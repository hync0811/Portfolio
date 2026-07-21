# Project architecture

The portfolio is a single-page Astro experience. Astro owns document structure and
static content; a small TypeScript controller progressively enhances the loading
flow, clock, navigation, and pointer dragging.

```text
src/
├── components/
│   ├── desktop/       # Interactive workspace and browser-like windows
│   ├── loading/       # First-visit loading experience
│   ├── shell/         # Fixed header and footer
│   └── ui/            # Small reusable visual primitives
├── layouts/           # Document shell, SEO defaults, global CSS imports
├── pages/             # Route entry points only
├── scripts/           # Progressive enhancement controllers
└── styles/            # Reset, design tokens, and truly global rules
```

## Boundaries

- `pages` compose features and contain no interaction implementation.
- Astro component styles remain scoped beside their markup.
- Global styles contain only reset, tokens, and document-wide behavior.
- Feature content will live with its feature or in a content collection once the
  final project schema is known.
- Client-side code uses data attributes as stable hooks; presentation classes are
  not JavaScript APIs.

## Deferred decisions

The overview is intentionally incomplete. The following should be confirmed before
building feature content: final About/Contact copy, Works data schema, popup and
carousel behavior, exact loading persistence, mobile interaction model, languages,
and asset/export strategy.
