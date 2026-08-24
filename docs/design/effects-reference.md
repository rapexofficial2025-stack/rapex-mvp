# UI effects reference (borders, cards, toggles, animations)

Saved from social media CSS-snippet posts (mostly "Codewithayansh") for
later use — same purpose as `button-reference.md`: pick from these when a
screen needs a specific effect, don't build from scratch.

**Same caveat as the button reference:** raw web CSS, not directly usable in
React Native (auth-preview/rider-app/customer-app) without translation —
directly usable as-is only for the web apps (Merchant/Admin portals).

## Gradient Border Effect (cursor-follow glow)
Two "Pro" cards where the border glow follows the mouse cursor position —
driven by one shared `mousemove` listener setting a CSS custom property,
not per-card JS. Only the card shell CSS was visible (the cursor-tracking
part relies on JS not shown):
```css
article {
  aspect-ratio: 3 / 4;
  border-radius: calc(var(--radius) * 1px);
  width: 260px;
  position: relative;
  display: grid;
  grid-template-rows: 1fr auto;
  box-shadow: 0 1rem 2rem -1rem black;
  padding: 1rem;
  gap: 1rem;
  -webkit-backdrop-filter: blur(calc(var(--cardblur, 5) * 1px));
  backdrop-filter: blur(calc(var(--cardblur, 5) * 1px));
}
main {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  width: 120ch;
  max-width: calc(100vw - 2rem);
  position: relative;
}
```
Web-only (Merchant/Admin) — needs real mouse position, not meaningful on touch/mobile.

## Neon Animated Card
Three cards (orange, pink, cyan) with a glowing neon ribbon/banner behind
each. Only HTML structure was visible, not the CSS driving the glow:
```html
<div class="box">
  <span></span>
  <div class="content">
    <h2>Card One</h2>
    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolor minus fuga.</p>
    <a href="#">Read More</a>
  </div>
</div>
```
Matches our existing purple/orange neon-glass language (GlassCard, Splash
spark glow, rider nav bar) — good fit if we want a card-level version of
that same effect.

## Electric Border Effect
Jittery/animated glowing outline around a card (cyan and yellow variants
shown), "DRAMATIC" badge. The CSS captured was actually an unrelated
hero-background block from the same file, not the border effect itself —
re-check the source before using, this entry is incomplete.

Directly relevant to future glow-border work (same family as our existing
gradient-ring borders on GlassCard/AgeGate/nav bar).

## Firework Simulator CSS
Pure-CSS firework particle burst animation (no JS/canvas). Partial keyframes
captured:
```css
@keyframes change-background {
  0%, 59%, 98%, 100% { background: #FEF4AD; }
  61%, 97% { background: #F8AE39; }
}
@keyframes move-Left {
  0%, 59%, 100% { width: 0px; left: 40%; }
  60% { width: 30px; left: 30%; }
  68% { width: 0px; left: 20%; }
}
```
Potential future use: a celebratory moment (order placed, incentive target
hit, referral milestone) — festive one-off animation, not a persistent UI
element.

## Animated Toggle Switch
Four themed toggle variants (Star Wars BB-8, cyan glow, day/cloud-sun,
night/moon). Base shell:
```css
.toggle {
  position: relative;
  cursor: pointer;
  display: inline-block;
  width: 200px;
  height: 100px;
  background: #211042;
  border-radius: 50px;
}
```
**Directly relevant** — matches what we already have live: rider-app's
Day/Night map-style toggle and the online/offline switches on Home/Wallet.
Good reference if we want to give those more visual flair later (e.g. a
day/night themed toggle track instead of the plain default `Switch`).

## Creative Login Form / Animated Login Form
**Not portable code** — these are a third-party **Visme** hosted form
widget embedded via script, not custom CSS/HTML we can extract:
```html
<div class="visme_d"
    data-title="Webinar Registration Form"
    data-url="g7ddqxx0-untitled-project?fullPage=true"
    data-domain="forms"
    data-full-page="true"
    data-min-height="100vh"
    data-form-id="133190">
</div>
```
The animated 3D character mascot reacting to form fields is a Visme
platform feature, not something to reimplement from this snippet. Worth
noting only as inspiration (character-reacts-to-form-focus concept) if we
ever want a mascot-driven interaction on a form screen — would need to be
built from scratch, not ported.
