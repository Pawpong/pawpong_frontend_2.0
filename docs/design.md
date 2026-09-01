# Pawpong UI Design Standards

This document is the reference point for design implementation in the Pawpong web frontend. The overall UX and information architecture of each screen are already defined, so rather than inventing new flows, compose Figma specs with the existing shared components and implement them consistently.

> **Do not modify UI authored by `heeyoung123` on or after 2026-09-01.**
> UI that `heeyoung123` has touched from 2026-09-01 onward is a settled design decision. Do not restyle, restructure, or "align to the brand" it — not even as part of a wider refactor. If a change looks necessary, stop and ask `heeyoung123` first.
>
> Work by `heeyoung123` dated before 2026-09-01 is not covered by this rule and follows the normal standards below.
>
> Check authorship and date before touching a file:
>
> ```
> git log --since=2026-09-01 --author=heeyoung123 -- <path>
> ```
>
> A non-empty result means the file is protected. This rule outranks every other rule in this document.

## 1. Order of Precedence

1. The relevant screen/component node in the Figma file `2026-pawpong`
2. The token, responsive, and state rules in this document
3. The shared component contracts in `src/shared/ui`
4. Per-page implementation

When these conflict, fix the shared component first, in the direction that satisfies Figma's visual intent together with accessibility and real data states. Never rebuild the same piece of UI separately on each page.

## 2. Figma Sources

- File: [2026-pawpong](https://www.figma.com/design/7VXGIjqr1eZBEmsp3OPNie/2026-pawpong)
- Home, full and responsive: PC `3349:2252855`, Tablet `4042:800891`, Mobile `4042:800892`
- PC header: `3349:1763537`
- Bottom navigation: `4042:780810`
- Home adoption card: Mobile `3349:1763378`, PC `3406:724284`
- Home community media tile: Mobile `3349:1763396`·`4161:823439`, Tablet `4161:821397`·`4161:823046`, PC `3406:724300`·`4161:820886`
- Home categories: Mobile `3349:1763363`, PC `3406:733504`
- Profile card: `1021:20324`
- Shared tab bar: `976:32388`
- Community main (feed): PC `1440 · 커뮤니티 홈`
- Community composer: `1056:46147`
- Social login: PC `3414:750712`, Tablet `3414:751419`, Mobile `3414:751420`
- Full menu, FAQ, settings: no standalone Figma screen exists, so combine the shell, surface, and type hierarchy of Home PC `3349:2252855`, the PC header `3349:1763537`, and the shared tabs `976:32388`.
- Retired breeder grade policy screens: the `등급 정책` (grade policy) entries in the old full menu — Mobile `3555:416834`, Tablet `3555:414100`, PC `3547:605288` — are archive reference only. Do not link them from the current menu or routes.

If a screen does not exist in Figma, reuse the `page shell → header → section → list/card → action` hierarchy of the closest existing screen. Features with no dedicated source, such as notifications, combine the list patterns from Home, Saved, and Community.

## 3. Core Principles

- Preserve the existing IA, entry points, and action placement. A design pass is not a change to the functional flow.
- Use semantic tokens for color, spacing, and typography. Do not introduce arbitrary hex values or arbitrary shadows.
- One meaning, one shared component. Extend a variant instead of cloning a component per page.
- Design the loading, error, and empty states of real APIs to the same standard as the happy path.
- Hover must not shift content position or change the baseline of a card row. Use only a shallow shadow and at most a 1.02x zoom inside the image; never apply translate/scale to the card itself or a gray overlay.
- Destructive actions go through an icon/menu and then a confirmation modal. Do not repeat small red text links in lists.
- Write mobile-first and extend only the properties that need to change at `tab:` and `pc:`.

## 4. Responsive System

Use the breakpoints Figma specifies, identically in CSS and JS.

| Range  |         Width |        Reference widths | Implementation              |
| ------ | ------------: | ----------------------: | --------------------------- |
| Mobile |       0–767px |            375px, 767px | Base classes, Figma `375/*` |
| Tablet |    768–1439px | 768, 1024, 1280, 1439px | `tab:`                      |
| PC     | 1440px and up |          1440px, 1920px | `pc:`                       |

- Tailwind: `--breakpoint-tab: 768px` and `--breakpoint-pc: 1440px` in `src/app/globals.css`
- JS: `BREAKPOINTS` in `src/shared/lib/useBreakpoint.ts` must always hold the same values.
- If a layout can be expressed in CSS, use responsive classes rather than `useBreakpoint`. Branch in JS only when the rendered content or the behavior itself differs.
- Do not use arbitrary `min-[1440px]`; use `pc:`. To add a new exceptional breakpoint, first record the reason and blast radius in this document.
- Test both sides of each boundary: 767↔768 and 1439↔1440.

### Page Shell and Gutters

- Full background/band shell cap: `PAGE_WIDTH_CLASS = mx-auto w-full max-w-[90rem]` (1440px)
- Content shell: `RESPONSIVE_SHELL_CLASS = 704px → 1376px → 1440px`. Subtracting each range's default gutter yields an actual content width of 672px → up to 1280px → 1280px.
- Default `Container`: mobile 20px / tablet 48px / PC 80px
- Mobile areas where Figma specifies 16px — home showcase, tabs, navigation — override with `px-4`.
- The shared `Container` caps its outer width at 704px on Mobile and 1376px on Tablet. Screens with a 16px gutter get 672px of mobile content width, screens with the default 20px gutter get 664px, and Tablet reaches up to 1280px after subtracting the 48px gutter. Content width must not shrink when moving up to PC's 80px gutter and 1280px content width.
- The primary content width of the PC 1440 frame is 1280px by default, after subtracting 80px on each side.
- On wider screens, do not grow the content width; center the 1440px shell instead.

### Responsive Change Rules

- Mobile: one column or 2-column cards, bottom navigation, touch targets of at least 40px.
- Tablet: increase information density, but do not switch on PC-only two-pane layouts early.
- PC: enable the GNB, two-pane splits, 4-column cards, and hover affordances from 1440px.
- Screens where Figma specifies a Tablet frame cap, such as composer forms, keep a 672px content width from 768–1439px and switch to the PC 1280px split layout at 1440px.
- Cards with fixed variants must not stretch without limit between reference widths. Adoption and breeder cards range from 164px to 282px; community cards from 321px to 407px.
- The explore layout of `ListingCardGrid` uses up to 282px in 2 columns from Mobile through Tablet, switching to 282px in 4 columns on PC. The breeder compact layout is limited to 164px 2-column on Mobile, up to 282px 3-column on Tablet, and 282px 4-column on PC, so card width does not invert across 1439→1440px.
- `CommunityFeedCard` in the community main feed keeps the 16px radius from Figma `3606:622637`, with a width cap of 343px on Mobile/Tablet and 415px on PC. Do not enlarge the 1:1 media to fill Tablet whitespace.
- The community main feed surface is white, per Figma PC `1440 · 커뮤니티 홈`. Do not lay a neutral gray surface across the full page shell — the column is only 343–415px wide, so on PC it would leave empty gray bands on either side.
- The community main `NavigationBar` ("포퐁커뮤니티") carries the screen's identity and the back-navigation anchor, so keep it across Mobile, Tablet, and PC.
- Profile and single-column feeds cap at 672px of content on Mobile/Tablet and at the 948px from Figma `1021:20324` on PC. Shared tabs do not share the content card cap; they fill the full `PAGE_WIDTH_CLASS`. Keep only the height, typography, and indicator ratio from Figma `976:32388`; the bottom rule and tab layout use the same full-width contract on every consuming screen.
- The chat list, conversation, and composer share the same 704px Mobile cap. The inside of the PC sidebar has its own width, so the cap does not apply there.
- The GNB and sub navigation also use `RESPONSIVE_SHELL_CLASS`. The background keeps the viewport width while the logo, title, and actions continue at the same content width across the boundary.
- So card sizes do not invert across 767↔768, cap the Mobile grid at the Figma 375 width and center it, and interpolate with `clamp()` from Tablet up to the PC cap where needed.
- Image aspect ratio is owned by each entity card; the grid owns only column count and gap.
- Use line-clamp and minimum heights so the outer size of cards in the same grid row does not jump when text line count differs.

## 5. Design Tokens

`src/app/globals.css` is the single source of truth for actual token values.

### Color Roles

| Role            | Token                        | Usage                                          |
| --------------- | ---------------------------- | ---------------------------------------------- |
| Brand primary   | `primary-500` (`#ad651d`)    | Active navigation, link emphasis, focus ring   |
| Brand secondary | `secondary-500` (`#f6c65d`)  | Secondary brand decoration                     |
| Point CTA       | `point-500` (`#fffe72`)      | Primary CTA button background                  |
| Warm surface    | `primary-50`, `point-50`     | Selected, unread, and soft hover backgrounds   |
| Primary text    | `neutral-850`                | Headings and primary body text                 |
| Secondary text  | `neutral-700`                | Descriptions and meta information              |
| Muted text      | `neutral-500`                | Dates and supporting information               |
| Border          | `neutral-150`, `neutral-300` | Card, section, and input borders               |
| Error           | `error-500/600`              | Destructive actions and error messages         |
| Info            | `info-500`                   | Info states and the Figma form focus/open rule |

- Shared components must not use Tailwind's default `zinc`, `slate`, `gray`, or `red` palettes, nor `dark:` variants. Express meaning with Pawpong semantic tokens.
- Hex is allowed only where the specific color is itself the meaning — Figma assets, social brand colors, pixel medals — and the source must be noted in a code comment.

### Typography

- Body: Pretendard, 150% line-height.
- Brand/section headings: Cafe24 Proup. Do not overuse it for ordinary body text.
- Minimum body size: 12px is reserved for supporting information such as dates and counters.
- Responsive body token `text-body-s`: 14px on mobile, 16px from tablet up.
- Numbers, statuses, and button labels have their visual size _and_ font weight decided by the shared component.

### Radius, Shadow, Motion

- Inputs and small controls: `rounded-lg`.
- Content cards: `rounded-lg` or `rounded-xl` per Figma; never mixed within one list.
- Pill CTAs and filters: `rounded-full`.
- Shared floating-layer shadow: the `0 7px 7px rgba(55,55,55,.1)` family.
- Transitions default to color, shadow, and opacity over 150–200ms.
- Under `prefers-reduced-motion`, states must still be distinguishable by color and text.

## 6. Layout Components

| Component         | Contract                                                                                                                                                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Container`       | Provides the 1440px shell and the default responsive gutters. Use it before creating a new max-width wrapper per page.                                                                                                                |
| `NavigationBar`   | Owns back/close/title on mobile and detail screens.                                                                                                                                                                                   |
| `PageHeader`      | Owns back navigation and the centered title on standalone pages.                                                                                                                                                                      |
| `SectionHeader`   | Aligns section title, description, and detail link.                                                                                                                                                                                   |
| `ShowcaseSection` | Provides gutters, vertical rhythm, and header for home sections.                                                                                                                                                                      |
| `BottomNav`       | The 56px primary navigation on Mobile and Tablet. Shown only on top-level screens and hidden on screens with their own bottom CTA. Renders the home-family fallback immediately during server streaming so it never overlaps content. |
| `TabBar`, `Tabs`  | Provide the tab height and indicator from Figma `976:32388` at the full `PAGE_WIDTH_CLASS` width. Do not apply a content-card max-width to tabs.                                                                                      |
| `ListingCardGrid` | Provides column count and gap for explore/home cards. It does not own card appearance.                                                                                                                                                |
| `FooterCtaBar`    | Provides the fixed bottom CTA alignment for composer and application screens.                                                                                                                                                         |
| `MobileMenu`      | Provides the full menu as a modal dialog at every breakpoint. Service links are always shown, account links only when signed in, and ESC, focus trap, and close-after-navigation are guaranteed.                                      |
| `SiteFooter`      | Provides the service menu, currently published business information, and policy links on public browsing screens. Not rendered in focused flows such as account, composer, or chat.                                                   |
| `FullPageMessage` | Provides the brand surface, typography, and action alignment for states that replace a whole page, such as 404 and global errors.                                                                                                     |

## 7. Shared Component Catalog

### Actions and Selection

- `Button`: primary, outline, text, fill, ghost. Extend these variants first for any new CTA.
- `FavoriteButton`, `FavoriteToggle`, `FollowButton`, `PostActionButton`: own the icon, label, and pending state of domain actions.
- The adoption-interest action is exposed to a regular visitor in exactly one place: Mobile CTA, Tablet hero, or PC hero. It is not shown on the owner's own listing, and the server also blocks self-registration with 403 to protect popularity ranking signals.
- `FilterChip`, `Badge`, `PixelTab`, `PixelSelectCard`: used for selection, categorization, and status display.
- `Checkbox`, `Switch`, `Select`, `Dropdown`, `DropdownMenu`: own form selection and menus.
- `Switch`, `Select`, `Checkbox`, and `DropdownMenu` share the `neutral` surface, `primary-500` focus ring, `point-500` selected state, and `error-*` destructive state.
- `OwnerActionsMenu`: gathers owner actions such as edit and delete into a single menu.
- `ReportPostAction`: owns the `⋮` menu on another user's community post, the sign-in prompt, the reason/detail input, and the submission result as one feature flow. Entity cards expose only a `moreAction` slot.
- `ChatRoomActionsMenu`: owns leave-room confirmation plus pending/error state from the same `⋮` entry point in both the list and the conversation header.
- `ChatAttachMenu`: the single entry point for image, file, and location attachments. Location sharing has no disabled placeholder — it provides an explicit consent modal, the browser permission request, and local error recovery as one flow.

### Input and Search

- `Input`, `InputField`: combine the input, label, help text, and error state. The Figma form focus/open border uses `info-500`, while brand emphasis on CTAs, navigation, and focus-visible rings uses `primary-500`.
- `InputUpload`: binds the entry point for writing posts and listings, combining supporting context with a `point-500` action on a white surface. Do not float a bare point-colored pill button over content with no context.
- `Textarea`, `TextareaField`: own long-form input and the character count/error state.
- `SearchBar`, `SearchButton`, `SearchIcon`: standardize search submission at 40px height, radius 8, and a neutral border. Home search widths are 343px Mobile / 482px Tablet / 846px PC.
- `Label`, `TextLabel`, `HelpMessage`: used for field labels, required/optional markers, and help text.
- `DocumentFilePicker`: provides the same document-picker surface, filename display, and error states for onboarding and grade review. Only PDF, JPG, PNG, and WEBP are allowed, at up to 20MB per file, and the server re-validates MIME type, extension, size, and upload ownership.

### Home Responsive Reference

| Area                |                       Mobile 375 |                             Tablet 768 |                         PC 1440 |
| ------------------- | -------------------------------: | -------------------------------------: | ------------------------------: |
| Search layout       |               95px / width 343px |                    116px / width 482px |             116px / width 846px |
| Banner              |                       375×191.67 | active 604.8×241.07 / section 259.73px | active 1134×452 / section 487px |
| Categories          |               2×2, section 225px |            4 in a row, section 124.5px |    4 in a row, section 187.39px |
| Adoption card       |                  164×195.84, 2×2 |                  164×195.84, 4 columns |              282×303, 4 columns |
| Home community tile | 122×122, 5 horizontally scrolled |                       122×122, 5 items |                300×300, 4 items |
| Bottom navigation   |                             56px |                                   56px |                          hidden |

- Inactive banner slides scale to `974 / 1134` (about 85.9%) of the active size at 30% opacity. No logical gap is added, so the scale-down whitespace itself becomes roughly 42.7px on Tablet and 80px on PC.
- When there are only 2–3 banners, repeat the source list 3 times to reach the slide count Swiper's `loop` requires. Start in the middle buffer and expose only the original banner count in the pagination, so previous/next, autoplay, and swipe cycle without warnings or losing the active class.
- Home section outer gutters are 16px Mobile / 48px Tablet / 80px PC, and the gap between the adoption/community headers and their cards is 12px.

### Data Presentation

- `MediaCard`: provides image, body, and meta slots for image cards. It does not nest the image detail link and the favorite button, and it preserves the aspect ratio with a `point-50` and paw-glyph fallback when the image is missing or fails to load.
- `CommunityMediaCard`: the square media tile in the home "동물 자랑하기" section. Body text and reaction actions stay on the community feed card; home shows only the representative image and the multi-image badge. Mobile uses 122px horizontal scrolling, Tablet 122px with 5 items, PC 300px with 4 items, and image failures keep the same-ratio brand fallback.
- `ProfileAvatar`, `ProfileHeader`, `AuthorInfo`, `Avatar`, `AvatarGroup`: unify profile image fallbacks and name/grade alignment.
- `ListingStats`, `ListingCardGrid`, `PostedDate`, `DetailLink`: provide list metadata and navigation affordances.
- `ImageCarousel`, `ImageModal`, `ImageDetailModal`: own image browsing, zoom, and the detail modal.
- `Pagination`, `InfiniteScrollTrigger`: own loading more items in paged and infinite lists.

### State and Feedback

- `AsyncState`: provides loading/error/empty states and a retry action at the same height and typography for non-list screens such as details, forms, and profiles.
- `ListState`: handles the pending → error → empty → content precedence in one place, and offers retry in situ through `errorAction` in the error state.
- `AlertMessage`, `ErrorBoundaryUI`: used for inline notices and recoverable screen errors.
- Loading preserves the layout; errors offer either retry or a safe path back.
- Empty states distinguish "no data" from "feature disabled" and choose copy and CTA accordingly.
- API errors must not replace the whole screen through the global React error boundary. Recover within that screen's `AsyncState`/`ListState`; the global boundary is only for rendering and programming errors.

### Overlays and Confirmation

- `Dialog`, `CtaModal`, `BottomSheet`, `PolicyModal`, `ShareModal`, `FollowersModal`: use the shared overlay that fits the purpose.
- `DeleteConfirmModal`: the default entry point for every destructive action that needs confirmation before deletion.
- `ExitConfirmModal`, `LoginPromptModal`: own composer-exit and authentication-required flows.
- Reporting never sends an arbitrary default reason. The user must explicitly choose a reason matching the backend enum, and client validation blocks the request until then.
- Signed-out reporting does not fire a 401 request first; `LoginPromptModal` preserves the current path as `returnUrl`.
- Leaving a chat room uses the same confirmation copy in the list and the conversation header. On success the closed room is removed from the list and message caches immediately, and if it was the room being viewed, the app `replace`s to `/chat` so the closed deep link does not remain in history.
- Chat location sharing tells the user their current coordinates will be revealed before sending. Only a single coordinate and its accuracy are stored on the message — no route or address is collected — and permission denial, unavailable location, and timeout are recovered inside the modal.
- Location messages use the `location` type with range-validated latitude and longitude. The bubble keeps the existing point/white surface, external maps open in a new tab, and raw coordinates are never reverse-geocoded into an approximate address.
- Close icons, focus trap, ESC, and overlay-click behavior are not reimplemented per page.
- The full menu uses the Radix `Dialog`. It lays a neutral/warm surface across the entire viewport while its inner content follows `RESPONSIVE_SHELL_CLASS` and the 16/48/80px gutters exactly.

### Account and Help Screens

- `/login` follows the 48/64px header, 343/500px button widths, and 12/16px spacing of the three social login Figma frames. The leftover email/password copy and separate sign-up link in Figma are not part of the current contract and are not shown.
- Authentication offers only Google, Kakao, and Naver OAuth. Existing users proceed to a successful sign-in and new users continue into sign-up onboarding from the same button; the page does not make the user choose between them up front.
- Auth buttons may use social brand colors as an exception, while keeping a shared 40px height, 8px radius, centered icon/label pairing, and `primary-500` focus-visible ring.
- `/login?returnUrl=...` accepts only internal paths beginning with `/` as a return target. A signed-in user re-entering is `replace`d, and browser-back for a signed-out user restores the previous public screen, so nobody gets trapped on the login page.
- `/settings` is the account hub for authenticated users. Profile, notifications, and saved items are shared, with listing management added for breeders only.
- Adopter settings and the full menu expose the `신청·후기 내역` (applications & reviews) entry point at `/activity`. It is not shown to breeders, and a server-side role guard also blocks direct access.
- `/activity` splits applications and my reviews with the shared `TabBar`. Lists are rendered as separated rows inside a `rounded-xl + neutral-150 border + white surface` panel rather than per-screen cards, keeping the same account-screen hierarchy as settings and notifications.
- The `reviewId` on the application list and detail is the source of truth for server state. The frontend does not re-scan the whole review list to guess whether a review exists, and it invalidates both the application and review caches after a review is written.
- One review per application. `consultation_completed` allows only a consultation review and `adoption_approved` only an adoption review; in any other state the composer is not shown.
- There is no dedicated Figma source for applications and reviews yet. The current screen — combining the home shell `3349:1763114`, the shared tabs `976:32388`, and the settings account panel's surface, typography, and gutters — is the policy reference; when a dedicated Figma appears, replace only the measured values.
- `/faq` is a public screen and shows real data from `GET /home/faqs?userType=...` for each adopter/breeder tab.
- FAQ items use native `details/summary` rather than duplicating a bespoke JavaScript accordion. The whole question row is a touch and keyboard target, and the open state is conveyed by both the arrow rotation and the answer surface.
- FAQ copy describes only the service entry points and API states that actually exist. It must not present verification as a health or outcome guarantee, nor promise unbuilt support, payment, or shipping policies.
- Reptile FAQs assume husbandry requirements differ by species and do not state one-size-fits-all temperature, humidity, UVB, or feeding numbers. Hygiene and health guidance cites authoritative veterinary and public health sources and states the boundary where a qualified veterinarian must be consulted.
- Hall of Fame entries keep the `point-100` podium surface from the Figma home. When an external image from historical data expires or fails to load, do not show the browser's broken-image icon — swap in the `point-100 + primary-300 PawIcon` fallback. Known placeholder hosts such as the development seed's `picsum.photos` skip the Next image proxy request entirely and also block entry into the detail modal, so no 503 or timeout logs pile up behind the on-screen fallback.
- Account menus and help lists use `rounded-xl + neutral-150 border + white surface` as their shared card contract, and do not scatter small text links.
- The policy fixed on 2026-08-31 has no New/Elite breeder grade system. Do not display or collect a grade on cards, profiles, search, sign-up, or settings.
- `/grade-policy` and `/grade-policy/apply` return `notFound()` and are not linked from any menu. The old UI is removed from the active build; the restore point and the policy decision are recorded in `docs/archive/grade-policy.md`.
- Breeder verification status (`pending | reviewing | approved | rejected`) and subscription plan (`basic | pro`) remain real contracts, independent of grades.
- The Figma design system contains a `progress bar-EXP`, but there is no basis yet for the EXP calculation, tiers, or benefits. Do not speculatively implement BPM/EXP as a replacement for New/Elite.
- Business information in the public footer follows the current values published on pawpong.kr and in the privacy policy. Do not invent an unconfirmed phone number, e-commerce registration number, or support hours.
- The footer appears only on `/`, `/explore`, `/community`, `/hall-of-fame`, and `/faq`. It is not attached to focused screens such as login, settings, my home, composers, details, or chat.

### Decoration and Structure

- `Breadcrumb`, `Separator`, `CtaBanner`, `ProfileAvatar`, `ProfileHeader`: compose the information hierarchy and brand surfaces.
- `Pixel*` components are used only where Figma explicitly specifies pixel art.
- Sub screens do not author their own header markup; they use `NavigationBar`/`PageHeader`. Kebab and bookmark icons with undecided behavior are not rendered, and any visible action is wired to a real menu or route.

## 8. List Rows and Deletion Patterns

- The whole row, or its main content area, must be one unambiguous navigation button/link.
- Unread is expressed with a `point-50` surface plus a `primary-500` dot, never relying on color alone.
- Repeating lists do not expose a small "delete" text link.
- Deletions that are hard to undo go through `OwnerActionsMenu` or an icon button, then `DeleteConfirmModal`.
- The delete button is never nested inside the row's navigation button.
- Hover background uses `primary-50` or `neutral-50`; the focus ring uses `primary-500`.

## 9. Data and Navigation State

- React Query lists specify `refetchOnMount: 'always'` on screens where data freshness matters on re-entry.
- Detail, composer, and profile screens must also re-check server state when restored from the back-navigation cache, so they pair `refetchOnMount: 'always'` with local retry.
- The shared `createQuery`/`createInfiniteQuery` apply this re-entry rule to dynamic data by default. Only reference data declared with `STALE_TIME.STATIC` — breeds, regions, filters — skips refetching within the same session.
- Screens restored by back navigation must not trust the stale view; invalidate the related query keys after a mutation.
- Detect document BFCache restore via `pageshow` and Next client history restore via `popstate`. After the new route segment has subscribed, call `resetQueries({ type: 'active' }, { cancelRefetch: true })` once so aborting in-flight requests and refetching happen atomically. Do not call `cancelQueries` and `resetQueries` separately, which leaves restored screens stuck pending.
- Infinite lists flatten pages and then dedupe by ID.
- Explore categories use `all | dog | cat | lizard` and map to the API's `petType` as `undefined | dog | cat | reptile` respectively. Adoption, breeder, and community share the same mapping, and `lizard` must not fall back to an all-items query just because supporting data is missing.
- Internal navigation URLs accept only values beginning with `/`.
- Never disguise an API failure as an empty state. Render errors and empty states separately.
- If optimistic updates are used, always roll back on failure and revalidate against the server value.
- Cookie-based role UI renders role-specific content only after `useAuthStatus().isReady` becomes true. Keep the server snapshot and the first client render identical, and re-read the cookie on `pageshow`, `popstate`, and `visibilitychange` so stale role UI does not survive a BFCache back navigation.

## 10. Images

- `next/image fill` always requires a `sizes` value matching the rendered width.
- Only the true LCP image of the first view uses Next 16's `preload` or `loading="eager"`. For lists that means the first image of the first card; for details, the first hero image.
- The default preload value on shared image components is `false`. Only a caller that knows the on-screen order should set `preload`, preventing every card from preloading at once.
- Small local SVG sets that are always visible in the first view, such as explore categories, may use `loading="eager"`.
- Data that may have no server URL, or may 404 in object storage, must provide a component fallback.
- Fallbacks preserve the layout ratio and make alt/decorative status explicit.
- A change of representative image after saving or uploading also counts as dirty state and is included in the exit warning.

## 11. Accessibility and Interaction

- Icon-only buttons carry an `aria-label` describing the action.
- Keep the visual icon size at Figma's 20/24/32px, but expand the actual click and focus area to at least 40×40px on mobile and tablet. When using negative margins, preserve the original icon width in the layout so title and logo positions do not shift across breakpoint boundaries.
- The focus-visible ring defaults to `primary-500` so it stays at least 3:1 against the background.
- Never expose a critical action only on hover. It must be reachable by keyboard focus and touch.
- Block duplicate submission while pending and communicate progress through the label.
- In composer and edit forms, a change to text, visibility, or existing/new images all trigger the exit confirmation for the X button, browser back, and reload alike.
- Actions that change server state — delete, vote, favorite — refresh the related counts and states together on success.

## 12. Verification Matrix

Check all of the following when completing a feature.

1. No overflow, jump, or clipping at 375, 767, 768, 1024, 1439, 1440, and 1920px, including both sides of each boundary
2. Keyboard Tab/Enter/ESC and focus-visible verified
3. pending/error/empty/content and long text verified
4. API refetch and cache consistency verified after back, forward, and re-entry
5. `pnpm lint`, `pnpm tsc --noEmit`, `pnpm build`
6. Related backend unit/E2E tests, plus a real local API/Socket connection
7. After the feature commit and the `test` push, update the Obsidian completion record

Screens connected as a single entry flow — full menu, FAQ, settings — are not verified by a simple render check; verify `open menu → follow link → browser back → menu closed state restored` as one sequence. Auth screens also verify the login redirect for a direct request with no cookie.

### Breakpoint Contract

- Mobile: `0–767px`. Use 375px as the reference, but the mobile layout must extend naturally up to 767px.
- Tablet: `768–1439px`. Verify the real-world 768 and 1024px widths as well as the 1439px upper boundary.
- PC: `1440px+`. Switches at 1440px, and at 1920px must not over-stretch, thanks to the `Container` cap and centering.
- CSS uses only `tab:` and `pc:`. Do not introduce `md:`, `lg:`, ad-hoc `min-[...]`, or per-screen JS branching.
- Across a single pixel (767↔768, 1439↔1440), column count, gutters, fixed CTAs, and navigation must not overlap or invert in width.

## 13. FSD Component and API Boundaries

- Do not import another slice of the same `features` layer directly. The API and mutation that complete one user action are owned by that feature.
- Domain reads and writes used by several features live in `entities`; domain-agnostic transport and upload primitives live in `shared/api`.
- App and widget layers use a feature's public API; when internal composition is required, compose the public APIs of lower layers.
- Browser storage utilities unrelated to domain UI, such as the OAuth sign-up session, live in `shared/lib`.
- Slice names use the singular domain noun. Never create a deep import that bypasses the public API.
- After a structural change, `pnpm lint:fsd`, `pnpm lint`, `pnpm tsc --noEmit`, and `pnpm build` must all pass.

## 14. Screen Alignment Status

| Area                            | Figma / shared reference                                               | Status                                                                                                      |
| ------------------------------- | ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| GNB · BottomNav                 | `3349:1763537`, `4042:780810`                                          | PC GNB and the mo/tab 56px top-level navigation and SSR fallback aligned                                    |
| Home banner · search · showcase | `3349:2252855`, `4042:800891`, `4042:800892`                           | Measured alignment at all 3 reference widths; community 122/300px media tiles and banner looping stabilized |
| Home adoption card              | `3349:1763378`, `3406:724284`, `MediaCard`                             | mo/tab and pc variants, hover, and gutters aligned                                                          |
| Home profile · tabs             | `1021:20324`, `976:32388`                                              | Matches Figma; global breakpoint re-verification still needed                                               |
| Social login                    | `3414:750712`, `3414:751419`, `3414:751420`                            | Current 3 OAuth providers, new-signup branch, returnUrl, and back navigation aligned                        |
| Community composer              | `1056:46147`                                                           | PC entry point unified on the standard `pc:`                                                                |
| Community reporting             | `DropdownMenu`, `Dialog`, `LoginPromptModal`                           | Non-owner menu, reason validation, and the standard report API wired up                                     |
| Hall of Fame                    | `3349:1763500`, contest components, `ContestEntryImage`                | API states, vote cancellation, and a no-request brand fallback for legacy images wired up                   |
| Notifications                   | `NotificationListItem`, `OwnerActionsMenu`, `DeleteConfirmModal`       | Grouped list, unread, delete confirmation, and see-all aligned                                              |
| Chat                            | Shared chat widths, Socket.IO, `ChatRoomActionsMenu`, `ChatAttachMenu` | Deep link, back navigation, leave room, location sharing, and Kafka healthy/failure/recovery E2E complete   |
| Listing drafts                  | `ListState`, `OwnerActionsMenu`, `DeleteConfirmModal`                  | Forced refetch on re-entry, error retry, and representative-photo dirty protection complete                 |
| API re-entry state              | `AsyncState`, `ListState`, `QueryProvider`, `useExitGuard`             | Document BFCache and Next popstate active-API refetch E2E complete                                          |
| Breeder verification policy     | Figma menu `3555:416834`, `docs/archive/grade-policy.md`               | New/Elite routes, active UI, and frontend API contract removed; verification status only                    |
| Adopter applications · reviews  | Home `3349:1763114`, tabs `976:32388`, account panel                   | Application list/detail, review composer/list/detail, and role-based entry points wired to real APIs        |
| Adoption interest policy        | Adoption detail component set, `FavoriteShareActions`                  | Single action across all breakpoints, hidden for owners, server self-boost 403 blocking complete            |

## 15. Document Update Rules

- When a Figma node is implemented, link that node ID and the code component in this document.
- When a shared component or variant is added, update the catalog and its usage conditions with it.
- When adding a new breakpoint, arbitrary color, arbitrary shadow, or page-specific modal, record why the existing shared rules could not solve it.
- Once a feature passes browser, API, and build checks, update both this document's status table and the Pawpong Obsidian notes.
