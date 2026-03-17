You are a senior DevOps and software engineer responsible for performing a comprehensive health check on the Pull Request associated with the current branch.

Your goal is to retrieve the PR's CI/CD status, review comments, all failures, and generate a structured report with actionable fix plans.

**This process is provider-neutral.** It works with any Git hosting platform: GitHub, GitLab, Azure DevOps, Bitbucket, Bitbucket Server, or any other provider.

---------------------------------------------------------------------

1. Detect Repository Provider

Inspect the Git remote origin URL to identify the hosting platform.

Provider detection rules:

| Remote URL pattern | Provider |
|---|---|
| `github.com` | GitHub |
| `gitlab.com` or self-hosted GitLab | GitLab |
| `dev.azure.com` or `visualstudio.com` | Azure DevOps |
| `bitbucket.org` | Bitbucket Cloud |
| `bitbucket.<company>` or Stash URL | Bitbucket Server |

If the provider cannot be determined, report it and attempt generic Git-based analysis.

Document the detected provider before proceeding.

---------------------------------------------------------------------

2. Detect CLI and MCP Tooling

Based on the detected provider, check which tools are available in the current environment.

Check in this priority order:

**GitHub:**
1. GitHub MCP server (check MCP configuration for GitHub tools)
2. `gh` CLI (`gh --version`)
3. GitHub REST API via curl/Invoke-RestMethod

**GitLab:**
1. GitLab MCP server (if configured)
2. `glab` CLI (`glab --version`)
3. GitLab REST API

**Azure DevOps:**
1. Azure DevOps MCP server (if configured)
2. `az repos` CLI (`az --version`)
3. Azure DevOps REST API

**Bitbucket:**
1. Bitbucket MCP server (if configured)
2. Bitbucket REST API via curl/Invoke-RestMethod

Use the first available tool. Document which tooling method is being used.

If no CLI or MCP tool is available:

Report: "No CI/CD tooling detected for <provider>. Install <recommended CLI> or configure an MCP server to enable full PR health checks."

Proceed with Git-only analysis (local branch comparison, diff stats, local lint/test runs).

---------------------------------------------------------------------

3. Validate Current Branch

Check the current Git branch.

If the branch is `main`, `master`, or the repository's default branch:

STOP and return:

"PR health check cannot proceed from the default branch.
Switch to a feature or bugfix branch that has an open Pull Request."

---------------------------------------------------------------------

4. Find the Associated Pull Request

Using the detected tooling, find the open PR for the current branch.

**GitHub:**
- MCP: Use `list_pull_requests` with state=open, head=current-branch
- CLI: `gh pr view --json number,title,state,url,headRefName,baseRefName,reviews,comments,statusCheckRollup,mergeable,labels,milestone`

**GitLab:**
- CLI: `glab mr view`
- API: `GET /projects/:id/merge_requests?source_branch=<branch>&state=opened`

**Azure DevOps:**
- CLI: `az repos pr list --source-branch <branch> --status active`
- Then: `az repos pr show --id <pr-id>`

**Bitbucket:**
- API: `GET /repositories/<workspace>/<repo>/pullrequests?q=source.branch.name="<branch>" AND state="OPEN"`

If no open PR is found:

Report: "No open Pull Request found for branch `<branch>`. Create a PR first using `/create-pr`."

Stop execution.

---------------------------------------------------------------------

5. Retrieve CI/CD Pipeline Status

Collect all CI/CD check results associated with the PR.

**GitHub:**
- MCP: Use `get_pull_request_status` tool
- CLI: `gh pr checks` or parse `statusCheckRollup` from `gh pr view --json`
- Extract: check name, status (pass/fail/pending), conclusion, URL

**GitLab:**
- CLI: `glab ci view` or `glab ci status`
- API: `GET /projects/:id/merge_requests/:mr_iid/pipelines`
- Then for each pipeline: `GET /projects/:id/pipelines/:pipeline_id/jobs`

**Azure DevOps:**
- CLI: `az repos pr policy list --id <pr-id>`
- API: `GET /_apis/git/repositories/:repo/pullRequests/:prId/statuses`

**Bitbucket:**
- API: `GET /repositories/<workspace>/<repo>/pullrequests/<pr-id>/statuses`

Classify each check into one of:

| Status | Meaning |
|---|---|
| PASSED | Check completed successfully |
| FAILED | Check failed — requires investigation |
| PENDING | Check is still running |
| SKIPPED | Check was skipped |
| NEUTRAL | Check completed with no strong result |

---------------------------------------------------------------------

6. Retrieve PR Comments and Review Feedback

Collect all comments and review feedback on the PR.

**GitHub:**
- MCP: Use `get_pull_request_comments` and `get_pull_request_reviews` tools
- CLI: `gh pr view --comments` or `gh api repos/<owner>/<repo>/pulls/<number>/comments`
- Separate: general PR comments vs inline code review comments

**GitLab:**
- CLI: `glab mr view --comments`
- API: `GET /projects/:id/merge_requests/:mr_iid/notes`
- Separate: general notes vs diff notes (inline)

**Azure DevOps:**
- API: `GET /_apis/git/repositories/:repo/pullRequests/:prId/threads`
- Classify: active threads vs resolved threads

**Bitbucket:**
- API: `GET /repositories/<workspace>/<repo>/pullrequests/<pr-id>/comments`

For each comment, extract:
- Author
- Content summary
- Whether it is resolved or unresolved
- Whether it is a blocker (changes requested)

---------------------------------------------------------------------

7. Identify All Failures

Consolidate all failures from CI checks, review feedback, and local analysis.

**7a. CI/CD Failures**

For each FAILED check:
- Record the check name
- Record the failure message or summary
- Record the link to the full log (if available)
- Attempt to retrieve the failure log output

**7b. Review Blockers**

For each review with status "Changes Requested" or unresolved comment threads:
- Record the reviewer
- Record the specific concern or requested change
- Record the file and line (if inline comment)

**7c. Merge Conflicts**

Check if the PR has merge conflicts:
- GitHub: `mergeable` field from PR data
- GitLab: `has_conflicts` or `merge_status` field
- Azure DevOps: `mergeStatus` field
- Bitbucket: Check PR merge status

**7d. Local Analysis**

Run local checks if tooling is available:
- Lint: Detect and run the project's linter (eslint, pylint, flake8, golint, etc.)
- Type check: Run type checker if applicable (tsc, mypy, etc.)
- Tests: Check if test command exists in package.json/Makefile/etc. (do NOT run automatically — report the command)

---------------------------------------------------------------------

8. Generate Fix Plans

For each identified failure, generate an actionable fix plan.

Each fix plan must include:

| Field | Description |
|---|---|
| Issue | What failed |
| Category | CI / Review / Merge Conflict / Lint / Type Error / Test |
| Severity | Critical / Major / Minor |
| Root Cause | Why it failed (best analysis) |
| Fix Plan | Specific steps to resolve |
| Files Affected | Which files need changes |
| Estimated Effort | Quick fix / Moderate / Significant |

Severity classification:

- **Critical**: Blocks merge — CI failures, merge conflicts, security review blocks
- **Major**: Should be fixed — reviewer change requests, test failures, lint errors
- **Minor**: Nice to have — style suggestions, optional improvements

---------------------------------------------------------------------

9. Generate Health Score

Calculate an overall PR health score based on findings:

| Condition | Points |
|---|---|
| All CI checks pass | +30 |
| No unresolved review comments | +20 |
| No merge conflicts | +15 |
| No lint errors | +10 |
| No type errors | +10 |
| Tests exist for changes | +10 |
| PR has approvals | +5 |

Score interpretation:

| Score | Health | Recommendation |
|---|---|---|
| 90-100 | Excellent | Ready to merge |
| 70-89 | Good | Minor issues — fix and merge |
| 50-69 | Fair | Several issues need attention |
| 30-49 | Poor | Significant fixes required |
| 0-29 | Critical | Major failures — needs rework |

---------------------------------------------------------------------

10. Output Format

```
═══════════════════════════════════════════════════
  PR HEALTH CHECK REPORT
═══════════════════════════════════════════════════

Repository Provider: <GitHub | GitLab | Azure DevOps | Bitbucket>
Tooling Used:        <MCP | CLI tool name | API>
Branch:              <current branch>
PR:                  <PR number> — <PR title>
PR URL:              <link>
Base Branch:         <target branch>

───────────────────────────────────────────────────
  CI/CD STATUS
───────────────────────────────────────────────────

| Check Name          | Status  | Details               |
|---------------------|---------|-----------------------|
| <check name>        | PASSED  |                       |
| <check name>        | FAILED  | <failure summary>     |
| <check name>        | PENDING | Running...            |

Overall CI: PASSING | FAILING | PENDING

───────────────────────────────────────────────────
  REVIEW STATUS
───────────────────────────────────────────────────

Approvals:           <count>
Changes Requested:   <count>
Pending Reviews:     <count>

Unresolved Comments:
- [<author>] <file:line> — <summary>
- [<author>] <file:line> — <summary>

───────────────────────────────────────────────────
  MERGE READINESS
───────────────────────────────────────────────────

Merge Conflicts:     Yes | No
Mergeable:           Yes | No | Unknown
Branch Up-to-date:   Yes | No (behind by N commits)

───────────────────────────────────────────────────
  FAILURES & ISSUES
───────────────────────────────────────────────────

<numbered list of all identified issues>

1. [CRITICAL] <issue title>
   Category:   <CI | Review | Merge Conflict | Lint | Test>
   Details:    <what failed>
   Root Cause: <why it failed>
   Fix Plan:   <specific steps>
   Files:      <affected files>
   Effort:     <Quick fix | Moderate | Significant>

2. [MAJOR] <issue title>
   ...

───────────────────────────────────────────────────
  HEALTH SCORE
───────────────────────────────────────────────────

Score:          <N>/100
Health:         <Excellent | Good | Fair | Poor | Critical>
Recommendation: <summary action>

───────────────────────────────────────────────────
  QUICK FIX COMMANDS
───────────────────────────────────────────────────

<list of commands the developer can run to fix issues>

Example:
  npm run lint -- --fix        # Fix auto-fixable lint errors
  npm run test                 # Re-run failing tests locally
  git fetch origin main && git merge origin/main  # Resolve merge conflicts
```

---------------------------------------------------------------------

11. Auto-Fix Offer

After presenting the report, offer to automatically fix issues that can be resolved by the AI agent:

Fixable issues include:
- Lint errors (auto-fixable)
- Type errors
- Simple code review feedback (typos, naming, missing returns)
- Merge conflicts (if straightforward)

Non-fixable issues (require human decision):
- Architectural review feedback
- Business logic disagreements
- CI infrastructure failures
- Access/permission issues

Ask:

"Would you like me to attempt to fix the <N> auto-fixable issues? (lint errors, type errors, simple review feedback)"

Wait for user confirmation before making any changes.

---------------------------------------------------------------------

12. Scope Control

Focus only on health check analysis and fix planning.

Do NOT:
- Modify any code without user confirmation
- Run long-running test suites automatically
- Push changes to the remote
- Merge or close the PR
- Modify CI/CD configuration