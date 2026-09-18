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
HOST_VERSION = "6.1.6"
HELPER_CHANNEL = "stable"
PROTOCOL_VERSION = 3
DEV_EXTENSION_ID = "jjmnjgihigllehhjfhcmhcgnkhjdablc"
PUBLISHER_CLIENT_ID = "1543575455523807385"
BROWSING_ARTWORK_URLS = [
    "https://github.com/viesca272/AnimeKai-RPC/releases/download/v6.1.6/AnimeKai-Browsing-Square-512x512.png",
    "https://github.com/viesca272/AnimeKai-RPC/releases/download/v6.1.6/AnimeKai-Browsing-Square-1024x1024.png",
    "https://github.com/viesca272/AnimeKai-RPC/releases/download/v6.1.6/AnimeKai-Browsing-4x3-512x384.png",
    "https://github.com/viesca272/AnimeKai-RPC/releases/download/v6.1.6/AnimeKai-Browsing-4x3-1024x768.png",
    "https://github.com/viesca272/AnimeKai-RPC/releases/download/v6.1.6/AnimeKai-Browsing-16x9-640x360.png",
    "https://github.com/viesca272/AnimeKai-RPC/releases/download/v6.1.6/AnimeKai-Browsing-16x9-1280x720.png",
    "https://github.com/viesca272/AnimeKai-RPC/releases/download/v6.1.6/AnimeKai-Browsing-2x1-640x320.png",
    "https://github.com/viesca272/AnimeKai-RPC/releases/download/v6.1.6/AnimeKai-Browsing-2x1-1280x640.png",
]
BROWSING_ICON_URL = BROWSING_ARTWORK_URLS[0]
PLAY_ICON_URL = "https://github.com/viesca272/AnimeKai-RPC/releases/download/v6.1.6/AnimeKai-Playback-Play-256x256.png"
PAUSE_ICON_URL = "https://github.com/viesca272/AnimeKai-RPC/releases/download/v6.1.6/AnimeKai-Playback-Pause-256x256.png"
APP_DIR = Path(os.environ.get("LOCALAPPDATA", str(Path.home()))) / "AnimeKaiRPC"
APP_DIR.mkdir(parents=True, exist_ok=True)
CONFIG_FILE = APP_DIR / "config.json"
LOG_FILE = APP_DIR / "native_host.log"
MANIFEST_FILE = APP_DIR / f"{HOST_NAME}.json"
INSTALL_INFO_FILE = APP_DIR / "install-info.json"
DEFAULTS = {
    "client_id": PUBLISHER_CLIENT_ID,
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
last_kind = None
browsing_started = None
artwork_rejected = False


def log(x):
    try:
        with LOG_FILE.open("a", encoding="utf-8") as f:
            f.write(time.strftime("%Y-%m-%d %H:%M:%S ") + str(x) + "\n")
    except Exception:
        pass


def cfg():
    try:
        stored = json.loads(CONFIG_FILE.read_text(encoding="utf-8"))
        merged = {**DEFAULTS, **stored}
        if not str(merged.get("client_id") or "").strip():
            merged["client_id"] = PUBLISHER_CLIENT_ID
        return merged
    except Exception:
        return DEFAULTS.copy()


def save(c):
    if not str(c.get("client_id") or "").strip():
        c["client_id"] = PUBLISHER_CLIENT_ID
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


def friendly_error(value):
    text = str(value or "").strip()
    low = text.lower()
    if not text:
        return None
    if "discord" in low and ("not found" in low or "no such file" in low or "pipe" in low):
        return "Discord desktop does not appear to be running. Open Discord, then press Refresh."
    if "connection refused" in low or "winerror 2" in low:
        return "Could not connect to Discord desktop. Make sure Discord is open, then press Refresh."
    return text


def status(error=None):
    send({
        "type": "status",
        "discordConnected": discord_connected,
        "hostVersion": HOST_VERSION,
        "helperChannel": HELPER_CHANNEL,
        "protocolVersion": PROTOCOL_VERSION,
        "clientId": cfg().get("client_id", "") or PUBLISHER_CLIENT_ID,
        "lastError": friendly_error(last_error),
        "error": friendly_error(error),
        "rpcVariant": last_variant,
        "rpcLastUpdate": last_rpc_update,
        "artworkRejected": artwork_rejected,
    })


def ensure_rpc():
    global rpc, discord_connected, last_error
    if Presence is None:
        last_error = "Desktop helper could not load its Discord RPC library: " + str(IMPORT_ERROR)
        discord_connected = False
        return False
    cid = str(cfg().get("client_id") or PUBLISHER_CLIENT_ID).strip()
    if not cid:
        last_error = "Bundled Discord Application ID is unavailable."
        discord_connected = False
        return False
    if rpc and discord_connected:
        return True

    error = None
    for attempt in range(2):
        try:
            rpc = Presence(cid)
            rpc.connect()
            discord_connected = True
            last_error = None
            log(f"Discord RPC connected (attempt {attempt + 1})")
            return True
        except Exception as e:
            error = e
            rpc = None
            discord_connected = False
            if attempt == 0:
                time.sleep(0.35)

    last_error = friendly_error(error)
    log("Discord connect failed: " + repr(error))
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
    global last_kind, browsing_started

    c = cfg()
    c.update({k: v for k, v in (settings or {}).items() if v is not None})
    if not str(c.get("client_id") or "").strip():
        c["client_id"] = PUBLISHER_CLIENT_ID
    if not ensure_rpc():
        status(last_error)
        return

    now = time.time()
    kind = str(d.get("kind") or "watching").lower()

    if kind == "browsing":
        if last_kind != "browsing" or browsing_started is None:
            browsing_started = now
        last_kind = "browsing"
        started = None
        paused_at = None
        last_url = str(d.get("url") or "https://animekai.be/")

        base = {
            "details": str(d.get("details") or "Browsing AnimeKai")[:128],
            "state": str(d.get("browseState") or "Finding something to watch")[:128],
        }
        if c.get("showTimestamp", True) and browsing_started is not None:
            base["start"] = int(browsing_started * 1000)

        requested_image = str(d.get("image") or "").strip()
        artwork_candidates = []
        if requested_image.startswith(("http://", "https://")):
            artwork_candidates.append(requested_image)
        for candidate in BROWSING_ARTWORK_URLS:
            if candidate not in artwork_candidates:
                artwork_candidates.append(candidate)

        for index, image in enumerate(artwork_candidates):
            full = dict(base)
            full.update({
                "large_image": image,
                "large_text": "AnimeKai",
                "buttons": [{"label": "Open AnimeKai", "url": str(d.get("url") or "https://animekai.be/")[:512]}],
            })
            try:
                rpc.update(**full)
                last_variant = "browsing-wide" if index == 0 else f"browsing-fallback-{index}"
                last_error = None
                last_rpc_update = int(time.time() * 1000)
                artwork_rejected = False
                status()
                return
            except Exception as e:
                last_error = friendly_error(e)
                artwork_rejected = True
                log(f"Browsing RPC artwork candidate {index + 1} failed: " + repr(e))

        try:
            rpc.update(**base)
            last_variant = "browsing-minimal"
            last_error = None
            last_rpc_update = int(time.time() * 1000)
            discord_connected = True
            status()
            return
        except Exception as e:
            last_error = friendly_error(e)
            discord_connected = False
            log("Browsing minimal RPC failed: " + repr(e))
            status(last_error)
            return

    last_kind = "watching"
    browsing_started = None
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
        if state == "playing":
            playback_icon = PLAY_ICON_URL
            playback_text = "Playing"
        elif state == "paused":
            playback_icon = PAUSE_ICON_URL
            playback_text = "Paused"
        else:
            playback_icon = BROWSING_ICON_URL
            playback_text = status_text

        full.update({
            "large_image": image,
            "large_text": str(d.get("title") or "AnimeKai")[:128],
            "small_image": playback_icon,
            "small_text": playback_text,
        })
    full["buttons"] = [{"label": "Watch on AnimeKai", "url": url[:512]}]

    try:
        rpc.update(**full)
        last_variant = "dynamic-branded"
        last_error = None
        last_rpc_update = int(time.time() * 1000)
        artwork_rejected = False
        status()
        return
    except Exception as e:
        last_error = friendly_error(e)
        log("Branded dynamic RPC failed: " + repr(e))

    if image.startswith(("http://", "https://")):
        cover_only = dict(base)
        cover_only.update({
            "large_image": image,
            "large_text": str(d.get("title") or "AnimeKai")[:128],
            "buttons": [{"label": "Watch on AnimeKai", "url": url[:512]}],
        })
        try:
            rpc.update(**cover_only)
            last_variant = "dynamic"
            last_error = None
            last_rpc_update = int(time.time() * 1000)
            artwork_rejected = False
            status()
            return
        except Exception as e:
            last_error = friendly_error(e)
            artwork_rejected = True
            log("Cover-only RPC failed: " + repr(e))

    try:
        rpc.update(**base)
        last_variant = "minimal"
        last_error = None
        last_rpc_update = int(time.time() * 1000)
        discord_connected = True
        status()
        return
    except Exception as e:
        last_error = friendly_error(e)
        discord_connected = False
        log("Minimal RPC failed: " + repr(e))
        status(last_error)


def clear():
    global started, paused_at, last_url, last_rpc_update, last_kind, browsing_started
    try:
        if rpc and discord_connected:
            rpc.clear()
    except Exception:
        pass
    started = None
    paused_at = None
    last_url = ""
    last_kind = None
    browsing_started = None
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


def manifest_is_valid():
    try:
        data = json.loads(MANIFEST_FILE.read_text(encoding="utf-8-sig"))
        origins = data.get("allowed_origins") or []
        return (
            data.get("name") == HOST_NAME
            and data.get("type") == "stdio"
            and Path(str(data.get("path") or "")).resolve() == current_executable()
            and f"chrome-extension://{DEV_EXTENSION_ID}/" in origins
        )
    except Exception:
        return False


def health_snapshot():
    out = {
        "version": HOST_VERSION,
        "channel": HELPER_CHANNEL,
        "protocol": PROTOCOL_VERSION,
        "platform": sys.platform,
        "manifest": manifest_is_valid(),
        "executable": current_executable().exists(),
        "config": CONFIG_FILE.exists(),
        "install_info": INSTALL_INFO_FILE.exists(),
        "registry": {},
        "discord": discord_connected,
        "client_id": bool(str(cfg().get("client_id") or PUBLISHER_CLIENT_ID).strip()),
    }
    if sys.platform.startswith("win"):
        import winreg
        for key in registry_locations():
            try:
                with winreg.OpenKey(winreg.HKEY_CURRENT_USER, key) as k:
                    out["registry"][key] = winreg.QueryValueEx(k, None)[0] == str(MANIFEST_FILE)
            except OSError:
                out["registry"][key] = False
    out["registry_ok"] = bool(out["registry"]) and all(out["registry"].values())
    out["installation_ok"] = bool(
        out["manifest"]
        and out["executable"]
        and out["config"]
        and out["install_info"]
        and out["client_id"]
        and out["registry_ok"]
    )
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
    log(f"AnimeKai RPC helper {HOST_VERSION} ({HELPER_CHANNEL}) started")
    ensure_rpc()
    status(None if discord_connected else last_error)

    while True:
        m = readmsg()
        if m is None:
            break
        try:
            t = m.get("type")
            if t == "config":
                previous = cfg()
                c = dict(previous)
                c.update(m.get("config") or {})
                if not str(c.get("client_id") or "").strip():
                    c["client_id"] = PUBLISHER_CLIENT_ID
                save(c)
                if str(previous.get("client_id") or "") != str(c.get("client_id") or ""):
                    reconnect_rpc()
                else:
                    ensure_rpc()
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
                ensure_rpc()
                h = health_snapshot()
                installation_ok = bool(h.get("installation_ok"))
                runtime_ok = bool(h.get("discord"))
                send({
                    "type": "health",
                    "ok": installation_ok and runtime_ok,
                    "installationOk": installation_ok,
                    "runtimeOk": runtime_ok,
                    "summary": "System health check complete",
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
            last_error = friendly_error(e)
            log("Message error: " + repr(e))
            send({"type": "error", "error": last_error})


if __name__ == "__main__":
    main()
