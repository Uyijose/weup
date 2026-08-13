Yes. **That is exactly the next stage.** You have already proven that the notification infrastructure works independently. Now we need to connect the actual user actions to `createNotification()`.

Your current backend already has authenticated like/comment routes, and the notification service exists. For example, your likes route currently inserts the like and returns immediately; it does not yet call the notification service.  Likewise, your comments route creates the comment but currently stops there. 

I would do this in **two stages**:

1. **First:** move the realtime listener to the authenticated app level.
2. **Second:** connect **Like → Comment → Subscribe → Message** to the notification service.

Don't change pagination or retention yet. They are not necessary for getting the core system working.

---

# 1. Final architecture

You want this:

```text
                    AUTHENTICATED EXPO APP
                             │
                             ▼
                   NotificationProvider
                             │
              ┌──────────────┴──────────────┐
              ▼                             ▼
       loadNotifications()          Realtime subscription
       loadUnreadCount()                    │
              │                             │
              └──────────────┬──────────────┘
                             ▼
                    notificationsStore
                             ▲
                             │
                    Supabase notifications
                             ▲
                             │
                     Backend services
                             ▲
          ┌──────────────────┼──────────────────┐
          │                  │                  │
        LIKE              COMMENT          SUBSCRIBE
          │                  │                  │
          └──────────────────┼──────────────────┘
                             │
                          MESSAGE
```

Your existing Expo structure already has `app/_layout.tsx`, `context`, `services`, `stores`, etc., so we can fit this into what you already have. 

---

# 2. Phase 5.8.26–5.8.28: Global notification listener

You currently have the realtime listener being used by the notifications screen. **We should move ownership of the listener to `AuthProvider`**, because your existing `AuthProvider` already knows when the user logs in/logs out. Your existing provider calls `hydrateAuth()` and `listenToAuthChanges()`. 

This is cleaner than creating another authentication provider.

## Create this file

```text
frontend-expo/context/NotificationProvider.tsx
```

### Git Bash

From the `frontend-expo` directory:

```bash
mkdir -p context
touch context/NotificationProvider.tsx
```

---

# 3. `NotificationProvider.tsx`

Put this complete code inside:

```tsx
import React, {
  ReactNode,
  useEffect,
  useRef,
} from "react";

import { useAuthStore } from "../stores/authStore";
import { useNotificationsStore } from "../stores/notificationsStore";
import {
  subscribeToNotifications,
} from "../utils/realtimeNotifications";

interface Props {
  children: ReactNode;
}

export default function NotificationProvider({
  children,
}: Props) {
  const user = useAuthStore((state) => state.user);
  const loading = useAuthStore((state) => state.loading);

  const loadNotifications =
    useNotificationsStore(
      (state) => state.loadNotifications
    );

  const loadUnreadCount =
    useNotificationsStore(
      (state) => state.loadUnreadCount
    );

  const unsubscribeRef = useRef<
    (() => void) | null
  >(null);

  useEffect(() => {
    // Do nothing while auth is still loading.
    if (loading) {
      return;
    }

    // Clean up any previous subscription.
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // User logged out.
    if (!user?.id) {
      return;
    }

    console.log(
      "[NOTIFICATION PROVIDER] Initializing for:",
      user.id
    );

    let active = true;

    const initialize = async () => {
      try {
        /*
         * Load existing notifications first.
         */
        await Promise.all([
          loadNotifications(),
          loadUnreadCount(),
        ]);

        if (!active) {
          return;
        }

        /*
         * Then subscribe to future notifications.
         */
        console.log(
          "[NOTIFICATION PROVIDER] Subscribing..."
        );

        unsubscribeRef.current =
          subscribeToNotifications(user.id);
      } catch (error) {
        console.log(
          "[NOTIFICATION PROVIDER] Initialization error:",
          error
        );
      }
    };

    initialize();

    return () => {
      active = false;

      if (unsubscribeRef.current) {
        console.log(
          "[NOTIFICATION PROVIDER] Cleaning up subscription"
        );

        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [
    user?.id,
    loading,
    loadNotifications,
    loadUnreadCount,
  ]);

  return <>{children}</>;
}
```

---

# 4. Edit `AuthProvider.tsx`

Your existing provider is already handling authentication. Don't duplicate that logic.

Open:

```text
frontend-expo/context/AuthProvider.tsx
```

Add:

```tsx
import NotificationProvider from "./NotificationProvider";
```

Then replace the current:

```tsx
return <>{children}</>;
```

with:

```tsx
return (
  <NotificationProvider>
    {children}
  </NotificationProvider>
);
```

So the end becomes:

```tsx
return (
  <NotificationProvider>
    {children}
  </NotificationProvider>
);
```

That's all.

This means:

```text
AuthProvider
   ↓
NotificationProvider
   ↓
Expo application
```

When the authenticated user changes, the notification provider changes with them.

---

# 5. IMPORTANT: remove the notification-screen realtime subscription

This is important.

You **do not want**:

```text
NotificationProvider
        ↓
Realtime subscription #1

Notifications screen
        ↓
Realtime subscription #2
```

because then one notification could be received twice.

Your previous logs showed the subscription being created when the notification screen opened:

```text
[REALTIME NOTIFICATIONS] Subscribing for user...
[REALTIME NOTIFICATIONS] Status: SUBSCRIBED
```

That should now happen at the authenticated-app level.

Open:

```text
frontend-expo/app/notifications/index.tsx
```

Find the `useEffect` that calls:

```tsx
subscribeToNotifications(...)
```

and **remove that realtime subscription effect entirely**.

The notification screen should only:

```text
load existing notifications
display them
mark them read
```

It should **not own realtime** anymore.

---

# 6. Your `realtimeNotifications.ts`

You already have this file:

```text
frontend-expo/utils/realtimeNotifications.ts
```

Keep it.

It should essentially look like:

```tsx
import { supabase } from "../lib/supabase";
import { useNotificationsStore } from "../stores/notificationsStore";

export function subscribeToNotifications(
  userId: string
) {
  console.log(
    "[REALTIME NOTIFICATIONS] Subscribing for user:",
    userId
  );

  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "notifications",
        filter: `recipient_id=eq.${userId}`,
      },
      (payload) => {
        console.log(
          "[REALTIME NOTIFICATIONS] New notification:",
          payload.new
        );

        useNotificationsStore
          .getState()
          .addNotification(payload.new as any);
      }
    )
    .subscribe((status) => {
      console.log(
        "[REALTIME NOTIFICATIONS] Status:",
        status
      );
    });

  return () => {
    console.log(
      "[REALTIME NOTIFICATIONS] Unsubscribing:",
      userId
    );

    supabase.removeChannel(channel);
  };
}
```

The key thing is that it returns:

```tsx
return () => {
  supabase.removeChannel(channel);
};
```

so the provider can clean it up.

---

# 7. Now the important part: Like → Notification

Your current likes route is:

```text
backend/src/routes/likes/likes.routes.js
```

It currently does:

```text
check existing like
      ↓
if exists → unlike
      ↓
otherwise insert like
      ↓
return liked:true
```

Your existing route is authenticated with `requireAuth`. 

We need:

```text
like succeeds
     ↓
get post owner
     ↓
createLikeNotification()
     ↓
return response
```

---

# 8. Edit `likes.routes.js`

Open:

```text
backend/src/routes/likes/likes.routes.js
```

### Current import

You currently have:

```js
import express from "express";
import { supabase } from "../../services/supabase.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
```

Replace it with:

```js
import express from "express";
import { supabase } from "../../services/supabase.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  createLikeNotification,
} from "../../services/notifications/notifications.service.js";
```

---

# 9. Replace the successful like section

Currently you have:

```js
await supabase.from("likes").insert({
  user_id: req.user.id,
  post_id: post_id || null,
  video_part_id: video_part_id || null,
});

res.json({ liked: true });
```

Replace it with:

```js
const { error: likeError } = await supabase
  .from("likes")
  .insert({
    user_id: req.user.id,
    post_id: post_id || null,
    video_part_id: video_part_id || null,
  });

if (likeError) {
  console.error(
    "[LIKES] INSERT ERROR",
    likeError
  );

  return res.status(400).json({
    error: likeError.message,
  });
}

/*
 * Only create a notification for post likes.
 */
if (post_id) {
  const { data: post, error: postError } =
    await supabase
      .from("posts")
      .select("id,user_id")
      .eq("id", post_id)
      .single();

  if (postError) {
    console.error(
      "[LIKES] FAILED TO FETCH POST OWNER",
      postError
    );
  } else if (post?.user_id) {
    let actorName = "Someone";

    const { data: actor } = await supabase
      .from("users")
      .select("username,full_name")
      .eq("id", req.user.id)
      .maybeSingle();

    actorName =
      actor?.full_name ||
      actor?.username ||
      "Someone";

    try {
      await createLikeNotification({
        recipientId: post.user_id,
        actorId: req.user.id,
        postId: post.id,
        actorName,
      });
    } catch (notificationError) {
      /*
       * Do not make a successful like fail
       * just because notification creation failed.
       */
      console.error(
        "[LIKES] NOTIFICATION ERROR",
        notificationError
      );
    }
  }
}

return res.json({
  liked: true,
});
```

This is deliberately done **after the like succeeds**.

---

# 10. Why this is safe for duplicate likes

Your current route already checks:

```js
.eq("user_id", req.user.id)
.eq(column, value)
.maybeSingle();
```

before inserting. 

Therefore:

```text
First like
→ insert like
→ notification

Second request while already liked
→ delete like
→ NO notification
```

That's exactly what Phase 5.8.14 wants.

---

# 11. Comment → Notification

Your current comment endpoint inserts:

```js
const { data, error } = await supabase
  .from("comments")
  .insert({
    post_id: post_id || null,
    video_part_id: video_part_id || null,
    user_id: req.user.id,
    comment,
    image_url,
  })
```

and returns the comment. 

We need to notify the owner after the insert succeeds.

---

## Edit imports

At the top of:

```text
backend/src/routes/comments/comments.routes.js
```

change:

```js
import express from "express";
import { supabase } from "../../services/supabase.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
```

to:

```js
import express from "express";
import { supabase } from "../../services/supabase.service.js";
import { requireAuth } from "../../middleware/auth.middleware.js";
import {
  createCommentNotification,
} from "../../services/notifications/notifications.service.js";
```

---

# 12. Add comment notification

Find:

```js
if (error) return res.status(400).json({ error: error.message });

res.json(data);
```

inside the `POST /` route.

Replace that portion with:

```js
if (error) {
  return res.status(400).json({
    error: error.message,
  });
}

/*
 * Notify the post owner.
 */
if (post_id && data?.user_id) {
  const { data: post, error: postError } =
    await supabase
      .from("posts")
      .select("id,user_id")
      .eq("id", post_id)
      .single();

  if (postError) {
    console.error(
      "[COMMENTS] FAILED TO FETCH POST OWNER",
      postError
    );
  } else if (post?.user_id) {
    const { data: actor } = await supabase
      .from("users")
      .select("username,full_name")
      .eq("id", req.user.id)
      .maybeSingle();

    const actorName =
      actor?.full_name ||
      actor?.username ||
      "Someone";

    try {
      await createCommentNotification({
        recipientId: post.user_id,
        actorId: req.user.id,
        postId: post.id,
        actorName,
      });
    } catch (notificationError) {
      console.error(
        "[COMMENTS] NOTIFICATION ERROR",
        notificationError
      );
    }
  }
}

return res.json(data);
```

Your existing notification service already prevents self-notifications:

```js
if (recipientId === actorId) {
  return null;
}
```

so a user commenting on their own post won't generate a notification.

---

# 13. Subscribe → Notification

Your subscription implementation is slightly different from likes/comments.

Your Expo creator page currently uses:

```text
usersStore.toggleSubscription()
```

and the subscription data is stored in:

```text
subscriptions
```

with:

```text
subscriber_id
creator_id
```

as you've already established. 

This means we need to find the **actual `toggleSubscription()` implementation** before changing it.

### Don't add notification code directly to `creator/[id].tsx`.

That's important.

The notification must be created by the backend, not by:

```text
Expo → Supabase insert → notification
```

because a malicious client could manufacture notifications.

The correct flow is:

```text
Expo
 ↓
usersStore.toggleSubscription()
 ↓
backend subscription endpoint
 ↓
subscription succeeds
 ↓
createFollowNotification()
```

Your plan calls this "follow", but because WeUp actually calls the relationship **subscription**, I'd keep the database notification type as:

```text
follow
```

while the UI can say:

```text
John subscribed to you.
```

or:

```text
John followed you.
```

depending on the product wording you want.

---

# 14. Message → Notification

Same principle.

Don't create a notification from:

```text
frontend-expo/app/chat/[id].tsx
```

The backend should create it after the message is successfully inserted.

The flow becomes:

```text
User A sends message
        ↓
messaging API
        ↓
message inserted
        ↓
identify recipients
        ↓
createMessageNotification()
        ↓
notifications
        ↓
Realtime
        ↓
User B sees badge
```

### One important consideration

For messaging, we should **not create a notification every time the conversation list is opened**.

Only:

```text
actual new message
```

should generate:

```text
message notification
```

And the sender should not receive one.

---

# 15. System notifications

You already have:

```js
createSystemNotification()
```

So this is already covered.

For example:

```js
await createSystemNotification({
  recipientId: userId,
  title: "Welcome to WeUp",
  body: "Your WeUp account is ready.",
});
```

No actor is needed.

---

# 16. Fix the GET notifications response

Your original plan says:

```json
{
  "notifications": [],
  "unreadCount": 0
}
```

but your current route returns only:

```json
{
  "notifications": []
}
```

Since your Expo app already separately calls:

```text
/api/notifications/unread-count
```

it **works**, but I recommend leaving the two endpoints separate for now.

Don't make an unnecessary API change.

You already have:

```text
GET /api/notifications
GET /api/notifications/unread-count
```

and your Expo service is using both.

---

# 17. One improvement to your notification service

Your current:

```js
markNotificationAsRead()
```

uses:

```js
.select()
.single()
```

If the notification ID doesn't belong to the authenticated user, `.single()` can throw.

That's not necessarily wrong, but your route currently converts that into:

```text
500 Failed to mark notification as read
```

when it should ideally be:

```text
404 Notification not found
```

We can clean that up after the core integrations are working.

---

# 18. Supabase: check Realtime once

You've already proven Realtime works, so **do not recreate the table**.

Your notification table already has the correct structure.

Make sure `notifications` is included in Supabase Realtime publication.

Run this in Supabase SQL Editor if you haven't already:

```sql
ALTER PUBLICATION supabase_realtime
ADD TABLE public.notifications;
```

If Supabase says the table is already in the publication, **that's fine**. Don't change anything.

Your successful realtime test already strongly indicates this is configured correctly.

---

# 19. Add a uniqueness protection for subscriptions

Because subscriptions should logically be unique, I'd also add this to Supabase:

```sql
ALTER TABLE public.subscriptions
ADD CONSTRAINT subscriptions_subscriber_creator_unique
UNIQUE (subscriber_id, creator_id);
```

**Only run this if that constraint doesn't already exist.**

You can check:

```sql
SELECT
  conname
FROM pg_constraint
WHERE conrelid = 'public.subscriptions'::regclass;
```

This is important because:

```text
User A → Subscribe to User B
```

shouldn't be able to create:

```text
row 1: A → B
row 2: A → B
row 3: A → B
```

That also makes notification duplication easier to control.

---

# 20. Git Bash commands

You don't need to recreate files that already exist.

For the **new global provider**:

From `frontend-expo`:

```bash
mkdir -p context
touch context/NotificationProvider.tsx
```

For the backend notification service directory, if it already exists, this does no harm:

```bash
mkdir -p backend/src/services/notifications
```

For checking your files:

```bash
find frontend-expo -path "*notification*" -type f
```

and:

```bash
find backend/src -path "*notification*" -type f
```

You should end up with approximately:

```text
frontend-expo/
├── app/
│   ├── _layout.tsx
│   └── notifications/
│       └── index.tsx
│
├── components/
│   └── notifications/
│       └── NotificationItem.tsx
│
├── context/
│   ├── AuthProvider.tsx
│   └── NotificationProvider.tsx
│
├── services/
│   └── notifications.service.ts
│
├── stores/
│   └── notificationsStore.ts
│
├── types/
│   └── notification.ts
│
└── utils/
    └── realtimeNotifications.ts
```

and:

```text
backend/
└── src/
    ├── middleware/
    │   └── auth.middleware.js
    │
    ├── routes/
    │   ├── comments/
    │   │   └── comments.routes.js
    │   ├── likes/
    │   │   └── likes.routes.js
    │   ├── messaging/
    │   │   └── messaging.routes.js
    │   └── notifications/
    │       └── notifications.routes.js
    │
    └── services/
        └── notifications/
            └── notifications.service.js
```

---

# 21. Restart the backend

After editing the backend:

```bash
cd backend
pnpm dev
```

If it's already running under nodemon, it should restart automatically.

Then start Expo:

```bash
cd ../frontend-expo
npx expo start -c
```

The `-c` clears the Metro cache, which is useful after adding the provider.

---

# 22. Test 1 — global realtime

This is the first test.

**Do NOT open `/notifications`.**

Stay on:

```text
Home
```

or:

```text
Creator profile
```

Then insert a test notification from Supabase:

```sql
INSERT INTO public.notifications (
  recipient_id,
  actor_id,
  type,
  title,
  body,
  read
)
VALUES (
  'fcf55afc-038f-4a77-a658-5a42214cc646',
  '0e1e0b54-90d0-4a79-b9bd-efb20365b18c',
  'system',
  'Global realtime test',
  'This notification was received outside the notification screen.',
  false
);
```

You should see:

```text
[NOTIFICATION PROVIDER] Initializing for: fcf...
[NOTIFICATION PROVIDER] Subscribing...
[REALTIME NOTIFICATIONS] Status: SUBSCRIBED
```

Then:

```text
[REALTIME NOTIFICATIONS] New notification: {...}
```

**without visiting `/notifications`.**

That proves Phase 5.8.26 is complete.

---

# 23. Test 2 — Like notification

This is the important one.

Use two accounts:

```text
Account A = Uyi Joe
Account B = utejoe
```

Suppose Uyi Joe owns a post.

Log in as:

```text
utejoe
```

Like Uyi Joe's post.

Then Uyi Joe should receive:

```text
New like

utejoe liked your video.
```

And the database should contain:

```text
type            = like
actor_id        = utejoe
recipient_id    = Uyi Joe
reference_type  = post
reference_id    = post ID
read            = false
```

You should see the notification arrive **even while Uyi Joe is on Home**.

---

# 24. Test 3 — Unlike

utejoe:

```text
Like
```

→ Uyi gets notification.

Then:

```text
Unlike
```

→ **no notification should be generated.**

Then:

```text
Like again
```

→ a new like notification can be generated.

That's correct because the second like is a new like event.

---

# 25. Test 4 — Comment

utejoe comments on Uyi Joe's post:

```text
utejoe commented on your video.
```

Uyi Joe receives it immediately.

Check:

```sql
SELECT
  type,
  actor_id,
  recipient_id,
  reference_id,
  reference_type,
  body,
  read
FROM public.notifications
ORDER BY created_at DESC
LIMIT 10;
```

You should see:

```text
comment
```

with:

```text
reference_type = post
```

---

# 26. Test 5 — Self-comment

Uyi Joe comments on **his own** post.

Expected:

```text
Comment created ✅
Notification created ❌
```

Same for likes:

```text
Self-like → no notification
```

This is important.

---

# 27. Test 6 — Subscribe

Use:

```text
utejoe
```

Subscribe to:

```text
Uyi Joe
```

Expected Uyi Joe:

```text
New follower

utejoe followed you.
```

Database:

```text
type = follow
actor_id = utejoe
recipient_id = Uyi Joe
reference_type = user
reference_id = Uyi Joe's ID
```

---

# 28. Test 7 — Message

utejoe sends Uyi Joe a message.

Expected:

```text
New message

utejoe sent you a message.
```

with:

```text
type = message
reference_type = conversation
reference_id = conversation ID
```

Then Uyi Joe replies.

**utejoe** should get the notification.

The sender should not get their own message notification.

---

# 29. One thing I would NOT implement yet

Don't implement:

```text
90-day deletion
```

or:

```text
cursor pagination
```

yet.

Your current:

```text
limit=50
```

is completely adequate for the first working version.

First make this chain 100% reliable:

```text
LIKE
COMMENT
SUBSCRIBE
MESSAGE
   ↓
notifications table
   ↓
Realtime
   ↓
global NotificationProvider
   ↓
Zustand
   ↓
badge
   ↓
notification screen
   ↓
mark read
```

Once those four events work, the notification system is genuinely integrated rather than just having a notification UI.

### One remaining piece

I **wouldn't give you a guessed code replacement for the subscription and messaging routes yet**. The files you provided/search results establish that the Expo subscription action goes through `usersStore.toggleSubscription()` and that messaging uses `messagesStore`, but we need the **actual current implementations** of those backend endpoints before inserting notification calls. Guessing those routes could break your existing messaging/subscription logic.

For likes and comments, however, we have the actual route code and the notification integration above is ready to apply.  
