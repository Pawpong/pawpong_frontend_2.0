# Pawpong AX design harness

## Mandatory sources

- Read `AX design/docs/design-system/PAWPONG_BRAND_HARNESS.md` before creating or modifying UI, copy, design tokens, icons, illustrations, or brand assets.
- Read `AX design/docs/design-system/PAWPONG_PIXEL_ANIMAL_RULES.md` before creating or modifying a Pawpong pixel animal.
- Treat the current semantic tokens, component contracts, canonical geometry, protected face roles, pixel-grid rules, and acceptance checklists as mandatory.
- When a target Figma node and the harness conflict, follow the target node for that implementation, report the discrepancy, and do not silently rewrite the harness.

## Pixel animals

- Use `$cat-wholebody` for reference-driven variants of an approved Pawpong pixel animal.
- Use `AX design/assets/pixel-animals/canonical/` as the only canonical geometry source.
- Default to canonical-lock mode unless the user explicitly requests and approves a new silhouette or pose.
- Do not deliver a pixel-animal SVG until the Skill validator and visual QA pass.

## Verification

- Keep generated AX assets under `AX design/assets/`.
- Preserve transparent backgrounds and exact SVG geometry.
- Run the project build when implementation code changes; documentation-only and standalone asset-only changes do not require a frontend build.
