# Rallycademy solo watchlist preview, 25 September 2026

This small product slice makes the existing fictional preview useful with zero league members: follow a player on their detail page, open the "Following" filter in Scout, and remove them at any time. Following is **private, saved on this device and separate from the five scoring picks**; it cannot be seen by other players and has no impact on score, leagues or early-call receipts. Existing saves migrate from version 2; unknown/tampered IDs are dropped. Clearing browser storage still loses follows. The filter is explicit and its empty state tells the user how to start.

This is not the full Rallycademy product: there are no real players, licensed feeds, valuations, model forecasts, alerts or account sync. The existing preview-season disclosure remains visible. A future real version must have licensed sources and separate state before adding any value movement claims. No keys or vendor data were added.

Local checks: build, security, edge, watchlist-specific flow, every control on the changed Scout/player screens, axe/44px/overflow on phone/small/desktop. Deployment deliberately deferred until parent authorization and other products ship. If this source is deployed, the parent must rerun all live-route security, visual and button checks before sharing any link.
