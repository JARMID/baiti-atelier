# Baiti Atelier Database Security & RLS Architecture Specification

## 1. Overview
Baiti Atelier utilizes a standalone, isolated PostgreSQL / Supabase architecture dedicated strictly to Algerian aluminum, PVC, wood, and glazing fabrication workshops. 

This database maintains strict physical and logical isolation from any external projects (such as TrustVault / `etudmslnmiqccuoknlpa`).

## 2. Row Level Security (RLS) Matrix

| Table | Operations | Permitted Roles | Constraint / Filter |
| :--- | :--- | :--- | :--- |
| `workshops` | `SELECT` | `anon`, `authenticated` | `is_archived = false` |
| `workshops` | `UPDATE` | `authenticated` | `owner_id = (select auth.uid())` |
| `workshop_profiles` | `SELECT` | `anon`, `authenticated` | `is_active = true` |
| `workshop_profiles` | `ALL` | `authenticated` | Owner of the parent workshop |
| `workshop_glass` | `SELECT` | `anon`, `authenticated` | `is_active = true` |
| `workshop_glass` | `ALL` | `authenticated` | Owner of the parent workshop |
| `quotes` | `INSERT` | `anon`, `authenticated` | Dimension validation ($200\text{mm} \le w, h \le 6000\text{mm}$, $q \ge 1$) |
| `quotes` | `SELECT` | `anon`, `authenticated` | Cryptographic verification token check or Workshop Owner |
| `quotes` | `UPDATE` | `authenticated` | Workshop Owner |
| `cutting_jobs` | `ALL` | `authenticated` | Workshop Owner only (Tenant Isolation) |
| `remnant_inventory`| `ALL` | `authenticated` | Workshop Owner only (Tenant Isolation) |
| `workshop_audit_logs`| `SELECT`| `authenticated` | Workshop Owner only |

## 3. High-Performance InitPlan Optimization
Direct calls to `auth.uid()` in RLS expressions cause PostgreSQL to re-evaluate the auth session for every candidate row. In Baiti Atelier:
- All RLS policies utilize `(select auth.uid())`.
- This enforces single-execution query planning (PostgreSQL InitPlan), achieving sub-millisecond query planning on high-volume catalog lookups.

## 4. Cryptographic Quote Verification & Margin Protection
- Client quotes generate an unguessable 32-character hexadecimal verification token (`gen_random_bytes(16)`).
- RPC function `verify_client_quote(p_quote_code, p_token)` exposes client-facing quotation lines while completely stripping the workshop's internal wholesale rate (`wholesale_rate_per_kg`), glass cost basis, and margin percentages.
- Anonymous clients cannot fish or enumerate quotes across Algerian wilayas.

## 5. Audit Logging & Least Privilege
- Stored procedure `log_workshop_event()` executes with `SECURITY DEFINER` with fixed `search_path = public`.
- Trigger functions have execution privileges explicitly revoked from `PUBLIC` and `anon`.
