Yes. The **realtime system itself is working**. Your test notification proves:

```text
Supabase INSERT
→ Realtime
→ NotificationProvider
→ notificationsStore
→ UI
```

The problem is specifically in how **likes/comments create the database notification**.

## 1. What is causing the problem?

### Comment — definite bug

Your `comments.routes.js` currently tries to create the notification inside:

```js
router.get("/")
```

That is the **GET comments** endpoint.

Worse, this condition is wrong:

```js
if (post_id && data?.user_id)
```

because `data` from:

```js
const { data, error } = await supabase
  .from("comments")
  ...
```

is an **array of comments**, not a single comment.

So:

```js
data?.user_id
```

will be `undefined`.

Therefore the notification code never runs.

The notification must be created in:

```text
POST /api/comments
```

**after the comment has successfully been inserted.**

---

### Like

Your like notification code is in the correct general location: after a successful like insertion.

However, we need to add logging around every step so we can see exactly where it fails.

---

# 2. Fix comments first

## File

```text
backend/src/routes/comments/comments.routes.js
```

### DELETE this entire block from `router.get("/")`

Find:

```js
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
```

**Delete it completely.**

Your `GET /api/comments` should only fetch comments.

---

# 3. Add the comment notification to POST

Still in:

```text
backend/src/routes/comments/comments.routes.js
```

Find this existing code:

```js
if (error) return res.status(400).json({ error: error.message });

res.json(data);
```

### Replace it with:

```js
if (error) {
  console.error(
    "[COMMENTS] INSERT ERROR",
    error
  );

  return res.status(400).json({
    error: error.message,
  });
}

console.log(
  "[COMMENTS] COMMENT CREATED",
  {
    commentId: data.id,
    postId: data.post_id,
    actorId: req.user.id,
  }
);

if (data.post_id) {
  console.log(
    "[COMMENTS] FETCHING POST OWNER",
    data.post_id
  );

  const { data: post, error: postError } =
    await supabase
      .from("posts")
      .select("id,user_id")
      .eq("id", data.post_id)
      .single();

  if (postError) {
    console.error(
      "[COMMENTS] FAILED TO FETCH POST OWNER",
      postError
    );
  } else {
    console.log(
      "[COMMENTS] POST OWNER FOUND",
      post
    );

    if (post?.user_id) {
      const { data: actor, error: actorError } =
        await supabase
          .from("users")
          .select("username,full_name")
          .eq("id", req.user.id)
          .maybeSingle();

      if (actorError) {
        console.error(
          "[COMMENTS] FAILED TO FETCH ACTOR",
          actorError
        );
      }

      const actorName =
        actor?.full_name ||
        actor?.username ||
        "Someone";

      console.log(
        "[COMMENTS] CREATING NOTIFICATION",
        {
          recipientId: post.user_id,
          actorId: req.user.id,
          postId: post.id,
          actorName,
        }
      );

      try {
        const notification =
          await createCommentNotification({
            recipientId: post.user_id,
            actorId: req.user.id,
            postId: post.id,
            actorName,
          });

        console.log(
          "[COMMENTS] NOTIFICATION CREATED",
          notification
        );
      } catch (notificationError) {
        console.error(
          "[COMMENTS] NOTIFICATION ERROR",
          notificationError
        );
      }
    } else {
      console.log(
        "[COMMENTS] POST HAS NO OWNER",
        post
      );
    }
  }
}

return res.json(data);
```

### Important

This goes **inside `router.post("/")`**, immediately after:

```js
if (error) {
   ...
}
```

and before:

```js
return res.json(data);
```

---

# 4. Your corrected comments route structure

After the changes, the important structure should be:

```text
GET /api/comments
    ↓
Fetch comments
    ↓
Return comments


POST /api/comments
    ↓
Insert comment
    ↓
Find post owner
    ↓
Find actor name
    ↓
createCommentNotification()
    ↓
notifications table
    ↓
Supabase Realtime
    ↓
Expo
```

That is the correct flow.

---

# 5. Fix/test likes

Your likes implementation is structurally correct.

But let's add logging so we can see exactly what happens.

## File

```text
backend/src/routes/likes/likes.routes.js
```

Find:

```js
const { error: likeError } = await supabase
  .from("likes")
  .insert({
    user_id: req.user.id,
    post_id: post_id || null,
    video_part_id: video_part_id || null,
  });
```

Replace it with:

```js
console.log(
  "[LIKES] CREATING LIKE",
  {
    actorId: req.user.id,
    postId: post_id,
    videoPartId: video_part_id,
  }
);

const { error: likeError } = await supabase
  .from("likes")
  .insert({
    user_id: req.user.id,
    post_id: post_id || null,
    video_part_id: video_part_id || null,
  });
```

Then find:

```js
if (likeError) {
  console.error(
    "[LIKES] INSERT ERROR",
    likeError
  );

  return res.status(400).json({
    error: likeError.message,
  });
}
```

Replace it with:

```js
if (likeError) {
  console.error(
    "[LIKES] INSERT ERROR",
    likeError
  );

  return res.status(400).json({
    error: likeError.message,
  });
}

console.log(
  "[LIKES] LIKE CREATED",
  {
    actorId: req.user.id,
    postId: post_id,
    videoPartId: video_part_id,
  }
);
```

---

# 6. Replace the like notification block

Now find this entire block:

```js
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
```

### Replace it with:

```js
if (post_id) {
  console.log(
    "[LIKES] FETCHING POST OWNER",
    post_id
  );

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
  } else {
    console.log(
      "[LIKES] POST OWNER FOUND",
      post
    );

    if (post?.user_id) {
      const { data: actor, error: actorError } =
        await supabase
          .from("users")
          .select("username,full_name")
          .eq("id", req.user.id)
          .maybeSingle();

      if (actorError) {
        console.error(
          "[LIKES] FAILED TO FETCH ACTOR",
          actorError
        );
      }

      const actorName =
        actor?.full_name ||
        actor?.username ||
        "Someone";

      console.log(
        "[LIKES] CREATING NOTIFICATION",
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
          "[LIKES] NOTIFICATION CREATED",
          notification
        );
      } catch (notificationError) {
        console.error(
          "[LIKES] NOTIFICATION ERROR",
          notificationError
        );
      }
    } else {
      console.log(
        "[LIKES] POST HAS NO OWNER",
        post
      );
    }
  }
}
```

I deliberately removed the comments from the code as requested and replaced them with `console.log()` diagnostics.

---

# 7. One more important issue: your comment GET route

Your current:

```js
router.get("/", async (req, res) => {
```

does **not** use:

```js
requireAuth
```

but your code doesn't actually need authentication just to read public comments.

That's fine if comments are intentionally public.

The important thing is that the notification creation **must not be there**.

---

# 8. Check the notification service

Your current:

```text
backend/src/services/notifications/notifications.service.js
```

already has:

```js
export async function createCommentNotification({
  recipientId,
  actorId,
  postId,
  actorName = "Someone",
})
```

and:

```js
return createNotification({
  recipientId,
  actorId,
  type: "comment",
  title: "New comment",
  body: `${actorName} commented on your video.`,
  referenceId: postId,
  referenceType: "post",
});
```

So **do not change that part**.

Likewise, your:

```js
createLikeNotification()
```

is already correct.

---

# 9. Restart the backend

After saving the changes, restart your backend.

From Git Bash, depending on how you normally start it:

```bash
cd backend
npm run dev
```

If the backend is already running with nodemon, it should restart automatically.

---

# 10. Test LIKE

You need **two users**.

For example:

```text
Uyi Joe
    owns Post A

Utejoe
    likes Post A
```

Make sure Uyi Joe is **not** the person liking the post.

When Utejoe likes Uyi Joe's post, backend should show:

```text
[LIKES] CREATING LIKE
```

then:

```text
[LIKES] LIKE CREATED
```

then:

```text
[LIKES] FETCHING POST OWNER
```

then:

```text
[LIKES] POST OWNER FOUND
```

then:

```text
[LIKES] CREATING NOTIFICATION
```

then:

```text
[LIKES] NOTIFICATION CREATED
```

And on Uyi Joe's Expo terminal:

```text
[REALTIME NOTIFICATIONS] New notification:
```

You should then see something like:

```json
{
  "type": "like",
  "title": "New like",
  "body": "utejoe liked your video."
}
```

---

# 11. Test COMMENT

Again:

```text
Uyi Joe
    owns Post A

Utejoe
    comments on Post A
```

When Utejoe submits the comment, backend should show:

```text
[COMMENTS] COMMENT CREATED
```

then:

```text
[COMMENTS] FETCHING POST OWNER
```

then:

```text
[COMMENTS] POST OWNER FOUND
```

then:

```text
[COMMENTS] CREATING NOTIFICATION
```

then:

```text
[COMMENTS] NOTIFICATION CREATED
```

And Uyi Joe should immediately receive:

```text
[REALTIME NOTIFICATIONS] New notification:
```

with:

```json
{
  "type": "comment",
  "title": "New comment",
  "reference_type": "post"
}
```

---

# 12. If it still doesn't work

The logs will tell us exactly where.

### If you see:

```text
[LIKES] LIKE CREATED
```

but **not**:

```text
[LIKES] FETCHING POST OWNER
```

then `post_id` isn't being sent.

---

### If you see:

```text
[LIKES] FAILED TO FETCH POST OWNER
```

then we have a `posts` table/ownership problem.

Send me that exact error.

---

### If you see:

```text
[LIKES] CREATING NOTIFICATION
```

but then:

```text
[LIKES] NOTIFICATION ERROR
```

then the notification service/database is the problem.

Send me that exact error.

---

### If you see:

```text
[LIKES] NOTIFICATION CREATED
```

but Uyi Joe doesn't get realtime:

Then the **backend notification creation works**, and we'd investigate Supabase Realtime/RLS/subscription.

But you've already proven realtime works with your system notification, so this would be much easier to isolate.

---

### For comments, your previous implementation would never reliably work

Because this:

```js
data?.user_id
```

was checking for `user_id` on the **array returned by GET comments**.

Moving the notification logic to the successful `POST /api/comments` operation fixes the fundamental problem.

---

## Your final flow

After these changes, you should have:

```text
                 USER ACTION
                     │
          ┌──────────┼──────────┐
          ↓          ↓          ↓
        LIKE      COMMENT     MESSAGE
          │          │          │
          ↓          ↓          ↓
      Backend     Backend     Backend
          │          │          │
          └──────────┼──────────┘
                     ↓
          createNotification()
                     ↓
             Supabase table
                     ↓
             Supabase Realtime
                     ↓
          NotificationProvider
                     ↓
          notificationsStore
                     ↓
             unreadCount +1
                     ↓
              🔔 Badge
```

So **yes, we're now at the stage of connecting every user action to the notification service**. Likes and comments are the first two to fix; after you test these logs, we can connect **subscriptions/follows and messages** using exactly the same pattern without disturbing the working realtime system.
