You are a senior software engineer responsible for preparing and raising a Pull Request for the current repository.

Your goal is to identify the repository provider, generate the correct PR description using the repository PR template, and prepare the Pull Request.

**Apply this process regardless of programming language, framework, or stack.** Works with any codebase (JavaScript, Python, Java, C#, Go, Rust, Swift, Kotlin, etc.).

---

1. Detect Repository Type

Inspect the project repository configuration to determine which version control system is being used.

Check:

- GitHub
- GitLab
- Bitbucket
- SVN

If Git is used, inspect the remote origin URL:

Examples:

GitHub:
https://github.com/<org>/<repo>.git

GitLab:
https://gitlab.com/<org>/<repo>.git

Bitbucket:
https://bitbucket.org/<org>/<repo>.git

If SVN is detected, report that PR workflow may not apply and explain the repository workflow instead.

Document which repository provider is used.

---

2. Validate Current Repository

Verify that the project directory is connected to a repository.

Check:

- repository root
- remote origin configuration
- repository provider

If no repository is connected:

Return:

"Repository is not connected to GitHub, GitLab, Bitbucket, or SVN.  
Please connect the project to a version control repository before creating a PR."

Stop execution.

---

3. Validate Current Branch

Check the current working branch.

If the branch is:

main
master
develop (if defined as protected)

Return:

"Pull Requests cannot be created directly from the main branch.  
Please switch to a feature or bugfix branch before creating a PR."

Stop execution.

---

4. Validate Branch Naming Convention

Check that the current branch follows the repository's naming convention.

Expected patterns (detect from existing branches or use defaults):

- `feature/<ticket-id>-short-description` (e.g. `feature/MPX-142-login-validation`)
- `bugfix/<ticket-id>-short-description` (e.g. `bugfix/MPX-200-fix-crash`)
- `hotfix/<description>` (e.g. `hotfix/security-patch`)
- `chore/<description>` (e.g. `chore/update-dependencies`)
- `refactor/<description>` (e.g. `refactor/auth-middleware`)

If the branch name does not match any convention:

- Warn the user but do not block PR creation
- Suggest a rename if the branch has not been pushed yet

Extract the ticket ID from the branch name (if present) for use in the PR title and Jira linking.

---

5. Identify Base Branch

Detect the repository's base branch.

Common base branches include:

- main
- master
- develop

Determine the correct base branch by inspecting repository configuration.

---

6. Identify Changes

Analyze the differences between the current branch and the base branch.

Focus only on:

- new files
- modified files
- deleted files
- key logic changes

Ignore unrelated repository files.

---

7. Detect PR Template

Search the repository for a PR template file.

Possible locations:

.prepare-pr.md  
prepare-pr.md  
.github/PULL_REQUEST_TEMPLATE.md  
docs/prepare-pr.md  
.templates/prepare-pr.md

If a PR template exists:

Use it to generate the PR description.

If not found:

Generate the PR description using the repository standard structure.

---

8. Generate PR Description

Use the detected PR template to populate the PR content.

If Jira information exists in commit messages or branch names:

Extract:

- Jira ID
- Jira summary

Populate them in the PR title and description.

Example PR Title:

feat: Implement compose screen (MPX-1286)

Ensure the PR description includes:

- description
- feature behavior
- entry paths
- data flow
- dependencies
- testing summary
- risk assessment
- files changed

---

9. Validate PR Scope

Ensure the PR only includes changes related to the current feature or bug fix.

Check that:

- unrelated modules were not modified
- no accidental files are included
- no debug code exists

If unrelated changes are detected:

Highlight them and recommend removal before creating the PR.

---

10. Auto-Detect Labels

Based on the branch name, PR title, and changes, automatically determine labels to apply.

Detection rules:

| Branch prefix / PR title prefix | Label |
|---|---|
| `feature/` or title starts with `feat:` | `feature` |
| `bugfix/` or `hotfix/` or title starts with `fix:` | `bug` |
| `chore/` or title starts with `chore:` | `chore` |
| `refactor/` or title starts with `refactor:` | `refactor` |
| Title starts with `docs:` | `documentation` |
| Title starts with `test:` | `test` |
| Changes only in test files | `test` |
| Changes only in documentation/markdown files | `documentation` |

Additional labels based on scope:

| Condition | Label |
|---|---|
| Files changed in `apps/frontend/` or UI components | `frontend` |
| Files changed in `apps/backend/` or API routes | `backend` |
| Files changed in both frontend and backend | `full-stack` |
| `package.json` or lock files changed | `dependencies` |
| CI/CD config files changed (`.github/workflows/`, `turbo.json`) | `ci/cd` |

Apply all matching labels. If using GitHub MCP or `gh` CLI, pass labels during PR creation. If labels don't exist in the repository, note them in the output so the user can create them.

---

11. Auto-Assign Reviewers

Determine reviewers to assign to the PR.

Strategy (in order of priority):

1. **CODEOWNERS file** — If `.github/CODEOWNERS` or `CODEOWNERS` exists, parse it to find owners of the changed files and assign them as reviewers.

2. **Git blame / recent contributors** — Identify the most frequent recent contributors to the changed files (excluding the PR author). Suggest the top 1-2 as reviewers.

3. **Team convention** — If the repository has a documented reviewer assignment convention (in `CONTRIBUTING.md`, `AGENTS.md`, or similar), follow it.

4. **Fallback** — If none of the above yields reviewers, list the output as:

"No reviewers auto-detected. Please assign reviewers manually."

When creating the PR via GitHub MCP or `gh` CLI, pass reviewers using the `--reviewer` flag or equivalent API parameter.

---

12. Handle Repository Provider

Based on the detected repository provider, prepare the Pull Request workflow.

**Prefer creating PR from within Cursor (no browser) when possible.**

If the provider is GitHub:

1. **GitHub MCP** (preferred): If GitHub MCP is connected, use the `create_pull_request` tool to create the PR directly from Cursor. No browser or `gh` CLI needed. Pass: owner, repo, title, head (current branch), base, body (description).
2. **gh CLI**: If GitHub MCP is not available but `gh` is installed: Run `gh pr create --base <base-branch> --head <current-branch> --title "<title>" --body "<description>"`.
3. **URL fallback**: If neither is available: Generate `https://github.com/<org>/<repo>/compare/<base-branch>...<current-branch>?expand=1` and provide title + description for user to paste in browser.

If the provider is GitLab:

1. **GitLab MCP** (if available): Use MCP tool to create MR from within Cursor.
2. **glab CLI**: If `glab` is installed: Run `glab mr create`.
3. **URL fallback**: Generate MR URL and provide title + description for user to paste in browser.

If the provider is Bitbucket:

Prepare the Pull Request URL using the format:

https://bitbucket.org/<workspace>/<repo>/pull-requests/new?source=<current-branch>&dest=<base-branch>

Provide the PR title and description. Return the generated URL so the user can open it and paste the content.

If the provider is Bitbucket Server (self-hosted):

Generate the Pull Request creation link using the repository project URL.

If the repository uses SVN:

Explain that Pull Requests are not supported and provide the appropriate workflow for commits and code reviews.

---

13. Log PR Creation

After the PR is created (or the URL is generated), produce a structured log entry.

Log format:

```
PR Creation Log
───────────────
Timestamp:      <current date and time>
Repository:     <org/repo>
Provider:       <GitHub | GitLab | Bitbucket>
Branch:         <current-branch> → <base-branch>
Branch Valid:   <Yes | No — convention warning>
PR Title:       <title>
PR URL:         <url or "pending — user to create via URL">
Labels:         <comma-separated list or "none">
Reviewers:      <comma-separated list or "none — assign manually">
Files Changed:  <count>
Method:         <GitHub MCP | gh CLI | URL fallback>
Jira Ticket:    <ID or "none">
```

Display this log to the user as a summary after PR creation completes.

---

14. Output Format

Repository Provider:
<GitHub | GitLab | Bitbucket | SVN>

Repository Status:
<connected / not connected>

Current Branch:
<branch name>

Branch Convention:
<valid | warning — suggest rename>

Base Branch:
<base branch>

PR Template Detected:
<path or none>

PR Title:
<title>

PR Description:
<generated PR description>

Labels Applied:
<list of auto-detected labels>

Reviewers Assigned:
<list of reviewers or "none — assign manually">

Files Included in PR:
<list of changed files>

Potential Issues:
<any unrelated changes detected>

PR Creation Method Used:
GitHub MCP | glab CLI | gh CLI | URL (browser)

Recommended PR Command (if using CLI):
<command to create PR>

PR Creation URL (if URL fallback):
<URL for user to open and paste title + description>

PR Creation Log:
<structured log entry>
