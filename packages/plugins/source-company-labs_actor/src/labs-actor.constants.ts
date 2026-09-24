export const LABS_ACTOR_COMPANY_NAME = 'Actor';
export const LABS_ACTOR_ORIGIN = 'https://labs.actor';
export const LABS_ACTOR_CAREERS_URL = `${LABS_ACTOR_ORIGIN}/hiring`;
export const LABS_ACTOR_DEFAULT_TIMEOUT_SECONDS = 30;
/** Main bundle referenced by the SPA shell. */
export const LABS_ACTOR_MAIN_JS_RE = /src="(\/static\/js\/main\.[0-9a-f]+\.js)"/i;
/**
 * Webpack runtime chunk map inside `n.u=e=>"static/js/"+e+"."+{…}[e]+".chunk.js"`.
 * Group 1 is the `{115:"bae9c619",…}` id→hash map body.
 */
export const LABS_ACTOR_CHUNK_MAP_RE =
  /\{((?:\d+:"[0-9a-f]+"\s*,?\s*)+)\}\s*\[\s*\w+\s*\]\s*\+\s*"\.chunk\.js"/;
export const LABS_ACTOR_CHUNK_PAIR_RE = /(\d+):"([0-9a-f]+)"/g;
/** Most chunks to fetch while looking for the hiring chunk. */
export const LABS_ACTOR_MAX_CHUNKS = 15;
/**
 * Start of the embedded jobs array: `=[{id:"…",title:"` — the binding name
 * is minified and other chunks ship their own `[{id:…}]` literals (e.g. the
 * machine-spec array `{id:"excavator",name:…}`), so the anchor must match
 * the job-entry shape, not just `id`.
 */
export const LABS_ACTOR_JOBS_ARRAY_RE = /=\s*\[\{id:"[^"]*",title:"/;
/** Apply mailbox by team — the site's own rule (Hardware/Growth go to lane@). */
export const LABS_ACTOR_APPLY_DEFAULT_EMAIL = 'shashi@labs.actor';
export const LABS_ACTOR_APPLY_LANE_EMAIL = 'lane@labs.actor';
export const LABS_ACTOR_APPLY_LANE_TEAMS = new Set(['hardware', 'growth']);
