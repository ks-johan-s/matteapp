#!/usr/bin/env python3
"""
Delar upp MatteÄventyrets original.html i en modulär, deploymentsbar struktur.

Användning:
    python3 split.py [sökväg-till-html]   # standard: original.html bredvid scriptet

Resultat (skrivs i samma mapp som scriptet):
    index.html          all HTML-markup + länkar till css/js
    css/style.css       all CSS
    js/*.js             ES-moduler (core, utils, hints, visuals, sheets,
                        navigation, scratchpad, mult-table, main)
    js/modules/*.js     en fil per räknemodul
    package.json        type: module (för node --check)

Skriptet är idempotiskt: kör om det när Gemini levererar en ny version av
original.html. All JS-logik hamnar i moduler; index.html:s inline-onclick-
anrop och globala anrop funkar via window-exponering i js/main.js.
"""

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "original.html"
if not SRC.is_absolute():
    SRC = ROOT / SRC

# Filstruktur: sökväg -> topp-nivå-deklarationer (i den ordning de ska ligga i filen).
# Allt som inte listas här stoppas med felmeddelande – mappingen UNDERHÅLLS.
FILE_MAP = {
    "js/core.js": [
        "state", "audioCtx", "playSound", "toggleSound", "toggleFocusMode",
        "addReward", "resetStreak",
    ],
    "js/utils.js": [
        "randInt", "shuffleArray", "formatNumSv", "formatFractionHTML",
        "formatMixedHTML", "showFeedback",
    ],
    "js/hints.js": [
        "moduleHintsData", "setHintSteps", "toggleHintBox", "nextHintStep",
        "renderHintBox",
    ],
    "js/visuals.js": [
        "buildNumberLineJumpSVG", "renderScaleSVG", "renderPizzaSVG",
        "renderDecimalNumberLineSVG", "renderMeasuringJugSVG",
        "renderKitchenScaleSVG", "buildUnitLadderSVGHTML", "renderClockSVG",
        "renderBarChartSVG", "renderMeanLevelingSVG",
    ],
    "js/sheets.js": ["handleSheetKeyDown", "handleSheetInput"],
    "js/navigation.js": ["navigateTo", "setDifficulty", "setInputMode"],
    "js/modules/addsub.js": [
        "setAddSubMode", "generateAddSubQuestion", "checkAddSubChoice",
        "checkAddSubTyped",
    ],
    "js/modules/mult.js": [
        "setSelectedTable", "generateMultQuestion", "checkMultChoice",
        "checkMultTyped",
    ],
    "js/modules/algo.js": [
        "setAlgoOp", "setAlgoSheetMode", "generateAlgoQuestion",
        "toggleAlgoLoan", "resetAlgoLoans", "renderGuidedAlgoGrid",
        "buildBlankAlgoSheet", "toggleBlankStrikeMode", "clearBlankSheet",
        "diagnoseAlgoMistake", "checkAlgoAnswer",
    ],
    "js/modules/scale.js": ["generateScaleQuestion", "checkScaleChoice"],
    "js/modules/frac.js": [
        "setFracSubMode", "generateFracQuestion", "toggleTwinSlice",
        "checkFracTwins", "checkFracChoice", "checkFracTyped",
    ],
    "js/modules/combo.js": [
        "generateComboQuestion", "checkComboChoice", "checkComboTyped",
    ],
    "js/modules/decimal.js": [
        "setDecimalSubMode", "decimalDragging", "attachDecimalLineEvents",
        "nudgeDecimalSlider", "generateDecimalQuestion", "checkDecimalPlaced",
        "checkDecimalChoice", "checkDecimalTyped",
    ],
    "js/modules/length.js": [
        "setLengthSubMode", "generateLengthQuestion", "checkLengthChoice",
        "checkLengthTyped",
    ],
    "js/modules/volweight.js": [
        "setVolWeightSubMode", "generateVolWeightQuestion",
        "checkVolWeightChoice", "checkVolWeightTyped",
    ],
    "js/modules/clock.js": [
        "formatDigitalTime", "setClockSubMode", "generateClockQuestion",
        "checkClockChoice", "describeTimeInWords", "renderSandboxClock",
        "setSandboxPM", "adjustSandboxMinutes", "startSandboxChallenge",
        "checkSandboxTarget",
    ],
    "js/modules/shop.js": [
        "SHOP_CATALOG", "setShopSubMode", "renderMoneyBadgeHTML",
        "updateShopTrayUI", "addMoneyToTray", "removeMoneyFromTray",
        "clearShopTray", "generateShopQuestion", "checkShopAnswer",
    ],
    "js/modules/geo.js": [
        "setGeoSubMode", "generateGeoQuestion", "checkGeoChoice",
        "checkGeoTyped",
    ],
    "js/modules/chart.js": [
        "setChartSubMode", "generateChartQuestion", "checkChartChoice",
        "checkChartTyped",
    ],
    "js/modules/avg.js": [
        "setAvgSubMode", "generateAvgQuestion", "checkAvgChoice",
        "checkAvgTyped",
    ],
    "js/modules/word.js": [
        "WORD_PROBLEMS", "setWordCategory", "generateWordQuestion",
        "buildWordGrid", "insertWordGridSymbol", "toggleWordGridLine",
        "clearWordGrid", "checkWordAnswer",
    ],
    "js/scratchpad.js": [
        "toggleScratchpad", "setScratchpadTab", "buildScratchpadGrid",
        "insertScratchpadSymbol", "toggleScratchpadLine", "spPenColor",
        "spPenWidth", "spDrawing", "setScratchpadPen",
        "resizeScratchpadCanvas", "initScratchpadCanvas", "clearScratchpad",
    ],
    "js/mult-table.js": [
        "toggleTableDrawer", "buildMultHelperTable", "highlightMultCell",
    ],
}

NAME_TO_FILE = {name: path for path, names in FILE_MAP.items() for name in names}

DECL_RE = re.compile(
    r"^(function\s+[A-Za-z_$][\w$]*|const\s+[A-Za-z_$][\w$]*|let\s+[A-Za-z_$][\w$]*"
    r"|document\.addEventListener|window\.onload)"
)
NAME_RE = re.compile(r"^(?:function|const|let)\s+([A-Za-z_$][\w$]*)")
TOKEN_RE = re.compile(r"[A-Za-z_$][A-Za-z0-9_$]*")


def dedent(text: str) -> str:
    """Tar bort minsta gemensamma indrag (leder blank rad med minst indent)."""
    lines = text.split("\n")
    base = None
    for line in lines:
        if line.strip():
            base = len(line) - len(line.lstrip(" "))
            break
    if not base:
        return text
    pad = " " * base
    return "\n".join(line[base:] if line.startswith(pad) else line for line in lines)


def split_trailing_trivia(chunk):
    """Flyttar efterföljande blankrader/kommentarer från chunkens slut
    till nästa chunk (sekationsrubriker hamnar då i rätt fil)."""
    i = len(chunk)
    in_block = False
    while i > 0:
        s = chunk[i - 1].strip()
        if in_block:
            i -= 1
            if "/*" in s:
                in_block = False
            continue
        if not s or s.startswith("//"):
            i -= 1
            continue
        if s.endswith("*/"):
            i -= 1
            if "/*" not in s:
                in_block = True
            continue
        if s.startswith("/*"):
            i -= 1
            if "*/" not in s:
                in_block = True
            continue
        break
    return chunk[:i], chunk[i:]


def unit_name(chunk_text: str):
    in_block = False
    for line in chunk_text.split("\n"):
        s = line.strip()
        if in_block:
            if "*/" in s:
                in_block = False
            continue
        if not s or s.startswith("//"):
            continue
        if s.startswith("/*"):
            if "*/" not in s:
                in_block = True
            continue
        m = NAME_RE.match(line)
        return m.group(1) if m else None
    return None


def rel_import(from_file: str, to_file: str) -> str:
    import posixpath

    rel = posixpath.relpath(to_file, posixpath.dirname(from_file))
    return rel if rel.startswith(".") else "./" + rel


def main() -> None:
    html = SRC.read_text(encoding="utf-8")

    # --- CSS ---
    style_m = re.search(r"<style>(.*?)</style>", html, re.S)
    if not style_m:
        sys.exit("Hittade ingen <style>-block i HTML-filen.")
    css_text = dedent(style_m.group(1)).strip("\n") + "\n"

    # --- JavaScript (största inline-<script>-blocket) ---
    scripts = re.findall(r"<script([^>]*)>([\s\S]*?)</script>", html)
    app_script = max(
        (s for s in scripts if "const state" in s[1]),
        key=lambda s: len(s[1]),
        default=None,
    )
    if not app_script:
        sys.exit("Hittade inget app-<script>-block i HTML-filen.")
    js_text = dedent(app_script[1]).strip("\n")

    # --- Dela JS i topp-nivå-enheter ---
    lines = js_text.split("\n")
    starts = [i for i, l in enumerate(lines) if DECL_RE.match(l)]
    if not starts:
        sys.exit("Inga topp-nivå-deklarationer hittades i script-blocket.")

    preamble = lines[: starts[0]]
    chunks = []
    for idx, s in enumerate(starts):
        end = starts[idx + 1] if idx + 1 < len(starts) else len(lines)
        chunks.append(lines[s:end])

    # Flytta mellanliggande kommentarer till efterföljande enhet.
    for i in range(len(chunks) - 1):
        body, trivia = split_trailing_trivia(chunks[i])
        chunks[i] = body
        chunks[i + 1] = trivia + chunks[i + 1]
    if preamble:
        chunks[0] = preamble + chunks[0]

    units = []  # (name|None, text)
    for chunk in chunks:
        text = "\n".join(chunk).strip("\n") + "\n"
        if not text.strip():
            continue
        units.append((unit_name(text), text))

    # --- Sortera enheter i filer, kontrollera mapping ---
    file_units = {path: [] for path in FILE_MAP}
    main_units = []
    unmapped = []
    for name, text in units:
        if name is None:
            main_units.append(text)
            continue
        path = NAME_TO_FILE.get(name)
        if path is None:
            unmapped.append(name)
        else:
            file_units[path].append(text)
    if unmapped:
        sys.exit(
            "Följande deklarationer saknar fil-mapping i split.py – lägg till dem i FILE_MAP:\n  "
            + "\n  ".join(unmapped)
        )

    # Inom varje fil: behåll original ordning (enheterna kommer redan i källordning).
    defined_in = {}
    for path, names in FILE_MAP.items():
        for n in names:
            defined_in[n] = path

    # --- Skriv filer ---
    js_root = ROOT / "js"
    for old in list(js_root.rglob("*.js")) if js_root.exists() else []:
        old.unlink()
    (ROOT / "css").mkdir(exist_ok=True)
    for path in FILE_MAP:
        (ROOT / path).parent.mkdir(parents=True, exist_ok=True)

    all_js_files = list(FILE_MAP) + ["js/main.js"]

    for path, chunks_in_file in file_units.items():
        own = set(FILE_MAP[path])
        text_all = "".join(chunks_in_file)
        tokens = set(TOKEN_RE.findall(text_all))

        # Vilka importer behövs? (endast namn definierade i NÅGON fil, inte i denna)
        by_source = {}
        for token in sorted(tokens):
            src = defined_in.get(token)
            if src and src != path:
                by_source.setdefault(src, []).append(token)

        imports = []
        for src in sorted(by_source):
            names = sorted(by_source[src])
            imports.append(
                f"import {{ {', '.join(names)} }} from '{rel_import(path, src)}';"
            )

        body_parts = []
        for chunk in chunks_in_file:
            # Exportera första deklarationsnyckelordet i chunken.
            chunk = re.sub(
                r"^(function|const|let)(?=\s)", r"export \1", chunk, count=1,
                flags=re.M,
            )
            body_parts.append(chunk.strip("\n"))

        header = f"// {path} — autogenererad av split.py från original.html\n"
        out = header + ("\n".join(imports) + "\n\n" if imports else "\n")
        out += "\n\n".join(body_parts) + "\n"
        (ROOT / path).write_text(out, encoding="utf-8")

    # --- main.js: namespace-exponering + expressionsenheter ---
    alias = {}
    for i, path in enumerate(all_js_files):
        alias[path] = "ns_" + re.sub(r"\W+", "_", Path(path).stem)

    main_parts = [
        "// js/main.js — entry point. Autogenererad av split.py från original.html",
        "// Exponerar alla modulers API på window så att inline-onclick i index.html",
        "// och globala anrop (t.ex. navigateTo('home')) funkar precis som förr.",
        "",
    ]
    for path in all_js_files:
        if path == "js/main.js":
            continue
        main_parts.append(f"import * as {alias[path]} from './{path[len('js/'):] if path.startswith('js/') else path}';")
    main_parts.append("")
    main_parts.append(
        "Object.assign(window, " + ", ".join(alias[p] for p in all_js_files if p != "js/main.js") + ");"
    )
    main_parts.append("")
    for text in main_units:
        main_parts.append(text.strip("\n"))
        main_parts.append("")
    (ROOT / "js/main.js").write_text("\n".join(main_parts), encoding="utf-8")

    # --- index.html ---
    new_html = re.sub(
        r"<style>[\s\S]*?</style>",
        '<link rel="stylesheet" href="css/style.css">',
        html,
        count=1,
    )
    app_script_re = re.compile(
        r"<script>(?=[\s\S]*const state)[\s\S]*?</script>"
    )
    new_html, n = app_script_re.subn(
        '<script type="module" src="js/main.js"></script>', new_html, count=1
    )
    if n != 1:
        sys.exit("Kunde inte ersätta app-script-blocket i index.html.")
    (ROOT / "index.html").write_text(new_html, encoding="utf-8")

    # --- css ---
    (ROOT / "css/style.css").write_text(css_text, encoding="utf-8")

    # --- package.json ---
    (ROOT / "package.json").write_text(
        '{\n'
        '  "name": "matteaventyr",\n'
        '  "private": true,\n'
        '  "type": "module",\n'
        '  "description": "MatteÄventyret – lekfull matteapp (statisk, vanilla JS-moduler)"\n'
        '}\n',
        encoding="utf-8",
    )

    n_units = len(units)
    n_funcs = sum(len(v) for v in file_units.values())
    print(f"OK: {n_units} enheter -> {len(FILE_MAP)} modulfiler + main.js")
    print(f"    {n_funcs} namngivna funktioner/konstanter fördelade")
    print("    index.html, css/style.css, package.json skrivna")


if __name__ == "__main__":
    main()
