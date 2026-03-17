# Start Ticket

Analyze a new ticket against existing implementation to find any duplicates or overlap, then create or extend work as per the description.

**Apply this process regardless of programming language, framework, or stack.** Works with any codebase (JavaScript, Python, Java, C#, Go, Rust, Swift, Kotlin, etc.) and any layer (frontend, backend, mobile, CLI, API, etc.).

Follow project guidelines (e.g. `Agents.md`, `agent.md`, `CONTRIBUTING.md`, or project-specific docs).

## Usage

```
/start-ticket [context-folder]
```

- `context-folder`: Optional path to folder containing screenshots, designs, or additional context

## Process

---

🛑 **STOP HERE FIRST - READ THIS BEFORE DOING ANYTHING ELSE** 🛑

Before reading ANY files, doing ANY analysis, or proceeding to ANY numbered steps below, you MUST do this:

**Ask the user this question**: "Is the ticket description and requirements already in the context folder `[folder-path]`, or would you like to provide the ticket details now?"

Wait for their response. Do not proceed until they answer.

- If they say it's in the context folder → Go to step 2
- If they will provide details → Wait for them to give you the ticket description, requirements, acceptance criteria, and technical constraints

**DO NOT skip this. DO NOT assume. DO NOT proceed without asking.**

---

### 1. Gather Ticket Information

(This information should have been gathered in the STOP step above)

Document what the user provided:

- Ticket description/requirements
- Any acceptance criteria
- Technical constraints or notes

### 2. Review Additional Context

If a context folder is provided:

- Read all files in the folder (screenshots, markdown files, design specs, etc.)
- Analyze screenshots to understand UI requirements
- Extract additional requirements from context files
- Summarize key insights

### 3. Analyze Existing Implementation

**Detect project language and stack** from package manager, config files, or imports (e.g. package.json, requirements.txt, pom.xml, go.mod, Cargo.toml).

Review project documentation (e.g. `Project Guide.md`, README, or equivalent) to understand guidance for code generation:

**Identify overlap:**

- Does existing implementation cover this ticket partially or fully?
- Which specific features relate to this ticket? (screens, components, modules, services, APIs, handlers, controllers, views—use terms appropriate to the stack)
- What files, modules, or packages are relevant?

**Assess completion:**

- Is existing implementation complete for this ticket's requirements?
- What functionality is present vs. missing?
- Are there differences from the requirements? (UI/UX, API contract, behavior, data model, etc.—depending on the layer)

### 4. Identify Gaps

Categorize gaps in existing implementation:

**Known gaps** (documented in project docs):

- Gaps explicitly mentioned in documentation
- Features marked as TODO or incomplete
- Known limitations

**Unknown gaps** (discovered by analysis):

- Missing functionality not documented as a gap
- Incomplete implementations
- Edge cases not handled
- Integration points not wired up
- Missing validations or error handling
- Presentation issues (UI polish, styling, layout—or equivalent for non-UI layers)
- Incorrect or mismatched data transformations (doesn't match reference implementation)

### 5. Determine Work Required

Based on the analysis:

**If existing implementation fully covers this:**

- Confirm what files/features already exist
- Note any testing or verification needed
- Suggest minimal additional work

**If existing implementation partially covers this:**

- List what's already done (can be leveraged)
- List what needs to be added/completed
- Suggest integration approach

**If existing implementation has a mistake:**

- List where the mistake was made in the source code (with code snippet)
- List what the correct implementation should be (with reference if available)
- Suggest changes to be made as a diff

**If existing implementation doesn't cover this:**

- Confirm this is net-new work
- Suggest similar patterns from existing code to follow (language-appropriate)
- Note any existing components, modules, services, utilities, or shared code that can be reused

## Output Format

### Ticket Requirements Summary

Concise restatement of what needs to be delivered.

### Context Analysis

Key insights from screenshots, designs, or additional context (if provided).

### Existing Implementation Analysis

#### What Existing Implementation Provides

- **Feature/Unit** (screen, component, API, module, etc.): {name}
  - Files: {list of relevant files}
  - Functionality: {what it does}
  - Status: {complete/partial/incomplete}

#### Coverage Assessment

- **Fully covered**: {features that are done}
- **Partially covered**: {features that are started but incomplete}
- **Not covered**: {features that don't exist}

### Gap Analysis

#### Known Gaps (from project documentation)

1. **Gap**: {description}
   - Documented in: {section of project docs}
   - Impact on ticket: {how it affects this work}

#### Unknown Gaps (discovered)

1. **Gap**: {description}
   - Current state: {what exists}
   - Expected state: {what should exist}
   - Impact on ticket: {how it affects this work}

### Work Required

#### Can Leverage from Existing Implementation

- {Component/module/service/utility/handler/controller—stack-appropriate}: {what it provides}
- {Another reusable unit}: {what it provides}

#### Needs to be Built/Fixed

1. **Task**: {description}
   - Type: {new feature / bug fix / enhancement / integration}
   - Files: {files to create or modify}
   - Depends on: {existing components/modules/services/utilities to use}

2. **Task**: {description}
   - Type: {type}
   - Files: {files}
   - Depends on: {dependencies}

### Recommendations

**Approach**: {suggested implementation approach—language and stack appropriate}

**Priority order**:

1. {highest priority task}
2. {next priority task}

**Risks/Considerations**:

- {potential issue or thing to watch out for}

---

**Next steps**: Review this analysis and let me know if you'd like to proceed with implementation or need any clarifications.
