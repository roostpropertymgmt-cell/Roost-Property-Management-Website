# Change Control Procedure (Basic)
- All changes land via Git branches and Pull Requests (PRs).
- ISO/Owner reviews PRs; CI checks (build/lint) must pass.
- Deploy to staging first, validate, then promote to production.
- Rollback via Git revert or Cloudflare version rollback.
- PRs, tags, and deploy logs are the change record of truth.
