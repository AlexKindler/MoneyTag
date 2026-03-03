# MONEYTAG SYSTEM ARCHITECTURE

## 1. The Spending Lifecycle
MoneyTag prevents opacity by tracing every federal dollar from appropriation to final expenditure.
- **Phase A (Appropriation):** Congress allocates funds and the Treasury issues budget authority. Every dollar is tagged and tracked from the moment it enters the federal pipeline.
- **Phase B (Flow):** Funds flow through federal agencies, bureaus, and sub-agencies. Every organization is a node in the spending hierarchy, fully traceable.
- **Phase C (Expenditure):** The money reaches the final vendor or recipient.

## 2. The "Final Mile" Tracking
The system surfaces three types of Terminal Expenditures:
1. **Direct Payments:** Benefits, grants, and subsidies paid directly to individuals or organizations.
2. **Contracts & Procurement:** Government purchases of goods and services from vendors, with full obligation and outlay tracking.
3. **Outcome-Linked Spending:** Every terminal expenditure is categorized (Social Security, Defense, Healthcare, Admin). High admin-to-outcome ratios trigger visual warnings.

## 3. UI Logic
- **Nodes:** Display "Depth" (how many steps away from the Treasury).
- **Transparency:** Hovering over any node shows the "Chain of Custody" -- a list of every agency and bureau that handled those specific dollars.
- **Accountability Dashboard:** Include a "Leak Counter" at the top showing "Unobligated Funds" vs. "Tagged Visibility."
