from PIL import Image
from pathlib import Path

image_folder = Path("Backend/app/images")

files = [
    "image.png",
    "img2.jpeg",
    "im4.png",
    "img5.png",
    "img6.png",
    "img8.png",
    "img9.png",
    "ggg.png",
    "ggg4.png",
    "im2.png",
    "pt11.png",
    "pt2.png",
    "pt3.png",
    "pt4.png",
    "pt5.png",
    "pt6.png",
    "pt12.png",
    "pp1.png",
    "pp2.png",
]

for filename in files:
    source = image_folder / filename

    if not source.exists():
        print(f"NOT FOUND: {filename}")
        continue

    output = image_folder / f"{source.stem}.webp"

    with Image.open(source) as img:
        img = img.convert("RGB")
        img.thumbnail((600, 750), Image.Resampling.LANCZOS)
        img.save(output, "WEBP", quality=82, method=6)

    old_size = source.stat().st_size / 1024
    new_size = output.stat().st_size / 1024

    print(
        f"{filename}: "
        f"{old_size:.0f} KB -> "
        f"{output.name}: {new_size:.0f} KB"
    )

print("\nImage compression completed!")