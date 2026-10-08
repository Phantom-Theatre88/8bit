#!/usr/bin/env python3
"""
Generate web-optimized WebP variants for repository raster images and rewrite
site references to use them.

Safety:
- Original PNG/JPEG files are preserved.
- Only use a WebP variant when it is at least 5% smaller than the source.
- JPEG/photos are resized to max 1920px and encoded at quality 82.
- PNG/diagram assets are resized only above 2048px and encoded losslessly.
"""

from __future__ import annotations

from pathlib import Path
from PIL import Image, ImageOps
import io
import os

ROOT = Path(__file__).resolve().parents[1]
IGNORE_DIRS = {".git", "node_modules", ".venv", "venv"}
TEXT_EXTS = {".html", ".css", ".js", ".json", ".md", ".txt", ".yml", ".yaml"}
RASTER_EXTS = {".jpg", ".jpeg", ".png"}
MIN_BYTES = 64 * 1024
MIN_SAVING_RATIO = 0.95

def ignored(path: Path) -> bool:
    return any(part in IGNORE_DIRS for part in path.parts)

def resize_to_max(img: Image.Image, max_dim: int) -> Image.Image:
    w, h = img.size
    if max(w, h) <= max_dim:
        return img
    scale = max_dim / max(w, h)
    size = (max(1, round(w * scale)), max(1, round(h * scale)))
    return img.resize(size, Image.Resampling.LANCZOS)

def build_webp(src: Path) -> tuple[Path | None, int, int]:
    original_size = src.stat().st_size
    if original_size < MIN_BYTES:
        return None, original_size, original_size

    dest = src.with_suffix(".webp")
    try:
        with Image.open(src) as opened:
            img = ImageOps.exif_transpose(opened)
            if src.suffix.lower() in {".jpg", ".jpeg"}:
                img = resize_to_max(img, 1920)
                if img.mode not in ("RGB", "L"):
                    img = img.convert("RGB")
                elif img.mode == "L":
                    img = img.convert("RGB")
                buf = io.BytesIO()
                img.save(buf, "WEBP", quality=82, method=6)
            else:
                img = resize_to_max(img, 2048)
                if img.mode not in ("RGB", "RGBA"):
                    img = img.convert("RGBA" if "transparency" in opened.info else "RGB")
                buf = io.BytesIO()
                img.save(buf, "WEBP", lossless=True, method=6)

        payload = buf.getvalue()
        if len(payload) >= original_size * MIN_SAVING_RATIO:
            if dest.exists():
                dest.unlink()
            return None, original_size, original_size

        dest.write_bytes(payload)
        return dest, original_size, len(payload)
    except Exception as exc:
        print(f"SKIP {src.relative_to(ROOT)}: {exc}")
        return None, original_size, original_size

def rewrite_references(mapping: dict[str, str]) -> int:
    changed = 0
    # Longest first prevents a shorter path from partially consuming a longer one.
    replacements = sorted(mapping.items(), key=lambda kv: len(kv[0]), reverse=True)
    # Also provide the common assets/... suffix so mirrored UI folders resolve locally.
    suffix_replacements: dict[str, str] = {}
    for old, new in replacements:
        for prefix in ("legacy-ui/", "next-ui/"):
            if old.startswith(prefix):
                suffix_replacements.setdefault(old[len(prefix):], new[len(prefix):])
    for item in ROOT.rglob("*"):
        if not item.is_file() or ignored(item.relative_to(ROOT)) or item.suffix.lower() not in TEXT_EXTS:
            continue
        try:
            text = item.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        new_text = text
        for old, new in replacements:
            new_text = new_text.replace(old, new)
        for old, new in suffix_replacements.items():
            new_text = new_text.replace(old, new)
        if new_text != text:
            item.write_text(new_text, encoding="utf-8")
            changed += 1
    return changed

def main() -> None:
    sources = sorted(
        p for p in ROOT.rglob("*")
        if p.is_file()
        and not ignored(p.relative_to(ROOT))
        and p.suffix.lower() in RASTER_EXTS
        and not p.name.endswith(".webp")
    )

    mapping: dict[str, str] = {}
    original_total = 0
    webp_total = 0
    converted = 0

    for src in sources:
        dest, before, after = build_webp(src)
        original_total += before
        if dest is None:
            continue
        converted += 1
        webp_total += after
        old = src.relative_to(ROOT).as_posix()
        new = dest.relative_to(ROOT).as_posix()
        mapping[old] = new
        print(f"WEBP {old}: {before/1024:.0f} KB -> {after/1024:.0f} KB")

    changed_text_files = rewrite_references(mapping)

    saved = sum(
        Path(ROOT / old).stat().st_size - Path(ROOT / new).stat().st_size
        for old, new in mapping.items()
    )
    print("")
    print(f"Converted variants: {converted}")
    print(f"Text files rewritten: {changed_text_files}")
    print(f"Estimated transferred bytes saved when these assets are used: {saved/1024/1024:.1f} MB")

if __name__ == "__main__":
    main()
