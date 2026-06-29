# AGENTS.md — HeartFirst Development Guidance

This repository supports HeartFirst by Shyntesy, a heart risk navigation platform focused on hidden and incomplete cardiovascular risk, starting with Lipoprotein(a) [Lp(a)], also called stealth cholesterol, and the risks it amplifies.

HeartFirst’s public journey language is:

Recognise → Clarify → Navigate → Prevent → Protect.

Public positioning:

Science-backed guidance for high Lipoprotein(a) [Lp(a)] and the risks it amplifies.

Broader category ambition:

Helping people clarify hidden and incomplete heart risk, navigate risks, and take early action to reduce the risk of heart attack, stroke, and avoidable cardiovascular damage.

## Working principles

Make the smallest safe change that solves the task.

Do not rewrite large sections unnecessarily.

Do not restructure files unless explicitly asked.

Preserve existing visual design, routes, file names, class names, and component patterns unless the task requires a change.

When changing HTML, CSS, JavaScript, metadata, sitemap entries, or structured data, keep the change precise and easy to review.

Avoid speculative additions. If something is uncertain, flag it clearly rather than inventing a solution.

## Language and editorial style

Use UK / International English by default.

Use US spelling only for official titles, quoted material, code, CSS, schema terms, regulatory names, or US-specific resources.

Do not hyphenate “heart risk” or “health team” in normal prose.

Use “health team” rather than “clinician” in public-facing copy unless there is a specific reason.

Use “early action” rather than “earlier action”.

Prefer “risk” over “risk picture” unless “risk picture” is explicitly explained nearby.

Prefer “and” rather than “&” in public copy.

Use “this” rather than “that” where both are possible and “this” creates more immediacy.

Avoid overusing em dashes. Use them sparingly and only where they add useful emphasis or rhythm.

When first mentioning Lipoprotein(a), write:

Lipoprotein(a) [Lp(a)]

or, where parentheses are more natural:

Lipoprotein(a) (Lp(a))

After first mention, use Lp(a) or stealth cholesterol as appropriate.

Use “stealth cholesterol” in lowercase except in headings, titles, or branded emphasis.

Do not write that standard cholesterol panels “may miss” Lp(a). Standard cholesterol panels do not include Lp(a) unless it is specifically ordered.

## Medical and trust boundaries

HeartFirst is educational. It does not diagnose, predict, treat, or replace medical care.

Do not create copy that implies individual diagnosis, personalised treatment, guaranteed prevention, or emergency triage.

For emergency symptoms, advise urgent/emergency medical help immediately.

Use careful language:

* “can”
* “may”
* “is associated with”
* “is linked with”
* “can contribute to”
* “helps clarify”
* “should be discussed with your health team”

Avoid overclaiming:

* Do not say Lp(a) guarantees an event.
* Do not say elevated Lp(a) means a heart attack, stroke, or valve procedure is inevitable.
* Do not say lifestyle substantially lowers Lp(a).
* Do not imply Lp(a)-specific drugs are available for routine clinical use unless the repository has been updated with verified current approval status.
* Do not imply aspirin, anticoagulants, or other medicines are universal prevention tools.

Trust is earned through conduct. Do not use language such as “trust us” or “we ask you to trust us”.

Preferred trust framing:

We operate to the highest ethical standard. Here is what this means in practice.

## HeartFirst site architecture

Preserve the current route structure unless explicitly asked to change it.

Key public routes may include:

* `/`
* `/about/`
* `/products/`
* `/articles/`
* `/briefings/`
* `/research/`
* `/toolkit/`
* `/glossary/`
* `/risks/`
* `/lpa/`
* `/lpa/risk-atlas/`

Risk Atlas module routes include:

* `/risks/plaque/`
* `/risks/inflammation/`
* `/risks/rupture/`
* `/risks/clot/`
* `/risks/cascade/`
* `/risks/heart-attack/`
* `/risks/stroke/`
* `/risks/valve-calcification/`
* `/risks/aortic-stenosis/`

The `/risks/` page acts as the Risk Atlas collection/about page.

The `/lpa/risk-atlas/` page belongs under the Lp(a) section, not under the general `/risks/` collection.

## Metadata and discoverability

For page edits, preserve or improve:

* one clear `<title>`
* one meta description
* canonical URL
* `robots` meta where already used
* Open Graph metadata
* Twitter card metadata
* JSON-LD structured data
* sitemap entries where needed

Avoid duplicate `<title>` tags.

Avoid duplicate `twitter:card` tags.

Do not publish `og:image` or `twitter:image` tags pointing to placeholder or non-existent image files.

For Open Graph images, prefer:

* 1200 × 630 px
* PNG or JPG
* under 8 MB, ideally under 1 MB
* no critical information near the bottom edge
* descriptive `og:image:alt`

## Structured data conventions

Use Schema.org terms exactly as Schema.org defines them, even when they use US spelling.

Use:

`Organization`

not:

`Organisation`

Use the stable ID:

`https://heartfirst.shyntesy.com/#organization`

Do not change this to `#organisation`.

For the HeartFirst website, use:

`https://heartfirst.shyntesy.com/#website`

For the Risk Atlas collection page, use:

`https://heartfirst.shyntesy.com/risks/#webpage`

For the Lp(a) page, use:

`https://heartfirst.shyntesy.com/lpa/#webpage`

For Risk Atlas module pages, use page-specific breadcrumb and webpage IDs, for example:

`https://heartfirst.shyntesy.com/risks/plaque/#breadcrumb`

and:

`https://heartfirst.shyntesy.com/risks/plaque/#webpage`

Risk Atlas module breadcrumbs should follow:

HeartFirst → Risk Atlas → Current module

Lp(a) Risk Atlas breadcrumbs should follow:

HeartFirst → Lp(a) → Lp(a) Risk Atlas

For the nine `/risks/` modules, `isPartOf` should point to:

`https://heartfirst.shyntesy.com/risks/#webpage`

For `/lpa/risk-atlas/`, `isPartOf` should point to:

`https://heartfirst.shyntesy.com/lpa/#webpage`

Use:

`"educationalUse": "Public education"`

not:

`"educationalUse": "Patient education"`

## Risk Atlas content conventions

Risk Atlas pages should be clear, crawlable, and useful without requiring JavaScript interaction.

Interactive content may be supported by JavaScript, but important educational content should also exist as static HTML where practical.

Each Risk Atlas module may include a near-bottom “Key information” section with nine cards:

* 3 core explanation cards
* 3 added-context cards
* 3 common misunderstanding / clarification cards

Use short, answer-shaped text.

Each card body should usually be no more than two sentences.

The common misunderstanding cards should be direct, clear, and useful.

Do not hide important educational content purely for SEO. If it is valuable enough for AI systems to read, it is valuable enough for people to read.

## Visual and CSS guidance

Preserve existing design tokens, theme behaviour, and class patterns.

Do not introduce new CSS systems unnecessarily.

Prefer reusing existing classes and extending carefully.

Gold buttons should use black text.

Dark buttons should use white text.

Body text should remain readable in both light and dark themes.

Do not create CSS “fix cascades” with unnecessary `!important` overrides. Use `!important` only when there is no cleaner option.

When adding animations or hover effects:

* keep them subtle
* respect `prefers-reduced-motion`
* avoid fragile overrides
* do not prioritise decoration over readability

## Navigation and accessibility

The hamburger menu should remain available on all screen sizes where this is part of the current design.

Mobile navigation should include Glossary where relevant.

Use semantic HTML where possible.

Use meaningful headings.

Use descriptive link text.

Do not remove accessibility labels, `aria` attributes, or screen-reader text unless replacing them with something better.

For interactive content, ensure there is a usable static or accessible fallback where practical.

## Repository notes

This is a mostly static HTML site. Pages live in route folders such as `about/`, `articles/`, `briefings/`, `glossary/`, `lpa/`, `products/`, `research/`, `risks/`, and `toolkit/`.

Risk Atlas shared assets include `risks/atlas.css`, `risks/atlas.js`, and fragments in `risks/shared/`.

Keep `sitemap.xml`, `robots.txt`, `_headers`, `llms.txt`, and `llms-full.txt` aligned when a change affects discoverability, indexing, routing, or public-facing canonical content.

## Development workflow

Before making changes:

1. Identify the exact files affected.
2. Keep changes scoped.
3. Preserve existing structure unless the task requires a change.
4. Check for duplicate metadata or broken links after editing.
5. Do not create unrelated files.
6. Do not move files unless explicitly asked.

After making changes, summarise:

* what changed
* which files changed
* anything that should be checked manually
* any uncertainty or follow-up needed

Do not claim a test passed unless it was actually run.

Do not claim a file exists unless it has been checked.

## Content caution list

Be especially careful with statements about:

* Lp(a)-specific therapies and approval status
* clinical guidelines
* emergency symptoms
* aspirin, antiplatelets, anticoagulants, or blood thinners
* genetic risk and family testing
* aortic valve calcification and aortic stenosis
* what standard cholesterol panels do or do not include

If current clinical status matters, verify before updating public copy.

## Preferred HeartFirst wording

Good phrases:

* hidden and incomplete heart risk
* clarify risk
* navigate risk
* take early action
* prepare better health team conversations
* science-backed guidance
* public education
* inherited cardiovascular risk
* risks it can amplify
* high Lp(a)
* stealth cholesterol
* full risk context
* this page is educational and does not diagnose

Avoid or use carefully:

* risk signal, unless the context clearly explains it
* risk picture, unless explained nearby
* patient education, unless the audience is specifically patients
* trust us
* guaranteed prevention
* cure
* diagnosis
* treatment advice
* medical certainty where only association is supported