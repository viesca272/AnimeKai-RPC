"""Prepare bundled PNGs and release assets from the checked-in image sources."""
import base64
import io
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parents[1]
DESTINATION = ROOT / "src/v7/extension/assets/rpc"


def build():
    DESTINATION.mkdir(parents=True, exist_ok=True)
    sources = {
        "animekai": ROOT / "src/v6/extension/assets/animekai-clean.webp.b64",
        "animepahe": ROOT / "src/v7/artwork/animepahe.b64",
        "nineanime": ROOT / "src/v7/artwork/nineanime.b64",
    }
    for name, path in sources.items():
        source = Image.open(io.BytesIO(base64.b64decode(path.read_text()))).convert("RGB")
        # Keep the whole source within the central area of a square Discord thumbnail.
        thumbnail = ImageOps.contain(source, (384, 384), Image.Resampling.LANCZOS)
        background = source.getpixel((0, 0))
        canvas = Image.new("RGB", (512, 512), background)
        canvas.paste(thumbnail, ((512-thumbnail.width)//2, (512-thumbnail.height)//2))
        canvas.save(DESTINATION / f"{name}-512.png", optimize=True)
    for name in ("play", "pause"):
        badge = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        draw = ImageDraw.Draw(badge)
        draw.ellipse((12, 12, 244, 244), fill="black")
        if name == "play":
            draw.polygon(((92, 62), (92, 194), (190, 128)), fill="white")
        else:
            for left in (78, 144):
                draw.rounded_rectangle((left, 62, left+34, 194), radius=8, fill="white")
        badge.save(DESTINATION / f"{name}-256.png", optimize=True)
    for path in DESTINATION.glob("*.png"):
        with Image.open(path) as image:
            image.verify()
        print(path.relative_to(ROOT))


if __name__ == "__main__":
    build()
