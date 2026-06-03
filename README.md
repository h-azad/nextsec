# nextsec

`nextsec` is a Node.js CLI for running an MVP security scan against Next.js projects. It validates project structure, audits package metadata against a local vulnerability map, applies static Next.js rules, formats reports for humans or CI, and exits non-zero when findings meet a configured severity threshold.

## Commands

```sh
nextsec scan [path]
nextsec audit [path]
nextsec db-update
```

## Common options

```sh
-f, --format <json|markdown|text>
--fail-on <low|medium|high|critical>
--ignore-rules <rule-ids>
```

## Configuration

Create `.nextsecrc` or `nextsec.json` in the target project:

```json
{
  "severityThreshold": "medium",
  "exclude": ["**/__tests__/**", "src/fixtures/*"],
  "ignoreRules": ["NS-009"],
  "exploitDbAutoUpdate": true
}
```

## Initial rules

- `NS-001`: flags exported functions in `'use server'` files that appear to lack input validation or authorization checks.
- `NS-004`: flags `dangerouslySetInnerHTML` usage for sanitization review.
- `NS-012`: flags sensitive-looking `NEXT_PUBLIC_` environment variables.
- `NS-DEP`: flags dependencies matching the packaged local vulnerability map.
