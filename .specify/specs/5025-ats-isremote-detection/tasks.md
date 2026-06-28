# Tasks: 5025 — ATS `isRemote` under-detection

> Status: draft — spec authored, implementation not started (awaiting review).

- [ ] T1 — Greenhouse: derive `isRemote`/`workFromHomeType` from the union of
      posting-location labels + `offices[].name`, keeping the primary `location`
      DTO selection unchanged (`processJob`).
    - Acceptance: a job with `location.name` = a city and `offices[]` containing
      `Remote - …` reports `isRemote: true`; `location` value is unchanged vs
      today.
- [ ] T2 — Greenhouse Harvest path (`processHarvestJob`): apply the same widening
      if it shares the location/offices shape; otherwise document why not.
    - Acceptance: no `offices[]`-borne remote signal is dropped on either path.
- [ ] T3 — Workday: trace `info.remoteType` / `listing.remoteType` population;
      ensure they map from `jobPostingInfo.remoteType` and that `locationsText`
      remote phrasing reaches `parsedLocations`. Fix mapping if wrong.
    - Acceptance: a job exposing `remoteType: "Remote"` reports `isRemote: true`.
- [ ] T4 — Greenhouse tests: office-remote positive + on-site negative
      (no over-detection).
- [ ] T5 — Workday tests: `remoteType: "Remote"` positive +
      `remoteType: "Field/Customer Site"` negative.
- [ ] T6 — `npm run build` (whole-graph typecheck) + both plugin suites green.
- [ ] T7 — Update `docs/index.md` (spec row + footer), `docs/log.md` (top entry),
      and `docs/questions.md` (Q-5025-a); `npm run lint:docs` passes.
