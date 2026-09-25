# Blew Manual: Styling Architecture, Constructable Sheets & Scoping 🍃

```
/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */
```

This chapter details the styling architecture in Blew: how Shadow DOM encapsulation interacts with global design tokens, how `BlewElement` automatically defaults to the system theme, and how to craft feature-level styles using native **Constructable Stylesheets** and **CSS `@scope`**.

---

## 1. The Shadow DOM Styling Boundary & Blew's Solution

In traditional web development, global stylesheets (`styles.css`) apply rules universally across the entire document. When components use Shadow DOM, the browser establishes a strict **style encapsulation boundary**:

* **Inward Isolation:** Selectors in external stylesheets (such as `p { color: red; }` or `.button { ... }`) cannot match elements located inside an open Shadow Root.
* **Outward Isolation:** Selectors written inside a component's Shadow Root cannot leak out or mutate elements in the outer document or other components.

While isolation prevents specificity collisions and dead code accumulation, real-world applications still require **uniform design themes** (typography, color palettes, spacing grids, corner radii, and dark/light modes).

Blew solves this cleanly without CSS-in-JS runtimes, preprocessors, or class-hash manglers by employing a two-tier pipeline:

$$
\text{Global System Theme} \xrightarrow{\text{Inherited Tokens \& Adopted Sheets}} \text{Shadow Boundary} \xrightarrow[@\text{scope}]{\text{Local Sheet}} \text{Component DOM}
$$

1. **Token Tunneling via CSS Custom Properties:** CSS variables (`--b-*`) naturally pierce the Shadow DOM barrier through standard property inheritance.
2. **Shared Constructable Stylesheet Adoption:** `BlewElement` instances automatically prepend the compiled global theme stylesheet into `adoptedStyleSheets`, allowing local feature sheets to cascade cleanly over theme defaults.

---

## 2. How the Global Theme Defaults Work

Blew establishes its global visual foundation in `src/core/theme.css`. This file defines standard cascade layers, core tokens, and typographic baselines:

```css
/* src/core/theme.css */
@layer b-reset, b-tokens, b-base;

@layer b-tokens {
  :root {
    /* System Typography */
    --b-font-sans: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --b-font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;

    /* Adaptive Color Palette via light-dark() */
    --b-color-surface: light-dark(#ffffff, #121212);
    --b-color-surface-elevated: light-dark(#f9fafb, #1e1e1e);
    --b-color-border: light-dark(rgba(0, 0, 0, 0.12), rgba(255, 255, 255, 0.12));
    --b-color-text: light-dark(#1f2937, #f3f4f6);
    --b-color-text-muted: light-dark(#6b7280, #9ca3af);
    --b-color-primary: #0070f3;
    --b-color-primary-hover: #005bb5;
    --b-color-danger: #ef4444;

    /* Spatial Dimensions */
    --b-radius-sm: 4px;
    --b-radius-md: 8px;
    --b-radius-lg: 12px;
    --b-radius-full: 9999px;
    --b-space-xs: 0.25rem;
    --b-space-sm: 0.5rem;
    --b-space-md: 1rem;
    --b-space-lg: 1.5rem;

    color-scheme: light dark;
  }
}

@layer b-reset {
  *, *::before, *::after {
    box-sizing: border-box;
  }
}

@layer b-base {
  body {
    font-family: var(--b-font-sans);
    background-color: var(--b-color-surface);
    color: var(--b-color-text);
    line-height: 1.5;
    margin: 0;
  }
}
```

### The Auto-Adoption Mechanism

When a class extending `BlewElement` attaches to the DOM, its constructor and `connectedCallback()` guarantee that base theme rules are applied before any component-specific rules:

```javascript
// Inside BlewElement (@blew/core)
export class BlewElement extends HTMLElement {
  constructor(options = {}) {
    super();
    this.attachShadow({ mode: options.mode ?? 'open' });
  }

  adoptStyles(...styleInputs) {
    // 1. Fetch singleton pre-parsed global theme sheet
    const themeSheet = Blew.getThemeSheet();

    // 2. Resolve incoming feature stylesheets (from cache or new replaceSync)
    const localSheets = styleInputs.flat().map(input => {
      if (input instanceof CSSStyleSheet) return input;
      return StyleSheetCache.getOrCreate(input);
    });

    // 3. Attach: Global theme first, feature styles second
    this.shadowRoot.adoptedStyleSheets = [themeSheet, ...localSheets];
  }
}
```

Because `themeSheet` sits at index $0$ and the component's custom sheet sits at index $1$ in `adoptedStyleSheets`, local feature rules naturally win during cascade resolution without requiring artificial specificity increases or `!important`.

---

## 3. Piercing the Boundary with CSS Custom Properties

CSS Custom Properties are not constrained by Shadow DOM boundaries. If a property is declared on `:root` (or on any parent container in the light DOM), child elements inside nested shadow roots automatically inherit it.

### Standard Blew Token Inventory

Feature components can freely reference any of Blew's canonical design tokens:

| Token Category | CSS Custom Property | Default Context |
| :--- | :--- | :--- |
| **Colors** | `var(--b-color-surface)` | Background color (adapts to light/dark) |
| | `var(--b-color-surface-elevated)` | Cards, floating panels, popovers |
| | `var(--b-color-text)` | Primary heading and body text |
| | `var(--b-color-text-muted)` | Captions, subtitles, disabled text |
| | `var(--b-color-primary)` | Primary brand accent and interactive buttons |
| | `var(--b-color-border)` | Dividing lines and container borders |
| **Typography** | `var(--b-font-sans)` | UI and standard reading text |
| | `var(--b-font-mono)` | Code blocks, hashes, numeric tabular data |
| **Borders** | `var(--b-radius-sm)` / `md` / `lg` | Rounded container radius |
| **Motion** | `var(--b-transition-fast)` | $150\text{ ms}$ ease-out standard transition |

### Color Schemes & `light-dark()`

Blew avoids duplicating CSS rules across `@media (prefers-color-scheme: dark)` queries by leveraging standard CSS `light-dark()` notation. When the user changes their operating system appearance, or when an ancestor sets `color-scheme: dark`, all `light-dark()` tokens resolve automatically inside every shadow root with zero JavaScript intervention.

---

## 4. Constructable Stylesheets: Zero-Duplication Styling

Traditional frontend component libraries frequently inject duplicate `<style>` tags into each shadow root. With $1,000$ list items on a screen, this creates $1,000$ duplicate style nodes in memory, causing frame drops and hundreds of kilobytes of memory waste.

Blew avoids this entirely using **Constructable Stylesheets** (`adoptedStyleSheets`):

```javascript
const componentStyles = `
  :host {
    display: flex;
    flex-direction: column;
    padding: var(--b-space-md);
  }
`;

export class MyCard extends BlewElement {
  connectedCallback() {
    // Compiled once, referenced by all instances
    this.adoptStyles(componentStyles);
  }
}
```

### Memory Footprint Guarantee

When `this.adoptStyles(string)` executes:

1. Blew calculates a fast hash of the stylesheet content.
2. If already parsed, the existing `CSSStyleSheet` reference is returned immediately.
3. If new, `new CSSStyleSheet().replaceSync(cssText)` compiles the CSS once into browser memory.

$$
\text{Memory Overhead for 1,000 Instances} \approx \mathcal{O}(1) \quad (< 1\text{ MB total})
$$

---

## 5. Component Scoping with Native CSS `@scope`

Inside the component stylesheet, Blew leverages **CSS `@scope`** to guarantee that selectors remain strictly bounded to the host element without class mangling or BEM prefixes.

### Basic Host Scoping

The `:host` pseudo-class targets the custom element container itself, while `@scope (:host)` confines rules within its shadow tree:

```css
:host {
  display: block;
  border: 1px solid var(--b-color-border);
  border-radius: var(--b-radius-md);
  background: var(--b-color-surface);
}

@scope (:host) {
  h3 {
    margin: 0 0 var(--b-space-xs) 0;
    color: var(--b-color-text);
  }
  p {
    color: var(--b-color-text-muted);
    font-size: 0.95rem;
  }
}
```

### Donut Scoping (Preventing Slot & Sub-Component Leakage)

When a component projects light DOM content via `<slot>` or embeds child custom elements, you may want styles to stop at the child component boundary. CSS `@scope` solves this via the `to (<limit>)` clause:

```css
/* Style elements inside this host, but STOP if entering a nested sub-card */
@scope (:host) to (.note-content, b-comment-card) {
  p {
    font-size: 0.9rem;
    line-height: 1.4;
  }
  a {
    color: var(--b-color-primary);
    text-decoration: underline;
  }
}
```

Any `<p>` tags located within `.note-content` or inside `<b-comment-card>` are excluded from this rule, preventing parent styles from polluting nested children.

---

## 6. Practical Implementation Examples

### Example 1: Building a Custom Feature Card on Top of Global Tokens

This example illustrates how a feature slice creates a custom element with localized styling while building upon global typography, colors, and border tokens:

```javascript
// src/features/dashboard/dashboard-card.js
import { BlewElement } from '@blew/core';

const styles = `
  :host {
    display: flex;
    flex-direction: column;
    padding: var(--b-space-lg);
    background: var(--b-color-surface-elevated);
    border: 1px solid var(--b-color-border);
    border-radius: var(--b-radius-lg);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
    transition: border-color 0.2s ease, transform 0.2s ease;
  }

  :host(:hover) {
    border-color: var(--b-color-primary);
    transform: translateY(-2px);
  }

  @scope (:host) {
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: var(--b-space-sm);
    }

    h2 {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--b-color-text);
      margin: 0;
    }

    .badge {
      padding: var(--b-space-xs) var(--b-space-sm);
      border-radius: var(--b-radius-full);
      font-size: 0.75rem;
      font-weight: 500;
      background: var(--b-color-primary);
      color: #ffffff;
    }

    .metric-value {
      font-family: var(--b-font-mono);
      font-size: 2rem;
      font-weight: 700;
      color: var(--b-color-text);
      margin: var(--b-space-sm) 0;
    }
  }
`;

export class DashboardCard extends BlewElement {
  connectedCallback() {
    this.adoptStyles(styles);
    this.render();
  }

  render() {
    const title = this.getAttribute('title') || 'Metric';
    const value = this.getAttribute('value') || '0';
    const tag = this.getAttribute('tag') || 'Live';

    this.shadowRoot.replaceChildren(this.html`
      <header>
        <h2>${title}</h2>
        <span class="badge">${tag}</span>
      </header>
      <div class="metric-value">${value}</div>
      <slot></slot>
    `);
  }
}

customElements.define('b-dashboard-card', DashboardCard);
```

### Example 2: Scoped Theme Overrides (Localized Reskinning)

Because custom properties inherit down the DOM tree, a feature slice can override theme tokens locally on its `:host` without affecting any other part of the application:

```css
/* src/features/analytics/analytics-view.css */
:host {
  display: block;
  padding: 2rem;

  /* 🎨 Locally redefine global tokens for this feature domain only */
  --b-color-primary: #10b981;          /* Emerald green accent instead of default blue */
  --b-color-primary-hover: #059669;
  --b-radius-md: 16px;                 /* Softer pill-style corners for this screen */
  --b-color-surface: light-dark(#f0fdf4, #064e3b); /* Green-tinted surface */
}

@scope (:host) {
  button.action-btn {
    background: var(--b-color-primary); /* Automatically picks up emerald green */
    border-radius: var(--b-radius-md);
    color: #ffffff;
    padding: 0.75rem 1.5rem;
    border: none;
    cursor: pointer;
  }
}
```

Every nested child element (such as `<b-dashboard-card>` or standard buttons) rendered within this feature view inherits the emerald green primary color and 16px border radius seamlessly.

---

## 7. Best Practices & Design Checklist

* **Do not import external CSS files via `@import` inside component styles.** `@import` inside a constructable stylesheet triggers blocking network round-trips. Always use `this.adoptStyles()` with cached string constants or imported CSS modules.
* **Keep component selectors flat.** Since `@scope (:host)` eliminates global name collisions, avoid nesting deep CSS selectors. Write simple rules like `button { ... }` or `header { ... }` rather than `.b-dashboard-card-inner-header-button`.
* **Always provide fallbacks for custom properties.** When referencing application variables, provide sensible fallbacks for resilience:
  ```css
  color: var(--b-color-text, #1f2937);
  ```
* **Use native CSS `light-dark()` over media queries.** Keep color definitions declarative in `:root` and feature hosts rather than duplicating blocks inside `@media (prefers-color-scheme: dark)`.

---

## 8. Related Chapters

* [Manual Home & Architecture Overview](home.md)
* [Feature Slices & Wildcard API Engine](features.md)
* [Canonical API Reference (`BlewElement`)](../API.md#1-module-blewcore-blewelement)
* [Quick Start Guide & Theme Layer Setup](../QUICKSTART.md#step-b-global-styles--cascade-layers-srccorethemecss)