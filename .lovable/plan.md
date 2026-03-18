

## Plan: Remove Early Settlement Entirely

Remove all early settlement calculator code and UI from the project.

### Files to edit

1. **`src/pages/broker/AgreementDetail.tsx`** — Remove the early settlement import, calculation, and the "Early Settlement Quote" card section. Remove unused `TrendingDown` icon import.

2. **`src/pages/portal/PortalAgreementDetail.tsx`** — Remove the early settlement import, calculation, and the "Early Settlement" card section. Remove unused `TrendingDown` icon import.

3. **`src/lib/early-settlement.ts`** — Delete this file entirely.

