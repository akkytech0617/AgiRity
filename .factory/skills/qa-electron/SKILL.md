---

name: qa-electron
description: >
Interactive AgiRity QA in isolated real Electron via agent-browser CDP.
Separates persistence and OS launch evidence from optional browser/mock UI checks.
---

# QA Tests — AgiRity Electron

## Runtime and isolation (required before flows)

Load the `agent-browser` and `electron-agent-browser` skills. Use the current
agent-browser guidance for explicit `--cdp` targeting and session ownership;
older examples using a bare `connect`, `reload`, or broad `pkill` are not safe
on shared desktops.

1. Work from the repository root. Check `agent-browser --version` and
   `node_modules/.bin/electron`; agent-browser is bundled with the Factory CLI.
   If missing, report BLOCKED rather than assuming an ordinary browser is equivalent.
2. Build with mock mode explicitly disabled for **the entire npm command**:

   ```bash
   VITE_USE_MOCK_DATA=false VITE_SENTRY_DSN= npm run prebuild:e2e
   ```

   This builds main, preload, and renderer without packaging or running test suites.
   Empty Sentry DSNs disable telemetry for this QA run, including values in local dotenv files.
3. Allocate a fresh temporary directory with `mktemp -d /tmp/agirity-qa.XXXXXX`.
   Record it as `QA_CONFIG_DIR` and reuse it across restarts within this run.
   Never delete/rename the user's `~/.agirity/workspaces.yaml`. Inspect whether
   the chosen local CDP port (example: 9223) is free; choose another if occupied,
   never terminate the existing owner.
4. Launch only the newly built app with a GUI-capable local runner. Use Execute
   with `fireAndForget: true` (not shell `&`); keep its returned PID/log path.
   Replace `/tmp/agirity-qa.RUN` below with the directory just allocated.

   ```bash
   ELECTRON_BIN="$(node -p "require('electron')")"
   exec env AGIRITY_CONFIG_DIR=/tmp/agirity-qa.RUN VITE_DEV_SERVER_URL= SENTRY_DSN= \
     "$ELECTRON_BIN" dist-electron/main/index.js \
     --user-data-dir=/tmp/agirity-qa.RUN/chromium \
     --remote-debugging-address=127.0.0.1 --remote-debugging-port=9223
   ```

   Keep a record of the **actual** chosen port and PID. Each Execute has a fresh
   shell, so pass the real values explicitly in subsequent calls. The `exec`
   makes the returned process the owned Electron process, not an npm wrapper.
5. Preserve Factory's `AGENT_BROWSER_SESSION` if set; otherwise assign a unique
   named session for this run. Use that same session on all calls. **Every**
   browser command must include the literal Electron port (not the Factory
   desktop CDP URL), e.g.:

   ```bash
   agent-browser --cdp 9223 tab
   agent-browser --cdp 9223 snapshot -i
   agent-browser --cdp 9223 eval '({workspace: typeof window.workspaceApi?.load, launcher: typeof window.launcherApi?.launchItem})'
   ```

   Select the actual AgiRity `file://.../dist/index.html` tab from the tab list if
   necessary. Require both functions and rendered app content. Inspect
   `window.workspaceApi.load()` for a successful real IPC result (setup evidence,
   not a replacement for UI flows). Do not add fake `window` APIs.
6. If startup is not ready, diagnose the owned launch log and run
   `agent-browser doctor --offline --quick`; retry the CDP attachment once after
   readiness. If still unavailable, report BLOCKED. Do not attach to another
   app, repeatedly launch copies, or navigate an unrelated browser to localhost.
   Do not `open`/`reload` the file URL: restart this run's Electron if needed.
   Current CDP attachment does not require `--allow-file-access`; if an older CLI
   cannot attach/render this build, report its version and the incompatibility.

The app has no authentication. Workspace data is isolated by
`AGIRITY_CONFIG_DIR` (see `src/main/services/ConfigService.ts` and the existing
Electron fixture). The Chromium profile is isolated separately by
`--user-data-dir`. Do not read or publish unrelated personal data/logs.

## Flow menu (real Electron by default)

Read the current UI and accessibility snapshot to locate controls; ref IDs and
labels can change. Do not assume controls still live in the old header rather
than the sidebar. An absent capability is BLOCKED with its observed UI state,
not permission to invent selectors or APIs.

### 1. Empty state / first launch

Use the fresh empty QA config. Verify the empty workspace message and creation
action, click it, and verify the editor opens. Check cancelling returns safely.
Do not reset a nonempty config by deleting user files.

### 2. Workspace creation and persistence

Create a uniquely named QA workspace through the UI, add a harmless folder item
pointing inside the temporary directory, and save. Verify its name and items in
the sidebar/list and detail view. Check the isolated `workspaces.yaml` exists.
Terminate only the recorded Electron PID and relaunch with the **same** config
and profile, then reattach via explicit CDP. Verify the saved workspace reloads.
A row appearing before restart is UI evidence, not proof of persistence.

### 3. Workspace editing

Edit only a QA-created workspace. Change its name and one item, save, and verify
detail/sidebar changes; restart as above if the diff touches save/load behavior.
Include a blank-name or invalid-item submission and verify validation prevents
corrupt saved data. Do not claim persistence if restart/load cannot be observed.

### 4. Workspace switching

Create two QA workspaces and switch using the current workspace navigation.
Verify selection, title, and item list update consistently. If search/filtering
changed, include no-match and clear-filter cases and verify selection recovers.

### 5. Preset selection

Use a QA workspace containing at least two items and a preset selecting one.
If the current editor cannot create presets, prepare test data only through the
existing `window.workspaceApi.save` API after reading `src/shared/types.ts` and
`src/renderer/mocks/workspaces.ts` for the current valid schema; assign fresh
UUIDs/timestamps and use harmless temporary folder items. Record this as fixture
setup, not UI creation coverage, then restart to load it. Do not invent a preset
API or assert a UI filtering effect unless implemented. Click the actual preset
controls and verify the implemented selection behavior; launch filtering requires
flow 6 with externally observable targets.

### 6. Workspace launch

Use only QA fixtures and approved harmless local targets, such as two folders
under the temporary directory. Real launch opens OS applications/windows; never
launch arbitrary commands, installed personal workspaces, or external websites.
Capture pending/success/error UI states where observable, but claim **OS launch**
PASS only with evidence the expected local target opened (and, for preset
filtering, excluded targets did not). IPC success or a "Done" button alone is not
proof. If native effects cannot be observed/are disallowed, report that portion
BLOCKED and state any separately verified UI/IPC behavior.

### 7. Individual item launch

Click a QA fixture's harmless folder item. Apply the same OS-effect evidence
and safety requirements as flow 6. Include a nonexistent temporary target for
error handling where supported; verify the app remains usable after failure.
Never label an unobserved external side effect PASS.

### 8. Settings / Tools / MCP navigation

Use the current sidebar/menu to visit implemented settings, tools, and MCP views.
Verify the intended view or explicitly labeled placeholder renders and returning
to the workspace retains selection. Do not claim placeholder functionality.

### 9. Item icons

Use QA fixture items of supported types. Verify icons/fallbacks render without
broken-image UI. Only real Electron's `launcherApi.getItemIcon` exercises native
icon retrieval; a Lucide fallback alone does not prove an OS icon was fetched.
Do not launch items merely to inspect icons.

## Optional browser/mock mode — UI only

Only use if explicitly requested. An ordinary browser has no preload APIs.
For renderer-only checks, mock workspace mode supplies in-memory
workspace data. Do not blindly run `npm run dev`: vite-plugin-electron also
starts Electron. Require an explicitly isolated renderer harness supplied by the
user, record how its fixtures and APIs are provided, and leave IPC/native flows
BLOCKED. If no such harness exists, use the real-Electron setup above or report
browser-only testing BLOCKED; do not invent a mock server or unsupported API.

Mock mode covers presentation, switching/navigation, and in-memory edits only.
It **does not** establish persistence, native icon retrieval, IPC, or OS launch;
launcher calls are not guaranteed to be mocked by workspace mock mode. Do not
click launch without real Electron safety controls, and mark required IPC flows
BLOCKED. Never silently downgrade real-Electron failures to mock PASS.

## Cleanup and failure handling

Stop only the recorded PID for this QA run (`kill <recorded-pid>`), including on
failure. Never use `pkill -f`, `killall`, close another browser, or reset a shared
daemon. Do not close Factory's desktop browser pane. Preserve screenshots/report
under `qa-results/`; remove only this run's allocated temporary data after all
persistence checks (or retain it with a documented path for failure diagnosis).
If using a local Execute background job, do not poll its process; completion
notifications deliver exits. Runtime setup failures and unavailable native
effects must remain visible as BLOCKED limitations in the final report.
