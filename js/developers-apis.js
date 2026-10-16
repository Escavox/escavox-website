/* ==========================================================================
   Escavox public API reference — the ONLY file to edit for developers.html
   --------------------------------------------------------------------------
   Everything on the Developers page (how to connect + every API/endpoint) is
   rendered from this object. Edit the values, commit, push. No build step.

   TEMPLATE STATUS: every value below is a PLACEHOLDER. While `placeholder`
   is true (top level or on an API) the page shows a "Placeholder" badge so
   nobody mistakes it for real documentation. Set it to false (or delete it)
   once the real details are filled in.

   Shape of an endpoint:
     {
       method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
       path: "/tracks/{trackId}",            // {name} = path parameter
       summary: "One line shown in the list",
       description: "Optional longer text",
       params: [ { name, in: "path"|"query"|"header"|"body", type, required, description } ],
       body: { ... },                        // optional example request body (POST/PUT/PATCH)
       response: { ... } or "text",          // example response
       curl: "..."                           // optional: overrides the auto-generated curl
     }
   ========================================================================== */
window.ESCAVOX_API = {
  placeholder: true,

  /* ---- How to connect (applies to every API below) ---- */
  connect: {
    baseUrl: "https://{API_BASE_URL}/v1",               // PLACEHOLDER — real base URL
    format: "JSON over HTTPS",                           // PLACEHOLDER — confirm
    auth: {
      type: "API key",                                   // PLACEHOLDER — API key / OAuth 2.0 / …
      header: "Authorization",                           // PLACEHOLDER — header name
      scheme: "Bearer {YOUR_API_KEY}",                   // PLACEHOLDER — header value format
      note: "Keys are issued by Escavox on request and are scoped to your organisation's tracks. Keep them server-side; never ship them in a browser or mobile app."
    },
    rateLimit: "To be confirmed",                        // PLACEHOLDER — e.g. "60 requests / minute per key"
    steps: [
      { title: "Request access", text: "Ask the Escavox team for API access, telling us which systems you want to connect.", link: { href: "contact.html?topic=api", label: "Request API access" } },
      { title: "Get your API key", text: "We issue a key for your organisation. Store it securely on your server." },
      { title: "Authenticate", text: "Send the key in the auth header on every request (see the example below)." },
      { title: "Make your first call", text: "List your tracks, then drill into readings and alerts for each one." }
    ]
  },

  /* ---- Public APIs ---- */
  apis: [
    {
      id: "tracks",
      name: "Tracks API",
      placeholder: true,
      summary: "PLACEHOLDER — shipments (tracks) your organisation is monitoring, with status and intelligence.",
      endpoints: [
        {
          method: "GET",
          path: "/tracks",
          summary: "List tracks",
          description: "PLACEHOLDER — returns the tracks visible to your API key, newest first.",
          params: [
            { name: "status", in: "query", type: "string", required: false, description: "PLACEHOLDER — filter, e.g. in_transit, completed" },
            { name: "from", in: "query", type: "date-time", required: false, description: "PLACEHOLDER — only tracks started after this time" },
            { name: "page", in: "query", type: "integer", required: false, description: "PLACEHOLDER — page number" }
          ],
          response: { items: [{ trackId: "PLACEHOLDER", status: "in_transit", origin: "PLACEHOLDER", destination: "PLACEHOLDER" }], page: 1, totalPages: 1 }
        },
        {
          method: "GET",
          path: "/tracks/{trackId}",
          summary: "Get a track",
          description: "PLACEHOLDER — one track with its latest reading and intelligence.",
          params: [
            { name: "trackId", in: "path", type: "string", required: true, description: "PLACEHOLDER — the Escavox TrackId" }
          ],
          response: { trackId: "PLACEHOLDER", status: "in_transit", latest: { temperatureC: 0, humidityPct: 0 }, vopScore: 0 }
        }
      ]
    },
    {
      id: "readings",
      name: "Readings API",
      placeholder: true,
      summary: "PLACEHOLDER — sensor readings (temperature, humidity, location) for a track.",
      endpoints: [
        {
          method: "GET",
          path: "/tracks/{trackId}/readings",
          summary: "List readings for a track",
          params: [
            { name: "trackId", in: "path", type: "string", required: true, description: "PLACEHOLDER — the Escavox TrackId" },
            { name: "from", in: "query", type: "date-time", required: false, description: "PLACEHOLDER — start of window" },
            { name: "to", in: "query", type: "date-time", required: false, description: "PLACEHOLDER — end of window" }
          ],
          response: { trackId: "PLACEHOLDER", readings: [{ time: "PLACEHOLDER", temperatureC: 0, humidityPct: 0, lat: 0, lng: 0 }] }
        }
      ]
    },
    {
      id: "alerts",
      name: "Alerts API",
      placeholder: true,
      summary: "PLACEHOLDER — excursions and events raised on your tracks.",
      endpoints: [
        {
          method: "GET",
          path: "/alerts",
          summary: "List alerts",
          params: [
            { name: "trackId", in: "query", type: "string", required: false, description: "PLACEHOLDER — limit to one track" }
          ],
          response: { items: [{ alertId: "PLACEHOLDER", trackId: "PLACEHOLDER", type: "PLACEHOLDER", raisedAt: "PLACEHOLDER" }] }
        }
      ]
    }
  ]
};
