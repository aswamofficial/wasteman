"""Convert Stitch code.html exports into Ionic React page components.

Stitch emits a full HTML document per screen: Tailwind-CDN config, Google Font
links, then a <body> of Tailwind-classed markup. We keep only the body markup,
turn it into JSX, and wrap it in IonPage/IonContent. Tokens live in
tailwind.config.js and fonts are installed as npm packages, so nothing here
depends on a CDN at runtime.
"""

import html
import os
import re
import sys

SRC_ROOTS = [
    r"C:\Users\Lenovo\AppData\Local\Temp\claude\C--xampp2\73e3c21e-a909-40da-87c8-4d33ae9f572e\scratchpad\stitch\a\stitch_one_shot_universal_execution",
    r"C:\Users\Lenovo\AppData\Local\Temp\claude\C--xampp2\73e3c21e-a909-40da-87c8-4d33ae9f572e\scratchpad\stitch\b\stitch_one_shot_universal_execution",
]
OUT_DIR = r"C:\xampp2\htdocs\wastenotify\wastenotify-app\src\pages\generated"
CSS_OUT = r"C:\xampp2\htdocs\wastenotify\wastenotify-app\src\styles\stitch-screens.css"

# folder -> (ComponentName, route, bottom-nav active key or None)
SCREENS = {
    "01_splash_onboarding":            ("Onboarding",        "/onboarding",             None),
    "02_login":                        ("Login",             "/login",                  None),
    "05_home_dashboard":               ("Home",              "/home",                   "home"),
    "06_capture_photo":                ("CapturePhoto",      "/report/capture",         None),
    "07_ai_analysis_result":           ("AiAnalysis",        "/report/analysis",        None),
    "08_confirm_location":             ("ConfirmLocation",   "/report/location",        None),
    "09_details_submit":               ("ReportDetails",     "/report/details",         None),
    "10_report_submitted":             ("ReportSubmitted",   "/report/submitted",       None),
    "11_map_explorer":                 ("MapExplorer",       "/map",                    "map"),
    "12_my_reports":                   ("MyReports",         "/reports",                "activity"),
    "13_report_detail_timeline":       ("ReportDetail",      "/reports/detail",         None),
    "14_resolved_before_after":        ("ReportResolved",    "/reports/resolved",       "activity"),
    "15_notifications":                ("Notifications",     "/notifications",          "home"),
    "16_statistics_impact":            ("Statistics",        "/statistics",             "activity"),
    "17_profile":                      ("Profile",           "/profile",                "profile"),
    "a1_admin_dashboard":              ("AdminDashboard",    "/admin",                  None),
    "a2_admin_incoming_report_detail": ("AdminReportDetail", "/admin/reports/detail",   None),
    "a3_admin_assign_update_status":   ("AdminAssignUpdate", "/admin/assign",           None),
    "a4_admin_ward_map_heatmap":       ("AdminWardMap",      "/admin/map",              None),
}

VOID = {"img", "input", "br", "hr", "meta", "link", "source", "area",
        "base", "col", "embed", "param", "track", "wbr"}

# HTML attribute -> JSX property
ATTR_MAP = {
    "class": "className",
    "for": "htmlFor",
    "tabindex": "tabIndex",
    "readonly": "readOnly",
    "maxlength": "maxLength",
    "minlength": "minLength",
    "autocomplete": "autoComplete",
    "autofocus": "autoFocus",
    "colspan": "colSpan",
    "rowspan": "rowSpan",
    "srcset": "srcSet",
    "usemap": "useMap",
    "enctype": "encType",
    "novalidate": "noValidate",
    "spellcheck": "spellCheck",
    "contenteditable": "contentEditable",
    "crossorigin": "crossOrigin",
    "datetime": "dateTime",
    "stroke-width": "strokeWidth",
    "stroke-linecap": "strokeLinecap",
    "stroke-linejoin": "strokeLinejoin",
    "stroke-dasharray": "strokeDasharray",
    "stroke-dashoffset": "strokeDashoffset",
    "fill-rule": "fillRule",
    "clip-rule": "clipRule",
    "clip-path": "clipPath",
    "stop-color": "stopColor",
    "stop-opacity": "stopOpacity",
    "fill-opacity": "fillOpacity",
    "stroke-opacity": "strokeOpacity",
    "text-anchor": "textAnchor",
    "vector-effect": "vectorEffect",
    "xlink:href": "xlinkHref",
    # The HTML parser lowercases SVG attribute names; React wants them camelCased.
    "viewbox": "viewBox",
    "preserveaspectratio": "preserveAspectRatio",
    "gradientunits": "gradientUnits",
    "gradienttransform": "gradientTransform",
    "patternunits": "patternUnits",
    "maskunits": "maskUnits",
    "clippathunits": "clipPathUnits",
    "stopcolor": "stopColor",
    "stopopacity": "stopOpacity",
    "strokewidth": "strokeWidth",
    "value": "defaultValue",
    "checked": "defaultChecked",
    "selected": "defaultSelected",
}

# React types these as numbers, so a bare string attribute won't type-check.
NUMERIC_ATTRS = {
    "rows", "cols", "size", "span", "start",
    "tabIndex", "maxLength", "minLength", "colSpan", "rowSpan",
}

# attributes to drop entirely
DROP_ATTRS = {"onclick", "onchange", "onsubmit", "oninput", "onload", "onerror"}

warnings = []


def css_prop_to_js(prop):
    prop = prop.strip()
    if prop.startswith("--"):
        return None  # custom properties need bracket syntax; handled by caller
    parts = prop.split("-")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def split_decls(style):
    """Split a style attribute on ';' that are not inside parentheses."""
    out, depth, cur = [], 0, ""
    for ch in style:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == ";" and depth == 0:
            out.append(cur)
            cur = ""
        else:
            cur += ch
    if cur.strip():
        out.append(cur)
    return out


def style_to_jsx(style):
    pairs = []
    for decl in split_decls(style):
        if ":" not in decl:
            continue
        prop, _, val = decl.partition(":")
        val = val.strip()
        if not val:
            continue
        key = css_prop_to_js(prop)
        # JS string literal: escape backslashes then double quotes
        esc = val.replace("\\", "\\\\").replace('"', '\\"')
        if key is None:
            pairs.append('"%s": "%s"' % (prop.strip(), esc))
        else:
            pairs.append('%s: "%s"' % (key, esc))
    return "{{ " + ", ".join(pairs) + " }}"


ATTR_RE = re.compile(
    r'([:\w][-:\w]*)\s*=\s*(".*?"|\'.*?\')|([:\w][-:\w]*)(?=[\s/>])',
    re.S,
)


def convert_attrs(attr_str, tag):
    out = []
    for m in ATTR_RE.finditer(attr_str):
        if m.group(1) is not None:
            name, raw = m.group(1), m.group(2)
            val = raw[1:-1]
        else:
            name, val = m.group(3), None  # boolean attribute

        low = name.lower()
        if low in DROP_ATTRS:
            warnings.append("dropped %s handler on <%s>" % (low, tag))
            continue

        if low == "style" and val is not None:
            out.append("style=" + style_to_jsx(val))
            continue

        jsx_name = ATTR_MAP.get(low, name)
        # keep data-* and aria-* exactly as authored
        if low.startswith("data-") or low.startswith("aria-"):
            jsx_name = name

        if val is None:
            out.append("%s={true}" % jsx_name)
        elif jsx_name in NUMERIC_ATTRS and val.strip().lstrip("-").isdigit():
            out.append("%s={%s}" % (jsx_name, val.strip()))
        else:
            # JSX string attributes can't contain a raw double quote
            if '"' in val:
                esc = val.replace("\\", "\\\\").replace('"', '\\"')
                out.append('%s={"%s"}' % (jsx_name, esc))
            else:
                out.append('%s="%s"' % (jsx_name, val))
    return (" " + " ".join(out)) if out else ""


TAG_RE = re.compile(r"<(/?)([a-zA-Z][-\w]*)((?:\s[^<>]*?)?)(/?)>", re.S)


def convert_tags(markup):
    def repl(m):
        closing, tag, attrs, selfclose = m.groups()
        if closing:
            return "</%s>" % tag
        converted = convert_attrs(attrs, tag)
        if tag.lower() in VOID or selfclose:
            return "<%s%s />" % (tag, converted)
        return "<%s%s>" % (tag, converted)

    return TAG_RE.sub(repl, markup)


def escape_text_braces(markup):
    """Curly braces in *text* would open a JSX expression. Escape them.

    Walks the string outside of tags only, so attribute values (already
    converted to JSX expressions) are untouched.
    """
    out = []
    i = 0
    for m in re.finditer(r"<[^>]*>", markup, re.S):
        text = markup[i:m.start()]
        out.append(text.replace("{", "&#123;").replace("}", "&#125;"))
        out.append(m.group(0))
        i = m.end()
    tail = markup[i:].replace("{", "&#123;").replace("}", "&#125;")
    out.append(tail)
    return "".join(out)


# Rules already provided globally by src/index.css — drop them so each screen's
# stylesheet contributes only what is genuinely specific to that screen.
BOILERPLATE_SELECTORS = {
    "body",
    "html",
    ".material-symbols-outlined",
    ".material-symbols-outlined.filled",
    ".hide-scrollbar",
    ".hide-scrollbar::-webkit-scrollbar",
}


def split_css_rules(css):
    """Split a stylesheet into top-level rules, respecting nested braces."""
    rules, depth, cur = [], 0, ""
    for ch in css:
        cur += ch
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                rules.append(cur.strip())
                cur = ""
    if cur.strip():
        rules.append(cur.strip())
    return rules


def extract_custom_css(doc, folder):
    """Return the screen-specific CSS from the document's <style> blocks."""
    kept = []
    for block in re.findall(r"<style>(.*?)</style>", doc, re.S):
        for rule in split_css_rules(block):
            sel = rule.split("{", 1)[0].strip()
            # keyframes and other at-rules are always screen-specific here
            if sel.startswith("@"):
                kept.append(rule)
                continue
            parts = {s.strip() for s in sel.split(",")}
            if parts and parts <= BOILERPLATE_SELECTORS:
                continue
            kept.append(rule)
    if not kept:
        return ""
    return "/* --- %s --- */\n%s\n" % (folder, "\n".join(kept))


SCRIPT_RE = re.compile(r"<script\b[^>]*>.*?</script>", re.S | re.I)


def extract_body(doc):
    m = re.search(r"<body([^>]*)>(.*)</body>", doc, re.S | re.I)
    if not m:
        raise SystemExit("no <body> found")
    attrs, inner = m.group(1), m.group(2)
    cls = ""
    cm = re.search(r'class\s*=\s*"(.*?)"', attrs, re.S)
    if cm:
        cls = cm.group(1)
    return cls, inner


NAV_RE = re.compile(
    r"<nav[^>]*\bclass=\"[^\"]*fixed bottom-0[^\"]*\"[^>]*>.*?</nav>", re.S | re.I
)


def strip_bottom_nav(inner):
    found = bool(NAV_RE.search(inner))
    return NAV_RE.sub("", inner), found


SELF_CLOSING_RE = re.compile(r"/>\s*$")
OPEN_RE = re.compile(r"^<([a-zA-Z][-\w]*)")
CLOSE_RE = re.compile(r"^</")


def reindent(markup, base):
    """Re-indent one-tag-per-line JSX by nesting depth.

    Safe because JSX strips leading and trailing whitespace on each line and
    drops whitespace-only lines, so this changes readability, not rendering.
    """
    out, depth = [], 0
    for raw in markup.split("\n"):
        line = raw.strip()
        if not line:
            continue
        if CLOSE_RE.match(line):
            depth = max(0, depth - 1)
        out.append(" " * (base + depth * 2) + line)
        # a line that opens a tag and doesn't close or self-close it nests
        if OPEN_RE.match(line) and not SELF_CLOSING_RE.search(line):
            tag = OPEN_RE.match(line).group(1)
            if tag.lower() not in VOID and ("</%s>" % tag) not in line:
                depth += 1
    return "\n".join(out)


def build_component(name, route, nav_key, body_class, inner, folder):
    inner, had_nav = strip_bottom_nav(inner)

    # Stitch ships imperative demo scripts (sliders, timers) in the body. They
    # can't survive the move to React, so drop them and re-implement behaviour
    # in the wrapper where a screen actually needs it.
    if SCRIPT_RE.search(inner):
        warnings.append("stripped inline <script> from %s (behaviour needs porting)" % folder)
        inner = SCRIPT_RE.sub("", inner)

    # Park HTML comments behind sentinels so the brace-escaping pass below
    # doesn't turn the JSX comment syntax we're about to emit into literal text.
    comments = []

    def park(m):
        comments.append(m.group(1).replace("*/", "*\\/").strip())
        return "@@JSXCOMMENT%d@@" % (len(comments) - 1)

    inner = re.sub(r"<!--(.*?)-->", park, inner, flags=re.S)
    inner = escape_text_braces(inner)
    inner = convert_tags(inner)
    inner = re.sub(
        r"@@JSXCOMMENT(\d+)@@",
        lambda m: "{/* %s */}" % comments[int(m.group(1))],
        inner,
    )
    inner = inner.strip()

    imports = ["import { IonContent, IonPage } from '@ionic/react';"]
    if nav_key:
        imports.append("import BottomNav from '../../components/BottomNav';")

    nav_line = "\n      <BottomNav active=\"%s\" />" % nav_key if nav_key else ""

    wrapper_class = body_class.strip()
    if nav_key and "pb-" not in wrapper_class:
        wrapper_class = (wrapper_class + " pb-24").strip()

    return """// AUTO-GENERATED from the Stitch export `%s`.
// Regenerate with scripts/convert_stitch.py rather than editing by hand;
// behaviour (routing, data, handlers) belongs in the wrapper, not in here.
%s

const %s: React.FC = () => (
  <IonPage>
    <IonContent fullscreen>
      <div className="%s">
%s
      </div>
    </IonContent>%s
  </IonPage>
);

export default %s;
""" % (folder, "\n".join(imports), name, wrapper_class, reindent(inner, 8), nav_line, name)


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(CSS_OUT), exist_ok=True)
    written = []
    css_chunks = []

    for folder, (name, route, nav_key) in SCREENS.items():
        path = None
        for root in SRC_ROOTS:
            cand = os.path.join(root, folder, "code.html")
            if os.path.exists(cand):
                path = cand
                break
        if not path:
            print("MISSING: %s" % folder)
            continue

        with open(path, "r", encoding="utf-8") as fh:
            doc = fh.read()

        body_class, inner = extract_body(doc)
        tsx = build_component(name, route, nav_key, body_class, inner, folder)
        css_chunks.append(extract_custom_css(doc, folder))

        out = os.path.join(OUT_DIR, name + ".tsx")
        with open(out, "w", encoding="utf-8") as fh:
            fh.write(tsx)
        written.append((name, route, nav_key, len(tsx)))
        print("%-20s -> %-28s %6d bytes" % (folder, name + ".tsx", len(tsx)))

    css = "\n".join(c for c in css_chunks if c)
    header = (
        "/* AUTO-GENERATED from the Stitch exports' <style> blocks.\n"
        "   Screen-specific rules only — shared boilerplate lives in index.css.\n"
        "   Regenerate with scripts/convert_stitch.py. */\n\n"
    )
    with open(CSS_OUT, "w", encoding="utf-8") as fh:
        fh.write(header + css)
    print("\ncustom CSS -> %s (%d bytes)" % (CSS_OUT, len(css)))

    print("\n%d components written to %s" % (len(written), OUT_DIR))
    if warnings:
        print("\nwarnings:")
        for w in sorted(set(warnings)):
            print("  - %s (x%d)" % (w, warnings.count(w)))


if __name__ == "__main__":
    main()
