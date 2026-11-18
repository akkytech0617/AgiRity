---
name: qa
description: >
  Run functional QA for AgiRity. Analyze an explicit PR base/head diff or local
  working changes, then test relevant flows in isolated real Electron via CDP.
---

# QA Orchestrator

**Scope:** Interactive functional QA through agent-browser only. Do not run CI checks, lint, unit tests, or automated test suites. Building the Electron runtime is a setup prerequisite, not a test result.

## 1. Configuration and target

Read `.factory/skills/qa/config.yaml` and `.factory/skills/qa-electron/SKILL.md`.
Test the checked-out branch locally; there are no remote preview deployments.
The default target is **real Electron**, with an isolated temporary workspace directory.
An ordinary browser at localhost has no preload IPC and is not equivalent.

## 2. Determine the diff (before starting the app)

All Git commands run from the repository root.

- **CI/PR or explicit comparison:** Require both `QA_BASE_REF` and `QA_HEAD_REF`.
  Validate each with `git rev-parse --verify "${QA_BASE_REF}^{commit}"` (and head),
  and verify `git rev-parse HEAD` equals the resolved head before testing.
  Use `git diff --name-status "$QA_BASE_REF...$QA_HEAD_REF"` and
  `git diff "$QA_BASE_REF...$QA_HEAD_REF"`. Three dots compare the merge-base
  with the PR head, not a clean checkout's working tree. The QA workflow checks
  out the actual head and provides the PR base/head SHAs; workflow_dispatch
  provides its selected base ref and selected branch head.
- **Local dirty worktree, no refs supplied:** Use `git diff HEAD --name-status`
  and `git diff HEAD` for tracked staged AND unstaged changes. Also enumerate
  `git ls-files --others --exclude-standard` and read relevant untracked files.
  Do not silently omit newly added app components.
- If only one ref is provided, Git/ref resolution fails, or CI supplies neither
  ref, report **BLOCKED** rather than treating the diff as empty.
- A clean local checkout with no explicit refs is **INCONCLUSIVE**: request the
  intended base/head or explicit smoke-test scope. It does not prove no app changed.
- Explicit smoke-test requests can run the requested flows without a diff.

Map changed paths to the `electron` app's `path_patterns`. Files outside those
patterns (docs, skills, workflows, wiki) do not trigger app flows by themselves.
Only after a valid comparison, if no app paths changed, report
**INCONCLUSIVE: No app code changed — QA not applicable for this diff.**
Record comparison mode, resolved refs, changed paths, and runtime in the report.

## 3. Start the correct runtime

Follow the real-Electron setup in the sub-skill. Do not independently start a
Vite server or open localhost in a browser. Missing CLI, build failure, unavailable
GUI/CDP, missing preload APIs, or unsafe test isolation => affected flows BLOCKED.
A browser/mock-only run must be explicitly requested and labeled UI-only;
persistence and OS launch flows remain BLOCKED in that mode.

## 4. Execute relevant flows

Select the sub-skill flows covering the actual change plus adjacent integration
points. At least half of test cases should cover changed behavior; include a
negative/boundary test. Add a focused interactive test if the menu has no coverage.
Never silently skip a flow; record a concrete BLOCKED reason and remediation.
Use fresh accessibility snapshots after each UI change; do not invent selectors
or replace missing public APIs with stubs and call that real IPC coverage.

## 5. Evidence and cleanup

Create `qa-results/$RUN_ID/` (choose a unique run ID). Capture meaningful
accessibility snapshots and screenshots, referencing filenames rather than
embedding image markdown. Use explicit Electron CDP targeting on every
agent-browser command. Verify persistence by restarting the owned Electron
process with the same temporary config, not merely inspecting React state.
Clean up only this run's process and temporary data as described in the sub-skill.
Never modify the user's `~/.agirity` directory or close their Electron/browser.

## 6. Report

Write `qa-results/report.md` using `.factory/skills/qa/REPORT-TEMPLATE.md`.
Use plain result labels: PASS, FAIL, BLOCKED, FLAKY, INCONCLUSIVE.
Keep rows limited to actual user-facing behavior, not setup commands.
Distinguish UI-only evidence, real IPC persistence, and observed OS effects.
Include missing prerequisites and untested portions even when other flows pass.

## 7. Failure learning

For reusable environment insights, include suggested skill updates in the report.
`failure_learning` is `report_only`: do not automatically edit skills, stage,
commit, push, or change repository settings from a QA run. Human review applies
suggestions later.
