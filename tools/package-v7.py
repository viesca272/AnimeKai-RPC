"""Build the Windows release from a separately compiled native helper."""
import argparse
import hashlib
import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VERSION = "7.0.0-alpha.1"


def build(executable):
    if not executable.is_file():
        raise FileNotFoundError(executable)
    output = ROOT / "release-v7"
    stage = ROOT / "build" / f"Anime-RPC-{VERSION}"
    if stage.exists():
        shutil.rmtree(stage)
    output.mkdir(exist_ok=True)
    shutil.copytree(ROOT / "src/v7/extension", stage / "extension")
    shutil.copytree(ROOT / "src/v7/windows", stage / "windows")
    (stage / "native_host").mkdir()
    shutil.copy2(executable, stage / "native_host/AnimeKaiRPCNativeHost.exe")
    for action in ("Install", "Repair", "Uninstall"):
        name = f"{action} Anime-RPC.cmd"
        (stage / name).write_text(f'@echo off\ncall "%~dp0windows\\{name}"\n', encoding="ascii")
    for source, target in [("docs/V7_INSTALL.md", "START-HERE.md"),
                           ("docs/V7_RELEASE_NOTES.md", "RELEASE-NOTES.md"),
                           ("docs/V7_TESTING.md", "TESTING.md"),
                           ("LICENSE", "LICENSE")]:
        shutil.copy2(ROOT / source, stage / target)
    shutil.copy2(ROOT / "src/v7/artwork/sources.json", stage / "ARTWORK-SOURCES.json")
    shutil.make_archive(str(output / f"Anime-RPC-Windows-v{VERSION}"), "zip", stage)
    shutil.make_archive(str(output / f"Anime-RPC-Extension-v{VERSION}"), "zip", stage / "extension")
    for asset in (stage / "extension/assets/rpc").glob("*.png"):
        shutil.copy2(asset, output / asset.name)
    assets = sorted(output.glob("*.zip")) + sorted(output.glob("*.png"))
    hashes = [f"{hashlib.sha256(asset.read_bytes()).hexdigest()}  {asset.name}" for asset in assets]
    (output / "SHA256SUMS.txt").write_text("\n".join(hashes) + "\n", encoding="ascii")
    print(f"Packaged {len(assets)} assets in {output}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--exe", type=Path, required=True)
    build(parser.parse_args().exe)
