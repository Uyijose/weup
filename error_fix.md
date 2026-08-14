Yes. The notification system itself is working — your manual Supabase notification proved that:

**Supabase INSERT → Realtime → NotificationProvider → notificationsStore → UI**

The problem is now specifically **backend like → notification creation**.

## 1. What is causing the like notification problem?

There are **two problems in the current backend code**.

### Problem 1 — `notifications.service.js` is using the wrong Supabase client

You currently have:

**`backend/src/lib/supabase.js`**

```js
import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);
```

But your notification service imports this:

```js
import { supabase } from "../../lib/supabase.js";
```

That means notification creation is using the **anon key**.

Your backend authentication middleware correctly uses:

```js
SUPABASE_SERVICE_ROLE_KEY
```

For server-side notification creation, we should use a server/admin Supabase client with the service-role key.

This is especially important if RLS is enabled on `notifications`.

---

### Problem 2 — Your duplicate check prevents a future like notification

You currently have this inside `createNotification()`:

```js
.eq("recipient_id", recipientId)
.eq("actor_id", actorId)
.eq("type", type)
.eq("reference_id", referenceId)
.eq("reference_type", referenceType)
```

For example:

Utejoe likes Uyi Joe's post:

```text
utejoe
↓
likes
↓
Uyi Joe's post
↓
notification
```

That notification remains in the database.

If Utejoe unlikes and then likes again, your code sees the **old notification** and returns it instead of creating a new notification.

So this duplicate strategy is not appropriate for likes.

---

# 2. Fix the Supabase client first

## File to CREATE

Create:

```text
backend/src/lib/supabaseAdmin.js
```

### Git Bash command

From your project root:

```bash
touch backend/src/lib/supabaseAdmin.js
```

Put this entire code inside it:

```js
import { createClient } from "@supabase/supabase-js";

export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log(
  "[SUPABASE ADMIN] Initialized:",
  !!process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

---

# 3. Change the notification service to use the admin client

## File

```text
backend/src/services/notifications/notifications.service.js
```

### OLD CODE

At the very top you currently have:

```js
import { supabase } from "../../lib/supabase.js";
```

### REPLACE WITH

```js
import { supabaseAdmin } from "../../lib/supabaseAdmin.js";
```

---

# 4. Replace `createNotification()`

There is another important change here.

Your current duplicate-checking system is too aggressive for likes.

### OLD CODE

Replace your **entire `createNotification()` function**, from:

```js
export async function createNotification({
```

through its closing:

```js
  return data;
}
```

with this:

```js
export async function createNotification({
  recipientId,
  actorId = null,
  type,
  title,
  body,
  referenceId = null,
  referenceType = null,
}) {
  console.log(
    "[NOTIFICATION] CREATE REQUEST",
    {
      recipientId,
      actorId,
      type,
      title,
      referenceId,
      referenceType,
    }
  );

  if (!recipientId) {
    throw new Error("Notification recipient is required");
  }

  if (!type) {
    throw new Error("Notification type is required");
  }

  if (!title) {
    throw new Error("Notification title is required");
  }

  if (!body) {
    throw new Error("Notification body is required");
  }

  const { data, error } = await supabaseAdmin
    .from("notifications")
    .insert({
      recipient_id: recipientId,
      actor_id: actorId,
      type,
      title,
      body,
      reference_id: referenceId,
      reference_type: referenceType,
      read: false,
    })
    .select()
    .single();

  if (error) {
    console.error(
      "[NOTIFICATION] CREATE ERROR",
      error
    );

    throw error;
  }

  console.log(
    "[NOTIFICATION] CREATED SUCCESSFULLY",
    data
  );

  return data;
}
```

### Why are we removing the duplicate check?

Because your database already prevents duplicate **likes** through the likes relationship.

The notification should represent an event.

For example:

```text
Like
→ notification

Unlike
→ no notification

Like again
→ new notification
```

We don't want the first notification to permanently block future legitimate likes.

For comments, each comment should also be capable of generating its own notification.

---

# 5. Change all notification database operations to `supabaseAdmin`

Because we changed the import from:

```js
supabase
```

to:

```js
supabaseAdmin
```

you must change the remaining notification-service references.

## File

```text
backend/src/services/notifications/notifications.service.js
```

Use Find & Replace.

### OLD

```js
supabase
```

### NEW

```js
supabaseAdmin
```

So for example:

### OLD

```js
const { data, error } = await supabase
  .from("notifications")
```

### NEW

```js
const { data, error } = await supabaseAdmin
  .from("notifications")
```

Do this **only in `notifications.service.js`**.

Do not globally replace `supabase` throughout your entire backend.

---

# 6. Add logs to the like route

Now we want to know exactly how far the like notification process gets.

## File

```text
backend/src/routes/likes/likes.routes.js
```

Find this section:

```js
if (post_id) {
```

### Replace the entire current block

From:

```js
if (post_id) {
```

through the matching closing `}` immediately before:

```js
return res.json({
  liked: true,
});
```

with:

```js
if (post_id) {
  console.log(
    "[LIKES] LIKE CREATED - STARTING NOTIFICATION",
    {
      postId: post_id,
      actorId: req.user.id,
    }
  );

  const { data: post, error: postError } =
    await supabase
      .from("posts")
      .select("id,user_id")
      .eq("id", post_id)
      .single();

  console.log(
    "[LIKES] POST OWNER RESULT",
    {
      post,
      error: postError,
    }
  );

  if (postError) {
    console.error(
      "[LIKES] FAILED TO FETCH POST OWNER",
      postError
    );
  } else if (!post?.user_id) {
    console.log(
      "[LIKES] POST OWNER NOT FOUND",
      {
        postId: post_id,
      }
    );
  } else if (post.user_id === req.user.id) {
    console.log(
      "[LIKES] USER LIKED THEIR OWN POST - NO NOTIFICATION"
    );
  } else {
    console.log(
      "[LIKES] NOTIFICATION RECIPIENT",
      {
        recipientId: post.user_id,
        actorId: req.user.id,
      }
    );

    let actorName = "Someone";

    const { data: actor, error: actorError } =
      await supabase
        .from("users")
        .select("username,full_name")
        .eq("id", req.user.id)
        .maybeSingle();

    console.log(
      "[LIKES] ACTOR RESULT",
      {
        actor,
        error: actorError,
      }
    );

    actorName =
      actor?.full_name ||
      actor?.username ||
      "Someone";

    console.log(
      "[LIKES] CREATING LIKE NOTIFICATION",
      {
        recipientId: post.user_id,
        actorId: req.user.id,
        postId: post.id,
        actorName,
      }
    );

    try {
      const notification =
        await createLikeNotification({
          recipientId: post.user_id,
          actorId: req.user.id,
          postId: post.id,
          actorName,
        });

      console.log(
        "[LIKES] LIKE NOTIFICATION CREATED",
        notification
      );
    } catch (notificationError) {
      console.error(
        "[LIKES] NOTIFICATION ERROR",
        notificationError
      );
    }
  }
}
```

This is important because now the backend terminal will tell us exactly where it stops.

---

# 7. One more important thing: verify your post owner

Your notification recipient is:

```js
post.user_id
```

So if:

```text
Utejoe likes Uyi Joe's post
```

the database must have:

```text
posts.user_id = Uyi Joe's UUID
```

In your case:

```text
Utejoe
0e1e0b54-90d0-4a79-b9bd-efb20365b18c
```

```text
Uyi Joe
fcf55afc-038f-4a77-a658-5a42214cc646
```

Run this in Supabase SQL Editor for the post you're testing:

```sql
SELECT
  id,
  user_id
FROM public.posts
WHERE id = 'YOUR_POST_ID';
```

You should see:

```text
user_id
fcf55afc-038f-4a77-a658-5a42214cc646
```

If it shows Utejoe's ID instead, then the backend is correctly notifying the **owner recorded in the post**, not necessarily the person you're expecting.

---

# 8. Your `notifications.routes.js` does NOT need changing

This is already fine:

```text
backend/src/routes/notifications/notifications.routes.js
```

Don't change it.

---

# 9. Your Expo notification files do NOT need changing

These are already working:

```text
frontend-expo/stores/notificationsStore.ts
frontend-expo/services/notifications.service.ts
```

Your realtime system has already proven that it receives a row inserted into:

```text
public.notifications
```

So the frontend is not the current problem.

The pipeline is currently:

```text
LIKE BUTTON
    ↓
likesStore
    ↓
POST /api/likes/toggle
    ↓
likes.routes.js
    ↓
createLikeNotification()
    ↓
notifications.service.js
    ↓
public.notifications
    ↓
Supabase Realtime
    ↓
Expo NotificationProvider
    ↓
notificationsStore
```

We need to fix the section in bold:

```text
likes.routes.js
       ↓
createLikeNotification()
       ↓
notifications.service.js
       ↓
public.notifications
```

---

# 10. Restart the backend

After making these changes, restart your backend.

If you're running it manually:

```bash
cd backend
npm run dev
```

If it's already running, stop it with:

```text
Ctrl + C
```

then:

```bash
npm run dev
```

If your backend is deployed on Render, commit and push:

```bash
git add backend/src/lib/supabaseAdmin.js
git add backend/src/services/notifications/notifications.service.js
git add backend/src/routes/likes/likes.routes.js
git commit -m "fix like notifications"
git push
```

Then wait for the Render deployment to finish.

---

# 11. Test it correctly

Use **two accounts**.

### Account A — Uyi Joe

```text
fcf55afc-038f-4a77-a658-5a42214cc646
```

Keep Uyi Joe's Expo app open.

Make sure the global notification provider is running.

You should already see:

```text
[NOTIFICATION PROVIDER] Subscribing...
[REALTIME NOTIFICATIONS] Status: SUBSCRIBED
```

### Account B — Utejoe

```text
0e1e0b54-90d0-4a79-b9bd-efb20365b18c
```

Use Utejoe to like a post **owned by Uyi Joe**.

---

# 12. What you should see in the backend terminal

When Utejoe likes Uyi Joe's post, you should see something similar to:

```text
[LIKES] LIKE CREATED - STARTING NOTIFICATION {
  postId: "...",
  actorId: "0e1e0b54-90d0-4a77-bd..."
}
```

Then:

```text
[LIKES] POST OWNER RESULT {
  post: {
    id: "...",
    user_id: "fcf55afc-038f-4a77-a658-5a42214cc646"
  }
}
```

Then:

```text
[LIKES] NOTIFICATION RECIPIENT {
  recipientId: "fcf55afc-038f-4a77-a658-5a42214cc646",
  actorId: "0e1e0b54-90d0-4a79-b9bd-efb20365b18c"
}
```

Then:

```text
[LIKES] CREATING LIKE NOTIFICATION
```

Then:

```text
[NOTIFICATION] CREATE REQUEST
```

Then:

```text
[NOTIFICATION] CREATED SUCCESSFULLY
```

And finally on Uyi Joe's Expo terminal:

```text
[REALTIME NOTIFICATIONS] New notification:
```

with:

```json
{
  "type": "like",
  "recipient_id": "fcf55afc-038f-4a77-a658-5a42214cc646",
  "actor_id": "0e1e0b54-90d0-4a79-b9bd-efb20365b18c"
}
```

Then the notification should appear immediately.

---

## 13. If it still doesn't work

The **most important terminal log** will be the first one that fails.

For example, if you get:

```text
[LIKES] FAILED TO FETCH POST OWNER
```

then the problem is the post lookup.

If you get:

```text
[LIKES] CREATING LIKE NOTIFICATION
```

but then:

```text
[NOTIFICATION] CREATE ERROR
```

then we know the problem is specifically the notification database operation.

If you get:

```text
[NOTIFICATION] CREATED SUCCESSFULLY
```

but Expo doesn't show it, then the backend is fixed and we move to the realtime subscription.

### One thing I would check immediately

After liking, run:

```sql
SELECT
  id,
  recipient_id,
  actor_id,
  type,
  title,
  body,
  reference_id,
  reference_type,
  read,
  created_at
FROM public.notifications
ORDER BY created_at DESC
LIMIT 10;
```

If the like notification appears there, **do not change the backend again**. At that point the problem is between the database INSERT and Expo realtime.

If it doesn't appear there, the new backend logs will tell us exactly why.



