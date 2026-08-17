# 07 — UI Guidelines

UI for RAPEX is generated in Base44/Gemini/Glide (components, layouts, navigation, responsive design), then converted/wired by Claude into the app folders under `apps/`. These tools never touch backend logic.

This doc will track:
- Design tokens (colors, spacing, typography) once defined
- Component conventions for converting generated output into `src/components/`
- Navigation conventions per app

## Status
In progress — auth-preview, rider-app, and the merchant/admin web portals already have real screens built. Culture/UX principles below apply to all of them.

## Workflow: who builds the layout

To keep token/credit cost down, new screen layouts should NOT be
hand-built from scratch here first. The flow is:

1. **Base44 (or Gemini/Glide) generates the layout.** Claude writes the
   prompt for it, describing the screen, real data fields, and the
   clarity rule above.
2. **Claude does one targeted pass** to port that output into the real
   `apps/*` code: real components, real hooks/data, matching the app's
   existing navigation and theme. This should be a single focused edit,
   not repeated back-and-forth rebuilding of the same screen's layout.
3. Fixes after that stay scoped to what's actually broken or wrong
   (wiring, a wrong data field, a real bug) — not further layout
   iteration, which goes back to Base44's prompt instead.

Exception: quick, cheap, surgical restyles (spacing/margin/color tweaks,
adding a press state, moving one element) are fine to do directly when
they're small — this rule is about not hand-building whole screens from
nothing.

## Accessibility / clarity rule (applies to every screen, every app)

RAPEX's customer base includes 50+ users with little app experience. The
target is Grab/foodpanda/GCash-level clarity, not Lazada-level button
sprawl (where a tap can lead anywhere and it's unclear why). Concretely:

1. **One primary action per screen.** A single, visually dominant CTA
   button that does the obvious next thing. If a screen seems to need two
   equally-important primary actions, that's a sign it should be two
   screens.
2. **No icon-only buttons for anything that isn't purely decorative.**
   Every button that leads somewhere or does something gets a visible
   label next to (or under) its icon. Icon-only is fine for things like a
   pure "close" X or a map layers toggle — never for navigation or a
   commit action.
3. **Cap secondary actions at ~3 per screen**, and keep them visually
   subordinate (smaller, outlined/ghost style) to the primary CTA so
   there's no ambiguity about what the "main" button is.
4. **Predictable navigation**, not branching menus: a button's label and
   icon should tell you what screen you land on before you tap it. Avoid
   generic "More" hubs that hide several unrelated actions behind one tap.

This is about interaction patterns (button count, label discipline, one
clear next step) — not copying Grab/foodpanda/GCash's actual art, colors,
or branding. RAPEX keeps its own visual identity throughout.
