# JobReady Live Site Audit

Date: 2026-04-03  
Workspace: `/Users/ombonthala/Desktop/Arwin-Solutions`  
Live site tested: `https://arwinai.com/jobready`  
Browser tested: Chrome headless via CDP, real browser navigation against the deployed site  
Viewports tested: desktop `1440x1200`, mobile `390x844`

## Scope

This audit is for the live deployed product, not the local build.

I tested:
- landing
- login
- signup
- OAuth entry buttons
- first-run signup redirect behavior
- home
- resume creation with all 5 entry paths
- resume editor load and save behavior
- jobs search on desktop and mobile
- save role -> apply role -> applications tracking
- applications board stage movement
- settings save persistence
- logout

Live credentials used:
- existing account: `arwinai.official@gmail.com`
- fresh QA signup account created during test

Real test asset used:
- `/Users/ombonthala/Desktop/Arwin-Solutions/docs/Chaithanya_Bonthala_CV.pdf`

Evidence captured:
- desktop screenshots under `/tmp/jobready-live-audit/desktop`
- mobile screenshots under `/tmp/jobready-live-audit/mobile`

Important note:
- This pass did not change product code.
- This is a testing and categorization document only.

## Executive Summary

The live JobReady product is not investor-ready yet.

The good news is that the live deployment is better than the local build in one important area: search itself is working for normal job-title queries on the deployed site. The core problems are elsewhere:

1. two of the five resume-entry methods are broken in production
2. the primary end-to-end action, `Apply now`, does not move a job into the tracker correctly
3. first-run signup still skips onboarding
4. the UI is visually cleaner than before, but still too loose, too tall, and too repetitive for an investor walkthrough

This is now a real live-site baseline. The issues below are separated into functionality, flow, UI/UX, layout, responsiveness, look and feel, components, interaction states, typography, iconography, sizing, and content.

## What Works On The Live Site

Confirmed passes:
- landing loads
- login loads
- signup loads
- email/password login works
- Google auth button redirects to Google OAuth
- LinkedIn auth button redirects to LinkedIn OAuth
- `Start from scratch` opens the resume editor
- `Create with AI` opens the AI wizard and then the resume editor
- `Start from an example` opens templates and then the resume editor
- resume editor save behavior appears stable once the editor is open
- jobs search returns results for `react`, `frontend developer`, `software engineer`, and `product manager`
- applications board renders on desktop and mobile
- moving a card from `Saved` to `Applied` inside the Applications board works
- settings profile save persists after reload
- logout works

## Investor-Blocking Issues

### LIVE-F01: Upload existing resume fails with a real PDF

- Severity: `P0`
- Category: Functionality
- Result: failed
- Reproduced on: desktop and mobile
- Test asset: `/Users/ombonthala/Desktop/Arwin-Solutions/docs/Chaithanya_Bonthala_CV.pdf`
- Observed message: `Could not parse the uploaded file. Try a different format or create from scratch.`
- Why it matters: this is one of the 5 primary entry paths and it currently fails on a real user CV.
- Evidence:
  - `/tmp/jobready-live-audit/desktop/upload-open.png`
  - `/tmp/jobready-live-audit/desktop/upload-error.png`
  - `/tmp/jobready-live-audit/mobile/upload-open-viewport.png`

### LIVE-F02: LinkedIn resume import fails in production

- Severity: `P0`
- Category: Functionality
- Result: failed
- Reproduced on: desktop
- Observed message: `LinkedIn import failed: LinkedIn API returned status 403. The profile may be private or the URL may be incorrect.`
- Test URL used: `https://www.linkedin.com/in/satyanadella/`
- Why it matters: this is another one of the 5 primary entry paths and it is non-functional on the deployed product.
- Evidence:
  - `/tmp/jobready-live-audit/desktop/linkedin-open.png`
  - `/tmp/jobready-live-audit/desktop/linkedin-error.png`
  - `/tmp/jobready-live-audit/mobile/linkedin-open-viewport.png`

### LIVE-F03: `Apply now` does not move a job into `Applied`

- Severity: `P1`
- Category: Functionality, Flow
- Result: failed
- Reproduced on: desktop
- Observed behavior:
  - I searched jobs
  - saved a role
  - clicked `Apply now`
  - then checked Applications
  - the role remained in `Saved`
  - `Applied` stayed at `0`
- Confirmed contrast case:
  - moving a role from `Saved` to `Applied` inside the Applications board does work
  - this means the broken piece is specifically the `Apply now` semantics from Jobs, not the tracker itself
- Why it matters: the product promise breaks exactly at the discovery-to-application handoff.
- Evidence:
  - `/tmp/jobready-live-audit/desktop/jobs-react-results.png`
  - `/tmp/jobready-live-audit/desktop/applications-after-save-apply.png`
  - `/tmp/jobready-live-audit/desktop/applications.png`

### LIVE-F04: New signup skips onboarding

- Severity: `P1`
- Category: Functionality, Flow
- Result: failed
- Reproduced on: desktop
- Observed behavior:
  - created a fresh account through the live signup form
  - landed on `/jobready/app`
  - onboarding did not appear
- Why it matters: the product claims a guided first-run flow, but the actual production behavior bypasses it.

## Categorized Audit

## 1. Functionality

### Confirmed failures

- `Upload existing resume` is broken with a real user PDF. This is not a cosmetic issue. It is a hard stop.
- `Import from LinkedIn` is broken with a production 403.
- `Apply now` does not update application stage.
- new-account signup bypasses onboarding.

### Confirmed passes

- email login works
- Google and LinkedIn OAuth entry points at least redirect correctly to their providers
- `Start from scratch`, `Create with AI`, and `Start from an example` work
- jobs search works on the live site for normal phrases
- applications board stage change works
- settings persistence works

## 2. Flow

### LIVE-FL01: The main end-to-end story is still broken

- Severity: `P1`
- The intended story is: create resume -> find jobs -> apply -> track.
- In production, that full story does not complete cleanly because `Apply now` does not update tracker state.
- Investor impact: the live walkthrough stalls at the exact moment the app should feel smartest.

### LIVE-FL02: Resume entry options still feel heavier than they should

- Severity: `P2`
- The 5-option start screen is clear in structure, but the interaction is not tight.
- Opening a card injects another interface inside the same card, which increases card height suddenly and makes the screen feel unstable.
- On mobile, the expanded upload and LinkedIn cards consume almost the entire viewport height, so the user’s attention is pulled into a long in-card form rather than a focused next step.
- The LinkedIn option visually repeats `Import from LinkedIn` as both the option title and the form title, which reads as duplication rather than progression.
- Evidence:
  - `/tmp/jobready-live-audit/desktop/upload-open.png`
  - `/tmp/jobready-live-audit/desktop/linkedin-open.png`
  - `/tmp/jobready-live-audit/mobile/upload-open-viewport.png`
  - `/tmp/jobready-live-audit/mobile/linkedin-open-viewport.png`

### LIVE-FL03: Resume editor starts too low on mobile

- Severity: `P2`
- On mobile, the user lands in a page with header, page heading, mode toggle, step pills, analyzer action, helper copy, and only then the first field.
- This creates too much pre-form friction for the most important product flow.
- Evidence:
  - `/tmp/jobready-live-audit/mobile/documents.png`

## 3. UI/UX

### LIVE-UX01: The product is calmer than before, but still too tall and too loose

- Severity: `P2`
- Desktop home, settings, and applications all use very large hero containers and large cards with relatively little content inside them.
- The result is a lot of dead air rather than a dense, confident workspace.
- Evidence:
  - `/tmp/jobready-live-audit/desktop/home.png`
  - `/tmp/jobready-live-audit/desktop/settings.png`
  - `/tmp/jobready-live-audit/desktop/applications.png`

### LIVE-UX02: Jobs cards are still too verbose for rapid scanning

- Severity: `P2`
- Search works on live, but the results cards show long descriptions directly in-list.
- Each card becomes visually tall, which reduces scan speed and makes the page feel heavier than it is.
- A tighter summary with a cleaner detail affordance would read more professionally.
- Evidence:
  - `/tmp/jobready-live-audit/desktop/jobs-search-frontend-developer-viewport.png`

### LIVE-UX03: The app still carries more explanation than action

- Severity: `P2`
- Several screens spend prime space on descriptive headers rather than the next decision.
- This is especially visible on Home and Settings, where large intro panels do not add proportional value once the user is inside the workspace.

## 4. Layout And Real Estate

### LIVE-LY01: Desktop home underuses the canvas

- Severity: `P2`
- The home hero is very large relative to the amount of information it contains.
- The action cards and recent activity area also leave a lot of unused space below and around content.
- It looks clean, but not efficient.
- Evidence:
  - `/tmp/jobready-live-audit/desktop/home.png`

### LIVE-LY02: Desktop settings has large inactive regions

- Severity: `P2`
- The top hero is oversized.
- The profile and security cards leave a large blank lower portion.
- The page reads as stretched instead of composed.
- Evidence:
  - `/tmp/jobready-live-audit/desktop/settings.png`

### LIVE-LY03: Applications layout is still board-first instead of decision-first

- Severity: `P2`
- The page uses a large title panel, then a stat row, then a wide kanban.
- This sequence is not wrong, but it spends too much vertical and horizontal space before the user reaches the actual role actions.
- Evidence:
  - `/tmp/jobready-live-audit/desktop/applications.png`

## 5. Responsiveness

### LIVE-R01: Mobile applications still feels like desktop responsive, not mobile native

- Severity: `P1`
- The tracker remains a horizontally clipped kanban on phone screens.
- The user sees the `Saved` column and only a slice of `Applied`.
- This is not a native mobile pattern.
- Evidence:
  - `/tmp/jobready-live-audit/mobile/applications.png`

### LIVE-R02: Mobile resume workspace is still chrome-heavy

- Severity: `P2`
- The editor is technically responsive, but not efficiently stacked.
- The screen prioritizes controls and framing over immediate editing.
- Evidence:
  - `/tmp/jobready-live-audit/mobile/documents.png`

### LIVE-R03: Mobile start options are usable but not streamlined

- Severity: `P2`
- The expanded cards fit, but they do so by occupying nearly the full visible area.
- This makes the flow feel long even before the user submits anything.
- Evidence:
  - `/tmp/jobready-live-audit/mobile/upload-open-viewport.png`
  - `/tmp/jobready-live-audit/mobile/linkedin-open-viewport.png`

## 6. Look And Feel

### LIVE-LF01: The app feels generic enterprise, not polished enterprise

- Severity: `P2`
- The palette is safe and calm, but the visual system still reads as generic card UI.
- Too many panels share the same white surface, soft border, and similar radius without enough hierarchy shift between primary, secondary, and utility content.
- This makes the app feel assembled from one pattern rather than intentionally directed.

### LIVE-LF02: There is still a mismatch between visual calm and visual authority

- Severity: `P2`
- The app is trying to feel soft and clean, but some screens cross into underpowered.
- Investors usually read that as unfinished rather than elegant.

## 7. Components

### LIVE-C01: Resume-entry cards are doing too much

- Severity: `P2`
- They act as option selector, explainer card, and inline form container all at once.
- That makes the state change bigger than it needs to be.

### LIVE-C02: Stat cards are oversized for the amount of signal they provide

- Severity: `P3`
- This is visible on Home and Applications.
- The metrics are useful, but the card sizing amplifies emptiness.

### LIVE-C03: Jobs result cards need stronger information hierarchy

- Severity: `P2`
- Title, company, location, score, description, chips, and actions all compete at once.
- The card works, but it is not sharply prioritized.

## 8. Interaction States

### LIVE-I01: `Apply now` is semantically misleading

- Severity: `P1`
- The label implies that the job will move forward in the system.
- In reality, it behaves more like an external link than a tracked transition.
- This is both a flow problem and a state-definition problem.

### LIVE-I02: Expanded-card behavior feels abrupt

- Severity: `P2`
- The open state is functional, but it changes the screen shape too aggressively.
- It feels like content appeared underneath the original option instead of a clean next step.

## 9. Typography

### LIVE-T01: Small uppercase section labels are too weak for the role they play

- Severity: `P3`
- Labels such as `WORKSPACE OVERVIEW`, `ROLE DISCOVERY`, and `PIPELINE TRACKING` are small, light, and visually low-value.
- They do not guide the user enough to justify their space.

### LIVE-T02: Secondary text is sometimes too faint against white surfaces

- Severity: `P2`
- Body support copy on cards and helper descriptions can feel washed out.
- This is especially noticeable on pale surfaces where low-contrast gray text reads as less intentional.

## 10. Iconography And Sizing

### LIVE-IS01: Icon treatment is consistent, but too generic

- Severity: `P3`
- The icons are serviceable and aligned, but they do not create much product personality or guidance.
- This matters less than functionality, but it contributes to the “template app” feeling.

### LIVE-IS02: Surface sizing does not always match task importance

- Severity: `P2`
- Large containers are often assigned to low-complexity content.
- Small interactive decisions then sit inside overlarge shells.

## 11. Content And Messaging

### LIVE-M01: Landing page still repeats the same promise too many times

- Severity: `P2`
- The live landing page is visually cleaner than the app interior, but it still repeats the same story across multiple sections.
- It explains the product more than it sharpens the product.
- Evidence:
  - `/tmp/jobready-live-audit/desktop/landing.png`

### LIVE-M02: Some in-app headings are still too explanatory

- Severity: `P2`
- Examples:
  - `Start with the resume basics, then move into search and applications.`
  - `Move saved roles through applied, interview, and offer in one place.`
- These are clear, but across the product there is still more descriptive narration than necessary.

## Test Matrix

### Resume entry paths

- `Start from scratch`: pass
- `Create with AI`: pass
- `Upload existing resume`: fail
- `Import from LinkedIn`: fail
- `Start from an example`: pass

### Jobs search

- desktop `react`: pass
- desktop `frontend developer`: pass
- desktop `software engineer`: pass
- desktop `product manager`: pass
- mobile `frontend developer`: pass

### Application tracking

- save from Jobs: pass
- `Apply now` from Jobs to tracker: fail
- move stage inside Applications board: pass

### Account flow

- email login: pass
- Google auth entry redirect: pass
- LinkedIn auth entry redirect: pass
- signup submission: pass
- first-run onboarding redirect: fail

### Settings

- profile save: pass
- value persistence after reload: pass

## Fix Order

Recommended sequence:

1. `LIVE-F01` Fix PDF upload reliability
2. `LIVE-F02` Fix LinkedIn import in production
3. `LIVE-F03` Fix `Apply now` state transition semantics
4. `LIVE-F04` Fix first-run signup routing to onboarding
5. `LIVE-R01` Replace mobile kanban behavior with a native-feeling tracker pattern
6. compress the resume-entry and mobile editor flows
7. reduce whitespace and oversized hero surfaces on Home, Settings, and Applications
8. tighten jobs result cards
9. compress landing and in-app copy

## Bottom Line

This is a real live-site audit, and the conclusion is straightforward:

- the live product is functional enough to inspect
- it is not functional enough to demo end to end with confidence
- the largest demo risks are not vague design taste issues
- they are concrete product failures in resume ingestion, LinkedIn import, onboarding, and application-state handoff

Once those are fixed, the next layer is visual tightening: density, hierarchy, copy reduction, mobile-native tracking, and better use of space.
