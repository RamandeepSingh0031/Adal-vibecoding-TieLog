# Privacy Policy — TieLog

_Last updated: 2026-02-24_

TieLog ("the app", "we", "our") is a private relationship journal. This document describes what data we collect, how we store it, and your rights as a user.

---

## 1. What data we collect

| Category | Examples | Purpose |
|----------|---------|---------|
| Account data | Email address, password hash | Authentication |
| Profile data | Full name, avatar URL | Personalization |
| Journal content | Note text, audio recordings, tags | Core functionality |
| Relationship data | Cluster names, organization names, person names and roles | Core functionality |

We collect **no analytics, no telemetry, and no advertising data**. We do not read the content of your notes.

---

## 2. Where data is stored

- **On your device** — All data is stored locally in the browser's IndexedDB (via Dexie.js) and is available offline.
- **In the cloud** — When online, data is synced to a Supabase (PostgreSQL) database hosted on AWS (ap-south-1 region) for backup purposes.

Audio recordings are stored as object URLs locally. Cloud backup of audio files requires the Pro tier.

---

## 3. Data access and isolation

- Each user's data is isolated at the database layer via Supabase **Row Level Security (RLS)** policies.
- Application-level queries additionally filter all results by `user_id` and cluster ownership chains.
- TieLog staff cannot read your note content.

---

## 4. Data retention

- Your data is retained for as long as your account is active.
- If you delete your account, all data is permanently removed from our servers within **30 days**.
- Local IndexedDB data is cleared immediately when you sign out of the app.

---

## 5. Your rights

You have the right to:

- **Access** — Export all your data (see the Settings → Export section).
- **Correction** — Edit or delete any note, cluster, organization, or person record at any time.
- **Deletion** — Delete your account and all associated data permanently.

To request account deletion, go to **Settings → Account → Delete Account**, or email [support@tielog.app](mailto:support@tielog.app).

---

## 6. Third-party services

| Service | Purpose | Privacy Policy |
|---------|---------|---------------|
| Supabase | Database, authentication | [supabase.com/privacy](https://supabase.com/privacy) |
| Vercel | Hosting | [vercel.com/legal/privacy-policy](https://vercel.com/legal/privacy-policy) |

---

## 7. Future: End-to-End Encryption

We intend to implement full client-side E2EE so that cloud-stored data cannot be read by anyone but you, not even TieLog. This is a planned milestone and will be announced via the app changelog.

---

## 8. Contact

Questions about this policy? Email [support@tielog.app](mailto:support@tielog.app)

---

_TieLog is committed to a zero-knowledge architecture. Privacy is not an afterthought — it is the product._
