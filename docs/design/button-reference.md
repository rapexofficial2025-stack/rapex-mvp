# Button style reference (CSS embossed button pack)

Saved from a social media CSS-snippet post ("CSS Embossed Button" by Nilesh
Mhatre) for later use — pick a style when a screen needs a button treatment
beyond the current default (`Button` in `packages/ui-native`/`ui-web`).

**Not directly usable as-is.** These are raw web CSS `:hover` rules only (no
base/resting state shown in the source screenshots) — same situation as the
earlier Glide glass-card CSS, which had to be translated into RN-native
techniques (LinearGradient, BlurView, drawn highlight lines) rather than
copy-pasted, since RN doesn't support `box-shadow`, `filter`, or `:hover`.
For web apps (Merchant/Admin portals), these CSS rules are closer to
directly usable.

## 4. Gradient Embossed Button
Purple-to-pink gradient fill, lifts + grows slightly + gains a colored glow shadow on hover.
```css
.btn4:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 15px 25px rgba(236,72,153,.5);
}
```

## 5. Metallic Embossed Button
Light gray/white "metal" look, subtle brighten + lift on hover.
```css
.btn5:hover {
  filter: brightness(1.05);
  transform: translateY(-2px);
}
```

## 7. Circular Embossed Button
Circular neumorphic button with a "+" icon, spins 90° + grows + icon recolors on hover.
```css
.btn7:hover {
  transform: rotate(90deg) scale(1.05);
  color: #38bdf8;
}
```

## 8. Glass Embossed Button
Frosted-glass button on an orange/red gradient background, brightens + lifts on hover.
```css
.btn8:hover {
  background: rgba(255,255,255,0.3);
  transform: translateY(-3px);
}
```

## 9. Dark Embossed Button
Dark/black button, lifts + text brightens on hover.
```css
.btn9:hover {
  transform: translateY(-3px);
  color: #f8fafc;
}
```

## 10. Hover Animated Embossed Button
Light/white neumorphic button, lifts further + gains a strong dual-direction soft shadow (the neumorphic "raised" look) on hover.
```css
.btn10:hover {
  transform: translateY(-6px);
  box-shadow: -12px -12px 24px #ffffff, 12px 12px 24px #94a3b8;
}
```

## Notes for later use
- Good native-driver RN equivalents for the `translateY` lift + shadow-on-press
  pattern already exist in this codebase — see `SlideToContinueButton.tsx`'s
  3D thumb treatment (real shadow + inner highlight) for the established
  approach.
- "Glass" (#8) and "Gradient" (#4) map well to the existing purple/orange
  neon-glass language used across auth-preview (`GlassCard`, `RapexGlassCard`,
  the Splash spark glow).
- "Metallic" (#5) and "Dark" (#9) are closer to Merchant/Admin's plainer web
  UI needs than to the customer-facing glass aesthetic.
