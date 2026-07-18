# SocietyHub — Demo Walkthrough

Every login below is password **`password123`**. To switch persona: **Profile tab → Sign out → Log in** as the next email. (Or use the account switcher — double-tap the Profile tab — to add several at once and flip between them.)

The three "kinds of account":
- **Student** — the normal app: a feed, explore, events, interactions.
- **Society** — a committee member switches *into* their society (whole app becomes it) to post & manage.
- **Union** — the students'-union console: oversight for the whole university.

---

## 1. Student — `student@demo.io` (Sam)
The everyday experience.

- **Home** — a feed of posts/events/polls from Sam's societies. **Like** a post (heart), **comment** (opens the bottom sheet — drag it up, @mention someone, reply to a comment). **Vote** in a poll, then tap another option to **change your vote**.
- **Bell (top-right)** — Sam has unread notifications. Open the inbox; tap one to jump to the thing it's about.
- **Explore** — Featured (Tech Society), "For You", Trending, and all societies. **Join** an OPEN society instantly. Try joining **Manchester Debate Union** (approval-required) → you get a **"Pending"** state (a committee member has to approve you). Try **Film Society** (verified-students-only).
- **Events** — your upcoming events; RSVP.
- **Profile** — your identity, **Campus Points + badges** (earned from joining/RSVPing/voting), your societies, perks you've unlocked.

---

## 2. Society account — `president@demo.io` (Priya) or `committee@demo.io` (Cam)
Runs **Manchester Sikh Society**. This shows the **society account flow**.

- On **Profile**, tap your name at the top (or the "Switch to a society account" row) → the **account switcher** slides up → pick **Manchester Sikh Society**. The **whole app becomes the society** (brand-tinted, a "MANAGING" bar at the top).
- **Society Home** — the society's own posts; a composer to **create a Post / Event / Poll**.
- **Insights** — honest engagement: members, RSVPs, poll turnout, most-attended event.
- **Members** — the roster **plus pending join requests at the top**: **Approve / Reject** the two people waiting to join.
- **Profile (society)** — the Instagram-style society page: edit profile, manage **perks**, view-as-public, a grid of posts.
- Switch back: tap the "MANAGING" bar (or double-tap the Profile tab) → pick your personal account.

> `committee@demo.io` has the same posting/approval powers; `president@demo.io` additionally is the owner. Both are good to compare.

---

## 3. Union console — `union@demo.io` (Uma)
This is the **"union thing"**: the **student union's oversight tool for the whole university** — what a union pays for. A union buys SocietyHub and this is where they run every society under them.

- Profile → **Union Admin console** row → the console takes over (clearly labelled "University of Manchester · Students' Union").
- **Dashboard** — university-wide stats (students, verified %, societies, requests) + "needs your review" cards.
- **Societies** — the approval queue. **Manchester Chess Society is PENDING** — **Approve** it (it then goes live for students). You can also **Feature** an approved society → it jumps to the top of every student's Explore. *(This is the paid lever: unions promote their societies.)*
- **Requests** — students asking for **committee roles**. Two are pending — **Approve/Reject**; approving promotes them in their society.
- **Settings** — university-wide rules (require approval to create societies, default join policy, etc.).

---

## 4. Founder — `founder@demo.io` (Fin)
Shows the **"I started a society, now what"** flow.

- Fin is president of **Manchester Chess Society**, which is **PENDING union approval**. He sees it in a pending state and can't fully operate it until Uma approves it (step 3). Log in as Uma, approve it, then back as Fin — it's live.

---

## Full flow, end-to-end (the impressive loop)
1. **Sam** joins Debate Union → **Pending**.
2. **Priya/Cam** (society account) → Members → **Approve** Sam.
3. **Sam** now sees Debate Union content in the feed; **comments** on a post; **@mentions** Priya.
4. **Priya** gets a **notification** (comment + mention).
5. **Sam** requests a **committee role**; **Uma** (union) sees it in **Requests** → **Approves** → Sam is promoted.
6. **Fin** creates a new society → it lands **Pending** → **Uma** approves/features it → it appears (featured) in **Sam's Explore**.

That loop touches student ↔ society ↔ union — the whole three-sided platform.

---

### Notes
- Demo emails are for local/demo only. All other seeded members are `filler01..12@demo.io` (also `password123`).
- Push notifications (device pings) need a development build; the in-app bell/badge/inbox work in Expo Go now.
