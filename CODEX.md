## Application Building Context

Read the following files in order before implementing or making architectural decisions:

1. `PLAN.md` - current product and implementation source of truth
2. `context/project-overview.md` - product definition, goals, features, and scope
3. `context/architecture.md` - system structure, mandatory tools, storage model, and invariants
4. `context/ui-context.md` - product feel, layout, map UI, and component conventions
5. `context/code-standards.md` - implementation rules and conventions
6. `context/ai-workflow-rules.md` - development workflow, scoping rules, and delivery approach
7. `context/progress-tracker.md` - current phase, completed work, open questions, and next steps

Keep `context/progress-tracker.md` current after meaningful implementation changes.

If `PLAN.md` and the context files disagree, update the context files to match `PLAN.md` before coding.

Mandatory constraints:

- Use AWS Aurora PostgreSQL with PostGIS as the production database.
- Use v0/Vercel as the deployment path.
- Use Groq only for preference extraction and grounded explanations.
- Do not use an LLM to rank neighborhoods.
