"""Export animated GIFs as transparent PNG frame sequences for reliable canvas playback."""
from pathlib import Path
from PIL import Image
import json

root = Path(__file__).resolve().parents[1]
manifest = {}
for folder in ("runners", "cars", "ui"):
    for gif in sorted((root / "assets" / folder).glob("*.gif")):
        key = gif.stem
        out = root / "assets" / "frames" / key
        out.mkdir(parents=True, exist_ok=True)
        image = Image.open(gif)
        frames, durations = [], []
        for index in range(image.n_frames):
            image.seek(index)
            frame = image.convert("RGBA")
            filename = f"frame-{index:03}.png"
            frame.save(out / filename)
            frames.append(f"assets/frames/{key}/{filename}")
            durations.append(max(20, int(image.info.get("duration", 100))))
        manifest[key] = {"frames": frames, "durations": durations}
(root / "assets" / "frames.js").write_text("window.GIF_FRAMES = " + json.dumps(manifest, indent=2) + ";\n")
