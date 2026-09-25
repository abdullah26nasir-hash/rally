# Rally shared leagues private-preview deployment

Do not deploy the static dist alone. Pages Functions live in `functions/`, outside `dist`. Deploy from this source root with Wrangler Pages, only after replacing the placeholder D1 ID in `wrangler.jsonc` with the actual database ID. The supplied placeholder `00000000-0000-0000-0000-000000000000` is local-test-only, never a production binding.

1. Provision one D1 database named `rally-leagues` on Cloudflare's free tier; enter its real ID in `wrangler.jsonc`. Use the Cloudflare Pages dashboard to add a `DB` D1 binding to `rally-leagues` in production and preview. The supplied `wrangler.jsonc` intentionally omits `pages_build_output_dir`, so it is local-development-only and does not override the project's production settings; verify dashboard configuration before deployment.
2. Apply `migrations/0001_shared_leagues.sql` to that D1 database with `wrangler d1 execute rally-leagues --remote --file migrations/0001_shared_leagues.sql`. Do not seed or clear an existing database. Run the migration before deploying the Function.
3. Build with `VITE_POSTHOG_KEY` and `VITE_POSTHOG_HOST=https://eu.i.posthog.com` as CI build variables only. Do not commit keys or env files. Use `wrangler pages deploy dist --project-name rally-t9w3n6` from the source root so it uploads both dist assets and `functions/`. Confirm the deploy tool sees the Functions bundle and D1 binding; if not, stop.
4. On the resulting private preview URL, confirm `X-Robots-Tag: noindex`; test two separate browser profiles or phones, shared-league create -> join -> standings, invite routing, code privacy, 403 nonmember access, and analytics consent (zero PostHog calls before consent, refusal, allowance and revocation). Re-run security suite against the live URL before giving it to the user.

Preview caveat: no accounts, device-bound league membership; clearing site data loses membership. Existing pre-D1 leagues remain local and are not migrated. League scores are for fictional preview fixtures, with no trusted identity or anti-cheat. Consent is opt-in. A league code is a bearer invitation; send it only to intended mates. The route remains `noindex` and the old demo code `LADS26` is local-only.

Reference: https://developers.cloudflare.com/pages/functions/bindings/ and https://developers.cloudflare.com/pages/functions/wrangler-configuration/ .
