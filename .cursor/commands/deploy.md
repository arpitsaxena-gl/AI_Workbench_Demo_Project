# Deployment Instructions

**Platform:** Vercel

---

## Prerequisites

- Vercel project linked to this repo (GitHub).
- Deploy Hook created in Vercel: **Project → Settings → Git → Deploy Hooks**.

---

## Branch

- **Production:** `main`

---

## Deployment Trigger

Use the **Vercel Deploy Hook** to deploy the latest commit on `main` (after pushing).

---

## Steps

1. **Commit** all application changes.
2. **Push** to the `main` branch on GitHub.
3. **Trigger** the deploy hook (optional — only if you want an immediate redeploy; otherwise Vercel may already deploy on push):

   curl -X POST "https://api.vercel.com/v1/integrations/deploy/prj_lfvn63891GaXEkLSav48rw1r4Mx3/focslUsnFK"
   