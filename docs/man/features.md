# Blew Manual: Feature Slices & Wildcard API Engine 🍃

```
/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */
```

This chapter details the primary architectural pattern in Blew: **Vertical Feature Slicing** paired with the **Wildcard API Engine**. By organizing code around domain capabilities rather than technical tiers, Blew keeps applications modular, testable, and maintainable as they grow.

---

## 1. Anatomy of a Vertical Feature Slice

In traditional frontend architectures, code is split horizontally across global directories (`components/`, `reducers/`, `services/`, `controllers/`). Adding, modifying, or removing a capability requires jumping across multiple disconnected folders.

Blew organizes applications vertically inside `src/features/<feature-name>/`. Every piece belonging to a domain capability lives inside that single directory:

```text
src/features/notes/
├── notes-view.js       # UI Custom Element: <b-notes-view> (extends BlewElement)
├── notes.css           # Feature-scoped styles (or embedded constructable CSS)
├── store.js            # TC39 Signal store (state, computed selectors, mutations)
├── endpoint.js         # WinterCG multi-method / RPC action endpoint
└── notes-card.js       # Local sub-component (<b-notes-card>)
```

### Core Axioms of Feature Slices

1. **Self-Sufficiency:** A feature slice should be runnable and testable independently of unrelated features.
2. **Explicit Public Boundaries:** A feature exposes its interface only through its UI entry point (`notes-view.js`), its route endpoint (`endpoint.js`), and exported signals in `store.js`.
3. **Safe Deletion:** Deleting the `src/features/notes/` directory cleanly removes the feature from the application with zero leftover orphaned files.

---

## 2. UI Screen Design with Custom Elements & Shadow DOM

Every screen in Blew is a native Custom Element extending `BlewElement` (`@blew/core`). This provides style isolation, native lifecycle handling, and DOM stamping using in-memory template cloning.

### Example: Feature Screen Implementation

```javascript
// src/features/notes/notes-view.js
import { BlewElement } from '@blew/core';
import { notes, activeNoteId, selectNote, addNote } from './store.js';

const styles = `
  :host {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: 1.5rem;
    height: 100%;
    view-transition-name: feature-notes;
  }

  @scope (:host) {
    aside {
      border-right: 1px solid var(--b-color-border);
      padding-right: 1rem;
    }
    .note-list {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      margin-top: 1rem;
      padding: 0;
    }
    .note-item {
      padding: 0.75rem;
      border-radius: var(--b-radius-md);
      cursor: pointer;
      background: var(--b-color-surface);
      border: 1px solid transparent;
      transition: border-color 0.15s ease;
    }
    .note-item.active {
      border-color: var(--b-color-primary);
    }
    button.new-btn {
      width: 100%;
      padding: 0.6rem;
      background: var(--b-color-primary);
      color: #ffffff;
      border: none;
      border-radius: var(--b-radius-md);
      cursor: pointer;
    }
  }
`;

export class NotesView extends BlewElement {
  connectedCallback() {
    this.adoptStyles(styles);
    this.render();

    // Auto-subscribe to the reactive notes signal store
    const unsubscribe = notes.subscribe(() => {
      this.updateList();
    });
    this.subscribe(unsubscribe);
  }

  updateList() {
    const listEl = this.shadowRoot.querySelector('#note-items');
    if (!listEl) return;

    const items = notes.value.map((n) => {
      const isActive = n.id === activeNoteId.value ? 'active' : '';
      return `<li class="note-item ${isActive}" data-id="${n.id}">${n.title}</li>`;
    }).join('');

    listEl.innerHTML = items;
  }

  render() {
    const fragment = this.html`
      <aside>
        <button class="new-btn" id="create-btn">+ Create Note</button>
        <ul class="note-list" id="note-items"></ul>
      </aside>
      <main id="note-detail">
        <p>Select a note from the left to read or edit.</p>
      </main>
    `;

    this.shadowRoot.replaceChildren(fragment);
    this.updateList();

    // Event Delegation
    this.shadowRoot.querySelector('#create-btn').onclick = () => addNote('Untitled Note');
    this.shadowRoot.querySelector('#note-items').onclick = (e) => {
      const item = e.target.closest('.note-item');
      if (item) selectNote(item.dataset.id);
    };
  }
}

customElements.define('b-notes-view', NotesView);
```

---

## 3. Constructable Stylesheets & Native CSS `@scope`

Blew bypasses runtime CSS-in-JS libraries and preprocessors by relying on browser-native styling primitives:

### Constructable Stylesheets (`adoptedStyleSheets`)

When `this.adoptStyles(cssText)` is called:

1. Blew checks an internal stylesheet cache keyed by the CSS string content.
2. If already parsed, the existing `CSSStyleSheet` instance is attached directly to `this.shadowRoot.adoptedStyleSheets`.
3. If new, `new CSSStyleSheet().replaceSync(cssText)` compiles the CSS once into memory.

This guarantees that $1,000$ active custom element instances share a single compiled stylesheet in browser memory, keeping memory consumption minimal ($< 1\text{ MB}$).

### Native CSS `@scope`

Inside shadow roots, styles can be scoped precisely without class-name hashing or BEM conventions:

```css
@scope (:host) to (.note-content) {
  p {
    font-size: 0.95rem;
    line-height: 1.5;
    color: var(--b-color-text);
  }
}
```

The `@scope` donut boundary prevents parent element styles from leaking into nested child components or slotted user content.

---

## 4. Multi-Method Endpoints & WinterCG Compliance

Blew endpoints adhere to the WinterCG fetch standard. Handlers consume standard `Request` objects and return standard `Response` objects:

$$
\text{Request} \longrightarrow \text{Handler}(\text{Request}, \text{Context}) \longrightarrow \text{Response}
$$

This allows identical execution across three environments:

1. **Unbundled Development:** Executed locally inside Node/Bun static dev servers.
2. **Offline Progressive Web App:** Executed directly inside the ESM Service Worker (`sw.js`).
3. **Production Serverless / Edge:** Deployed to Cloudflare Workers, Fastly Compute, Bun, or Node.js.

### Multi-Method REST Endpoint (`endpoint.js`)

```javascript
// src/features/notes/endpoint.js

// In-memory data store for local dev / offline sync
const storage = new Map([
  ['note_1', { id: 'note_1', title: 'Architecture Review', content: 'Native PWA...' }]
]);

/**
 * GET /api/notes
 * GET /api/notes/:id
 */
export async function GET(request, { params }) {
  if (params?.action) {
    const item = storage.get(params.action);
    if (!item) {
      return Response.json({ error: 'Note not found' }, { status: 404 });
    }
    return Response.json(item);
  }

  const all = Array.from(storage.values());
  return Response.json({ total: all.length, items: all });
}

/**
 * POST /api/notes
 */
export async function POST(request) {
  const data = await request.json();
  if (!data?.title?.trim()) {
    return Response.json({ error: 'Title is required' }, { status: 422 });
  }

  const id = `note_${Date.now()}`;
  const newNote = { id, title: data.title.trim(), content: data.content || '' };
  storage.set(id, newNote);

  return Response.json(newNote, { status: 201 });
}

/**
 * DELETE /api/notes/:id
 */
export async function DELETE(request, { params }) {
  const id = params?.action;
  if (!id || !storage.has(id)) {
    return Response.json({ error: 'Note not found' }, { status: 404 });
  }

  storage.delete(id);
  return new Response(null, { status: 204 });
}
```

---

## 5. Named Action Dispatching (RPC-Style Exports)

In addition to standard REST verbs (`GET`, `POST`, `PATCH`, `DELETE`), Blew allows exporting **Named Actions**. This enables RPC-style endpoint dispatching without declaring separate routes for every custom operation.

When a request arrives at `/api/notes/:action*`, the dispatcher inspects the first segment of `:action`:

```text
Request URL:      POST /api/notes/archive-note
Extracted Action: "archive-note" -> camelCase: "archiveNote"
```

If `archiveNote` is an exported function on `endpoint.js`, Blew invokes it directly:

```javascript
// src/features/notes/endpoint.js

// Named RPC Action: POST /api/notes/archive-note
export async function archiveNote(request, { url }) {
  const { id } = await request.json();
  const note = storage.get(id);

  if (!note) {
    return Response.json({ error: 'Note not found' }, { status: 404 });
  }

  note.archived = true;
  storage.set(id, note);

  return Response.json({ success: true, archived: id });
}

// Named RPC Action: GET /api/notes/export-all
export async function exportAll(request) {
  const all = Array.from(storage.values());
  return new Response(JSON.stringify(all, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="notes.json"'
    }
  });
}
```

### Dispatch Resolution Hierarchy

```text
Incoming Request: /api/:feature/:action*
                 │
                 ▼
Does exported function match camelCase(action)?
                 │
        ┌────────┴────────┐
     Yes│                 │No
        ▼                 ▼
Invoke action()      Does exported function match request.method?
                          │
                 ┌────────┴────────┐
              Yes│                 │No
                 ▼                 ▼
          Invoke METHOD()       Return 405 Method Not Allowed
```

---

## 6. Atomic Feature Flags & Dynamic Route Pruning

A feature slice is registered in `src/routes.js` as a unified entry pairing its UI view and wildcard API endpoint:

```javascript
// src/routes.js
import { ENV } from '@blew/env';

export const features = [
  {
    name: 'home',
    view: {
      pattern: '/',
      tag: 'b-home-view',
      load: () => import('@features/home/home-view.js')
    }
  },
  {
    name: 'notes',
    disabled: false, // 👈 Single atomic feature flag
    view: {
      pattern: '/notes/:subview*',
      tag: 'b-notes-view',
      load: () => import('@features/notes/notes-view.js')
    },
    api: {
      pattern: '/api/notes/:action*',
      load: () => import('@features/notes/endpoint.js')
    }
  },
  {
    name: 'ai-summary',
    // Dynamically disabled in production builds until ready
    disabled: ENV.isProd(),
    view: {
      pattern: '/ai/:action*',
      tag: 'b-ai-view',
      load: () => import('@features/ai/ai-view.js')
    },
    api: {
      pattern: '/api/ai/:action*',
      load: () => import('@features/ai/endpoint.js')
    }
  }
];
```

### How `extractActiveRoutes()` Normalizes Entries

The utility parser (`@blew/router-utils`) filters out disabled features in a single pass at application boot:

```javascript
import { features } from './routes.js';
import { extractActiveRoutes } from '@blew/router-utils';

const { views, apis } = extractActiveRoutes(features);
```

* **Client UI Router:** Receives only active `views`. Navigating to a disabled feature route renders the configured `fallbackTag` (404 screen).
* **Service Worker / Server API Dispatcher:** Receives only active `apis`. Requests to a disabled endpoint immediately return `404 Not Found or Disabled`.
* **Headless Production Compiler (`build.js`):** When compiling for production, features with `disabled: true` are excluded from the dependency tree, pruning their code and assets entirely from final bundles.

---

## 7. Next Steps

* Study the [Canonical API Reference](../API.md) for parameter listings and return types.
* Review the [Quick Start Guide](../QUICKSTART.md) to initialize your first project.
* Explore [Styling Architecture & Scoping](styling.md) for custom property inheritance and constructable sheet mechanics.
* Return to the [Manual Master Index](contents.md) for additional architecture chapters.