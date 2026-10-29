# Included fonts

The application uses the two font collections supplied for this project:

- GeoLab: 44 original Unicode font styles.
- Slava Meskhi: 42 legacy font styles adapted to Unicode Georgian.

`scripts/prepare-fonts.py` creates compressed web copies and the character
coverage manifest in `js/fonts.json`. It preserves the source font outlines,
family names and embedded attribution records. The original archives remain
unchanged. Brotli is optional: the script writes WOFF2 when available, otherwise
WOFF. The checked-in files use WOFF.

Every font was verified to contain 33 nonempty, distinct glyphs for the modern
Georgian alphabet. In particular, ღ and ლ map to different glyphs. The legacy
collection is mapped using its Mac Roman character table, including the two
Windows Symbol fonts. The four explicitly named Mtavruli designs also expose
their capital glyphs at the modern Georgian uppercase Unicode codepoints.

The adapted legacy fonts intentionally do not advertise Latin letters: their
original Latin slots contain Georgian outlines. Use the GeoLab collection for
Spanish and English, and consult `coverage` for the exact characters in a text.
`spanishSample` only records support for the sample bilingual title, not every
possible Spanish character. Unsupported punctuation is likewise reported by
the application instead of changing the entered text.
