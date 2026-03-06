# Review Branch

Perform a comprehensive code review of the current branch changes by following the instructions in the Claude Code review command located at `.claude/commands/review-branch.md`.

## Instructions

1. Read the review guidelines from `.claude/commands/review-branch.md`
2. Execute a `git diff main...HEAD` to see all changes in the current branch
3. Follow all the review criteria specified in the Claude review command, including:
   - Pattern compliance checks against AGENTS.md
   - Blitzy duplication detection
   - Code quality assessment
   - TypeScript and React best practices
   - Testing coverage and quality

4. Provide the output in the exact format specified in the Claude review command

## Context

This command wraps the Claude Code `/review-branch` command for use in Cursor, ensuring consistent code review standards across different development environments.
