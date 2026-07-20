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

---

===

---

## Verdict: Cascade is the most ambitious page, and it mostly lands — but it has one real bug, one dead-end, and a few places where its ambition outruns its clarity

This page tries to do something the others didn't: be a **synthesis view** that connects four prior modules plus a forward-pointing branch. That's the right instinct for a cascade page. The dual layout (rail map on top, artery below) is genuinely useful — abstract pathway + concrete anatomy in one frame. And it's inherited every discipline Clot established: aligned thresholds (12/35/60/84/100 ↔ 12/35/60/84), progressive per-element reveals, the propagating crack via `drawCrack` (you backported my R2 fix from Rupture!), the cheap idle loop (`updatePlateletPulse` only, no full `updateShape` — Clot's C1 perf bug fixed), and reduced-motion gating on the loop.

So the foundations are strong. But it's not yet "as good as it can be." Here's what's holding it back.

## Bugs / correctness

### B1 — The pathway rail's `S` commands don't connect; it's actually three disconnected arcs
Line 122–123:
```
d="M122,104 C220,70 316,70 414,104 S608,138 706,104 S812,70 858,96"
```
The first segment is a cubic `C` ending at **(414,104)**. The next `S` smooth-continues from there — but `S` reflects the *previous control point*, so the join is mathematically continuous but the reflected control lands at (414 + (414−316), 104 + (104−70)) = (512, 138), which then curves to (706,104). The third `S` reflects again from (706,104)'s incoming control (608,138) → reflected to (804,70) → curves to (858,96).

The result is a **rail that dips down, back up, down again** — a W shape — not the gentle single wave I suspect you wanted. Worse, your **node circles sit at y=104, 84, 124, 112, 96** — none of them actually on the rail path except the first and last. Activity node (304,84) floats above a rail that at x=304 is around y=70; Rupture node (486,124) sits below a rail that at x=486 is around y=138. The rail and the nodes are visually disconnected.

This is the kind of thing that's invisible when you're building it and glaring to a first-time viewer. Fix: either lay nodes on the rail mathematically (sample `railBase.getPointAtLength()` and position nodes from it), or replace the multi-curve with one smooth cubic whose peaks/valleys hit your node coordinates. The first option is more robust and ~10 lines.

### B2 — Idle loop reads `state.value > 60` but platelets don't exist until the same threshold, so the pulse never animates until you're already past stage 3
Line 569: `if(state.value > 60) updatePlateletPulse();`
Platelets first appear at `clot = (v-60)/24`, i.e. at v=60 they're at opacity 0. So the pulse only kicks in once you're already into the clot stage. That's... actually fine, since pulsing invisible platelets would be wasted work. But it means the **signal pulse on activity nodes** (which you presumably want animating in earlier stages) isn't happening — `updatePlateletPulse` only touches platelets. If you wanted the activity signals or rail progress to gently pulse, that's missing. If you didn't, ignore.

### B3 — `branchPanel` is a dead-end
Lines 198–206: the "Next modules" panel appears at flow-threat (good timing), shows "heart pathway" and "brain pathway" arrows — but they're **purely decorative `<path>` elements with arrowheads**, not links. The page whose entire purpose is to hand off to Heart Attack and Stroke doesn't actually link to them. And right now those destination pages don't exist (verified: `heart-attack/` and `stroke/` are missing), so even if you wired them they'd 404.

When those pages exist, `branchPanel` should contain two real `<a>` elements to `../heart-attack/` and `../stroke/`. Until then, at minimum add `aria-disabled` or a "coming soon" cue so users aren't expecting clickable arrows. Right now it's a tease.

## Clarity problems (the page's job is to *connect* — make sure it does)

### C1 — The rail map and the artery below don't visually correspond
This is the big one. The page's whole promise is "show how the steps connect." But the rail (top) and the artery (bottom) use **different anchor points** for the same concepts:
- Rail "Activity" node is at x≈304; the artery's `activitySignals` cluster is at x≈350–530
- Rail "Rupture" node is at x=486; the artery's `ruptureCrack` is at x≈535–622
- Rail "Clot" node is at x=668; the artery's `clotMass` is at x≈546–670

A user watching the rail fill in has no spatial cue connecting "Rupture lit up" to "the crack appeared in the artery." **Vertical alignment between rail nodes and artery events would make the synthesis click.** Either:
- Move the rail nodes to the x-coordinates of their artery counterparts (then bend the rail to visit them), or
- Draw faint vertical guide lines from each active node down to its artery event when it lights up.

The second is cheaper and reads beautifully — a dashed vertical drop from "Rupture" to the crack the moment it appears.

### C2 — The hand-off sentence overpromises one direction
Stage 3 meaning (line 346): *"This is the hand-off from a plaque problem to a blood-contact problem. It prepares the clot step **without claiming a clot must form**."* — good, this is the careful framing.
But Stage 2 meaning (line 341): *"This stage links plaque context to a more active environment. It does not mean inflammation and clot are the same thing; they remain distinct processes."* — also good.

Where it slips is the hero sub (line 36): *"how a local artery problem can become a pathway that leads toward downstream event modules."* That's accurate but the verb "leads toward" is slightly stronger than the careful stage copy. Consider "can lead toward" to match the conditional framing everywhere else.

### C3 — `pathwayArrows` only render in Pathway view, but they're the *connective tissue* — they should be on by default
Lines 146, 452: the arrows between rail nodes have `opacity="0"` and only appear when `detailReveal * max(...)`. So in the default view, a user sees five disconnected circles light up one by one with **no visible connection between them**. That defeats the entire purpose of a cascade diagram. The rail's `railProgress` line does fill in, which helps — but the directional arrows (which communicate "this leads to that") are hidden behind the toggle.

For a cascade page, the connecting arrows should be **on by default at low opacity**, brightening in Pathway view. Right now the default view says "here are some nodes" rather than "here is a pathway."

### C4 — Stage 0 node opacities are inconsistent and look broken
Lines 128, 133, 137, 141: nodeActivity starts at `.45`, nodeRupture at `.35`, nodeClot at `.30`, nodeFlow at `.25`. Presumably this is a "future steps are dimmer" cue. But nodePlaque (line 124) has no opacity attribute, so it's `1` by default. The result at stage 0: Plaque is fully bright, the next four step down in opacity — which reads as "Plaque is active, the others are disabled/future." That's actually a reasonable cue *if intentional*. But combined with `railProgress` opacity 0 at start, the page opens looking like "one bright node, four ghost nodes, no rail" — which feels broken rather than intentional.

Fix the first impression: either show the full rail at low opacity from stage 0 (so the pathway is visible as a pathway even before progression), or label the dimming explicitly ("steps ahead" caption near nodeFlow).

## Polish

### P1 — `drawCrack` is great; backport confirmed and improved
You've taken my Rupture R2 suggestion (propagating crack via dasharray) and made it a reusable `drawCrack(progress)` function with cached `crackLength`. This is the right abstraction. **Now do the same for `ruptureCrack` on the Rupture page itself** — it still uses the old opacity+stroke-width fade. The pattern is right here in Cascade lines 401–406; copy it over.

### P2 — Backport `updatePlateletPulse` (separate from full updateShape) to Clot
Cascade lines 428–435 split the pulse into its own function so the idle loop is cheap. **Clot still runs full `updateShape` every 190ms** (Clot C1 from last review). You've solved it here — port the fix back.

### P3 — `compositionBlock.hidden = state.value < 5` is consistent (good), but the composition heading "What a cascade can connect" is the weakest of the four lists
Plaque: "What plaque is made of" (components). Inflammation: "What inflammation can involve" (mechanisms). Rupture: "What rupture can involve" (mechanisms). Clot: "What clot formation can involve" (mechanisms). Cascade: "What a cascade can connect" — this is the odd one out because the answer is just "the previous four pages," which the list then restates. It's fine, but consider making it additive: *"What can feed a cascade"* and include the risk-layer chips (Lp(a), ApoB, BP, metabolic, family history) that Pathway view reveals — those are the actual *inputs* to a cascade and they're under-taught right now.

### P4 — `metricPressure` (Low/Rising/High/Very high/Severe) is a new vocabulary word
Every other page's metric column uses domain-specific terms (narrowing %, cap status, flow impact). Cascade introduces "Pathway pressure" — an invented concept that doesn't map to anything clinical. It's a useful UI shorthand but it's the only made-up term in the atlas. Either keep it (it's intuitive) or relabel to something defensible like "Pathway stage" or just drop that metric row.

## What's genuinely excellent

- **The dual-map concept** (rail + artery) is the right idea for a synthesis page — it just needs the spatial correspondence fixed (C1).
- **Honest hand-offs everywhere**: stage copy repeatedly says "can," "prepares," "without claiming," and the final stage points forward rather than declaring an event. This restraint is consistent with the rest of the atlas and it's working.
- **`drawCrack` as a reusable utility** — you've started abstracting the patterns. That's the right direction as you hit pages 6–9.
- **Reduced-motion gating on the idle loop** (line 565) — better than Clot, which ran the loop unconditionally.
- **Threshold alignment is perfect.** Five pages in, the discipline is locked in.

## To answer your question directly: is it as good as it must and can be?

**Not yet — but the gap is small and specific.** "Must" (correctness): fix **B1** (rail geometry/nodes disconnected — it's the kind of thing that looks like a bug to viewers) and decide what to do about **B3** (dead-end branch panel pointing at pages that don't exist). "Can be" (clarity): fix **C1** (rail-to-artery spatial correspondence — this is the page's reason to exist) and **C3** (connecting arrows on by default). Those four changes turn this from "ambitious draft with rough edges" into "the page that makes the whole series click."

## Suggested priority fixes

1. **B1 + C1 together** — re-lay the rail so nodes sit on it AND align with artery events. One geometric pass fixes both.
2. **C3** — default the pathway arrows to low opacity so the page opens as a pathway.
3. **B3** — make `branchPanel` either link to real pages (when they exist) or honestly signal "coming next."
4. Backport `drawCrack` to Rupture and `updatePlateletPulse` to Clot while it's fresh.


---

===

---


## Ship it.

I verified everything on disk rather than taking the changelog at face value, and every claim holds up.

### Verified backports (genuine credit to you)

**Rupture — propagating crack: confirmed, and implemented better than I asked for.** You used `pathLength="1"` (line 135) so the dasharray math is normalized to `1 - crack` instead of requiring a `getTotalLength()` call. That's cleaner than my suggestion — no cached length, no first-frame hiccup. I missed in my original Rupture review that you'd already moved to this; my apologies. Thresholds also now align (12/35/60/84/100 ↔ 12/35/60/84). Rupture's two long-standing issues are genuinely closed.

**Clot — separate `updatePlateletPulse` + lightweight idle loop: confirmed.** Function exists at line 369, idle loop at 505–508 only calls `updatePlateletPulse()` (no full `updateShape` re-run). C1 perf bug fixed. The `state.value > 12` guard is also better than Cascade's `> 60` — platelets become relevant earlier in Clot than in Cascade, and you've matched the guard to each page's actual threshold.

### Cascade fixes — all in, all verified

| Fix | Status |
|---|---|
| **B1** Rail geometry/nodes disconnected | ✅ Nodes now sit on the rail curve at (250,104)→(410,84)→(560,124)→(680,112)→(790,96), matching the path's `C…C…C…C…C` waypoints. Reads as one connected pathway now. |
| **C1** Rail-to-artery spatial correspondence | ✅ `eventGuides` adds dashed vertical drops from each node toward the artery. The rail and artery are now visually linked, which is the page's whole point. |
| **C3** Pathway arrows on by default | ✅ `pathwayArrows` now starts at `.18` opacity (was `0`) and the formula `clamp(.18 + p*.18 + detail*.44, .18, .88)` lifts on Pathway view. Page opens as a pathway, not as five loose circles. |
| **B3** Branch panel honest about "coming next" | ✅ `branchPanel` carries `role="img"`, `aria-label`, `aria-disabled="true"`, and reads "Coming next / Shown later, not linked yet." No fake links. |
| **C2** Hero "leads toward" → conditional | ✅ Now "can connect into a pathway that can lead toward" — doubled conditional, matches stage copy. |
| **P3** "What a cascade can connect" → "What can feed a cascade" | ✅ List now names the actual upstream inputs (Lp(a), ApoB, BP, metabolic, inflammatory, calcium-score, smoking, medicines, symptoms, family history). The composition block finally teaches the inputs. |
| **P4** "Pathway pressure" → "Visual intensity" | ✅ No more invented clinical term. |

### Two small things I'll mention so they're on your radar — not blockers

1. **C4 (stage-0 node dimming) wasn't explicitly addressed, but it no longer matters.** The nodes still step down `.45 / .35 / .30 / .25` at stage 0, which was originally a concern because the page opened looking like "one bright node + four ghosts." But with the pathway arrows now visible at `.18` from the start and the rail fully drawn, the dimming reads correctly as "future steps, faded until reached" rather than "broken." So C4 is resolved *de facto* by C3 + the rail. No action needed.

2. **`guidePlaque` is on from stage 0** (line 469: `.16 + detail*.18`). The other four guides only appear as their stage activates. That's a deliberate choice (Plaque context is always present) and it reads fine — just flagging that it's the one guide that doesn't fade in with progression, in case it was unintentional.

### Where the series stands

Five pages in, the discipline is locked: aligned thresholds, progressive per-element reveals, separate cheap idle loops, reduced-motion gating, honest cascade framing, topic-specific CTAs on the later pages. The shell extraction is paying off — pages 4 and 5 were materially cheaper to build well than pages 1–3, which is exactly the payoff you wanted from the refactor.

Cascade is now doing its job: it's the page a user reaches after Plaque → Inflammation → Rupture → Clot and finally sees how those four connect, with an honest hand-off toward Heart Attack and Stroke. That's a complete educational arc for the arterial cascade. The remaining four pages (heart-attack, stroke, valve-calcification, aortic-stenosis) are net-new ground rather than synthesis, so they'll have different design challenges — but the patterns are now there to inherit.

Ship it.

---

===

---

Let me read the full file.Good. Now the large truncated section.I have the complete file. Here is the full review.

---

## A. Executive verdict

**Ready to publish — and the most strategically important page in the HeartFirst digital estate.** No must-fix bugs. The architecture is correct: `atlas.js` and `atlas.css` imported via `../../risks/`, `HFAtlas.clamp/lerp/ease/pct` imported, `HFAtlas.allowMotion()` used, `<link rel="canonical">` present, all `getElementById` references map to present elements, all labels participate in the toggle. The two images (`one-in-five.png`, `family-tree.png`) have correct, descriptive `alt` text. This page works harder than any other in the atlas because it has to simultaneously serve as an educational standalone, a synthesis view of the nine-module atlas, a product entry point, and the primary SEO asset for the `stealth cholesterol` / `Lp(a)` category. It does all four jobs. There are improvements worth making — particularly on the "useless block" you identified in Note 3, and on a small but important bug in the `limits` element — but nothing here blocks publication.

---

## B. One genuine bug

**`limits` is rendered as a `<div class="callout">` (line 408) but `limits.textContent = stage.limits` in `render()` (line 607) treats it like a plain text container.** The `<div>` has the initial text "This is not a risk calculator, diagnosis, or treatment plan. It is a visual map for organising questions." hardcoded as its inner HTML (not inner text). When JS runs `limits.textContent = stage.limits` at slider value 0, it overwrites the element's content with the same string — which happens to match stage 0's `limits` field exactly, so at slider 0 it looks fine. But at every other stage, `textContent` assignment strips any child elements that may have been inside the `callout` div (there are none currently, but this is fragile). More critically: the `<div class="callout">` has left-border and background styling from `atlas.css` that is correct for the initial disclaimer but visually identical for stage-specific `limits` copy that should read as plain informational text rather than a styled alert. Stage 4's limits copy ("This does not diagnose valve disease") and stage 5's ("This final stage is not a prediction") don't need the gold-border alert styling — they're informational rather than warning. Consider rendering `limits` as a plain `<p>` inside a standard `info-block` rather than a styled callout, or keeping the callout only for the stage-0 disclaimer and switching to a plain element for stages 1–4. Simplest fix that preserves current appearance:

```html
<!-- Replace the callout div with a standard info-block: -->
<div class="info-block">
  <h3 class="subhead">What this does not show</h3>
  <p id="limits" class="panel-copy">This is not a risk calculator, diagnosis, or treatment plan. It is a visual map for organising questions.</p>
</div>
```

---

## C. The "useless block" — your diagnosis is correct, your proposed fix is better, but there is a more valuable version

Your current block (lines 388–392):
```
Lp(a) signal: Inherited
Artery pathway: Context
Valve pathway: Context
Family relevance: Possible
```

Your proposed replacement:
```
Lp(a) signal: Inherited
Artery relevance: Plaque, inflammation, rupture, clot, heart attack, stroke
Valve relevance: Calcification and aortic stenosis
Risk relevance: Can elevate, accelerate, and compound other cardiovascular risk
Family relevance: Close relatives may also have high levels
```

Your diagnosis is right: "Context" and "Possible" are internal notes masquerading as public content. Your proposed fix is genuinely better — the named risk domains replace the flat placeholders with real information.

But there is a more valuable version of this block, because the stage data already drives it. The current stage values update dynamically but only output single words that don't tell the reader anything. The real opportunity is to make this block **change meaningfully as the slider advances** — so it reflects what is actually being shown at each stage rather than being a static snapshot. Here is what it could say across five stages:

| Stage | Lp(a) signal | Artery | Valve | Family |
|-------|-------------|--------|-------|--------|
| 0 | Mostly inherited | Not yet shown | Not yet shown | May be relevant |
| 1 | Lifelong exposure | Context building | Context building | Testing may help family |
| 2 | Amplifying artery risk | Plaque → clot pathway | Background context | Siblings and children |
| 3 | Amplifying valve risk | Linked | Calcification → stenosis | First-degree relatives |
| 4 | Compounded picture | Linked | Linked | Test close relatives |

The values already in the stage objects (`signal`, `artery`, `valve`, `family`) are the seeds of this, but they are too compressed as currently written ("Amplifying", "Artery", "Context") to be useful. Replacing those four values in the stage data with the full-sentence versions above, and updating the metric labels to match, would make this block the most scannable summary panel on the page — a reader who has slid to stage 3 and glances at the legend immediately understands where they are in the pathway without reading the full prose panel.

Concrete implementation: update each stage's metric values in the `stages` array:

```js
// Stage 0:
signal:'Mostly inherited', artery:'Not yet shown', valve:'Not yet shown', family:'May be relevant for close relatives'

// Stage 1:
signal:'Lifelong exposure', artery:'Building context', valve:'Building context', family:'Family testing worth discussing'

// Stage 2:
signal:'Amplifying artery risk', artery:'Plaque → rupture → clot → events', valve:'Background context', family:'Siblings and children may share it'

// Stage 3:
signal:'Amplifying valve risk', artery:'Linked', valve:'Calcification → stenosis pathway', family:'First-degree relatives worth testing'

// Stage 4:
signal:'Compounded picture', artery:'Linked — artery modules', valve:'Linked — valve modules', family:'Test close relatives'
```

And update the legend metric labels to be slightly wider to accommodate the longer values — or keep the labels short but make the `.value` element font slightly smaller for longer strings via a CSS rule:

```css
.metric .value{font-weight:800;word-break:break-word;font-size:clamp(.78rem,.95rem,1rem);}
```

This makes the block genuinely informative at every stage and earns its space in the layout.

---

## D. What this module does exceptionally well

**The dual pathway design — artery path curving upward from the Lp(a) node, valve path curving downward — is the most effective visual metaphor in the atlas.** It communicates "one source, two diverging risk directions" without any text. The path animation (`drawPath`) tracing each route as the slider advances makes the branching legible as a progression rather than as a static diagram. This is exactly the right visual architecture for a synthesis module.

**The `familySignal` group** (lines 361–368) — a dashed arc from the Lp(a) node to a small cluster of family circles, with the text "one result can prompt family testing conversations" — is the most emotionally resonant visual element in the entire atlas. It is also medically accurate: the dashed line correctly implies possibility rather than certainty, the cluster of three circles correctly implies "some relatives, not all," and the text avoids both false reassurance and unnecessary alarm. Keep this exactly as designed.

**The `lpa-proof-section`** (lines 174–220) with the two proof cards (Common/Inherited) plus the three `lpa-why-cards` is a structural addition that no other atlas module has — a standalone educational argument for why this topic matters before the interactive element begins. The sequence (proof cards → interactive visual → detailed modules → CTA) is the right information architecture for a page that needs to serve both first-time visitors and returning users who already understand Lp(a) basics.

**The `lpa-alert-notes` block** (lines 197–202) is the most useful single text block in the atlas. Five concise, specific, non-alarmist points — level matters, less familiar than HDL/LDL, lifestyle still matters, treatment trials underway, metabolic complexity — address the five questions a motivated non-specialist actually has after learning their Lp(a) is elevated. "New treatment trials are underway. Several Lp(a)-targeting medicines are being tested, including gene-silencing therapies" is the most forward-looking sentence in HeartFirst's educational content to date, and it is accurate as of the current state of Lp(a) pharmacotherapy development. Keep this, but add a low-key recency signal ("as of [year]" or "at the time of publication") since this is the one sentence most likely to become outdated:

```html
<li><strong>New treatment trials are underway.</strong> Several Lp(a)-targeting medicines are being tested, including gene-silencing therapies — ask your health team about the current state of Lp(a)-specific treatment options.</li>
```

**The `compositionBlock` "What Lp(a) can amplify" list** (lines 410–416) is correctly scoped — it names the four amplification domains (artery, valve, family, compounding) without claiming inevitability for any of them. This is the cleanest summary of Lp(a)'s risk relevance in any HeartFirst page.

**The CTA card copy** (line 441) is the best CTA in the project: "High Lp(a) is rarely a single-answer problem. The practical question is how it fits with your current tests, family history, artery risk, valve risk, and modifiable risk layers." This framing is accurate, non-alarming, and directly justifies why a paid structured product (rather than a free web search) is the appropriate next step.

---

## E. Should-fix items

**1. `Date.now()/1000` in `renderParticles()` (line 554)** — same flag as Valve Calcification and Aortic Stenosis. Replace with `performance.now()/1000`. Add this module to the single-pass update covering all three affected files.

**2. `buildSidebar` is not called for this module** (line 456–458 confirm the JS only calls `renderTopbar`, `renderFooter`, and `initShellControls` — no `buildSidebar` call). This is intentional: this module has its own `lpa-panel-list` navigation (lines 225–241) rather than the standard `riskSidebar`. That design decision is correct — the Lp(a) atlas nav logically links to the Lp(a) hub, artery pathway, valve pathway, and all modules rather than the per-module sidebar used inside `/risks/`. Document this as a confirmed structural difference. The `<aside id="riskSidebar">` element is absent from the HTML (confirmed — no such element exists in this file), which means there is no orphaned container. Clean.

**3. The scope card** (line 168) includes "Connects artery and valve pathways without placing Lp(a) inside the /risks/ folder" — this is an internal implementation note, not visitor-facing information. A visitor reading the scope card does not care or need to know about folder structure. Replace with something visitor-meaningful:

```html
<li>Treats Lp(a) as a cross-cutting risk signal rather than a single artery or valve condition.</li>
```

**4. `nodeEvents` is labelled "Heart attack or stroke"** (line 330) in the SVG but the atlas module it should link to is `/risks/cascade/` or `/risks/heart-attack/` — the visual node doesn't link anywhere. The `module-grid` links at lines 425–434 provide full module navigation below the visual, so this is not a missing feature — just a note that the SVG nodes are informational only, not interactive. Confirm this is intentional. If future versions add click-through from SVG nodes to individual modules (a reasonable v2 feature given the visual is already a synthesis map), the node IDs and group structure are already set up correctly for it.

---

## F. Final checklist before publishing

- [ ] Fix `limits` element: replace `<div class="callout">` with a standard `info-block` / `<p id="limits">` to decouple the gold-border alert styling from stage-specific informational limits copy
- [ ] Upgrade stage metric values from compressed single words ("Context", "Possible") to the fuller per-stage descriptions proposed in section C
- [ ] Add recency signal to the "New treatment trials are underway" sentence
- [ ] Replace "without placing Lp(a) inside the /risks/ folder" scope card item with visitor-meaningful language
- [ ] Replace `Date.now()/1000` with `performance.now()/1000` in `renderParticles()` — include in same pass as Valve Calcification and Aortic Stenosis
- [ ] Confirm `nodeEvents` SVG nodes are intentionally non-interactive (for now) and document v2 click-through as a future feature
- [ ] Confirm product CTA URLs are intentional placeholders or update to live URLs across all ten modules simultaneously


---

===

---


signal:'Inherited', artery:'Not yet shown', valve:'Not yet shown', family:'Relevant for family and loved ones'

signal:'Lifelong exposure', artery:'Building context', valve:'Building context', family:'Your result can inform family and loved ones'

signal:'Amplifies artery risk', artery:'Plaque → rupture → clot → events', valve:'Background context', family:'Parents, siblings, and children may share it'

signal:'Amplifies valve risk', artery:'Linked artery pathway', valve:'Calcification → stenosis pathway', family:'Helps family and loved ones stay informed'

signal:'Compounded risk', artery:'Linked artery pathway', valve:'Linked valve pathway', family:'Helps family and loved ones plan next steps'


---

We need to upgrade both the Plaque and the Inflammation risk atlases 

these were our first two attempts and probably now our weakest entries
they are however the first two risk atlases so should be amongst the best, most compelling and engaging, grabbing readers and ensuring they want to go through other modules

/lpa/risk-atlas may be one of our stronger modules and we wonder if you can use this as a 'template' or standard to elevate both the plaque and the inflammation modules. Alternatively, if you remember and prefer another module, let us know and we'll share it with you

We're assuming you still have ready access to /lpa/risk-atlas and the existing plaque file is at /risks/plaque

Please make the plaque risk atlas exemplary, premium, compelling

Thanks in advance


---

Breadcrumbs in both visible HTML and JSON-LD BreadcrumbList. The upgraded index has both. The individual module pages have visible breadcrumbs but some are missing JSON-LD BreadcrumbList — add this to each module's <head>. The pattern is the same for every module, only the position 2 item changes:
json{
  "@type": "BreadcrumbList",
  "@id": "https://heartfirst.shyntesy.com/risks/plaque/#breadcrumb",
  "itemListElement": [
    {"@type":"ListItem","position":1,"name":"HeartFirst","item":"https://heartfirst.shyntesy.com/"},
    {"@type":"ListItem","position":2,"name":"Risk Atlas","item":"https://heartfirst.shyntesy.com/risks/"},
    {"@type":"ListItem","position":3,"name":"Plaque","item":"https://heartfirst.shyntesy.com/risks/plaque/"}
  ]
}

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": "https://heartfirst.shyntesy.com/risks/plaque/#breadcrumb",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "HeartFirst",
      "item": "https://heartfirst.shyntesy.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Risk Atlas",
      "item": "https://heartfirst.shyntesy.com/risks/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Plaque",
      "item": "https://heartfirst.shyntesy.com/risks/plaque/"
    }
  ]
}
</script>


---

===


---

Github & Codex split


define the boundary like this:

heartfirst = public educational site and domain files
heartfirst-dev = sales, marketing, funnel, experiments, and portable assets

heartfirst-dev.

Examples:

sales pages
Systeme.io HTML blocks
checkout-support copy
marketing landing pages
launch pages
offer positioning
email funnel page content
experimental product pages
If a file starts in heartfirst-dev but may move later
That is fine. Just treat it as a draft until you decide where it belongs.

Possible destinations:

heartfirst
legal
Systeme.io
Shyntesy main
another product workspace

focusing on sales and marketing in heartfirst-dev, that sounds like the correct place for:

sales page copy;

product positioning;

offer framing;

funnel structure;

pricing / value proposition language;

Systeme.io-compatible HTML;

marketing assets that are not yet public HeartFirst site pages.

---

===

Thanks
here is our draft Recognise Hub
Please review it and give us feedback

---

---
title: "Recognise"
seo_title: "Recognise Heart Risk | HeartFirst"
stage: "Recognise"
topic: "Heart risk orientation and route finding"
kicker: "HEARTFIRST · RECOGNISE"
resource_question: "Where should I begin?"
deck: "Free, science-backed guidance to help you understand the heart, recognise internal and lived risks, and see what the standard cholesterol test does and does not show."
slug: "/recognise/"
primary_audience: "Adults seeking a clear and trustworthy starting point for understanding heart risk"
secondary_audience: "Family members, carers, people responding to a diagnosis or family event, and people preparing for a health team conversation"
estimated_reading_time: "11–14 minutes"
resource_type: "Collection hub"
access: "Open access"
formats:
  - "Canonical web hub"
  - "Individual web guides"
  - "Downloadable PDFs"
  - "Print versions"
  - "At a Glance companions"
publication_status: "First full public-facing hub draft"
version: "0.1"
clinical_review_status: "Required before publication"
---

# Recognise

**Heart risk rarely arrives as one clear problem.**

**HEARTFIRST · RECOGNISE**

Free, science-backed guidance to help you understand the heart, recognise internal and lived risks, and see what the standard cholesterol test does and does not show.

> **THE QUESTION**
>
> Where should I begin?

## Start with what brought you here

You may have arrived because:

- someone in your family had a heart attack or stroke;
- you were told that your cholesterol was high;
- you were told that your cholesterol was normal, but still feel that something may be missing;
- you have high blood pressure, diabetes, kidney disease, or another diagnosis;
- you have heard about Lipoprotein(a), or Lp(a), and do not know whether it was tested;
- you are trying to understand how food, sleep, movement, stress, smoking, work, or the environment affect heart risk;
- someone you love has survived a major cardiovascular event;
- you want to act before a first or further event changes what is still possible;
- you do not yet know the right question to ask.

Recognise is designed for this moment.

It does not assume that you already understand medical language.

It does not assume that one number, one diagnosis, one habit, or one test explains everything.

And it does not require you to complete a course before you are allowed to take a useful next step.

Recognise helps you see the landscape.

It gives you a clearer starting point for understanding what matters, what may remain incomplete, and where to go next.

## Why Recognise exists

Heart risk is often presented in fragments.

One appointment focuses on cholesterol.

Another focuses on blood pressure.

A separate result concerns glucose, kidney function, rhythm, or a scan.

Family history may remain in someone’s memory rather than in the record.

Advice about food, movement, sleep, smoking, alcohol, or stress may be given without asking what the person’s health, work, income, disability, culture, caring responsibilities, or environment make possible.

Each piece may be useful.

The difficulty is that people are often left to understand the connections alone.

This can lead to two opposite problems.

### False reassurance

A familiar result may be treated as though it answered a much larger question.

For example:

- “My cholesterol was normal, so every important heart risk must have been assessed.”
- “My HDL cholesterol is high, so other lipid risk does not matter.”
- “I feel well, so nothing significant can be developing.”
- “Nobody mentioned family testing, so the family history cannot be important.”

### Unfocused fear

The opposite can happen too.

A person may discover a new risk factor and begin to believe that:

- every symptom is caused by it;
- every available test is needed;
- one abnormal result predicts a future event;
- prevention is already too late;
- they must manage the entire problem alone.

Recognise is built to avoid both errors.

> **The purpose is not to reassure you about what has not been assessed, or frighten you with what might be present. It is to help you recognise what each piece of information can and cannot tell you.**

## Four foundations

Recognise is built around four open-access foundations.

Together, they move from the cardiovascular system itself to the risks that may affect it, the conditions in which those risks are lived, and the limits of the test most people already know.

The recommended route begins with the heart.

It is not a rule.

You may start with the question closest to your concern.

---

## The Heart We Are Trying to Protect

**RECOGNISE · THE HEART**

How the heart, circulation, and blood work together, and why cardiovascular risk is rarely one isolated problem.

> **THE QUESTION**
>
> What are we trying to protect?

The heart is more than a pump.

Cardiovascular health also depends on electrical coordination, valves, coronary blood supply, arteries, veins, blood, pressure, flow, and the body’s ability to respond to demand.

This foundation makes the system concrete before asking what can go wrong.

It helps explain why:

- a rhythm problem is not the same as plaque;
- a valve problem is not the same as high cholesterol;
- the heart, brain, kidneys, blood vessels, and blood are connected;
- one reassuring result cannot represent every part of the system;
- heart risk is often a time-and-load process.

**Start here when:** you want a clear foundation before reading about risk, tests, or prevention.

**About 10–12 minutes · Read online · PDF · Print · At a Glance · Open access**

**[Explore The Heart We Are Trying to Protect](/recognise/the-heart/)**

---

## The Quiet Epidemic: Heart Risks That Build Within the Body

**RECOGNISE · INTERNAL AND CARDIOMETABOLIC RISK**

Why heart risk can build quietly, how heart attack, stroke, and other cardiovascular damage can end or permanently change lives, and why prevention matters while there is still time to act.

> **THE QUESTION**
>
> What can place the heart and cardiovascular system under strain from within?

Cardiovascular disease can kill.

It can also leave people living with disability, dependence, lost work, reduced income, repeated hospital care, and consequences carried by partners and families for years or for life.

Many of the risks and disease processes behind those outcomes may cause no clear symptoms while they are developing.

This foundation introduces:

- blood pressure and vascular load;
- glucose regulation and insulin resistance;
- cholesterol, lipoproteins, ApoB, and Lp(a);
- kidney health;
- plaque and established vascular disease;
- heart rhythm, valves, heart muscle, and structure;
- inflammation and clotting as distinct systems;
- inherited and family risk.

It also separates four kinds of information that are often confused:

- a risk factor;
- a measurement;
- a diagnosis;
- evidence of established disease or damage.

**Start here when:** you are worried about quiet, inherited, cardiometabolic, structural, or already established heart risk.

**About 12–15 minutes · Read online · PDF · Print · At a Glance · Open access**

**[Explore The Quiet Epidemic](/recognise/internal-risk/)**

---

## The Risks We Live With

**RECOGNISE · LIFESTYLE AND ENVIRONMENT**

How the air we breathe, the food available to us, movement, sleep, tobacco and nicotine, alcohol, stress, work, relationships, and the conditions around us can shape heart risk, and why prevention cannot be reduced to personal choice.

> **THE QUESTION**
>
> What in our lives and surroundings can shape cardiovascular strain?

The cardiovascular system responds to exposure, not to whether the exposure was chosen.

What people do matters.

So do addiction, disability, cost, work, caregiving, housing, pollution, safety, commercial influence, social connection, and access to care.

This foundation looks at:

- tobacco, nicotine, and second-hand smoke;
- food patterns and the environment in which people eat;
- movement, physical capacity, and prolonged sitting;
- sleep, recovery, shift work, and sleep apnoea;
- alcohol;
- chronic stress, work, and caregiving;
- loneliness and social connection;
- air pollution, noise, heat, housing, and neighbourhoods;
- money, education, commercial influence, and access to prevention.

It does not ask only:

> What should this person change?

It also asks:

> What would make change possible?

**Start here when:** lifestyle advice has felt simplistic, blaming, unrealistic, or disconnected from the life in which it must be carried out.

**About 20–24 minutes · Read online · PDF · Print · At a Glance · Open access**

**[Explore The Risks We Live With](/recognise/lifestyle-environment/)**

---

## Your Cholesterol Test Is Useful. But It Does Not Show Every Heart Risk.

**RECOGNISE · CHOLESTEROL TESTING**

What total cholesterol, LDL-C, HDL-C, triglycerides, and non-HDL-C can tell us, what important information may still be missing, and why a useful lipid panel is a foundation rather than a complete heart risk assessment.

> **THE QUESTION**
>
> What does the standard cholesterol test show, and what remains outside it?

The standard lipid panel is one of cardiovascular prevention’s most useful and familiar tools.

It usually reports total cholesterol, LDL cholesterol, HDL cholesterol, and triglycerides. Some reports also include non-HDL cholesterol.

The test can help identify important lipid abnormalities, guide prevention and treatment discussions, and show change over time.

It does not assess every lipid-related or wider cardiovascular risk.

This foundation explains:

- what each standard result can and cannot tell you;
- why “good” and “bad” cholesterol are useful but incomplete labels;
- why “within range” and “right for this person” are not always the same;
- why high HDL-C does not cancel other risk;
- why LDL-C and particle number are related but not identical;
- why Lp(a) and ApoB are outside the standard panel unless ordered;
- why blood pressure, glucose regulation, kidney health, family history, symptoms, plaque, rhythm, valves, heart muscle, and lived exposures remain separate questions.

The problem is not the test.

The problem is false closure when a useful result is treated as the end of a larger cardiovascular conversation.

**Start here when:** you have a cholesterol report, remember being told your cholesterol was “fine”, or want to know what routine testing did and did not assess.

**About 19–23 minutes · Read online · PDF · Print · At a Glance · Open access**

**[Explore Your Cholesterol Test Is Useful](/recognise/cholesterol-test/)**

---

## Choose by what you need now

You do not have to follow the four foundations in order.

### I want to understand the basics before thinking about risk

Start with **The Heart We Are Trying to Protect**.

### I am worried about inherited, quiet, or internal risk

Start with **The Quiet Epidemic: Heart Risks That Build Within the Body**.

### I have been told to change my lifestyle, but the advice does not fit my life

Start with **The Risks We Live With**.

### I have a cholesterol result and do not know how much it really tells me

Start with **Your Cholesterol Test Is Useful. But It Does Not Show Every Heart Risk.**

### A heart attack, stroke, sudden death, or diagnosis in my family has left me unsure where to begin

Use **10 Questions People Ask About Heart Health** to find the route closest to your concern, or begin with internal and family risk in **The Quiet Epidemic**.

### I already know that my own information is scattered or incomplete

You may be ready for **Clarify heart risk**.

You do not need to complete all four foundations first.

## More ways to use Recognise

The four foundations provide depth.

Supporting resources make them easier to enter, revisit, share, and apply.

### 10 Questions People Ask About Heart Health

**Which question brought me here, and where should I go next?**

A question-led route finder for people who do not yet know which topic or stage fits their concern.

### My Starting Point

**What have I recognised, what remains unclear, and where will I go next?**

A simple personal record for noting what stood out, what is already known, what remains uncertain, and which route feels useful next.

It is not an assessment or a score.

### At a Glance

One-page companions for readers who need fast orientation before deciding whether to read the complete guide.

### Glossary

Plain-language explanations of important cardiovascular terms, with layered sections for a quick overview, a practical explanation, and deeper detail.

### Lp(a), family history, and topic-specific guides

Focused resources for readers whose concern begins with an inherited risk, a family event, a specific result, or a question not fully covered by one foundation.

## What Recognise can and cannot do

Recognise can help you:

- understand essential cardiovascular ideas;
- distinguish different kinds of risk and information;
- recognise why one number or test cannot answer every question;
- identify what you already know;
- notice what may remain unknown, incomplete, scattered, or unexplained;
- prepare clearer questions;
- choose a relevant next route.

Recognise cannot:

- calculate your personal cardiovascular risk;
- diagnose a condition;
- interpret your symptoms or results as personal medical advice;
- determine which tests, medicines, diet, exercise, or treatment you need;
- guarantee that an event will or will not happen;
- replace examination, urgent care, or qualified professional judgement.

Reading creates understanding.

Protection requires appropriate action in the real world.

That action may be as simple as finding an old report, recording a family event accurately, asking whether Lp(a) was tested, or preparing one focused question.

It may also require clinical assessment, treatment, family support, workplace change, or a longer prevention plan.

## From Recognise to the Heart Risk Navigator

Recognise is the open education and orientation stage of the **Heart Risk Navigator**.

It belongs to a wider journey:

> **Recognise → Clarify → Navigate → Prevent → Protect**

This is not a compulsory staircase.

People can enter where their need begins, and the paid products can stand alone.

### Recognise

Understand why heart risk matters, find the question that brought you here, and identify a useful starting point.

### Clarify

Organise what is known, identify what remains unknown or incomplete, and prepare what may need to be discussed.

> **Known → Unknown → To discuss**

**Clarify heart risk** is a structured heart risk audit. It creates a clearer record without diagnosing, scoring, or prescribing.

### Navigate

Place results, diagnoses, family information, exposures, and unresolved questions into context.

Recognise what is connected, what must remain distinct, and what needs health team interpretation before the next decision.

> **Known + Unknown → To discuss → Next action**

**Navigate heart risk** supports decision preparation. It is not a risk calculator or treatment pathway.

### Prevent

Carry an agreed next action into a continuing process.

Record what was agreed, track relevant results, prepare a health team report, and update the plan as new information becomes available.

> **Next action → Results → loop**

This is the **heart risk prevention loop**.

### Protect

Continue the work over time.

Protect is the continuing stage: preserving clarity, updating information, supporting future prevention loops, and helping useful action remain visible rather than being lost between appointments or life changes.

HeartFirst does not replace medical monitoring or professional care.

## A useful next step

You do not need to solve your entire heart risk today.

Choose one question.

Open one foundation.

Find one report.

Record one family event.

Notice one assumption that needs checking.

Prepare one question for your health team.

> **Recognition is not the end of prevention. It is where informed prevention can begin.**

## Where to begin

### Begin with the recommended route

**[Start with The Heart We Are Trying to Protect](/recognise/the-heart/)**

### Begin with the question already on your mind

**[Use 10 Questions People Ask About Heart Health](/recognise/10-questions/)**

### Begin with your own information

**[Explore Clarify heart risk](/clarify/)**

Clarify is a paid product. It is not required to use Recognise or any of HeartFirst’s open-access educational resources.

## Publication and production notes

This hub should be built as a highly scannable route-finding page rather than a continuous article.

### Recommended page sequence

1. Hero and central question
2. Why Recognise exists
3. Recommended starting point
4. Four foundation cards
5. Choose by need
6. Supporting Recognise resources
7. What Recognise can and cannot do
8. The Heart Risk Navigator journey
9. Final starting routes

### Foundation-card requirements

Each card should display:

- exact public title;
- topic kicker;
- one-sentence promise;
- **The question**;
- current estimated reading time;
- available formats;
- open-access status;
- descriptive link text.

### Conditional publication

Do not show a supporting resource as available until its public route is live.

Until then:

- remove the card or link;
- use an accurate “coming soon” label only where strategically useful;
- never send readers to an empty or placeholder page.

### Accessibility and UX

The final hub requires:

- semantic heading order;
- keyboard-accessible cards and menus;
- visible focus states;
- no colour-only meaning;
- readable line length;
- clear link labels;
- sufficient contrast;
- reduced-motion support;
- accessible format labels;
- responsive card layout;
- no public numbering of the four foundations;
- no requirement to read all resources before proceeding.

### Evidence and review

The hub should not become a duplicate evidence review.

Its factual claims should remain consistent with the approved foundation masters, and its principal job is orientation, explanation, and route finding.

Before publication, confirm:

- exact foundation titles, slugs, reading times, and format availability;
- current product names, prices, and routes;
- the wording and availability of Protect;
- all links and redirects;
- standard sitewide health-information disclaimer and emergency link;
- publication date, last-reviewed date, version, editorial owner, clinical-review status, and correction contact;
- consistency with the final Recognise Content Standard and all four approved foundation masters.

---

here is some reasoning behind the draft:

The hub is built around one central question:

Where should I begin?

Its role is not to summarise four articles. It:

explains why Recognise exists;
introduces the four foundations and the question each answers;
lets readers enter by concern rather than forcing a fixed order;
shows what Recognise can and cannot do;
introduces supporting resources such as 10 Questions, My Starting Point, At a Glance companions, and the glossary;
connects Recognise to Clarify → Navigate → Prevent → Protect;
makes clear that the journey is not compulsory and the products can stand alone.

The opening position is:

Heart risk rarely arrives as one clear problem.

The closing position is:

Recognition is not the end of prevention. It is where informed prevention can begin.

The public-facing draft is approximately 2,439 words, with an estimated reading time of 11–14 minutes, but it is designed as a scannable route-finding page rather than a continuous article.

---

===

---

---
title: "Recognise"
seo_title: "Recognise Heart Risk | HeartFirst"
stage: "Recognise"
topic: "Heart risk understanding, orientation, and route finding"
kicker: "HEARTFIRST · RECOGNISE"
resource_question: "Why does recognising heart risk matter?"
deck: "Understand the heart we are protecting, the risks that can affect it, what standard cholesterol testing can and cannot show, and which Heart Risk Navigator stage fits what you need now."
slug: "/recognise/"
primary_audience: "Adults seeking a clear and trustworthy introduction to heart risk and prevention"
secondary_audience: "Family members, carers, people responding to a diagnosis or family event, and people preparing for a health team conversation"
estimated_reading_time: "12–15 minutes"
resource_type: "Collection and Navigator orientation hub"
access: "Open access"
formats:
  - "Canonical web hub"
  - "Individual web guides"
  - "Downloadable PDFs"
  - "Print versions"
  - "At a Glance companions"
publication_status: "Restructured public-facing hub draft"
version: "0.2"
clinical_review_status: "Required before publication"
---

# Recognise

**Heart risk can remain quiet, scattered, or incomplete until a major event makes it impossible to ignore.**

**HEARTFIRST · RECOGNISE**

Understand the heart we are protecting, the risks that can affect it, what standard cholesterol testing can and cannot show, and which Heart Risk Navigator stage fits what you need now.

> **THE QUESTION**
>
> Why does recognising heart risk matter?

## Why recognition matters

The heart and cardiovascular system sustain every organ, every movement, every conversation, every working day, and every ordinary moment of life.

When this system is damaged, the consequences can be fatal.

They can also leave a person living with loss of speech, movement, memory, independence, income, or the ability to care for themselves and others. A partner may become a long-term unpaid carer. A family may lose earnings while care needs and costs rise.

Yet heart risk does not always arrive with a clear warning.

High blood pressure, high Lipoprotein(a), or Lp(a), atherosclerosis, insulin resistance, kidney disease, and other important risks may cause no obvious symptoms while they develop. Information may exist across separate reports, appointments, diagnoses, and family memories without anyone bringing it together.

Recognition does not promise that every heart attack, stroke, disability, or death can be prevented.

It creates the possibility of acting while there is still something meaningful to protect.

> **Before heart risk can be clarified, navigated, reduced, or protected against, it must first be recognised.**

This is why HeartFirst begins here.

Recognise is free, open-access education and orientation. It is not a diagnosis, assessment, score, or compulsory first step before using another part of the Heart Risk Navigator.

## Heart risk does not become visible in the same way for everyone

Where routine preventive care is readily available, a standard cholesterol test is often one of the first formal encounters people have with heart risk.

A report may contain:

- total cholesterol;
- LDL cholesterol;
- HDL cholesterol;
- triglycerides;
- sometimes non-HDL cholesterol.

This can be a valuable beginning.

It is not a universal one.

Access to cholesterol testing, preventive appointments, laboratories, medicines, and continuing care differs greatly within and between countries. Some people have never been offered a lipid panel. Others cannot reach or afford routine testing. Some first encounter heart risk through:

- a blood pressure reading;
- diabetes or kidney testing;
- pregnancy-related care;
- symptoms;
- a heart rhythm or valve diagnosis;
- a scan;
- a family member’s heart attack, stroke, or sudden death;
- their own major cardiovascular event.

For many people, the first available information is not the information that would ideally have been found first.

Recognise does not assume that everyone begins with the same test, the same access, or the same level of knowledge.

It begins with the landscape.

## Two questions, not one

The first version of this hub treated “Where should I begin?” as though it were one question.

It is really two.

### What do I need to understand?

The four Recognise foundations answer this question.

They explain:

- what we are trying to protect;
- what can place the cardiovascular system under strain from within;
- what in our lives and surroundings can shape that strain;
- what the standard cholesterol test does and does not show.

### What do I need to do next?

The wider Heart Risk Navigator answers this question.

Depending on what is already known and what you need now, the useful stage may be:

- Recognise;
- Clarify;
- Navigate;
- Prevent;
- Protect.

Understanding the topic and choosing the next action are related.

They are not the same task.

## The Recognise landscape

The four foundations form one coherent introduction to heart risk.

They move through four essential questions:

> **What are we protecting?**  
> **What can threaten it from within?**  
> **What in our lives and surroundings can shape the strain?**  
> **What does our most familiar test show, and what remains outside it?**

You can follow this route in sequence.

You can also enter through the question closest to your concern.

There is no required order.

---

## The Heart We Are Trying to Protect

**RECOGNISE · THE HEART**

How the heart, circulation, blood, valves, electrical system, and wider cardiovascular system work together.

> **THE QUESTION**
>
> What are we trying to protect?

The heart is more than a pump.

Cardiovascular health depends on coordinated electrical activity, valves, coronary blood supply, arteries, veins, blood, pressure, flow, and the ability to respond to demand.

This foundation makes the system concrete before asking what can go wrong. It explains why rhythm, plaque, valve disease, heart muscle, blood pressure, blood, brain, and kidney health are connected without becoming the same problem.

**Begin here when:** you want a clear foundation before thinking about risk, testing, or prevention.

**About 10–12 minutes · Read online · PDF · Print · At a Glance · Open access**

**[Explore The Heart We Are Trying to Protect](/recognise/the-heart/)**

---

## The Quiet Epidemic: Heart Risks That Build Within the Body

**RECOGNISE · INTERNAL AND CARDIOMETABOLIC RISK**

Why heart risk can build quietly, what may be lost when damage occurs, and why prevention matters while there is still time to act.

> **THE QUESTION**
>
> What can place the heart and cardiovascular system under strain from within?

This foundation introduces:

- blood pressure and vascular load;
- glucose regulation and insulin resistance;
- cholesterol, lipoproteins, ApoB, and Lp(a);
- kidney health;
- plaque and established vascular disease;
- heart rhythm, valves, heart muscle, and structure;
- inflammation and clotting as distinct systems;
- inherited and family risk.

It also distinguishes a risk factor, a measurement, a diagnosis, and evidence of established disease or damage.

**Begin here when:** you are concerned about quiet, inherited, cardiometabolic, structural, or already established heart risk.

**About 12–15 minutes · Read online · PDF · Print · At a Glance · Open access**

**[Explore The Quiet Epidemic](/recognise/internal-risk/)**

---

## The Risks We Live With

**RECOGNISE · LIFESTYLE AND ENVIRONMENT**

How daily life, exposure, opportunity, and the conditions around us can shape cardiovascular strain.

> **THE QUESTION**
>
> What in our lives and surroundings can shape cardiovascular strain?

The cardiovascular system responds to exposure, not to whether the exposure was chosen.

What people do matters.

So do addiction, disability, cost, work, caregiving, housing, pollution, safety, commercial influence, social connection, and access to care.

This foundation explores tobacco and nicotine, food, movement, sleep, alcohol, stress, work, relationships, air pollution, noise, heat, housing, neighbourhoods, and the conditions that make prevention easier for some people and harder for others.

It asks not only:

> What should change?

It also asks:

> What would make change possible?

**Begin here when:** lifestyle advice has felt simplistic, blaming, unrealistic, or disconnected from the life in which it must be carried out.

**About 20–24 minutes · Read online · PDF · Print · At a Glance · Open access**

**[Explore The Risks We Live With](/recognise/lifestyle-environment/)**

---

## Your Cholesterol Test Is Useful. But It Does Not Show Every Heart Risk.

**RECOGNISE · CHOLESTEROL TESTING**

What the standard lipid panel can tell us, what remains outside it, and why a useful test is a foundation rather than a complete cardiovascular assessment.

> **THE QUESTION**
>
> What does the standard cholesterol test show, and what remains outside it?

The standard lipid panel is one of cardiovascular prevention’s most useful and familiar tools where it is available.

It usually reports total cholesterol, LDL cholesterol, HDL cholesterol, and triglycerides. Some reports also include non-HDL cholesterol.

It does not automatically include Lp(a) or ApoB. It does not assess blood pressure, glucose regulation, kidney disease, family history, symptoms, plaque, rhythm, valves, heart muscle, or lived exposures.

This foundation explains what each standard result can and cannot tell you, why “within range” and “right for this person” are not always the same, and how a correct result can still create false closure when it is treated as the end of a larger cardiovascular conversation.

**Begin here when:** you have a cholesterol report, remember being told your cholesterol was “fine”, or want to know what routine testing did and did not assess.

**About 19–23 minutes · Read online · PDF · Print · At a Glance · Open access**

**[Explore Your Cholesterol Test Is Useful](/recognise/cholesterol-test/)**

---

## Which Recognise foundation fits your concern?

### I want to understand the cardiovascular system before thinking about risk

Begin with **The Heart We Are Trying to Protect**.

### A family member had a premature heart attack, stroke, or sudden death

Begin with **The Quiet Epidemic**, particularly its inherited and family-risk sections.

### I have heard about Lp(a), ApoB, blood pressure, diabetes, kidney disease, plaque, rhythm, or valve disease

Begin with **The Quiet Epidemic**.

### I have been told to change my lifestyle, but the advice feels impossible or disconnected from my life

Begin with **The Risks We Live With**.

### I have a cholesterol report and do not know how much it really tells me

Begin with **Your Cholesterol Test Is Useful. But It Does Not Show Every Heart Risk.**

### I do not yet know which concern to follow

Use **10 Questions People Ask About Heart Health** to find the route closest to the question on your mind.

This chooses a topic.

The next section chooses a Navigator stage.

## Where are you in the Heart Risk Navigator?

The Heart Risk Navigator is HeartFirst’s wider journey:

> **Recognise → Clarify → Navigate → Prevent → Protect**

This is not a compulsory staircase.

You do not need to complete every Recognise foundation before moving forward. The paid products stand alone and can be used according to need.

You may also return to an earlier stage when new information, a diagnosis, a family event, or a life change creates a new question.

### You need to understand the landscape

**Recognise**

Use Recognise when you are still trying to understand:

- why heart risk matters;
- the kind of risk or information you are dealing with;
- what a test, diagnosis, family event, or exposure may and may not tell you;
- which question to follow next.

Recognise is free and open access.

### You have information, but it is scattered, incomplete, or difficult to see clearly

**Clarify heart risk**

Clarify is a structured heart risk audit.

It helps you:

- gather existing results, diagnoses, family information, exposures, and concerns;
- record what is known;
- identify what remains unknown or incomplete;
- prepare what may need to be discussed with your health team.

> **Known → Unknown → To discuss**

Choose Clarify when the immediate need is not another explanation, but a clearer account of your own information.

Clarify is a paid product.

### You have several risks, results, diagnoses, or unresolved questions and need to understand the relationships

**Navigate heart risk**

Navigate helps place information into context without turning it into a personal score or diagnosis.

It supports you in considering:

- what may elevate or compound significance;
- what adds important context;
- what must remain clinically distinct;
- what remains unresolved and needs health team interpretation;
- what next action may need to be discussed.

> **Known + Unknown → To discuss → Next action**

Choose Navigate when information exists, but the relationships, priorities, or decision questions are unclear.

Navigate is a paid product.

### An appropriate next action has already been agreed and now needs to be carried through

**Prevent heart risk**

Prevent helps turn an agreed next action into a continuing process.

It supports:

- recording what was agreed;
- tracking relevant results or progress;
- preparing a health team report;
- returning to the plan as new information becomes available.

> **Next action → Results → loop**

This is the **heart risk prevention loop**.

Choose Prevent when the primary challenge is no longer recognising or organising the issue, but following through on an agreed action.

Prevent is a paid product.

### You need continuity beyond one prevention loop

**Protect**

Protect is the continuing stage.

Its role is to help preserve clarity, keep important information visible, and support future prevention loops as health, evidence, family circumstances, and priorities change.

Protect is not medical monitoring and does not replace professional care.

Its exact public offers will be introduced as they are finalised.

## The stages can connect without becoming a rigid sequence

A person may:

- use one Recognise guide and move directly to Clarify;
- begin with Clarify because they already have years of records;
- use Navigate without completing Clarify because a decision is already waiting;
- begin Prevent after an action has already been agreed with their health team;
- return to Recognise after a new diagnosis or family event;
- repeat parts of the journey as circumstances change.

The stage should fit the need.

The need should not be forced to fit the stage.

> **Recognise helps you understand the landscape. The wider Navigator helps you decide what kind of work comes next.**

## Supporting Recognise resources

The four foundations provide depth.

Supporting resources make them easier to enter, revisit, share, and use.

### 10 Questions People Ask About Heart Health

A question-led route finder for people who do not yet know which topic or stage fits their concern.

### My Starting Point

A simple personal record for noting:

- what brought you here;
- what stood out;
- what is already known;
- what remains unclear;
- which route feels useful next.

It is not an assessment or score.

### At a Glance companions

One-page orientation resources for readers who need the essential points before deciding whether to read a complete foundation.

### Glossary

Plain-language explanations of important cardiovascular terms, with layered sections for a quick overview, practical understanding, and deeper detail.

### Lp(a), family history, and topic-specific guides

Focused resources for readers whose concern begins with inherited risk, a family event, a specific result, or a question that needs a narrower explanation.

## What Recognise can and cannot do

### Recognise can help you:

- understand essential cardiovascular ideas;
- recognise why heart risk matters;
- distinguish different types of risk and information;
- see why one number or test cannot answer every question;
- identify the question closest to your concern;
- notice what may remain unknown, incomplete, scattered, or unexplained;
- prepare clearer questions;
- identify which Navigator stage may fit your present need.

### Recognise cannot:

- calculate your personal cardiovascular risk;
- diagnose a condition;
- interpret symptoms or results as personal medical advice;
- determine which tests, medicines, diet, exercise, or treatment you need;
- guarantee that an event will or will not happen;
- replace examination, urgent care, or qualified professional judgement.

Reading can create understanding.

Prevention requires appropriate action in the real world.

That action may be finding a report, recording a family event accurately, asking whether Lp(a) was tested, preparing one health team question, seeking clinical assessment, or carrying through an action already agreed.

## A useful next step

You do not need to solve your entire heart risk today.

First ask:

> **What do I need to understand?**

Then ask:

> **What kind of work do I need to do next?**

You may need a foundation.

You may need to Clarify.

You may need to Navigate.

You may already be ready to Prevent.

> **Recognition is not the end of prevention. It is where informed prevention can begin.**

## Begin here

### Understand the full landscape

**[Start with The Heart We Are Trying to Protect](/recognise/the-heart/)**

### Follow the question already on your mind

**[Use 10 Questions People Ask About Heart Health](/recognise/10-questions/)**

### Organise your own information

**[Explore Clarify heart risk](/clarify/)**

### Put existing information into context

**[Explore Navigate heart risk](/navigate/)**

### Carry through an agreed next action

**[Explore Prevent heart risk](/prevent/)**

Clarify, Navigate, and Prevent are paid products. They are not required to use Recognise or HeartFirst’s open-access educational resources.

## Publication and production notes

This hub is a scannable orientation and routing page, not a continuous educational article.

### Recommended page sequence

1. Hero and reason recognition matters
2. How heart risk first becomes visible in different settings
3. The distinction between understanding a topic and choosing a Navigator stage
4. Four-foundation overview
5. Topic-based Recognise routing
6. Need-based Navigator routing
7. Supporting resources
8. Boundaries
9. Final routes

### Foundation-card requirements

Each foundation card should display:

- exact public title;
- topic kicker;
- one-sentence promise;
- **The question**;
- current estimated reading time;
- available formats;
- open-access status;
- descriptive link text.

### Navigator-routing requirements

Each stage card should explain:

- the reader state that makes the stage relevant;
- the principal job of the stage;
- the relevant portion of the shared flow;
- whether the resource is open access or paid;
- that stages and products can stand alone;
- that the journey is not compulsory.

Do not present the stages as a diagnostic decision tree or claim that the hub can determine the correct product for an individual.

### Access and global framing

Do not imply that the standard lipid panel is a universal starting point.

The public copy should acknowledge that:

- access to preventive testing and care is unequal;
- people first encounter heart risk through different tests, diagnoses, symptoms, family events, or major events;
- a lipid panel is a common formal entry point where routine testing is available, not the universal beginning of cardiovascular prevention.

### Conditional publication

Do not show a supporting resource or product route as available until the route is live and the offer is final.

Use an accurate “coming soon” label only where strategically useful.

Never send readers to an empty or placeholder page.

### Accessibility and UX

The final hub requires:

- semantic heading order;
- keyboard-accessible cards and navigation;
- visible focus states;
- no colour-only meaning;
- readable line length;
- clear descriptive links;
- sufficient contrast;
- reduced-motion support;
- responsive card layout;
- no public numbering of the four foundations;
- no requirement to read all resources before proceeding.

### Evidence and review

The hub’s factual claims should remain consistent with the approved foundation masters.

Access framing should be checked against current WHO evidence on noncommunicable-disease service and essential-technology availability. WHO has documented marked inequalities in access to preventive services and technologies, including total-cholesterol measurement in lower-resource primary-care settings.[1–3]

Before publication, confirm:

- exact foundation titles, slugs, reading times, and format availability;
- current product names, prices, routes, and availability;
- final public wording and offers for Protect;
- all links and redirects;
- standard sitewide health-information disclaimer and emergency link;
- publication date, last-reviewed date, version, editorial owner, clinical-review status, and correction contact;
- consistency with the final Recognise Content Standard and approved foundation masters.

### Internal references

1. World Health Organization. *Cardiovascular diseases*. Updated 31 July 2025.
2. World Health Organization. *Noncommunicable diseases*. Updated 25 September 2025.
3. World Health Organization. *Health system capacity for noncommunicable disease prevention and control*. WHO country-capacity reporting has identified substantial differences in the availability of essential NCD technologies, including total-cholesterol measurement, across income settings.

---

===

---

This is a strong piece. The ethical framework is consistent, the voice is humane without being soft, and the structure is well-built. Most of what follows is precision work, not structural problems.

---

## What's working well

The opening thesis — *"The conditions around us can become conditions within us"* — is immediately clear and gives the whole piece a single idea to orbit around.

**"Lifestyle" is an incomplete word** is the best section in the piece. The paragraph-per-example structure (smoking, food, sitting, sleep, pollution) makes the point land in five different registers without repetition. *"The phrase lifestyle risk becomes harmful when it turns conditions into character"* should not be touched.

The **"Modifiable does not mean easy"** list (lines 113-121) is precise and each item is distinct. The four examples that follow it (unsafe neighbourhood, nicotine dependence, food insecurity, shift worker, person with heart failure) demonstrate that the list isn't theoretical.

**"A breathing exercise cannot repair an unsafe workplace, replace lost income, provide respite care, or end discrimination"** (line 377) is one of the strongest lines in any of the Recognise foundations so far. It currently sits in inline text. Consider making it the section's pull quote — it's more powerful than the line that currently holds that position.

The **multi-level prevention framework** (personal, health team, family, policy) is the right structure for this content. It prevents the piece from collapsing into individual-instruction mode.

The **sleep section** correctly distinguishes poor sleep from sleep disorders and flags OSA specifically. The caveat that signs "do not by themselves establish a diagnosis" is appropriate for a Recognise-level resource.

The **"Risks can cluster"** section's 12-item portrait (lines 513-525) is a real person's life, not a checklist. It should be preserved exactly.

The **"Questions about the conditions shaping them"** subsection includes *"Which risk have I been blamed for without being offered practical support?"* — a question most cardiovascular resources would never include. It's necessary.

The **cross-reference to The Quiet Epidemic** (line 141) uses the v0.6 compound title. Consistency confirmed.

---

## Fixes and corrections

**1. "Caused" vs "attributed to" — alcohol deaths (line 327)**

> WHO estimated that alcohol **caused** 474,000 cardiovascular deaths in 2019.

Your own air pollution section (line 414) correctly uses "premature deaths **attributed to** outdoor air pollution." The alcohol line should use the same qualifier. WHO's alcohol fact sheet typically uses "alcohol-attributable" or similar language. "Attributed to" or "estimated to have caused" would be more precise and consistent.

**2. "Morally neutral" in At a glance (line 41) is compressed to the point of ambiguity**

> "Modifiable" does not mean easy, immediate, entirely personal, or **morally neutral**.

The full "Modifiable does not mean easy" section makes clear what this means (it doesn't mean someone caused their illness, it doesn't mean they should have tried harder). But in the At a glance bullet, "morally neutral" reads oddly — it could mean "modifiable risks have moral dimensions" or "the term isn't morally neutral" or "modifiability doesn't erase moral complexity." All true, but none is what a reader will reliably take from the phrase on first encounter.

Consider: *"entirely personal, or free from moral judgement"* or simply *"entirely personal, or a matter of individual responsibility alone"* — the latter aligns with the section's own language.

**3. The stress section's inline line is stronger than its pull quote (lines 377 vs 381)**

Inline: *"A breathing exercise cannot repair an unsafe workplace, replace lost income, provide respite care, or end discrimination."*

Pull quote: *"Stress prevention becomes credible when it addresses both the response inside the person and the pressure outside them."*

The inline line is visceral and specific. The pull quote is a correct summary. I'd make the inline line the pull quote. The summary can remain as a closing sentence.

**4. The "What this guide does not claim" section is thinner than The Quiet Epidemic's equivalent**

The Quiet Epidemic has a 9-item list *plus* a full paragraph: *"Personal interpretation belongs with an appropriately qualified health professional who can listen to the person, consider symptoms and concerns, review history and family information, examine relevant measurements and records, explain what they may mean, discuss the available options and their consequences, and decide with the person what action is appropriate."*

This piece has an 8-item list and then one sentence: *"Lifestyle and environmental prevention should be adapted to the person's health, capacity, circumstances, priorities, culture, and access to support."*

The professional-interpretation paragraph is a meaningful safety net — it's where you clarify that this is education, not medical advice, and that the reader should work with their health team. For a piece that explicitly discusses tobacco cessation, alcohol withdrawal risk, OSA diagnosis, and adapted exercise, that safety net matters. Consider restoring a version of the paragraph.

**5. Reference [15] verification needed**

The note references *"related 2025 focused-update materials identifying psychosocial stressors, social deprivation, physical inactivity, and obstructive sleep apnoea as relevant risk modifiers or clinical context."* If the 2025 ESC focused update exists and supports these specific attributions, fine. If it doesn't yet, or if it doesn't address all four items, this note should be corrected before publication. This is flagged in your pre-publication list but it's worth emphasising — reference [15] is cited in multiple sections.

---

## Minor observations (not problems)

**Reading time:** 4,813 words of body text. At ~250 wpm (careful non-fiction reading), that's roughly 19 minutes. Your 20–24 minute estimate is slightly generous but honest — it accounts for the pull quotes, lists, and the fact that readers will pause at some of the more confronting content. I'd say 18–22 minutes is the tighter range, but 20–24 is defensible and doesn't need changing.

**Noise section is thin:** Four sentences (lines 447-451) vs 20+ for most other sections. This is arguably appropriate — noise is not a primary cardiovascular exposure the way tobacco, diet, or physical activity are, and the piece already has a heat sub-section, a built-environment section, and an air pollution section. Over-expanding noise would distort the piece's proportions. But if you wanted to add one sentence, connecting noise → sleep disruption → cardiovascular strain would link it to an existing section without requiring new evidence.

**The title** — "The Risks We Live With" is human and immediate, and it works on the page. The same search-result/citation concern we addressed for The Quiet Epidemic applies here (it could describe financial risks, relationship risks, etc.), but I'd weigh whether a compound title is needed more carefully for this one. "The Risks We Live With" has a quality that "The Risks We Live With: How Lifestyle and Environment Shape Heart Risk" would dilute. Your call.

**The "Go deeper" accordion opportunity:** The sleep-apnoea signs (lines 300) and the alcohol-withdrawal warning (lines 345-346) are both candidates for web accordion treatment — they're important clinical caveats that could interrupt the reading flow for someone who's moving through the piece for the first time. The Quiet Epidemic v0.6 production notes already flag the accordion approach; the same logic applies here.

---

## What I'd leave alone

- The "Food is also:" 17-item list (lines 209-226). It's long. That's the point. Don't shorten it.
- The "Risks can cluster" 12-item portrait. Same reasoning.
- The "Lifestyle is an incomplete word" section. It's the piece's moral centre. Don't restructure it.
- The two-group question structure ("Questions about your own exposures" / "Questions about the conditions shaping them"). The distinction is meaningful.
- The multi-level prevention framework. Correct structure for this content.

---

===

---




We agree that this needed settling now, but we have not adopted the proposed sentence exactly.

The canonical description is now:

Clarify heart risk is a structured heart risk audit. It helps you organise what is known, identify what remains unknown or incomplete, prepare a health team discussion brief, and record the next action agreed with your health team.

This is hopefully stronger because it:

uses organise, which describes Clarify’s real value;
follows the shared Navigator flow rather than creating a long inventory;
avoids arbitrarily including exposures, barriers, concerns, or questions in some locations but not others;
names the health team discussion brief, which is an actual Clarify output and therefore does not overpromise;
retains the health team’s role in agreeing the next action.

Specific pages can still mention exposures, questions, concerns, symptoms, or barriers when describing relevant features. They should not alter the master product description.

question:
 and record the next action agreed with your health team
vs
 and record the next action you agree with your health team 

Updated files

The_Heart_We_Are_Trying_to_Protect_Content_Master_v0.4.md

The-Quiet-Epidemic_v0.7_draft.md

The_Risks_We_Live_With_Content_Master_v0.4.md

Your_Cholesterol_Test_Is_Useful_Content_Master_v0.4.md

HeartFirst_Recognise_Hub_Content_Master_v0.6.md


---

