---
'solid-stripe': major
---

solid-stripe now requires Solid 2. Install `solid-js` and `@solidjs/web` 2.0.0-rc.19 or later. Apps on Solid 1 should stay on solid-stripe 1.x.

The components, props, hooks, and the `solid-stripe/checkout` entry keep their names and shapes. Hooks still return accessors.

Two behaviors change because Solid 2 changes them:

- solid-stripe throws when an element or hook is used in the wrong place. Examples are an element type that a checkout provider does not support, a checkout hook under the wrong provider, and an element inside both a checkout provider and `<Elements>`. These errors go to the nearest `<Errored>` boundary. Without a boundary, Solid 2 logs `REACTIVITY_HALTED` and stops processing updates.
- Solid 2 applies a state change on the next microtask, not inside the setter. A change to `options` reaches `elements.update()`, `element.update()`, `changeAppearance()`, or `loadFonts()` at that point, and the unsupported prop change warnings print at the same time.
