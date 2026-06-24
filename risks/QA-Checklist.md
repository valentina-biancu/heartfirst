# QA Checklist

## marker

Every marker-end and marker-start reference must have a matching <marker id="..."> inside <defs>.

---

## pointOnPath + coronaryPathGuide pattern

The pointOnPath + coronaryPathGuide pattern for particle animation is the most sophisticated rendering approach in the atlas. Using a transparent guide path (stroke="transparent") and calling getPointAtLength() against it produces particles that follow the true anatomical curve of the coronary artery rather than a mathematical approximation. The gate / lerp logic in renderParticles() (lines 384–385) that slows and clusters particles at the blockage point — gate = raw > (.63 - obstruction*.20) && raw < (.76 + obstruction*.08) — is genuinely clever: as obstruction increases, the gate window widens and the particles bunch up upstream of the blockage, which is an accurate visual analogue of the clinical phenomenon. This should be documented as the template pattern for the Stroke module's embolic pathway.
Stage 4's meaning field ("This is the point where a flow problem can become muscle damage. It is the reason time and emergency evaluation matter") is the most precisely calibrated sentence in the atlas. It makes the clinical stakes explicit without tipping into fear-based framing. "The reason time matters" is accurate — time-to-reperfusion is the primary determinant of outcome in STEMI — without saying "every minute counts" or similar urgency theatre. Keep this verbatim.
Stage 5's meaning field ("The atlas stops here because heart attack care is urgent, personal, and time-sensitive. The educational message is: do not wait to self-interpret possible emergency symptoms") is the first stage copy in the atlas to explicitly narrate why the slider stops where it does rather than just describing what the visual shows. This meta-educational move — explaining the design decision to the reader — is the right approach for any stage that ends at an event boundary. Use this pattern for the Stroke module's final stage.
The callout block (lines 213–215) is the strongest emergency disclaimer placement in any page in the HeartFirst project to date. It appears inside the right panel rather than buried in a footer, it is in plain imperative language ("seek urgent medical help immediately"), and it is immediately preceded by the stage discussion prompt — so a reader who gets to "discuss with your health team" and then keeps reading hits the emergency statement before leaving the panel. The sequencing is intentional and correct.
The CTA card copy (lines 223) is the best product bridge in the atlas: "Heart attack is where hidden and incomplete risk can become immediate harm" is a precise and honest framing of why the paid products exist, and the per-product differentiation (Clarify for incomplete checks, Navigate for connected signals, Prevent for risk reduction) is accurate and non-manipulative. This should become the reference CTA template for the Stroke module.

```js

      function pointOnPath(path, t){
        const len = path.getTotalLength ? path.getTotalLength() : 0;
        if(!len) return { x:0, y:0 };
        return path.getPointAtLength(clamp(t,0,1) * len);
      }

      function buildCues(){
        const oxygenData = [
          [510,350,3.4],[535,360,3.1],[558,382,3.4],[528,402,3.2],[494,414,3.1],[566,426,3.0],[481,376,2.8],[590,400,2.9]
        ];
        oxygenDots.innerHTML = oxygenData.map(([cx,cy,r], i) =>
          `<circle class="oxygen-dot" data-i="${i}" data-base-r="${r}" cx="${cx}" cy="${cy}" r="${r}" fill="#9be4ff" opacity="0"></circle>`
        ).join('');

        const deficitData = [
          [520,348,4.2],[548,376,4.5],[566,406,4.2],[509,426,4.0],[592,418,3.8],[486,394,3.7]
        ];
        deficitDots.innerHTML = deficitData.map(([cx,cy,r], i) =>
          `<circle class="deficit-dot" data-i="${i}" data-base-r="${r}" cx="${cx}" cy="${cy}" r="${r}" fill="#ffb45f" opacity="0"></circle>`
        ).join('');

        const particleCount = 18;
        flowParticles.innerHTML = Array.from({length:particleCount}).map((_, i) =>
          `<circle class="flow-particle" data-i="${i}" r="3.1" fill="#d7f8ff" opacity="0"></circle>`
        ).join('');
      }

      function drawRail(progress){
        railProgress.setAttribute('stroke-dashoffset', (1 - clamp(progress,0,1)).toFixed(3));
      }

      function renderParticles(){
        const v = state.value;
        const flowLoss = clamp((v - 12) / 23, 0, 1);
        const obstruction = clamp((v - 35) / 65, 0, 1);
        const nodes = flowParticles.querySelectorAll('.flow-particle');
        state.particleTick += allowMotion ? .018 : 0;
        nodes.forEach((node, i) => {
          const raw = ((i / nodes.length) + state.particleTick) % 1;
          const gate = raw > (.63 - obstruction*.20) && raw < (.76 + obstruction*.08);
          const t = gate ? lerp(raw, .60, obstruction*.55) : raw;
          const pt = pointOnPath(coronaryPathGuide, t);
          const fade = clamp(1 - flowLoss*.55 - obstruction*.35, .12, .9);
          node.setAttribute('cx', pt.x.toFixed(1));
          node.setAttribute('cy', (pt.y + Math.sin((raw*10+i)*1.3)*2.2).toFixed(1));
          node.setAttribute('opacity', (fade * (gate ? .45 : .9)).toFixed(2));
          node.setAttribute('r', (3.1 - obstruction*1.2).toFixed(1));
        });
      }


```

---

## beta and final template checklist

For beta publication, I would require only:

Confirm product CTA URLs resolve correctly.
Quick visual check in dark and light mode.
Quick interaction check: slider, play, reset, labels, supply view.

For final template status, I would additionally require:

Convert Heart Attack SVG gradients to CSS-variable-aware colours or add a light-mode override.
Add marker-definition audit to the QA checklist.
Add dead-ID audit to the QA checklist.
Record pointOnPath() as the preferred curved-flow animation pattern.
Record “the atlas stops here because…” as the preferred emergency/event-boundary stage pattern.
Record in-panel emergency callout as required for Heart Attack and Stroke modules.
Bottom line

---



