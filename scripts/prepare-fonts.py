#!/usr/bin/env python3
"""Prepare the supplied font collections for YDA without changing typed text.

Requires Python 3 and fonttools; brotli is optional (WOFF2 when installed,
otherwise compressed WOFF). Example from the repository root:
  python3 scripts/prepare-fonts.py --input-dir ../upload

The GeoLab Unicode character maps are preserved. The older Slava Meskhi
collection places Georgian glyphs in Latin slots; its web copies receive a
Unicode Georgian cmap. Original names, copyright records and outlines remain.
The original archives are not modified or copied into the public application.
"""
from __future__ import annotations

import argparse
import hashlib
import io
import importlib.util
import json
import re
import string
from pathlib import Path
from zipfile import ZipFile

from fontTools.pens.boundsPen import BoundsPen
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._c_m_a_p import CmapSubtable

GEORGIAN = "აბგდევზთიკლმნოპჟრსტუფქღყშჩცძწჭხჯჰ"
LEGACY_KEYS = "abgdevzTiklmnopJrstufqRySCcZwWxjh"
SPANISH_SAMPLE = "La princesa Nana, el príncipe Zhorzhi y el caballo alado Bubu"
ROOT = Path(__file__).resolve().parents[1]
ARCHIVES = (
    ("GeoLab_fonts_[FONTS.GE].zip", "GeoLab", False),
    ("Slava_Meskhi_Fonts_[FONTS.GE].zip", "Slava Meskhi", True),
)


def font_name(font: TTFont, name_id: int, fallback: str) -> str:
    record = font["name"].getDebugName(name_id)
    return record.strip() if record else fallback


def adapt_legacy(font: TTFont, mtavruli: bool = False) -> None:
    source = next(
        table.cmap for table in font["cmap"].tables
        if table.platformID == 1 and table.platEncID == 0
    )
    mapped = {ord(letter): source[ord(key)]
              for letter, key in zip(GEORGIAN, LEGACY_KEYS)}
    # Only the explicitly named Mtavruli designs have uppercase Georgian
    # outlines; do not claim uppercase coverage for ordinary Mkhedruli fonts.
    if mtavruli:
        for letter in GEORGIAN:
            mapped[ord(letter) - 0x10D0 + 0x1C90] = mapped[ord(letter)]
    # ASCII digits and punctuation have their conventional meanings in these
    # files. Latin letters do not: retaining them would silently draw Georgian
    # when a user enters Spanish. Use another font for a Latin text block.
    for char in string.digits + string.punctuation + " ":
        glyph = source.get(ord(char))
        if glyph and glyph != ".notdef":
            mapped[ord(char)] = glyph
    # Nonbreaking space uses the same space outline/advance.
    if 32 in mapped:
        mapped[160] = mapped[32]
    # These are established typographic equivalents, not invented capitals.
    for target, original in [(0x2010, 45), (0x2011, 45)]:
        if original in mapped:
            mapped[target] = mapped[original]
    tables = []
    for platform, encoding in [(0, 3), (3, 1)]:
        table = CmapSubtable.newSubtable(4)
        table.platformID = platform
        table.platEncID = encoding
        table.language = 0
        table.cmap = mapped.copy()
        tables.append(table)
    font["cmap"].tables = tables


def nonempty_georgian(font: TTFont, cmap: dict[int, str]) -> int:
    glyph_set = font.getGlyphSet()
    count = 0
    for letter in GEORGIAN:
        glyph = cmap.get(ord(letter))
        if not glyph or glyph == ".notdef":
            continue
        pen = BoundsPen(glyph_set)
        glyph_set[glyph].draw(pen)
        if pen.bounds:
            count += 1
    return count


def prepare(input_dir: Path, output_dir: Path, manifest_path: Path) -> list[dict]:
    output_dir.mkdir(parents=True, exist_ok=True)
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    manifest = []
    ids = set()
    flavor = "woff2" if (importlib.util.find_spec("brotli") or importlib.util.find_spec("brotlicffi")) else "woff"
    for archive_name, source, legacy in ARCHIVES:
        with ZipFile(input_dir / archive_name) as archive:
            names = sorted(n for n in archive.namelist()
                           if n.lower().endswith((".ttf", ".otf")))
            for name in names:
                data = archive.read(name)
                font = TTFont(io.BytesIO(data), recalcTimestamp=False)
                family = font_name(font, 16, font_name(font, 1, Path(name).stem))
                style = font_name(font, 17, font_name(font, 2, "Regular"))
                identifier = re.sub(r"-[0-9a-f]{8}$", "", Path(name).stem)
                identifier = re.sub(r"[^a-z0-9-]+", "-", identifier.lower()).strip("-")
                if identifier in ids:
                    raise ValueError(f"Duplicate font ID: {identifier}")
                ids.add(identifier)
                if legacy:
                    adapt_legacy(font, "mtavruli" in family.casefold())
                cmap = font.getBestCmap() or {}
                coverage = sorted(cp for cp, glyph in cmap.items() if glyph != ".notdef")
                georgian_glyphs = nonempty_georgian(font, cmap)
                if georgian_glyphs != len(GEORGIAN):
                    raise ValueError(f"{name}: only {georgian_glyphs}/33 Georgian outlines")
                if len({cmap[ord(letter)] for letter in GEORGIAN}) != 33:
                    raise ValueError(f"{name}: Georgian letters share a glyph unexpectedly")
                font.flavor = flavor
                target = output_dir / f"{identifier}.{flavor}"
                font.save(target)
                # Verify the serialized web font, not only the in-memory cmap.
                roundtrip = TTFont(target)
                if nonempty_georgian(roundtrip, roundtrip.getBestCmap() or {}) != 33:
                    raise ValueError(f"Round-trip verification failed: {target}")
                entry = {
                    "id": identifier,
                    "family": family,
                    "style": style,
                    "label": f"{family} · {style}",
                    "src": f"assets/fonts/{target.name}",
                    "cssFamily": "YDA_" + identifier.replace("-", "_"),
                    "source": source,
                    "legacy": legacy,
                    "coverage": coverage,
                    "weight": int(getattr(font.get("OS/2"), "usWeightClass", 400)),
                    "georgianGlyphs": georgian_glyphs,
                    "spanishSample": not legacy and all(ord(c) in cmap for c in SPANISH_SAMPLE),
                    "bytes": target.stat().st_size,
                    "originalSha256": hashlib.sha256(data).hexdigest(),
                }
                manifest.append(entry)
    manifest.sort(key=lambda item: (item["source"], item["family"].casefold(), item["weight"], item["style"]))
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--input-dir", type=Path, default=ROOT.parent / "upload")
    parser.add_argument("--output-dir", type=Path, default=ROOT / "assets" / "fonts")
    parser.add_argument("--manifest", type=Path, default=ROOT / "js" / "fonts.json")
    args = parser.parse_args()
    result = prepare(args.input_dir, args.output_dir, args.manifest)
    print(json.dumps({
        "fonts": len(result),
        "unicodeOriginals": sum(not item["legacy"] for item in result),
        "adaptedLegacy": sum(item["legacy"] for item in result),
        "verifiedGeorgianOutlines": sum(item["georgianGlyphs"] for item in result),
        "fontBytes": sum(item["bytes"] for item in result),
        "manifest": str(args.manifest),
    }, ensure_ascii=False))


if __name__ == "__main__":
    main()
