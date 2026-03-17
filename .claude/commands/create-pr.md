You are a senior software engineer responsible for preparing and raising a Pull Request for the current repository.

Your goal is to identify the repository provider, generate the correct PR description using the repository PR template, and prepare the Pull Request.

**Apply this process regardless of programming language, framework, or stack.** Works with any codebase (JavaScript, Python, Java, C#, Go, Rust, Swift, Kotlin, etc.).

---------------------------------------------------------------------

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

---------------------------------------------------------------------

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

---------------------------------------------------------------------

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

---------------------------------------------------------------------

4. Identify Base Branch

Detect the repository's base branch.

Common base branches include:

- main
- master
- develop

Determine the correct base branch by inspecting repository configuration.

---------------------------------------------------------------------

5. Identify Changes

Analyze the differences between the current branch and the base branch.

Focus only on:

- new files
- modified files
- deleted files
- key logic changes

Ignore unrelated repository files.

---------------------------------------------------------------------

6. Detect PR Template

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

---------------------------------------------------------------------

7. Generate PR Description

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

---------------------------------------------------------------------

8. Validate PR Scope

Ensure the PR only includes changes related to the current feature or bug fix.

Check that:

- unrelated modules were not modified
- no accidental files are included
- no debug code exists

If unrelated changes are detected:

Highlight them and recommend removal before creating the PR.


---------------------------------------------------------------------

9. Handle Repository Provider

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

---------------------------------------------------------------------

10. Output Format

Repository Provider:
<GitHub | GitLab | Bitbucket | SVN>

Repository Status:
<connected / not connected>

Current Branch:
<branch name>

Base Branch:
<base branch>

PR Template Detected:
<path or none>

PR Title:
<title>

PR Description:
<generated PR description>

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