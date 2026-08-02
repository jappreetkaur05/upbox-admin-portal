# UpBox WMS UI Sprint Plan — Covered vs Uncovered

Source: `UpBox_WMS_UI_Sprint_Plan.pdf`  
Compared against: Upbox admin portal (frontend / mock) + rider app as of 31 Jul 2026  

Constraint: UI only, no backend (matches sprint and current build).

---

## Legend

| Status | Meaning |
|--------|---------|
| Covered | Built and usable in the product |
| Partial | Some screens or subset of the feature exists |
| Uncovered | Not built (or replaced by a different approach) |
| Different | Sprint asked for X; we built Y instead (still valid for Upbox) |

---

## Intern: Jap

### Day 1 — Warehouse Configuration

| Item | Status | Notes |
|------|--------|-------|
| Warehouse setup | Partial | Locations / warehouse pages exist |
| Zones, aisles, racks, shelves, bins | Partial | Location hierarchy used in putaway/picking; not full config UI |
| Capacity | Partial | Rack utilization exists |
| Barcode / QR templates | Partial | Labels / barcodes in outbound; not a template manager |
| Warehouse settings | Uncovered | |

### Day 1 — Client Management

| Item | Status | Notes |
|------|--------|-------|
| Client profile | Uncovered | |
| Billing profile | Uncovered | |
| Warehouse assignment | Uncovered | |
| API / webhook placeholders | Uncovered | |
| Shipping preferences | Uncovered | |
| SLA screens | Partial | SLA on orders / KPIs only |
| Notification settings | Uncovered | |

### Day 1 — Inventory Control

| Item | Status | Notes |
|------|--------|-------|
| Stock overview | Covered | Inventory stock page |
| Stock adjustment | Uncovered | |
| Cycle count | Uncovered | |
| Audit | Uncovered | |
| Transfers | Partial | Warehouse moves |
| Batch / lot | Uncovered | |
| Serial numbers | Uncovered | |
| Expiry | Uncovered | |
| FIFO / FEFO configuration | Uncovered | |
| Quarantine | Uncovered | |
| Reserved inventory | Uncovered | |
| Incoming inventory view | Covered | Incoming orders page |
| Utilization | Covered | Rack utilization |

### Day 2 — Picking & Packing

| Item | Status | Notes |
|------|--------|-------|
| Wave planning | Covered | “Send to pick” |
| Batch / zone picking | Covered | Options under More options + assign strategy |
| Picker dashboard | Covered | Picking page |
| Pick exceptions | Covered | Confirm vs exception once; Exceptions board |
| Packing stations | Covered | |
| Packaging recommendation | Covered | |
| Weight & dimension validation | Covered | Stepped Validate → QC → Print |
| SLA dashboards | Partial | Order SLA + dashboard KPIs |

### Day 2 — Dock & Yard

| Item | Status | Notes |
|------|--------|-------|
| Dock scheduling | Uncovered / Different | Upbox uses FE handoff, not 3PL dock |
| Truck queue | Uncovered / Different | |
| Gate pass | Uncovered | |
| Dock allocation | Uncovered / Different | FE bay optional on Assign |
| Driver verification | Different | **FE check-in** (OTP) |
| Yard overview | Uncovered | |
| Dock utilization dashboards | Uncovered | |
| FE check-in → assign → release | Covered | Built instead of classic dock/yard |

### Day 3 — Billing Engine

| Item | Status | Notes |
|------|--------|-------|
| Storage billing | Uncovered | |
| Pick-pack billing | Uncovered | |
| Shipping billing | Uncovered | |
| Custom charges | Uncovered | |
| Invoices | Uncovered | |
| Wallet | Uncovered | |
| GST invoice UI | Uncovered | |
| Billing reports | Uncovered | |

### Day 3 — Automation Rules

| Item | Status | Notes |
|------|--------|-------|
| Rule builder UI | Uncovered | |
| Allocation rules | Partial | Rules list + auto/manual allocate |
| Courier selection automation | Uncovered | Manual courier on label generate |
| Picking wave automation | Partial | Auto-assign pickers on release |
| Notification automation | Uncovered | |
| Dispatch automation | Uncovered | |
| Low stock alerts | Uncovered | |

---

## Intern: Taran

### Day 1 — Warehouse Analytics

| Item | Status | Notes |
|------|--------|-------|
| Operational KPIs | Partial | Inbound + outbound dashboards |
| Inventory analytics | Partial | Stock / utilization |
| Workforce analytics | Partial | Team / workers (inbound-tied) |
| SLA dashboards | Partial | |
| Utilization dashboards | Covered | |
| Ageing | Uncovered | |
| Dead stock | Uncovered | |

### Day 1 — Exception Center

| Item | Status | Notes |
|------|--------|-------|
| Unified exception center | Uncovered | |
| Inventory mismatch | Uncovered | |
| Damaged SKU | Partial | Pick exception types only |
| Wrong scan | Uncovered | |
| Courier rejection | Uncovered | |
| Failed dispatch | Partial | In-field failed status (monitor) |
| Comments / attachments | Uncovered | |
| Resolution workflow | Partial | Pick exception resolve / replace |

### Day 2 — Digital Warehouse

| Item | Status | Notes |
|------|--------|-------|
| Interactive warehouse map | Uncovered | |
| Clickable zones / aisles / racks / bins | Uncovered | |
| Occupancy / live status | Uncovered | |
| Search to locate SKU / bin / rack | Uncovered | |

### Day 2 — Advanced Visualization

| Item | Status | Notes |
|------|--------|-------|
| Travel paths | Uncovered | |
| Congestion heatmap | Uncovered | |
| Rack details viz | Uncovered | |
| Capacity planning viz | Uncovered | |
| Inventory velocity | Uncovered | |
| Zoom / minimap / overview | Uncovered | |

### Day 3 — UI Polish

| Item | Status | Notes |
|------|--------|-------|
| Global components | Partial | Enterprise UI kit in use |
| Navigation | Covered | AppShell sections |
| Breadcrumbs | Covered | |
| Reusable tables | Partial | DataTable (search/sort/etc. vary by page) |
| Charts | Partial | Funnel / KPI style |
| Timeline components | Covered | Order timeline |
| Notifications / toasts | Covered | |
| Dark mode | Uncovered | |
| Accessibility pass | Uncovered | |

### Day 3 — End-to-End Flow

| Item | Status | Notes |
|------|--------|-------|
| Inbound → QC → putaway | Covered | Inbound flow (QC not a separate named module) |
| Inventory | Partial | |
| Allocation → picking → packing | Covered | Guided outbound strip |
| Dispatch | Different | **Release to FE** (not truck dispatch) |
| Returns | Uncovered / Partial | Rider has returns; admin reverse flow weak |
| Seamless connected UI | Partial | Pipeline strip + step guides on outbound |

---

## After WMS UI — Mobile apps (sprint says “only after complete WMS UI”)

| Item | Status | Notes |
|------|--------|-------|
| Picker app | Uncovered | Picker role uses web Picking |
| QC app | Uncovered | |
| Putaway app | Uncovered | Putaway is web |
| Packing app | Uncovered | Packing is web |
| Supervisor app | Uncovered | Supervisor uses web |
| Dock Supervisor app | Uncovered | |
| Rider app | Partial | Exists (`upbox_rider_app`); handoff via localStorage |
| Inventory Auditor app | Uncovered | |

---

## Summary counts (approx.)

| Status | Rough share |
|--------|-------------|
| Covered | Strong on inbound floor + outbound pick/pack/FE handoff |
| Partial | Inventory, analytics, automation, UI polish, E2E |
| Uncovered | Clients, billing, maps/heatmaps, full exception center, full inventory control, classic dock/yard |

### Biggest gaps vs sprint PDF

1. Client Management  
2. Billing Engine  
3. Digital warehouse map + advanced viz  
4. Full Inventory Control (cycle count, lot/serial, quarantine, etc.)  
5. Unified Exception Center  
6. Classic Dock & Yard (intentionally replaced by FE flow)  
7. Automation rule builder  
8. Full set of role-specific mobile apps  

### Strongest coverage vs sprint PDF

1. Picking & Packing (Jap Day 2)  
2. End-to-end warehouse → FE release flow  
3. Basic dashboards / utilization  
4. FE check-in as “driver verification” equivalent  
