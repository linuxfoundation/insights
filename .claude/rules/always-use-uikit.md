# Always Use Uikit Components

When generating any Vue template in this repo, you MUST use components from `frontend/app/components/uikit/` instead of raw HTML equivalents.

## Rule

**Before writing any HTML element, check if a uikit component exists for it.**

Never use these raw elements when a uikit equivalent is available:

| Raw HTML | Use instead |
|---|---|
| `<button>` | `<lfx-button>` or `<lfx-icon-button>` |
| `<input>` | `<lfx-input>` |
| `<select>` | `<lfx-select>` |
| `<textarea>` | `<lfx-textarea>` |
| `<table>`, `<tr>`, `<td>` | `<lfx-table>` |
| `<dialog>` / modal div | `<lfx-modal>` |
| `<aside>` / side panel | `<lfx-drawer>` |
| Loading spinner div | `<lfx-spinner>` |
| Placeholder shimmer | `<lfx-skeleton>` |
| Tab bar | `<lfx-tabs>` |
| Tooltip wrapper | `<lfx-tooltip>` |
| Checkbox input | `<lfx-checkbox>` |
| Radio input | `<lfx-radio>` |
| Toggle/switch | `<lfx-toggle>` |

## How to Apply

1. Before writing a component template, scan `frontend/app/components/uikit/` to see what's available
2. Read the uikit component's `.vue` file to understand its props and slots before using it
3. If no uikit component exists for the element, use Tailwind + raw HTML and note that a uikit component may be needed
4. Never invent a custom button, input, or modal — always use the uikit versions
