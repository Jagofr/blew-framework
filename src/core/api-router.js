/*
 * Copyright (c) 2026 Blew Framework Authors
 * SPDX-License-Identifier: LicenseRef-ACPNCL-1.0
 */

/**
 * @fileoverview Universal WinterCG Request -> Response wildcard API dispatcher.
 * Executes identical endpoint logic within Service Workers (offline mode) and
 * server/edge runtimes (Node.js, Bun, Cloudflare Workers).
 * @module @blew/api
 */

/**
 * @typedef {import('./router-utils.js').ApiRouteEntry} ApiRouteEntry
 */

/**
 * @typedef {object} ApiContext
 * @property {Record<string, string>} params - Matched URLPattern tokens.
 * @property {URL} url - Fully parsed URL instance including searchParams.
 */

/**
 * Converts a kebab-case string into camelCase for RPC named action resolution.
 *
 * @param {string} str - Input kebab-case identifier (e.g., 'archive-note').
 * @returns {string} Converted camelCase identifier (e.g., 'archiveNote').
 * @example
 * ```javascript
 * toCamelCase('archive-note'); // 'archiveNote'
 * ```
 */
export function toCamelCase(str) {
  if (!str || typeof str !== 'string') return '';
  return str.replace(/-([a-z0-9])/gi, (_, char) => char.toUpperCase());
}

/**
 * BlewApiRouter handles incoming HTTP Request objects matching wildcard
 * endpoint patterns and routes them to exported functions.
 */
export class BlewApiRouter {
  /**
   * Initializes the wildcard API router.
   *
   * @param {ApiRouteEntry[]} routes - Registered active API route definitions.
   */
  constructor(routes) {
    /**
     * Registered API route definitions.
     * @type {ApiRouteEntry[]}
     */
    this.routes = Array.isArray(routes) ? routes : [];

    /**
     * Pre-compiled URLPattern instances.
     * @private
     * @type {Array<{ pattern: URLPattern, route: ApiRouteEntry }>}
     */
    this._compiledRoutes = [];

    this._compileRoutes();
  }

  /**
   * Pre-compiles route pattern strings into URLPattern instances.
   * @private
   */
  _compileRoutes() {
    if (typeof URLPattern === 'undefined') return;

    this._compiledRoutes = this.routes.map((route) => {
      const pattern = new URLPattern({ pathname: route.pattern });
      return { pattern, route };
    });
  }

  /**
   * Dispatches an incoming WinterCG Request to the appropriate feature endpoint handler.
   *
   * Dispatch Resolution Order:
   * 1. Named Action Export: First segment of `:action` converted to camelCase.
   * 2. HTTP Verb Export: Exported function matching `request.method` (GET, POST, etc.).
   * 3. 405 Method Not Allowed: If no matching verb handler is exported.
   * 4. 404 Not Found: If no registered route pattern matches the request URL.
   *
   * @param {Request} request - Standard WinterCG fetch Request.
   * @returns {Promise<Response>} Resolved fetch Response.
   * @example
   * ```javascript
   * const response = await apiRouter.handle(new Request('http://localhost/api/notes/archive', {
   *   method: 'POST',
   *   body: JSON.stringify({ id: '1' })
   * }));
   * ```
   */
  async handle(request) {
    if (!request || !(request instanceof Request)) {
      return new Response(JSON.stringify({ error: 'Bad Request: Invalid Request object' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const url = new URL(request.url);
    const pathname = url.pathname;

    // Search for a matching route
    for (const { pattern, route } of this._compiledRoutes) {
      const result = pattern.exec({ pathname });
      if (!result) continue;

      /** @type {Record<string, string>} */
      const params = {};
      const groups = result.pathname?.groups || {};
      for (const [key, value] of Object.entries(groups)) {
        if (value !== undefined) {
          params[key] = value;
        }
      }

      /** @type {ApiContext} */
      const context = {
        params,
        url
      };

      // Dynamically load the endpoint module exports
      let endpointModule;
      try {
        endpointModule = typeof route.load === 'function' ? await route.load() : route.load;
      } catch (err) {
        console.error(`Failed to load endpoint for ${route.pattern}:`, err);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (!endpointModule || typeof endpointModule !== 'object') {
        return new Response(JSON.stringify({ error: 'Endpoint Module Not Found' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // Step 1: Check for Named Action Export
      // Extract the first segment of :action if present
      const rawAction = params.action ? params.action.split('/')[0] : '';
      if (rawAction) {
        const camelAction = toCamelCase(rawAction);
        if (typeof endpointModule[camelAction] === 'function') {
          try {
            return await endpointModule[camelAction](request, context);
          } catch (err) {
            console.error(`Error in named action '${camelAction}':`, err);
            return new Response(JSON.stringify({ error: 'Internal Action Error' }), {
              status: 500,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
      }

      // Step 2: Check for HTTP Verb Export
      const method = request.method ? request.method.toUpperCase() : 'GET';
      if (typeof endpointModule[method] === 'function') {
        try {
          return await endpointModule[method](request, context);
        } catch (err) {
          console.error(`Error in HTTP verb '${method}':`, err);
          return new Response(JSON.stringify({ error: 'Internal Handler Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      }

      // Step 3: 405 Method Not Allowed
      return new Response(
        JSON.stringify({ error: `Method Not Allowed: ${method}` }),
        {
          status: 405,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // Step 4: 404 Not Found
    return new Response(
      JSON.stringify({ error: 'Not Found or Disabled' }),
      {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
