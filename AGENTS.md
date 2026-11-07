<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- All reads go through `queryOptions` in `src/lib/data/queries.ts` (loader `ensureQueryData` + `useSuspenseQuery`); today they resolve demo data from `src/lib/data/demo.ts`, so backend integration only swaps those function bodies.
- Demo data must be visibly labelled as example content ("exemplo") and never look like real alumni records.
- Logged-in screens live under the pathless `_portal` layout (header, sidebar, mobile bottom nav); public screens use `PublicShell`/`AuthShell`.
- Accessibility preferences (font scale, high contrast) are applied via `data-font` / `.hc` on `<html>` from `src/lib/accessibility.tsx`; new colors must be tokens so high-contrast overrides keep working.
- Login/signup are demo-only (`src/lib/demo-session.ts`) until real authentication is added.
