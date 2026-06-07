# JobReady Investor Demo Audit

Date: 2026-04-03  
Workspace: `/Users/ombonthala/Desktop/Arwin-Solutions`  
Runtime tested: local production build on `http://127.0.0.1:3010`  
Browser tested: Chrome headless via CDP  
Viewports tested: desktop `1440x1200`, mobile `390x844`

## Scope

I treated this as a real browser QA pass, not a code-only review.

Flows covered:
- `/jobready` landing
- signup screen load
- login with the provided account
- home dashboard
- resume creation flow with all 5 entry options
- resume editor save behavior
- jobs search with multiple queries
- save role -> apply role -> applications tracker
- settings page load
- logout
- additional targeted checks for signup submission, tracker stage movement, and settings persistence

Evidence captured:
- Browser screenshots in `/tmp/jobready-audit/desktop`
- Browser screenshots in `/tmp/jobready-audit/mobile`
- Structured run summary in `/tmp/jobready-audit/summary.json`

## Executive Summary

JobReady is not investor-ready yet.

The core problem is not one isolated bug. It is a stack of issues across first-run flow, resume ingestion reliability, job discovery quality, and action semantics. Three resume entry paths work reliably right now: `Start from scratch`, `Create with AI`, and `Start from an example`. Two do not: `Upload existing resume` is flaky and `Import from LinkedIn` fails against the live backend. Job discovery only works reliably for narrow token searches like `react`, while standard user phrasing like `frontend developer` returns zero results. `Apply now` does not move a role into `Applied`; it leaves the role in `Saved`, which breaks the end-to-end story you want to demo.

There are also clear UX issues on mobile. The applications board is still a horizontally scrolling kanban instead of a native-feeling mobile tracker, and the resume editor spends too much vertical space on chrome before the user reaches the first editable field.

## What Passed

These flows worked in the live browser:

- Login with the provided account succeeded.
- Landing, login, signup, home, jobs, applications, settings, and logout all rendered on desktop and mobile.
- `Start from scratch` opened the editor on desktop and mobile.
- `Create with AI` opened the editor on desktop and mobile.
- `Start from an example` opened the editor on desktop and mobile.
- Resume editor autosave appeared stable once the editor was already open.
- Moving a role from `Saved` to `Applied` inside the Applications board worked when using the board action directly.
- Profile save in Settings worked and persisted on reload.

Additional targeted pass:
- A fresh throwaway account was created successfully through the signup UI, which confirms account creation itself works.

## Confirmed Issues

### JR-01: New signup skips onboarding

- Severity: `P1`
- Status: confirmed in live browser
- Observed: a brand-new throwaway account created through the signup form landed on `/jobready/app`, not `/jobready/app/onboarding`.
- Expected: first-run users should enter onboarding before landing on the main dashboard.
- Investor risk: the product promises guided setup, but the first-run experience bypasses it.
- Likely cause: the auth redirect effect in `src/app/jobready/signup/page.tsx` immediately pushes authenticated users to `/jobready/app`, racing the explicit success redirect to onboarding.
- Relevant code:
  - `src/app/jobready/signup/page.tsx:21`
  - `src/app/jobready/signup/page.tsx:42`

### JR-02: Resume upload is flaky and blocks the user even when raw text is available

- Severity: `P0`
- Status: confirmed in live browser and direct API verification
- Observed in browser: uploading `/Users/ombonthala/Desktop/Arwin-Solutions/docs/Chaithanya_Bonthala_CV.pdf` failed on desktop and mobile with `Could not parse the uploaded file. Try a different format or create from scratch.`
- Observed in API: three direct calls to `/api/resume/upload` with the same authenticated account and the same file returned inconsistent results:
  - run 1: `extractedData` present
  - run 2: `extractedData` null
  - run 3: `extractedData` null
- Expected: the same file should deterministically open the editor every time.
- Investor risk: one of the most important resume entry methods is unreliable with a real CV file.
- Likely cause: the upload route depends on backend LLM extraction and returns `success: true` even when `extractedData` is null. The documents page then hard-fails the user instead of opening the editor with whatever was extracted.
- Relevant code:
  - `src/app/jobready/app/documents/page.tsx:101`
  - `src/app/jobready/app/documents/page.tsx:113`
  - `src/app/jobready/app/documents/page.tsx:115`
  - `src/app/api/resume/upload/route.ts:101`
  - `src/app/api/resume/upload/route.ts:136`
  - `src/app/api/resume/upload/route.ts:149`

### JR-03: LinkedIn import fails against the live backend

- Severity: `P0`
- Status: confirmed in live browser and direct API verification
- Observed in browser: both desktop and mobile returned `LinkedIn import failed: LinkedIn API returned status 403. The profile may be private or the URL may be incorrect.`
- Observed in API: direct POST to `/api/resume/linkedin` returned the same error for `https://www.linkedin.com/in/satyanadella/`.
- Expected: the import should open the editor for a valid public-profile URL if this feature is exposed in production.
- Investor risk: one of the 5 resume entry methods is currently non-functional.
- Likely cause: the BFF is healthy; it simply proxies a backend failure. The break is in the actual LinkedIn import service / RapidAPI path, not in form validation.
- Relevant code:
  - `src/app/jobready/app/documents/page.tsx:78`
  - `src/app/jobready/app/documents/page.tsx:84`
  - `src/app/api/resume/linkedin/route.ts:29`
  - `src/app/api/resume/linkedin/route.ts:40`
  - `src/components/jobready/resume/ResumeCreationFlow.tsx:109`
  - `src/components/jobready/resume/ResumeCreationFlow.tsx:125`

### JR-04: `Apply now` does not move a role into `Applied`

- Severity: `P1`
- Status: confirmed in live browser and direct API verification
- Observed: after saving and clicking `Apply now` on `Senior Full-stack React Developer`, the Applications screen still showed `1 Saved` and `0 Applied`. The role remained in the `Saved` column on desktop and mobile.
- Direct API confirmation: the stored application record still had `status: "saved"`.
- Expected: `Apply now` should either:
  - create or update the application to `applied`, then open the external link, or
  - clearly separate `Open job link` from `Mark as applied`.
- Investor risk: the core end-to-end promise breaks at the moment the user tries to move from discovery into application tracking.
- Likely cause: `JobSearch` only implements `handleSave`; `Apply now` is a plain anchor in `JobCard` and bypasses tracker state entirely.
- Relevant code:
  - `src/components/jobready/jobs/JobSearch.tsx:93`
  - `src/components/jobready/jobs/JobSearch.tsx:97`
  - `src/components/jobready/jobs/JobCard.tsx:110`
  - `src/components/jobready/jobs/JobCard.tsx:119`

### JR-05: Search fails for normal role phrases

- Severity: `P1`
- Status: confirmed in live browser and direct API verification
- Observed in UI: the following queries returned zero jobs on desktop and mobile:
  - `frontend developer`
  - `software engineer`
  - `product manager`
- Observed in API:
  - `frontend developer` -> `0`
  - `frontend` -> `2`
  - `developer` -> `5`
  - `software engineer` -> `0`
  - `software` -> `8`
  - `engineer` -> `7`
  - `product manager` -> `0`
  - `product` -> `10`
  - `manager` -> `6`
- Expected: common multi-word job titles should return results without forcing users to guess token-by-token.
- Investor risk: role discovery feels broken unless the user knows the exact search hack that works.
- Likely cause: the Remotive query is built as a single comma-joined phrase, and the other data providers are effectively absent in this environment, so there is no query expansion or fallback decomposition.
- Relevant code:
  - `src/components/jobready/jobs/JobSearch.tsx:50`
  - `src/app/api/jobs/route.ts:229`
  - `src/app/api/jobs/route.ts:231`
  - `src/app/api/jobs/route.ts:338`

### JR-06: Mobile applications tracker still feels like a desktop kanban squeezed into a phone

- Severity: `P2`
- Status: confirmed in visual review
- Observed: on mobile, the tracker shows the summary cards first and then a horizontally scrolling four-column kanban. The board is clipped, requires side-scrolling, and does not feel native.
- Expected: a mobile tracker should either be a single-column staged list, segmented stage switcher, or card stack with clear stage controls.
- Investor risk: mobile looks like a responsive desktop board rather than a product designed for mobile.
- Evidence:
  - `/tmp/jobready-audit/mobile/applications.png`
- Likely cause: the mobile CSS preserves the 4-column kanban with a fixed minimum width of `1040px`.
- Relevant code:
  - `src/app/jobready/jobready.css:3030`
  - `src/app/jobready/jobready.css:3070`
  - `src/app/jobready/jobready.css:5384`
  - `src/app/jobready/jobready.css:5392`

### JR-07: Mobile resume editor uses too much vertical space before the first field

- Severity: `P2`
- Status: confirmed in visual review
- Observed: mobile resume editing shows the app header, hero copy, toolbar, progress, step pills, and analyzer block before the user gets to the first input. The editing surface starts too low.
- Expected: on mobile, the first form field should be visible immediately or nearly immediately.
- Investor risk: the product feels overbuilt and heavy on the most important workflow.
- Evidence:
  - `/tmp/jobready-audit/mobile/new-editor.png`
- Likely cause: the mobile layout keeps too much desktop chrome alive on a short viewport.
- Relevant code:
  - `src/components/jobready/resume/ResumeEditor.tsx:143`
  - `src/components/jobready/resume/ResumeEditor.tsx:173`
  - `src/components/jobready/resume/ResumeEditor.tsx:206`
  - `src/app/jobready/jobready.css:1782`
  - `src/app/jobready/jobready.css:5291`
  - `src/app/jobready/jobready.css:5489`

### JR-08: Landing page still over-explains the same value proposition

- Severity: `P3`
- Status: confirmed in visual/content review
- Observed: the landing page repeats the same story across hero, product overview, how it works, why it lands, and CTA. The page is clean, but it is still longer and more repetitive than it needs to be for this product.
- Expected: shorter, sharper narrative with fewer sections and stronger demo-oriented hierarchy.
- Investor risk: the product reads like a generic feature explainer instead of a confident, focused workflow.
- Likely cause: several sections restate the same “resume + jobs + applications” message with minor wording changes.
- Relevant code:
  - `src/app/jobready/page.tsx:62`
  - `src/app/jobready/page.tsx:88`
  - `src/app/jobready/page.tsx:123`
  - `src/app/jobready/page.tsx:147`
  - `src/app/jobready/page.tsx:168`

### JR-09: Disabled social sign-in buttons are still visually prominent

- Severity: `P2`
- Status: confirmed in visual review
- Observed: login and signup show Google and LinkedIn buttons in primary form real estate even though provider envs are missing in this environment, followed by a note saying they are unavailable.
- Expected: if OAuth is unavailable for the demo environment, the UI should either hide those actions or visually de-emphasize them.
- Investor risk: dead-looking entry points on the first screen undermine confidence immediately.
- Likely cause: the buttons are always rendered and only disabled based on env presence.
- Relevant code:
  - `src/components/jobready/auth/SocialAuthButtons.tsx:29`
  - `src/components/jobready/auth/SocialAuthButtons.tsx:41`
  - `src/components/jobready/auth/SocialAuthButtons.tsx:81`
  - `src/components/jobready/auth/SocialAuthButtons.tsx:101`

## Additional Verification Notes

- `Apply now` is broken as an end-to-end action, but the Applications board itself is not broken.
  - I verified on a throwaway account that the board action `Applied` successfully moved a saved role from `Saved` to `Applied`.
- Settings persistence is working.
  - I updated the throwaway account location to `Bengaluru, India`, reloaded Settings, and the value persisted.
- The login flow itself is working.
  - The current breakpoints are after login, not before it.

## Recommended Fix Order

If we work this down in order, I would fix it like this:

1. `JR-02` Resume upload reliability
2. `JR-03` LinkedIn import backend/service path
3. `JR-04` Apply action semantics
4. `JR-05` Multi-word search reliability
5. `JR-01` First-run onboarding routing
6. `JR-06` Mobile applications tracker layout
7. `JR-07` Mobile resume editor compression
8. `JR-09` Demo-env social auth presentation
9. `JR-08` Landing page copy compression

## Ready For Next Step

This document is the issue baseline. The next clean step is to take `JR-02` first and fix it end to end before moving to the next item.
