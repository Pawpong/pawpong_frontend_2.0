# Card layouts

| Shared component  | Production consumers                                                               | Fixed layout                                                                          |
| ----------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `MediaCard`       | `AdoptionGridCard`, `BreederCard`                                                  | square photo, badge top-left, action bottom-right, title/description, optional status |
| `SummaryCard`     | `AdoptionSummaryCard` (adoption application and chat `PetInfoCard`)                | square 80px / tablet 96px photo, status/title/description, detail link                |
| `PhotoTile`       | `CommunityMediaCard`                                                               | square photo, count top-right, review status bottom, optional desktop reactions       |
| `CardImage`       | all three layouts, adoption detail `DetailPhotoButton` (parent/environment photos) | cover crop, missing/error fallback, session-sensitive image retry                     |
| `ListingCardGrid` | exploration, bookmarks, breeder listings, home adoption showcase                   | fluid 2 / 3 / 4 columns; skeleton uses same rules                                     |

Card components own radius, spacing, type scale, and overlay placement. Domain adapters own text formatting, URLs, badge content, permissions and mutations. Do not add per-card `thumbnailClassName`, arbitrary overlay positioning, or page-named size variants. Container-level width constraints remain the list's responsibility. Keep image `sizes` and preload hints: these are performance inputs, not design variants.

Feed, parent/environment detail, posting-management and completed-adoption cards retain their own layouts. They are not migrated to `SummaryCard`: management actions, carousels and confirmation dialogs should not be lost merely to share an outer box. Parent/environment photos still share the photo frame: square `CardImage` inside the existing enlarge button.

Column overrides stay at the list: the home adoption showcase pins four columns from tablet up so four cards stay on one row, and the two-column breeder home pins four columns on desktop.

Behavioral checks: `node --test tests/card-layouts.test.cjs tests/ui-alignment/skeleton.test.cjs tests/community-photo-access/session-image.test.cjs`.
