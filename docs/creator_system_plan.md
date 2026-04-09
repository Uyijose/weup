# Creator System Plan

## Role Structure Recommendation

Add a column to users table:

```sql
is_creator boolean default false
```

Or scalable option using role text:

```sql
role text default 'user'
```

Possible roles:
- user
- creator
- admin
- super_admin (ignore for now)

---

# Creator Capabilities

## Account & Profile Control

1. Edit profile information (name, bio, avatar)
2. Set display preferences (public/private posts)
3. Block users disturbing them
4. Manage notifications (on/off for comments, new subscribers, earnings)

## Video & Content Control

5. Create and upload posts/videos
6. Edit or delete their own posts/videos
7. Set video metadata (title, description, tags)
8. Set monetization options (ads enabled/disabled)
9. Schedule posts for later publication
10. Pin featured videos on profile

## Analytics & Insights

11. See total views per video and total views overall
12. Track subscriber count
13. Track engagement (likes, comments, shares)
14. Track earnings (e.g., credits earned)
15. View video performance trends

## Monetization & Payments

16. Request payout or checkout at month-end
17. Track payout history
18. See estimated earnings in real-time
19. Apply promo codes or discounts to their content (optional future feature)

## Community Interaction

20. Moderate comments on their own posts (delete, block, hide)
21. Respond to subscriber messages/comments
22. Create custom posts for subscribers only (optional tiered content)

## Security & Safety

23. Report users disturbing them
24. Enable 2FA for account security
25. Track account login history

---

# Recommended Creator Structure

/creator\
- dashboard.jsx (overview: earnings, subscribers, recent posts)
- posts.jsx (create, edit, delete posts)
- earnings.jsx (view earnings, request payouts)
- subscribers.jsx (view list of subscribers)
- settings.jsx (profile settings, privacy, security)

---

# Suggested Creator Tables

### creators (optional separate table)
```sql
id serial primary key
user_id uuid references users(id)
description
earnings numeric default 0
verified boolean default false
created_at timestamp
updated_at timestamp
```

### creator_posts
```sql
id serial primary key
creator_id uuid references users(id)
title text
description text
media_url text
tags text[]
views integer default 0
likes integer default 0
comments integer default 0
monetization boolean default true
created_at timestamp
updated_at timestamp
```

### creator_payouts
```sql
id serial primary key
creator_id uuid references users(id)
amount numeric
status text default 'pending' -- pending, approved, rejected
requested_at timestamp
processed_at timestamp
```

---

# Security Rule for Creators

Always validate creator role in backend:

```javascript
if (user.role !== "creator") {
  return res.status(403).json({ error: "Unauthorized" })
}
```

---

# Analytics/Logs Table (Recommended)

Store creator actions:

```sql
creator_id
action
target_id (optional: post_id, user_id)
timestamp
```

---

This plan covers everything a creator can do, from content creation to earnings, analytics, and security.

