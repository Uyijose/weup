Yes. **This is the right point to start implementing Phase 5.8**, but I would **not connect likes/comments/follows/messages yet**.

First, we should build the notification foundation:

1. Supabase `notifications` table
2. RLS policies
3. Backend notification service
4. Backend notification routes
5. Register the routes in `app.js`
6. Expo notification service
7. Expo notification store
8. Test that notifications can be fetched/read
9. Then, in the next phase, connect likes/comments/follows/messages so the backend automatically creates notifications.

That keeps us from mixing several moving parts at once.

---

# Phase 5.8.1 — Notification Foundation

## 1. Files we will create

### Backend

Create:

```text
backend/
└── src/
    ├── routes/
    │   └── notifications/
    │       └── notifications.routes.js
    │
    └── services/
        └── notifications/
            └── notifications.service.js
```

Assuming your backend root is the project containing:

```text
src/
package.json
server.js
```

### Expo

Create:

```text
frontend-expo/
├── services/
│   └── notifications.service.ts
│
├── stores/
│   └── notificationsStore.ts
│
└── types/
    └── notification.ts
```

We are **not creating the notification screen yet**.

We first make sure the data flow works.

---

# 2. Supabase — create the database table

Go to:

**Supabase Dashboard → Your Project → SQL Editor → New query**

Run this:

```sql
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null,
  actor_id uuid,
  type text not null,
  title text not null,
  body text not null,
  reference_id text,
  reference_type text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_recipient_id_idx
on public.notifications (recipient_id);

create index if not exists notifications_recipient_created_at_idx
on public.notifications (recipient_id, created_at desc);

create index if not exists notifications_recipient_read_idx
on public.notifications (recipient_id, read);

alter table public.notifications enable row level security;

create policy "Users can view their own notifications"
on public.notifications
for select
to authenticated
using (recipient_id = auth.uid());

create policy "Users can update their own notifications"
on public.notifications
for update
to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());
```

### Important

I intentionally **did not create an INSERT policy** for authenticated users.

The Expo client should not be able to do:

```text
INSERT notification
```

for arbitrary users.

The backend will eventually create notifications.

---

# 3. Verify the Supabase table

In Supabase:

**Table Editor → notifications**

You should see:

```text
id
recipient_id
actor_id
type
title
body
reference_id
reference_type
read
created_at
```

You can also run:

```sql
select *
from public.notifications
order by created_at desc;
```

It should return an empty result initially.

That's correct.

---

# 4. Enable Supabase Realtime

For the realtime portion later, we want the `notifications` table included in the realtime publication.

Run this in Supabase SQL Editor:

```sql
alter publication supabase_realtime
add table public.notifications;
```

If Supabase tells you the table is already part of the publication, **do not run it again**.

You can also check:

**Supabase → Database → Publications → supabase_realtime**

and confirm `notifications` is listed.

We won't use realtime in the Expo code yet. That's Phase 5.8.4.

---

# 5. Backend notification service

## File to create

```text
src/services/notifications/notifications.service.js
```

From your backend root, Git Bash:

```bash
mkdir -p src/services/notifications
touch src/services/notifications/notifications.service.js
```

Put this complete code inside it:

```javascript
const { supabase } = require("../../lib/supabase");

async function createNotification({
  recipientId,
  actorId = null,
  type,
  title,
  body,
  referenceId = null,
  referenceType = null,
}) {
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

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      recipient_id: recipientId,
      actor_id: actorId,
      type,
      title,
      body,
      reference_id: referenceId,
      reference_type: referenceType,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function getNotifications(userId, limit = 50) {
  const safeLimit = Math.min(
    Math.max(Number(limit) || 50, 1),
    100
  );

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("recipient_id", userId)
    .order("created_at", {
      ascending: false,
    })
    .limit(safeLimit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

async function getUnreadNotificationCount(userId) {
  const { count, error } = await supabase
    .from("notifications")
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("recipient_id", userId)
    .eq("read", false);

  if (error) {
    throw error;
  }

  return count ?? 0;
}

async function markNotificationAsRead(
  notificationId,
  userId
) {
  const { data, error } = await supabase
    .from("notifications")
    .update({
      read: true,
    })
    .eq("id", notificationId)
    .eq("recipient_id", userId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

async function markAllNotificationsAsRead(userId) {
  const { data, error } = await supabase
    .from("notifications")
    .update({
      read: true,
    })
    .eq("recipient_id", userId)
    .eq("read", false)
    .select();

  if (error) {
    throw error;
  }

  return data ?? [];
}

module.exports = {
  createNotification,
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
```

### One thing to verify

Your existing:

```text
src/lib/supabase.js
```

must export the Supabase client as:

```javascript
supabase
```

For example:

```javascript
module.exports = {
  supabase,
};
```

If your existing file exports it differently, **don't change it yet**. Send me that file and I will adapt this service to your existing export.

---

# 6. Backend notification routes

## Create directory/file

From backend root:

```bash
mkdir -p src/routes/notifications
touch src/routes/notifications/notifications.routes.js
```

Put this in:

```text
src/routes/notifications/notifications.routes.js
```

```javascript
const express = require("express");

const {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} = require("../../services/notifications/notifications.service");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const notifications = await getNotifications(
      userId,
      req.query.limit
    );

    return res.json({
      notifications,
    });
  } catch (error) {
    console.error(
      "[NOTIFICATIONS] FETCH ERROR",
      error
    );

    return res.status(500).json({
      error: "Failed to fetch notifications",
    });
  }
});

router.get("/unread-count", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const unreadCount =
      await getUnreadNotificationCount(userId);

    return res.json({
      unreadCount,
    });
  } catch (error) {
    console.error(
      "[NOTIFICATIONS] UNREAD COUNT ERROR",
      error
    );

    return res.status(500).json({
      error: "Failed to fetch unread notification count",
    });
  }
});

router.patch("/:id/read", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const notification =
      await markNotificationAsRead(
        req.params.id,
        userId
      );

    return res.json({
      notification,
    });
  } catch (error) {
    console.error(
      "[NOTIFICATIONS] MARK READ ERROR",
      error
    );

    return res.status(500).json({
      error: "Failed to mark notification as read",
    });
  }
});

router.patch("/read-all", async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const notifications =
      await markAllNotificationsAsRead(userId);

    return res.json({
      notifications,
    });
  } catch (error) {
    console.error(
      "[NOTIFICATIONS] MARK ALL READ ERROR",
      error
    );

    return res.status(500).json({
      error: "Failed to mark notifications as read",
    });
  }
});

module.exports = router;
```

---

# 7. Register the notification route

Now we need to edit:

```text
src/app.js
```

I don't want you to blindly replace the entire `app.js`, because your existing middleware/order is important.

Find the section where you import routes.

You should have things similar to:

```javascript
const commentsRoutes = require("./routes/comments/comments.routes");
const likesRoutes = require("./routes/likes/likes.routes");
const messagingRoutes = require("./routes/messaging/messaging.routes");
```

### Add this directly after those route imports:

```javascript
const notificationsRoutes = require("./routes/notifications/notifications.routes");
```

Then find where routes are registered.

You should have something similar to:

```javascript
app.use("/api/comments", commentsRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/messaging", messagingRoutes);
```

### Add directly after the messaging route:

```javascript
app.use("/api/notifications", notificationsRoutes);
```

So the result should look approximately like:

```javascript
app.use("/api/comments", commentsRoutes);
app.use("/api/likes", likesRoutes);
app.use("/api/messaging", messagingRoutes);
app.use("/api/notifications", notificationsRoutes);
```

### Important

Your actual route paths may differ.

If you send me your current `src/app.js`, I can give you the **exact old code → exact new code replacement** instead of making you locate it manually.

---

# 8. Authentication middleware

There is one important requirement here.

The notification routes use:

```javascript
req.user?.id
```

Therefore:

```text
auth.middleware.js
```

must run before the notification routes.

If your existing messaging routes already work with:

```javascript
req.user.id
```

then we can use the same pattern.

For example, if your current app does:

```javascript
app.use("/api/messaging", authMiddleware, messagingRoutes);
```

then notification should use the same approach:

```javascript
app.use(
  "/api/notifications",
  authMiddleware,
  notificationsRoutes
);
```

**Do not add another authentication implementation.**

Because I haven't seen your actual `src/app.js` and `src/middleware/auth.middleware.js`, this is the one part I don't want you guessing on.

---

# 9. Expo notification type

Now go to:

```text
frontend-expo/
```

Create:

```text
types/notification.ts
```

Git Bash:

```bash
touch types/notification.ts
```

Complete code:

```typescript
export type NotificationType =
  | "like"
  | "comment"
  | "follow"
  | "message"
  | "system";

export type Notification = {
  id: string;
  recipient_id: string;
  actor_id?: string | null;
  type: NotificationType | string;
  title: string;
  body: string;
  reference_id?: string | null;
  reference_type?: string | null;
  read: boolean;
  created_at: string;
};
```

---

# 10. Expo notification service

Create:

```text
frontend-expo/services/notifications.service.ts
```

Git Bash:

```bash
touch services/notifications.service.ts
```

Complete code:

```typescript
import { getAuthToken } from "../utils/getAuthToken";
import type {
  Notification,
} from "../types/notification";

const API_BASE =
  process.env.EXPO_PUBLIC_BACKEND_URL;

async function authHeaders() {
  const token = await getAuthToken();

  if (!token) {
    throw new Error("No auth session");
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function requestJson(
  url: string,
  options?: RequestInit
) {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options?.headers ?? {}),
      ...(await authHeaders()),
    },
  });

  const data = await response.json();

  if (!response.ok) {
    return {
      ...data,
      error:
        data?.error ||
        data?.message ||
        `Request failed with status ${response.status}`,
    };
  }

  return data;
}

export async function fetchNotifications(
  limit = 50
): Promise<{
  notifications?: Notification[];
  error?: string;
}> {
  if (!API_BASE) {
    return {
      notifications: [],
      error: "Backend URL is not configured",
    };
  }

  const url =
    `${API_BASE}/api/notifications?limit=${limit}`;

  console.log(
    "[NOTIFICATIONS SERVICE] FETCH:",
    url
  );

  return requestJson(url);
}

export async function fetchUnreadNotificationCount(): Promise<{
  unreadCount?: number;
  error?: string;
}> {
  if (!API_BASE) {
    return {
      unreadCount: 0,
      error: "Backend URL is not configured",
    };
  }

  const url =
    `${API_BASE}/api/notifications/unread-count`;

  console.log(
    "[NOTIFICATIONS SERVICE] UNREAD COUNT:",
    url
  );

  return requestJson(url);
}

export async function markNotificationAsRead(
  notificationId: string
): Promise<{
  notification?: Notification;
  error?: string;
}> {
  if (!API_BASE) {
    return {
      error: "Backend URL is not configured",
    };
  }

  const url =
    `${API_BASE}/api/notifications/${notificationId}/read`;

  return requestJson(url, {
    method: "PATCH",
  });
}

export async function markAllNotificationsAsRead(): Promise<{
  notifications?: Notification[];
  error?: string;
}> {
  if (!API_BASE) {
    return {
      notifications: [],
      error: "Backend URL is not configured",
    };
  }

  const url =
    `${API_BASE}/api/notifications/read-all`;

  return requestJson(url, {
    method: "PATCH",
  });
}
```

This deliberately follows the same architecture as your existing:

```text
services/messaging.service.ts
```

---

# 11. Expo notifications Zustand store

Create:

```text
frontend-expo/stores/notificationsStore.ts
```

Git Bash:

```bash
touch stores/notificationsStore.ts
```

Complete code:

```typescript
import { create } from "zustand";

import {
  fetchNotifications,
  fetchUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../services/notifications.service";

import type {
  Notification,
} from "../types/notification";

type NotificationsState = {
  notifications: Notification[];
  unreadCount: number;
  loading: boolean;
  error: string | null;

  loadNotifications: () => Promise<void>;
  loadUnreadCount: () => Promise<void>;
  markAsRead: (
    notificationId: string
  ) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  addNotification: (
    notification: Notification
  ) => void;
};

export const useNotificationsStore =
  create<NotificationsState>((set) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
    error: null,

    loadNotifications: async () => {
      try {
        set({
          loading: true,
          error: null,
        });

        const response =
          await fetchNotifications();

        if (response.error) {
          set({
            loading: false,
            error: response.error,
          });
          return;
        }

        set({
          notifications:
            response.notifications ?? [],
          loading: false,
          error: null,
        });
      } catch (error) {
        console.log(
          "[NOTIFICATIONS STORE] LOAD ERROR",
          error
        );

        set({
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to load notifications",
        });
      }
    },

    loadUnreadCount: async () => {
      try {
        const response =
          await fetchUnreadNotificationCount();

        if (response.error) {
          set({
            error: response.error,
          });
          return;
        }

        set({
          unreadCount:
            response.unreadCount ?? 0,
          error: null,
        });
      } catch (error) {
        console.log(
          "[NOTIFICATIONS STORE] UNREAD COUNT ERROR",
          error
        );

        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to load unread notification count",
        });
      }
    },

    markAsRead: async (notificationId) => {
      try {
        const response =
          await markNotificationAsRead(
            notificationId
          );

        if (response.error) {
          set({
            error: response.error,
          });
          return;
        }

        set((state) => ({
          notifications:
            state.notifications.map(
              (notification) =>
                notification.id ===
                notificationId
                  ? {
                      ...notification,
                      read: true,
                    }
                  : notification
            ),
          unreadCount:
            state.notifications.find(
              (notification) =>
                notification.id ===
                notificationId
            )?.read
              ? state.unreadCount
              : Math.max(
                  state.unreadCount - 1,
                  0
                ),
          error: null,
        }));
      } catch (error) {
        console.log(
          "[NOTIFICATIONS STORE] MARK READ ERROR",
          error
        );

        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to mark notification as read",
        });
      }
    },

    markAllAsRead: async () => {
      try {
        const response =
          await markAllNotificationsAsRead();

        if (response.error) {
          set({
            error: response.error,
          });
          return;
        }

        set((state) => ({
          notifications:
            state.notifications.map(
              (notification) => ({
                ...notification,
                read: true,
              })
            ),
          unreadCount: 0,
          error: null,
        }));
      } catch (error) {
        console.log(
          "[NOTIFICATIONS STORE] MARK ALL READ ERROR",
          error
        );

        set({
          error:
            error instanceof Error
              ? error.message
              : "Failed to mark notifications as read",
        });
      }
    },

    addNotification: (notification) => {
      set((state) => {
        const exists =
          state.notifications.some(
            (item) =>
              item.id === notification.id
          );

        if (exists) {
          return state;
        }

        return {
          notifications: [
            notification,
            ...state.notifications,
          ],
          unreadCount: notification.read
            ? state.unreadCount
            : state.unreadCount + 1,
        };
      });
    },
  }));
```

---

# 12. Important: Zustand import

Notice this:

```typescript
import { create } from "zustand";
```

This is important because you just had the exact same problem in `messagesStore.ts`:

```text
Cannot find name 'create'
```

Your `messagesStore.ts` was missing the Zustand import.

Your notification store already has it.

For your existing `messagesStore.ts`, add this as the **first import**:

```typescript
import { create } from "zustand";
```

So the top should become:

```typescript
import { create } from "zustand";

import {
  createConversation as createConversationApi,
  fetchConversations,
  fetchMessages,
  sendMessage as sendMessageApi,
} from "../services/messaging.service";
```

That should also eliminate the chain of:

```text
set implicitly has any
get implicitly has any
members implicitly has any
conversation implicitly has any
...
```

because TypeScript will finally know that:

```typescript
create<MessagesState>
```

is a Zustand store creator.

---

# 13. Backend testing before touching the Expo UI

This is important.

**Don't create the notification screen yet.**

First prove:

```text
Supabase
↓
Backend
↓
API
↓
Expo service
```

works.

---

# 14. Create a test notification manually

Because we deliberately don't allow client INSERTs, use Supabase SQL Editor for the first test.

First get your own authenticated user's ID.

You can get it from:

**Supabase → Authentication → Users**

Copy your user's UUID.

Then run:

```sql
insert into public.notifications (
  recipient_id,
  actor_id,
  type,
  title,
  body,
  reference_id,
  reference_type
)
values (
  'YOUR_USER_ID',
  null,
  'system',
  'Welcome to WeUp',
  'Your notification system is working.',
  null,
  null
);
```

Replace:

```text
YOUR_USER_ID
```

with the actual UUID.

---

# 15. Start the backend

From your backend project:

```bash
npm run dev
```

or whatever command your existing `package.json` uses.

If you aren't sure, run:

```bash
npm run
```

and look for the development/start script.

---

# 16. Test the API

You should eventually have:

```text
GET /api/notifications
```

and:

```text
GET /api/notifications/unread-count
```

and:

```text
PATCH /api/notifications/:id/read
```

and:

```text
PATCH /api/notifications/read-all
```

The important one to test first is:

```text
GET /api/notifications
```

You need an authenticated request containing the same Bearer token that your Expo app uses.

The response should look approximately like:

```json
{
  "notifications": [
    {
      "id": "...",
      "recipient_id": "...",
      "actor_id": null,
      "type": "system",
      "title": "Welcome to WeUp",
      "body": "Your notification system is working.",
      "reference_id": null,
      "reference_type": null,
      "read": false,
      "created_at": "..."
    }
  ]
}
```

---

# 17. Test unread count

Call:

```text
GET /api/notifications/unread-count
```

You should receive:

```json
{
  "unreadCount": 1
}
```

Then mark the notification as read:

```text
PATCH /api/notifications/NOTIFICATION_ID/read
```

Then call:

```text
GET /api/notifications/unread-count
```

It should now return:

```json
{
  "unreadCount": 0
}
```

---

# 18. Test mark-all-read

Create two or three test notifications:

```sql
insert into public.notifications (
  recipient_id,
  type,
  title,
  body
)
values
(
  'YOUR_USER_ID',
  'system',
  'Test notification 1',
  'Testing notifications.'
),
(
  'YOUR_USER_ID',
  'system',
  'Test notification 2',
  'Testing unread notifications.'
);
```

Then:

```text
GET /api/notifications/unread-count
```

should give something like:

```json
{
  "unreadCount": 2
}
```

Call:

```text
PATCH /api/notifications/read-all
```

Then call unread count again.

It should be:

```json
{
  "unreadCount": 0
}
```

---

# 19. Test from Expo

Once the backend endpoints work, your Expo store can be tested from any existing screen temporarily.

For example, temporarily add:

```typescript
import { useEffect } from "react";
import { useNotificationsStore } from "../stores/notificationsStore";
```

Then inside a component:

```typescript
const loadNotifications =
  useNotificationsStore(
    (state) => state.loadNotifications
  );

const loadUnreadCount =
  useNotificationsStore(
    (state) => state.loadUnreadCount
  );

useEffect(() => {
  loadNotifications();
  loadUnreadCount();
}, []);
```

And:

```typescript
const notifications =
  useNotificationsStore(
    (state) => state.notifications
  );

const unreadCount =
  useNotificationsStore(
    (state) => state.unreadCount
  );

console.log(
  "[TEST NOTIFICATIONS]",
  notifications
);

console.log(
  "[TEST UNREAD COUNT]",
  unreadCount
);
```

If you see your manually-created notification in the console, then:

```text
Supabase
   ↓
Backend
   ↓
notifications.service
   ↓
Expo notifications.service
   ↓
notificationsStore
```

is working.

---

# 20. What we are deliberately NOT doing yet

Don't modify these yet:

```text
src/routes/likes/likes.routes.js
src/routes/comments/comments.routes.js
src/routes/messaging/messaging.routes.js
```

And don't modify the follow/subscription logic yet.

We first establish the notification infrastructure.

After that, **Phase 5.8.2** should connect the actual events.

The eventual architecture will be:

```text
LIKE
User A
   ↓
likes route
   ↓
like succeeds
   ↓
createNotification()
   ↓
notifications table
   ↓
User B gets notification
```

For comments:

```text
COMMENT
   ↓
comments route
   ↓
comment succeeds
   ↓
createNotification()
```

For follows/subscriptions:

```text
FOLLOW/SUBSCRIBE
   ↓
follow succeeds
   ↓
createNotification()
```

For messages:

```text
SEND MESSAGE
   ↓
message succeeds
   ↓
createNotification()
```

---

# 21. One thing I need from your backend before event integration

For the **next phase**, I don't want to guess how your backend currently handles these actions.

The important files are:

```text
src/app.js
src/lib/supabase.js
src/middleware/auth.middleware.js
src/routes/likes/likes.routes.js
src/routes/comments/comments.routes.js
src/routes/messaging/messaging.routes.js
```

Especially `app.js`, because I need to see exactly how your existing authentication middleware and routes are registered.

So **for now**, implement the Supabase table + backend notification service/routes + Expo type/service/store above.

Then send me those backend files, especially:

```text
src/app.js
src/lib/supabase.js
src/middleware/auth.middleware.js
```

and I can give you the **exact old-code → new-code replacements** for registering the notification API without disturbing your existing messaging/likes/comments system.

### Final implementation sequence

```text
PHASE 5.8.1
Notification database
        ↓
Notification backend service
        ↓
Notification API
        ↓
Expo notification service
        ↓
Expo Zustand store
        ↓
TEST
        ↓
PHASE 5.8.2
Connect likes
        ↓
Connect comments
        ↓
Connect follows/subscriptions
        ↓
Connect messages
        ↓
PHASE 5.8.3
Notifications screen
        ↓
PHASE 5.8.4
Realtime notifications
        ↓
PHASE 5.8.5
AppHeader notification badge
        ↓
PHASE 5.8.6
Notification navigation
        ↓
PHASE 5.8.7
Push notifications
```

**Don't move to the next phase until the manual `system` notification can successfully travel from Supabase → backend → Expo store.** That gives us a clean checkpoint before we start modifying the existing like/comment/message functionality.
