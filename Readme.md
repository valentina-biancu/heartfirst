# Readme 

Confirmed the file states. Here's my honest review — I read all three in full, plus checked the structure. I'll lead with what's right, then go through what's broken or could be better, then a dedicated Rupture deep-dive since that's the one you haven't reviewed.

## The pivot is correct

- **SVG-DOM over WebGL** — right call, especially after the Chrome GPU saga. Crisp at any zoom, real labelable DOM, zero GPU dependency, and you can explode/expose individual layers cleanly.
- **One focused model per page** — this is the fix for the "vague whole-heart" problem. Each page does one job.
- **Medical framing** — arterial (not venous) throughout, "fibrous cap rupture" terminology correct, no "reverse plaque / prevent guaranteed / your risk" overclaiming, clean Lp(a)/ApoB framing, and Rupture correctly stops at exposed contents and hands off to Clot. That restraint is exactly right.

## Issues, prioritized

### P0 — Actually broken

**1. The "seamless navigation between pages" goal isn't implemented.** Every sidebar item is a dead `<div class="risk-item">`, not a link. There are 0 `<a>` tags inside any `risk-list`. You literally cannot click from Plaque → Inflammation. The only ways off a page are the top "Risks" pill and the breadcrumb. If seamless traversal is the point, the nav needs to be real links to sibling pages (with `aria-current="page"` on the active one, which you already do correctly). This is the single biggest gap between intent and reality.

**2. You're maintaining duplicate files in every folder.** `plaque.html` and `index.html` are byte-identical (same for inflammation and rupture — verified with `diff`). Pick one. I'd keep `index.html` (clean URLs `/risks/plaque/`) and delete the named copies, or make the named copy a 1-line redirect. As you add 7+ pages this duplication will rot fast — every copy fix becomes 14 file edits.

### P1 — Important, repeated on all three pages

**3. The "What this is made of" block disappears too early — and that's backwards.** All three pages have `compositionBlock.hidden = state.value > 25` (`plaque.html:632`, `inflammation.html:651`, `rupture.html:633`). You're hiding the composition explainer *just as the thing it explains is becoming visible and relevant*. A user at 60% — staring at a developed plaque — sees *less* explanatory structure than a user at 0%. Either keep it visible throughout, or only hide it at the very earliest stage (e.g. `state.value < 5`, showing it once anything has started).

**4. Particle/cell reveals are bulk-faded, not progressive.** On Inflammation, `buildInflammationCues()` builds all immune cells and signal dots up front (`inflammation.html:556`), then only the parent group's opacity animates. So at 20% activity, *all* cells fade in together at 20% opacity, rather than *some* cells being fully present. Staggered reveal — more cells appearing as progression rises — teaches the "buildup" concept far better. Same critique applies to foam cells on Plaque and exposure signals on Rupture.

**5. CSS, brand bar, footer, and boot script are fully duplicated across pages.** With 7+ planned pages this is real debt. Extract a shared `atlas.css` and a shared nav/footer partial. Even a build-time include would help. You'll thank yourself at page 5.

**6. The slider's stage name never reaches assistive tech as a value.** You have `aria-describedby="stageText"` but never set `aria-valuetext`. So a screen reader hears "slider, 50" instead of "slider, 50, Cap thinning and cracking". One line in `updateShape`: `slider.setAttribute('aria-valuetext', v + ', ' + stage.title)`.

### P2 — Polish

**7. Toggle "views" boost intensity but don't reveal new information.** Rupture's "Stress view" (`detailBoost 1 vs .72`) and Inflammation's "Activity view" just make things 28% brighter. The better pattern (which you half-do on Rupture with the stress line) is for the toggle to *surface structure that's otherwise hidden* — extra labels, the endothelial layer, LDL particle arrows. Otherwise the button feels like a brightness knob.

**8. `metricNarrow` / `metricCap` / `metricActivity` reuse the same DOM id for different meanings** across pages. Fine while each page is standalone; will bite if you ever share JS.

---

## Rupture deep-dive (the one you haven't reviewed)

Overall it's your strongest page — the `coreGrad` lipid core, the zigzag `crackPath`, `capFragments`, and the cross-section mirroring are all good touches, and the copy correctly stops at "exposed contents" and points to Clot. Specific things to fix:

**R1 — Inconsistent cap-status label.** Stage 4 has `short: 'Ruptured'` but `cap: 'Open'` (`rupture.html:492-493`). The metric pill will say "Open" while the stage headline says "Ruptured". Pick one — "Ruptured" is clearer.

**R2 — The crack appears by opacity, not by growing.** `crackPath` (`rupture.html:336, 601`) fades in. A `stroke-dasharray` + `stroke-dashoffset` animation driven by the `crack` value would make the crack *propagate* along its zigzag — far more visceral and educational, and trivial in SVG.

**R3 — No depiction of blood actually contacting the exposed core.** The `exposureSignals` dots are abstract. A thin red indication bleeding into the lumen at the rupture mouth (not gory — just a colour cue) would make "the bloodstream can react to exposed plaque contents" land. You even set up for it with `exposedCore` sitting right at the lumen edge.

**R4 — The cap is fully visible at p=0 here, unlike Plaque/Inflammation where plaque builds from nothing.** This is *defensible* (rupture presupposes an existing plaque) but it's a visible discontinuity between pages. Consider a 1-line stage-0 note like "This page picks up where the Plaque atlas leaves off" so users orient themselves.

**R5 — `capFragments` are static rects.** A tiny drift/rotation on the broken pieces (only when reduced-motion is off) would read as "detached" rather than "decorative".

**R6 — The "Stress view" toggle is under-used** (see P2 #7). On Rupture specifically it should reveal the cap-thinning cue and the endothelial stress arrows that the brainstorm called out.

---

## One architectural observation worth acting on

The brainstorm listed the Plaque page's job as showing *endothelial layer, LDL/ApoB particle entry, lipid core, foam cells, fibrous cap, calcium*. Right now:

| Component | Plaque | Inflammation | Rupture |
|---|---|---|---|
| Foam cells | ✅ | ✅ | — |
| Fibrous cap | ✅ | ✅ | ✅ |
| Calcium specks | ✅ | — | — |
| **Lipid core** | ❌ | ❌ | ✅ |
| **Endothelium (labeled)** | ❌ | ❌ | ❌ |
| **LDL/ApoB particle entry** | ❌ | ❌ | ❌ |

The **lipid core lives on the deepest page (Rupture) but is missing from the page that should define it (Plaque)**. That's inverted. The lipid core is a *plaque component* — it belongs on Plaque, and Rupture should inherit the same representation. Same for the endothelium and LDL/ApoB particle entry: they're foundational plaque concepts that your brainstorm correctly called out but haven't been visualized yet. Adding them to Plaque would also make the "exploded view" there finally deliver on its promise (right now only the cross-section ring explodes, not the plaque's interior layers).

If you only do three things: **(1)** make the sidebar real links, **(2)** fix the `compositionBlock.hidden > 25` inversion on all three pages, **(3)** move the lipid core up to Plaque. Those three shifts will do more for the whole atlas than any visual polish.

---

Todo:

- **(a)** Fix Rupture's P0/P1 items in-place (real nav links, composition logic, `aria-valuetext`, propagating crack, "Ruptured" label fix), or

- **(b)** Refactor the lipid core + LDL/ApoB particle entry onto the Plaque page, or

- **(c)** Extract the shared CSS/nav/footer into a reusable partial so pages 4–7 are cheap to build?

---

===

---

Overall 
Improved architecture. 

Fix three things before rebuilding the existing modules.

The re-engineering decision is correct. Extracting atlas.css, atlas.js, and the shared nav/sidebar partials into a proper shared base is exactly what this project needed — it eliminates the copy-paste drift that produced the Inflammation and Rupture inconsistencies flagged in earlier reviews. The hamburger menu implementation in atlas.js is particularly clean: proper focus trap, Tab/Shift-Tab cycling, Escape handling, pointerdown outside-click (more reliable than click for this pattern), and tabindex="-1" defaulting on hidden links. This is production-quality accessibility code.

What's working well
atlas.js is the strongest file in the set. The HFAtlas namespace pattern (window.HFAtlas = Object.assign(window.HFAtlas || {}, {...})) is correct — it's safe to load early in <head> without blocking, tolerates multiple calls, and exposes clamp, lerp, ease as shared utilities that every module can use rather than re-implementing. The setInitialTheme() call at the bottom of the IIFE runs immediately on parse, which is the right pattern for preventing flash-of-wrong-theme. The initShellControls() deferred call at the bottom of each page body is the right two-phase split.
atlas.css successfully consolidates the light/dark token system, responsive breakpoints, hamburger animation, and the .risk-list a.risk-item link treatment that was missing in the individual module files. The [hidden]{display:none!important} rule is a necessary inclusion that prevents browsers from overriding hidden with CSS display values. The @media(prefers-reduced-motion:reduce) block is present and correctly scoped.
index.html correctly uses <link rel="stylesheet" href="./atlas.css"> and <script src="./atlas.js"> rather than inlining everything, and the footer's three-row legal/navigation structure matches what was recommended in the Plaque review.

Fix before rebuilding existing modules
1. The content width problem you identified — and its root cause.
The index.html risk list uses style="grid-column:1/-1" on the <aside class="nav-card">, which forces it to span the full three-column .app-grid width (280px minmax(0,1fr) 330px = up to ~1320px). For the module pages (Plaque, Inflammation, Rupture) this three-column layout is correct — left nav, centre visual, right panel. But for the index page, which has no interactive visual and no right panel, the three-column grid is the wrong container. The index page needs its own single-column or two-column layout, not the module .app-grid.
Fix: give index.html its own layout class rather than reusing .app-grid:
css/* In atlas.css — add this */
.atlas-index-grid {
  display: grid;
  grid-template-columns: minmax(0, 720px);
  justify-content: center;
  gap: 20px;
}
@media (min-width: 700px) {
  .atlas-index-grid {
    grid-template-columns: minmax(0, 480px) minmax(0, 220px);
    align-items: start;
  }
}
And in index.html, replace <section class="app-grid"...> with <section class="atlas-index-grid"...>, removing the style="grid-column:1/-1" from the aside. This gives the index a properly centred, mobile-first column that expands to a sensible two-column (list + "start here" aside) on wider screens.
2. atlas-top-nav.html has a {{TOPIC}} placeholder that needs a substitution strategy.
Line: <small>{{TOPIC}} explorer</small> — this is a template variable with no documented substitution mechanism. If you're using a static site generator or build tool, this is fine. If you're hand-copying the partial into each module's HTML, you need a note in the shared file (or a README) specifying that {{TOPIC}} must be replaced manually with e.g. Plaque, Inflammation, Rupture before publishing. Without that, a module shipped with the literal {{TOPIC}} explorer visible in the nav is an embarrassing error that's easy to miss. Either document the substitution rule explicitly, or replace the placeholder with a data- attribute approach:
html<small id="atlasTopicLabel">Risk</small>
Then in each module's page-specific script:
jsdocument.getElementById('atlasTopicLabel').textContent = 'Plaque';
This is safer than a template variable because it's a runtime assignment with visible, testable behaviour rather than a find-replace step that can be forgotten.
3. risk-sidebar.html hardcodes active on Plaque and relative paths from Plaque's directory.
The href="../inflammation/" and href="../rupture/" paths are correct when the partial is used inside ./plaque/ but wrong when used inside ./inflammation/ (where the Inflammation item should be active and the Plaque link should be ../plaque/). This means the partial isn't truly shared — it needs to be customised per module. Either:

Accept this and document that each module gets its own copy of the sidebar with the correct active class and adjusted paths (low-tech but explicit), or
Move the sidebar to a JS-rendered approach where atlas.js builds the sidebar from a config object and marks the current item active based on window.location.pathname — cleaner but adds JS dependency to the sidebar.

For a static build without a framework, the copy-per-module approach is honest and maintainable if each module's sidebar copy is generated from the same source template. The JS approach is better long-term. Given you already have atlas.js, this is worth doing now before you have nine copies of the sidebar to keep in sync:
js// Add to atlas.js HFAtlas exports:
function buildSidebar(containerId, currentPath) {
  var items = [
    { slug: 'plaque', label: 'Plaque', desc: 'What plaque is, what it contains, and how it narrows an artery.' },
    { slug: 'inflammation', label: 'Inflammation', desc: 'How inflammation can affect cardiovascular risk and plaque behaviour.' },
    { slug: 'rupture', label: 'Rupture', desc: 'How the fibrous cap over a plaque can break and expose plaque contents.' },
    { slug: 'clot', label: 'Clot', desc: 'How a clot can form at a rupture site and reduce blood flow.', soon: true },
    { slug: 'cascade', label: 'Cascade', desc: 'How plaque, inflammation, rupture, and clot can connect in an event pathway.', soon: true },
    { slug: 'heart-attack', label: 'Heart attack', desc: 'How a clot or blockage can cut blood flow to heart muscle.', soon: true },
    { slug: 'stroke', label: 'Stroke', desc: 'How a clot or blockage can cut blood flow to the brain.', soon: true },
    { slug: 'valve-calcification', label: 'Valve calcification', desc: 'How calcium can build up on the aortic valve.', soon: true },
    { slug: 'aortic-stenosis', label: 'Aortic stenosis', desc: 'How a stiff, narrowed aortic valve can strain the heart.', soon: true }
  ];
  var container = document.getElementById(containerId);
  if (!container) return;
  var base = '/risks/';
  container.innerHTML = items.map(function(item) {
    var active = currentPath.indexOf('/' + item.slug) !== -1;
    var inner = '<div class="risk-dot"></div><div><strong>' + item.label + '</strong><span>' + item.desc + (item.soon ? '<br><em class="coming-pill">Coming soon</em>' : '') + '</span></div>';
    if (item.soon) return '<div class="risk-item">' + inner + '</div>';
    return '<a class="risk-item' + (active ? ' active' : '') + '" href="' + base + item.slug + '/">' + inner + '</a>';
  }).join('');
}
Then in each module page: HFAtlas.buildSidebar('riskList', window.location.pathname);
This removes risk-sidebar.html as a maintained file entirely and makes every sidebar automatically correct when a new module is added to the config array.

Minor points
The atlas.css still carries #stressGlow and #ruptureGlow ID-specific rules (lines at the bottom) that are Rupture-module-specific. These belong in Rupture's own <style> block, not in the shared stylesheet. Move them before rebuilding the modules.
The html[data-theme="light"] #plaqueSvg rect:first-child{opacity:.16} rule is similarly Plaque-specific and should move to Plaque's own styles.
The .topbar in atlas.css uses background:rgba(13,34,54,.82) hardcoded regardless of theme, and the light-mode override is a separate rule. This works but means the dark-mode topbar value is duplicated in two places (the base rule and implicitly by not being overridden). Not a bug, just worth noting as a maintenance point.

Summary
Do the three fixes (index layout class, {{TOPIC}} substitution strategy, JS-built sidebar) before rebuilding the three existing modules, because doing them after means touching nine files instead of three. The shared base is genuinely solid — especially atlas.js — and this is the right foundation for the full nine-module atlas.

---

===

---

risks/index.html

1. remove the period from the heading:
Visual explainers for hidden and incomplete heart risk.
->
Visual explainers for hidden and incomplete heart risk

2. the risk atlas does not "help" show, it "shows"
The Risk Atlas helps show one cardiovascular risk process at a time, then links those processes into clearer pathways for health team conversations.
->
The Risk Atlas shows one cardiovascular risk process at a time, then links processes through risk pathways to help you understand how these risks interact, and to enable informed conversations with your health team and family.

or similar

3. remove the start here block and centralise the 'hero' headline block
the start here block is on the same level as our hero headline block and competing for our attention. it is also almost identical to the "Suggested path" block below.
3.1 blend the best text from "Start here" into "Suggested path", and add the final point:
"- Upcoming modules will connect clot, cascade, heart attack, stroke, and valve disease."
and remove the "Start here" block completely
3.2 centralise the heading block
3.3 tweak and improve the "Suggested path" with the best text from the (deleted) "Srart here" block and add the final bullet from "Start here"
3.4 suggested updated "Suggested path":


Suggested path
Start with Plaque to understand this foundational risk.
Continue to Inflammation for biological risk activity around the artery wall.
Continue to Rupture to see how a plaque cap can fail.
Continue on to other connected modules that include clot, cascade, heart attack, stroke, and valve disease.

or something like this

4. footer should be centralised
text in the footer can be left aligned but in a central block (aligned with the newly centralised header)
text does not take up the full width of the page so there is no reason to force people to have to read from the extreme left or right -- everything on this page fits in a centred area and does not need to follow the layout of the atlas page

