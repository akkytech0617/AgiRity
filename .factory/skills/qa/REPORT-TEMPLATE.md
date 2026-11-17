## QA Report

- Comparison mode / base / head: {{COMPARISON}}
- Changed app paths: {{CHANGED_PATHS}}
- Runtime / isolation: {{RUNTIME}}
- Limitations / untested native effects: {{LIMITATIONS}}

| #   | Test Case | App | Persona | Result | Notes |
| --- | --------- | --- | ------- | ------ | ----- |

{{TEST_ROWS}}

Result values: PASS, FAIL, BLOCKED, FLAKY, INCONCLUSIVE

{{#if ACTIONABLE_ITEMS}}

### Action Required

{{ACTIONABLE_ITEMS}}
{{/if}}

<details>
<summary>Screenshots & Evidence</summary>

{{EVIDENCE}}

</details>
