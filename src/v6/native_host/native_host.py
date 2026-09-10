import json, os, struct, sys, time
from pathlib import Path

try:
    from pypresence import Presence
except Exception as e:
    Presence = None
    IMPORT_ERROR = repr(e)
else:
    IMPORT_ERROR = None

HOST_NAME = "com.animekai.discordrpc"
HOST_VERSION = "6.0.0-alpha.2"
DEV_EXTENSION_ID = "jjmnjgihigllehhjfhcmhcgnkhjdablc"
APP_DIR = Path(os.environ.get("LOCALAPPDATA", str(Path.home()))) / "AnimeKaiRPC"
APP_DIR.mkdir(parents=True, exist_ok=True)
CONFIG_FILE = APP_DIR / "config.json"
LOG_FILE = APP_DIR / "native_host.log"
MANIFEST_FILE = APP_DIR / f"{HOST_NAME}.json"
DEFAULTS = {
    "client_id": "",
    "playbackMode": "auto",
    "showTimestamp": True,
    "detailsTemplate": "{anime}",
    "stateTemplate": "Episode {episode} / {total} • {status}",
}

rpc = None
discord_connected = False
last_error = None
last_variant = None
last_rpc_update = None
started = None
paused_at = None
last_url = ""
artwork_rejected = False


def log(x):
    try:
        with LOG_FILE.open("a", encoding="utf-8") as f:
            f.write(time.strftime("%Y-%m-%d %H:%M:%S ") + str(x) + "\n")
    except Exception:
        pass


def cfg():
    try:
        return {**DEFAULTS, **json.loads(CONFIG_FILE.read_text(encoding="utf-8"))}
    except Exception:
        return DEFAULTS.copy()


def save(c):
    CONFIG_FILE.write_text(json.dumps(c, indent=2), encoding="utf-8")


def readmsg():
    h = sys.stdin.buffer.read(4)
    if not h:
        return None
    n = struct.unpack("<I", h)[0]
    b = sys.stdin.buffer.read(n)
    return json.loads(b.decode("utf-8"))


def send(o):
    b = json.dumps(o, separators=(",", ":"), ensure_ascii=False).encode("utf-8")
    sys.stdout.buffer.write(struct.pack("<I", len(b)) + b)
    sys.stdout.buffer.flush()


def status(error=None):
    send({
        "type": "status",
        "discordConnected": discord_connected,
        "hostVersion": HOST_VERSION,
        "clientId": cfg().get("client_id", "") or "",
        "lastError": last_error,
        "error": error,
        "rpcVariant": last_variant,
        "rpcLastUpdate": last_rpc_update,
        "artworkRejected": artwork_rejected,
    })


def ensure_rpc():
    global rpc, discord_connected, last_error
    if Presence is None:
        last_error = "pypresence import failed: " + str(IMPORT_ERROR)
        discord_connected = False
        return False
    cid = str(cfg().get("client_id") or "").strip()
    if not cid:
        last_error = "No Discord Application ID saved."
        discord_connected = False
        return False
    if rpc and discord_connected:
        return True
    try:
        rpc = Presence(cid)
        rpc.connect()
        discord_connected = True
        last_error = None
        log("Discord RPC connected")
        return True
    except Exception as e:
        rpc = None
        discord_connected = False
        last_error = str(e)
        log("Discord connect failed: " + repr(e))
        return False


def close_rpc():
    global rpc, discord_connected
    try:
        if rpc:
            rpc.close()
    except Exception:
        pass
    rpc = None
    discord_connected = False


def reconnect_rpc():
    global last_error
    close_rpc()
    time.sleep(0.15)
    ok = ensure_rpc()
    if ok:
        log("Discord RPC refreshed successfully")
    else:
        log("Discord RPC refresh failed: " + str(last_error))
    return ok


def templ(t, d, status_text):
    vals = {
        "anime": str(d.get("title") or "Anime"),
        "episode": str(d.get("episode") or "—"),
        "total": str(d.get("total") or "?"),
        "status": status_text,
    }
    out = str(t or "")
    for k, v in vals.items():
        out = out.replace("{" + k + "}", v)
    return out[:128]


def activity(d, settings=None, override=None):
    global started, paused_at, last_url, last_error, last_variant
    global last_rpc_update, discord_connected, artwork_rejected

    c = cfg()
    c.update({k: v for k, v in (settings or {}).items() if v is not None})
    if not ensure_rpc():
        status(last_error)
        return

    now = time.time()
    mode = str(c.get("playbackMode") or "auto").lower()
    state = override or (mode if mode in ("playing", "paused") else str(d.get("state") or "paused"))
    pos = max(0, float(d.get("position") or 0))
    dur = max(0, float(d.get("duration") or 0))
    url = d.get("url") or "https://animekai.be/"

    if url != last_url:
        started = None
        paused_at = None
        last_url = url

    if state == "playing":
        if started is None:
            started = now - pos
        elif paused_at is not None:
            started += now - paused_at
            paused_at = None
    elif started is not None and paused_at is None:
        paused_at = now

    status_text = (
        "Watching" if state == "playing" else
        "Buffering" if state == "buffering" else
        "Finished" if state == "ended" else
        "Paused"
    )

    base = {
        "details": templ(c.get("detailsTemplate"), d, status_text),
        "state": templ(c.get("stateTemplate"), d, status_text),
    }
    if c.get("showTimestamp", True) and started is not None:
        base["start"] = int(started * 1000)
        if state == "playing" and dur:
            base["end"] = int((started + dur) * 1000)

    image = d.get("image") if isinstance(d.get("image"), str) else ""
    full = dict(base)
    if image.startswith(("http://", "https://")):
        full.update({
            "large_image": image,
            "large_text": str(d.get("title") or "AnimeKai")[:128],
        })
    full["buttons"] = [{"label": "Watch on AnimeKai", "url": url[:512]}]

    try:
        rpc.update(**full)
        last_variant = "dynamic"
        last_error = None
        last_rpc_update = int(time.time() * 1000)
        artwork_rejected = False
        status()
        return
    except Exception as e:
        last_error = str(e)
        artwork_rejected = bool(image)
        log("Dynamic RPC failed: " + repr(e))

    try:
        rpc.update(**base)
        last_variant = "minimal"
        last_error = None
        last_rpc_update = int(time.time() * 1000)
        discord_connected = True
        status()
        return
    except Exception as e:
        last_error = str(e)
        discord_connected = False
        log("Minimal RPC failed: " + repr(e))
        status(last_error)


def clear():
    global started, paused_at, last_url, last_rpc_update
    try:
        if rpc and discord_connected:
            rpc.clear()
    except Exception:
        pass
    started = None
    paused_at = None
    last_url = ""
    last_rpc_update = int(time.time() * 1000)


def current_executable():
    return Path(sys.executable if getattr(sys, "frozen", False) else __file__).resolve()


def expected_manifest():
    origins = [f"chrome-extension://{DEV_EXTENSION_ID}/"]
    extra = cfg().get("extension_origins")
    if isinstance(extra, list):
        origins.extend(x for x in extra if isinstance(x, str) and x.startswith("chrome-extension://"))
    return {
        "name": HOST_NAME,
        "description": "AnimeKai Discord RPC V6 native host - Made by viesca27",
        "path": str(current_executable()),
        "type": "stdio",
        "allowed_origins": sorted(set(origins)),
    }


def registry_locations():
    return [
        "Software\\Google\\Chrome\\NativeMessagingHosts\\" + HOST_NAME,
        "Software\\Chromium\\NativeMessagingHosts\\" + HOST_NAME,
        "Software\\Microsoft\\Edge\\NativeMessagingHosts\\" + HOST_NAME,
    ]


def health_snapshot():
    out = {
        "platform": sys.platform,
        "manifest": MANIFEST_FILE.exists(),
        "executable": current_executable().exists(),
        "registry": {},
        "discord": discord_connected,
        "client_id": bool(str(cfg().get("client_id") or "").strip()),
    }
    if sys.platform.startswith("win"):
        import winreg
        for key in registry_locations():
            try:
                with winreg.OpenKey(winreg.HKEY_CURRENT_USER, key) as k:
                    out["registry"][key] = winreg.QueryValueEx(k, None)[0] == str(MANIFEST_FILE)
            except OSError:
                out["registry"][key] = False
    return out


def repair():
    fixed = []
    errors = []
    if not sys.platform.startswith("win"):
        return {
            "ok": False,
            "fixed": [],
            "errors": ["Repair is currently supported on Windows only."],
            "health": health_snapshot(),
        }

    try:
        MANIFEST_FILE.write_text(json.dumps(expected_manifest(), indent=2), encoding="utf-8")
        fixed.append("Native Messaging manifest")
    except Exception as e:
        errors.append("Manifest: " + str(e))

    try:
        import winreg
        for key in registry_locations():
            with winreg.CreateKey(winreg.HKEY_CURRENT_USER, key) as k:
                winreg.SetValueEx(k, None, 0, winreg.REG_SZ, str(MANIFEST_FILE))
        fixed.append("Browser registration")
    except Exception as e:
        errors.append("Registry: " + str(e))

    reconnect_rpc()
    return {
        "ok": not errors and discord_connected,
        "fixed": fixed,
        "errors": errors + ([] if discord_connected else [last_error or "Discord RPC did not reconnect."]),
        "health": health_snapshot(),
    }


def main():
    global last_error
    ensure_rpc()
    status(None if discord_connected else last_error)

    while True:
        m = readmsg()
        if m is None:
            break
        try:
            t = m.get("type")
            if t == "config":
                c = cfg()
                c.update(m.get("config") or {})
                save(c)
                reconnect_rpc()
                status(None if discord_connected else last_error)
            elif t == "activity":
                activity(m.get("data") or {}, m.get("settings"))
            elif t == "clear":
                clear()
                status()
            elif t == "test":
                activity({
                    "title": "AnimeKai RPC V6",
                    "episode": 1,
                    "total": 1,
                    "url": "https://animekai.be/",
                    "image": "",
                    "state": "playing",
                    "position": 15,
                    "duration": 300,
                }, m.get("settings"))
            elif t == "health":
                h = health_snapshot()
                send({
                    "type": "health",
                    "ok": bool(h.get("client_id")) and bool(h.get("discord")) and (all(h.get("registry", {}).values()) if sys.platform.startswith("win") else False),
                    "summary": "Health check complete",
                    "health": h,
                })
            elif t == "repair":
                send({"type": "repairResult", **repair()})
            elif t == "refresh":
                reconnect_rpc()
                status(None if discord_connected else last_error)
            elif t == "ping":
                ensure_rpc()
                status(None if discord_connected else last_error)
        except Exception as e:
            last_error = str(e)
            log("Message error: " + repr(e))
            send({"type": "error", "error": str(e)})


if __name__ == "__main__":
    main()
