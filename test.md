Yes. At this point, **5.8.18–5.8.25 should be implemented together**, because realtime, the notification screen, the item component, and the header badge depend on each other.

There is also one important correction before we proceed:

> Your backend notification routes currently read `req.user?.id`, but your `app.js` does **not** apply `requireAuth` to `/api/notifications`.

That explains the `401 Unauthorized` you previously got when testing the endpoint without authentication, and we should fix that properly rather than weakening the route.

Below is the implementation in the exact **Git Bash → file → code → test** format.

---

# Phase 5.8.18–5.8.25 — Complete Notification Frontend Implementation

## Final files involved

### Create

```text
frontend-expo/utils/realtimeNotifications.ts
frontend-expo/app/notifications/index.tsx
frontend-expo/components/notifications/NotificationItem.tsx
frontend-expo/styles/notifications/notifications.styles.ts
```

### Edit

```text
frontend-expo/components/layout/AppHeader.tsx
```

We should also make one small backend correction:

```text
backend/src/app.js
```

---

# 1. First fix the backend authentication

Your current:

```text
backend/src/app.js
```

has:

```js
app.use("/api/notifications", notificationsRoutes);
```

But your notification routes expect:

```js
req.user?.id
```

`req.user` only exists after `requireAuth` runs.

## Replace this

```js
app.use("/api/notifications", notificationsRoutes);
```

## With this

```js
app.use(
  "/api/notifications",
  requireAuth,
  notificationsRoutes
);
```

But first you need to import the middleware.

### At the top of `backend/src/app.js`

Add:

```js
import { requireAuth } from "./middleware/auth.middleware.js";
```

So the relevant section becomes:

```js
import messagingRoutes from "./routes/messaging/messaging.routes.js";
import notificationsRoutes from "./routes/notifications/notifications.routes.js";
import { requireAuth } from "./middleware/auth.middleware.js";
```

Then:

```js
app.use(
  "/api/notifications",
  requireAuth,
  notificationsRoutes
);
```

### Important

Do **not** put authentication inside every notification route.

This:

```js
app.use(
  "/api/notifications",
  requireAuth,
  notificationsRoutes
);
```

means all of these automatically require authentication:

```text
GET   /api/notifications
GET   /api/notifications/unread-count
PATCH /api/notifications/:id/read
PATCH /api/notifications/read-all
```

---

# 2. Restart the backend

From your backend folder:

```bash
cd backend
npm run dev
```

or whatever command you normally use to start your backend.

---

# 3. Test authentication properly

Do **not** simply open:

```text
http://localhost:5000/api/notifications/unread-count
```

in your browser anymore.

That request contains no:

```text
Authorization: Bearer <token>
```

So `401` is expected.

Your Expo application already has:

```text
getAuthToken()
```

which we will use.

---

# 4. Create realtime notification utility

From the Expo project root:

```bash
mkdir -p utils
touch utils/realtimeNotifications.ts
```

File:

```text
frontend-expo/utils/realtimeNotifications.ts
```

## Complete code

```ts
import { supabase } from "../lib/supabase";
import { useNotificationsStore } from "../stores/notificationsStore";
import type { Notification } from "../types/notification";

export function subscribeToNotifications(
  userId: string
): () => void {
  if (!userId) {
    console.log(
      "[REALTIME NOTIFICATIONS] No user ID provided"
    );

    return () => {};
  }

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

        const notification =
          payload.new as Notification;

        useNotificationsStore
          .getState()
          .addNotification(notification);
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

---

# 5. Important Supabase step — enable Realtime

This is required.

Go to:

**Supabase Dashboard → Database → Replication**

Find the `notifications` table and make sure it is enabled for Realtime / Postgres Changes.

Depending on the current Supabase dashboard UI, you may see the table under the Realtime publication.

The database publication should contain:

```text
notifications
```

If you prefer SQL, run this in Supabase SQL Editor:

```sql
alter publication supabase_realtime
add table public.notifications;
```

### If you get:

```text
relation "public.notifications" is already member of publication
```

that's fine.

It means Realtime is already enabled.

---

# 6. Check Supabase RLS

Your notification table should have RLS enabled.

Run:

```sql
alter table public.notifications enable row level security;
```

For the Expo Realtime client to receive only the authenticated user's notifications, create a SELECT policy.

```sql
create policy "Users can view their own notifications"
on public.notifications
for select
to authenticated
using (recipient_id = auth.uid());
```

If you already created this policy, **do not create it again**.

You can check in:

```text
Supabase
→ Database
→ Tables
→ notifications
→ RLS Policies
```

You should have a policy equivalent to:

```text
Users can view their own notifications
SELECT
recipient_id = auth.uid()
```

### Important architecture

Your backend uses:

```text
SUPABASE_SERVICE_ROLE_KEY
```

for server-side notification creation.

The Expo application uses:

```text
SUPABASE_ANON_KEY
```

for Realtime.

That is exactly what we want.

---

# 7. Create the notifications screen

Run:

```bash
mkdir -p app/notifications
touch app/notifications/index.tsx
```

File:

```text
frontend-expo/app/notifications/index.tsx
```

## Complete code

```tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, {
  useCallback,
  useEffect,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";

import NotificationItem from "../../components/notifications/NotificationItem";
import { useNotificationsStore } from "../../stores/notificationsStore";
import { styles } from "../../styles/notifications/notifications.styles";
import { subscribeToNotifications } from "../../utils/realtimeNotifications";
import { useAuthStore } from "../../stores/authStore";

export default function NotificationsScreen() {
  const {
    notifications,
    loading,
    error,
    loadNotifications,
    loadUnreadCount,
  } = useNotificationsStore();

  const user = useAuthStore((state) => state.user);

  const loadData = useCallback(async () => {
    await Promise.all([
      loadNotifications(),
      loadUnreadCount(),
    ]);
  }, [
    loadNotifications,
    loadUnreadCount,
  ]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const unsubscribe =
      subscribeToNotifications(user.id);

    return unsubscribe;
  }, [user?.id]);

  const handleNotificationPress = (
    notification: {
      id: string;
      type: string;
      reference_id?: string | null;
      reference_type?: string | null;
      actor_id?: string | null;
    }
  ) => {
    if (
      notification.type === "like" ||
      notification.type === "comment"
    ) {
      if (notification.reference_id) {
        router.push(
          `/posts/${notification.reference_id}`
        );
      }

      return;
    }

    if (notification.type === "follow") {
      if (notification.actor_id) {
        router.push(
          `/user/${notification.actor_id}`
        );
      }

      return;
    }

    if (notification.type === "message") {
      if (notification.reference_id) {
        router.push(
          `/chat/${notification.reference_id}`
        );
      }

      return;
    }

    console.log(
      "[NOTIFICATIONS] No navigation target:",
      notification
    );
  };

  if (loading && notifications.length === 0) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" />

        <Text style={styles.stateText}>
          Loading notifications...
        </Text>
      </View>
    );
  }

  if (error && notifications.length === 0) {
    return (
      <View style={styles.centerState}>
        <Ionicons
          name="alert-circle-outline"
          size={42}
          color="#EDEDED"
        />

        <Text style={styles.stateTitle}>
          Unable to load notifications
        </Text>

        <Text style={styles.stateText}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadData}
        >
          <Text style={styles.retryButtonText}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color="#EDEDED"
          />
        </Pressable>

        <Text style={styles.headerTitle}>
          Notifications
        </Text>

        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <NotificationItem
            notification={item}
            onPress={() =>
              handleNotificationPress(item)
            }
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={loadData}
          />
        }
        contentContainerStyle={
          notifications.length === 0
            ? styles.emptyList
            : styles.list
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color="#777777"
            />

            <Text style={styles.emptyTitle}>
              No notifications yet
            </Text>

            <Text style={styles.emptyText}>
              You'll see likes, comments, follows,
              and messages here.
            </Text>
          </View>
        }
      />
    </View>
  );
}
```

---

# 8. Important: check your AuthStore

I used:

```ts
const user = useAuthStore((state) => state.user);
```

because your existing project already has:

```text
stores/authStore.ts
```

But if your `authStore` calls the authenticated user something different, such as:

```ts
currentUser
```

or:

```ts
profile
```

then that one line must match your actual store.

If your current `authStore.ts` has:

```ts
user
```

leave it exactly as above.

---

# 9. Create NotificationItem

Run:

```bash
mkdir -p components/notifications
touch components/notifications/NotificationItem.tsx
```

File:

```text
frontend-expo/components/notifications/NotificationItem.tsx
```

## Complete code

```tsx
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Pressable,
  Text,
  View,
} from "react-native";

import type { Notification } from "../../types/notification";
import { useNotificationsStore } from "../../stores/notificationsStore";
import { styles } from "../../styles/notifications/notifications.styles";

type Props = {
  notification: Notification;
  onPress: () => void;
};

function getIcon(type: string) {
  switch (type) {
    case "like":
      return "heart";

    case "comment":
      return "chatbubble";

    case "follow":
      return "person-add";

    case "message":
      return "chatbubble-ellipses";

    case "system":
      return "information-circle";

    default:
      return "notifications";
  }
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  const diff =
    Math.max(
      0,
      now.getTime() - date.getTime()
    ) / 1000;

  if (diff < 60) {
    return "Just now";
  }

  if (diff < 3600) {
    return `${Math.floor(diff / 60)}m ago`;
  }

  if (diff < 86400) {
    return `${Math.floor(diff / 3600)}h ago`;
  }

  if (diff < 604800) {
    return `${Math.floor(diff / 86400)}d ago`;
  }

  return date.toLocaleDateString();
}

export default function NotificationItem({
  notification,
  onPress,
}: Props) {
  const markAsRead =
    useNotificationsStore(
      (state) => state.markAsRead
    );

  const handlePress = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.notification,
        !notification.read &&
          styles.notificationUnread,
      ]}
    >
      <View style={styles.avatar}>
        <Ionicons
          name={getIcon(notification.type) as any}
          size={22}
          color="#EDEDED"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>
          {notification.title}
        </Text>

        <Text style={styles.body}>
          {notification.body}
        </Text>

        <Text style={styles.timestamp}>
          {formatTime(
            notification.created_at
          )}
        </Text>
      </View>

      {!notification.read && (
        <View style={styles.unreadDot} />
      )}
    </Pressable>
  );
}
```

---

# 10. Why I'm using an icon instead of avatar for now

Your current backend returns:

```text
actor_id
```

but not:

```text
actor: {
  id,
  username,
  full_name,
  avatar_url
}
```

So we should **not pretend the actor avatar exists yet**.

The icon gives us a working notification UI immediately.

Later we can add actor information to the backend query and replace the icon with:

```text
[John's avatar] John liked your video
```

That will be a separate enhancement.

---

# 11. Create notification styles

Run:

```bash
mkdir -p styles/notifications
touch styles/notifications/notifications.styles.ts
```

File:

```text
frontend-expo/styles/notifications/notifications.styles.ts
```

## Complete code

```ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
  },

  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222222",
  },

  backButton: {
    width: 40,
    alignItems: "flex-start",
    justifyContent: "center",
  },

  headerTitle: {
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "700",
  },

  headerSpacer: {
    width: 40,
  },

  list: {
    paddingBottom: 30,
  },

  notification: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#1C1C1C",
  },

  notificationUnread: {
    backgroundColor: "#101010",
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#222222",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  content: {
    flex: 1,
  },

  title: {
    color: "#EDEDED",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 3,
  },

  body: {
    color: "#B5B5B5",
    fontSize: 14,
    lineHeight: 20,
  },

  timestamp: {
    color: "#707070",
    fontSize: 12,
    marginTop: 5,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#EDEDED",
    marginLeft: 10,
  },

  centerState: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  stateTitle: {
    color: "#EDEDED",
    fontSize: 17,
    fontWeight: "700",
    marginTop: 12,
    textAlign: "center",
  },

  stateText: {
    color: "#888888",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },

  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#222222",
  },

  retryButtonText: {
    color: "#EDEDED",
    fontSize: 14,
    fontWeight: "600",
  },

  emptyList: {
    flexGrow: 1,
  },

  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 35,
  },

  emptyTitle: {
    color: "#EDEDED",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
  },

  emptyText: {
    color: "#777777",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
    marginTop: 8,
  },
});
```

---

# 12. Update AppHeader

Your current:

```text
frontend-expo/components/layout/AppHeader.tsx
```

already has the notification icon.

We need to make it functional and add the unread badge.

## Replace your imports

### Current

```tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { styles } from "../../styles/layout/appHeader.styles";
```

### Replace with

```tsx
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, {
  useEffect,
  useState,
} from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

import { styles } from "../../styles/layout/appHeader.styles";
import { useNotificationsStore } from "../../stores/notificationsStore";
```

---

## Add this inside `AppHeader()`

Immediately after:

```tsx
const [searchQuery, setSearchQuery] =
  useState("");
```

add:

```tsx
const unreadCount =
  useNotificationsStore(
    (state) => state.unreadCount
  );

const loadUnreadCount =
  useNotificationsStore(
    (state) => state.loadUnreadCount
  );

useEffect(() => {
  loadUnreadCount();
}, [loadUnreadCount]);
```

---

# 13. Add notification handler

Inside `AppHeader()` add:

```tsx
const handleOpenNotifications = () => {
  console.log(
    "[HEADER] Opening notifications"
  );

  router.push("/notifications");
};
```

---

# 14. Replace the existing notification button

### Current code

```tsx
<Pressable hitSlop={10}>
  <Ionicons
    name="notifications-outline"
    size={24}
    color="#EDEDED"
  />
</Pressable>
```

### Replace with

```tsx
<Pressable
  onPress={handleOpenNotifications}
  hitSlop={10}
  style={{
    position: "relative",
  }}
>
  <Ionicons
    name="notifications-outline"
    size={24}
    color="#EDEDED"
  />

  {unreadCount > 0 && (
    <View
      style={{
        position: "absolute",
        top: -7,
        right: -9,
        minWidth: 16,
        height: 16,
        borderRadius: 8,
        backgroundColor: "#FF3B30",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 3,
      }}
    >
      <Text
        style={{
          color: "#FFFFFF",
          fontSize: 9,
          fontWeight: "700",
        }}
      >
        {unreadCount > 99
          ? "99+"
          : unreadCount}
      </Text>
    </View>
  )}
</Pressable>
```

This gives you:

```text
🔔
```

when:

```text
unreadCount = 0
```

and:

```text
🔔 3
```

when:

```text
unreadCount = 3
```

and:

```text
🔔 99+
```

when it is above 99.

---

# 15. One improvement to your Zustand store

Your current `addNotification()` is good.

However, because Realtime can sometimes reconnect, we should make sure the same notification isn't added twice.

You already have:

```tsx
const exists =
  state.notifications.some(
    (item) =>
      item.id === notification.id
  );

if (exists) {
  return state;
}
```

**Keep that.**

That protects the UI from duplicate realtime events.

---

# 16. Fix `markAsRead()` carefully

There is a subtle issue in your existing store.

You currently do:

```tsx
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
```

This is actually logically okay because it checks the old state before the mapped update.

So **you don't need to replace it right now.**

---

# 17. But there is one backend improvement

Your current:

```text
markNotificationAsRead()
```

uses:

```js
.select()
.single();
```

If the notification doesn't belong to the user, Supabase can return an error.

That's acceptable, but the API currently turns that into:

```text
500
```

when it would be better as:

```text
404
```

for a notification that doesn't exist for that user.

We can improve this later.

For now, the important security condition is already present:

```js
.eq("id", notificationId)
.eq("recipient_id", userId)
```

So a user cannot mark another user's notification as read.

---

# 18. Check your Expo route

Because you created:

```text
app/notifications/index.tsx
```

Expo Router should automatically create:

```text
/notifications
```

You do **not** need to manually add it to a route registry.

So:

```tsx
router.push("/notifications");
```

should work.

---

# 19. Check your Supabase Realtime setup

Your existing:

```text
frontend-expo/lib/supabase.ts
```

already has:

```ts
realtime: {
  params: {
    eventsPerSecond: 10,
  },
},
```

So **you don't need to change that file**.

Good.

---

# 20. Verify the backend route

Restart backend and use your Expo app while logged in.

The request should now look like:

```text
GET
http://localhost:5000/api/notifications/unread-count
Authorization: Bearer <USER_ACCESS_TOKEN>
```

You should receive:

```json
{
  "unreadCount": 0
}
```

or:

```json
{
  "unreadCount": 3
}
```

instead of:

```json
{
  "error": "Unauthorized"
}
```

---

# 21. How to test with a real notification

The easiest test is to manually insert a notification into Supabase.

First get your logged-in user's UUID.

You can get it from Supabase:

```text
Authentication
→ Users
→ select your user
→ copy User UID
```

Then in Supabase SQL Editor:

```sql
insert into public.notifications (
  recipient_id,
  actor_id,
  type,
  title,
  body,
  reference_id,
  reference_type,
  read
)
values (
  'YOUR_USER_UUID',
  null,
  'system',
  'Test notification',
  'Realtime notifications are working.',
  null,
  null,
  false
);
```

Replace:

```text
YOUR_USER_UUID
```

with the actual UUID.

---

# 22. What should happen

With the Expo app open and logged in:

### Before insert

Header:

```text
🔔
```

Notifications screen:

```text
No notifications yet
```

Then execute the SQL.

You should immediately see the console:

```text
[REALTIME NOTIFICATIONS] New notification:
```

and the notification should appear in the store.

The header should change from:

```text
🔔
```

to:

```text
🔔 1
```

without refreshing the app.

That confirms:

```text
Supabase
   ↓
Realtime
   ↓
realtimeNotifications.ts
   ↓
notificationsStore.addNotification()
   ↓
Header badge
```

is working.

---

# 23. Test mark-as-read

Open:

```text
/notifications
```

You should see:

```text
Test notification

Realtime notifications are working.
```

with an unread indicator.

Tap it.

The app should:

1. Call:

```text
PATCH /api/notifications/{id}/read
```

2. Backend verifies:

```text
recipient_id = authenticated user
```

3. Database changes:

```text
read: false
```

to:

```text
read: true
```

4. Store changes the notification to read.

5. Unread count goes from:

```text
1
```

to:

```text
0
```

6. Header badge disappears.

---

# 24. Test pull-to-refresh

On the notification screen, pull downward.

You should see the refresh indicator.

It will call:

```text
GET /api/notifications
```

and:

```text
GET /api/notifications/unread-count
```

---

# 25. Test realtime cleanup

This is important.

Open the notification screen.

Your console should show:

```text
[REALTIME NOTIFICATIONS] Subscribing for user: ...
```

Leave the screen.

You should see:

```text
[REALTIME NOTIFICATIONS] Unsubscribing: ...
```

That confirms:

```tsx
return unsubscribe;
```

is working.

---

# 26. Test duplicate protection

Insert one notification.

You should get:

```text
1
```

Do not get:

```text
2
```

for the same database row.

The store's:

```tsx
item.id === notification.id
```

check prevents that.

---

# 27. Final notification architecture

After these changes, your project will look like:

```text
backend
└── src
    ├── middleware
    │   └── auth.middleware.js
    │
    ├── routes
    │   └── notifications
    │       └── notifications.routes.js
    │
    └── services
        └── notifications
            └── notifications.service.js
```

And Expo:

```text
frontend-expo
├── app
│   └── notifications
│       └── index.tsx
│
├── components
│   └── notifications
│       └── NotificationItem.tsx
│
├── services
│   └── notifications.service.ts
│
├── stores
│   └── notificationsStore.ts
│
├── styles
│   └── notifications
│       └── notifications.styles.ts
│
├── types
│   └── notification.ts
│
└── utils
    └── realtimeNotifications.ts
```

The overall flow is now:

```text
                  USER ACTION
                      │
          ┌───────────┼───────────┐
          ↓           ↓           ↓
        LIKE       COMMENT      FOLLOW
          │           │           │
          └───────────┼───────────┘
                      ↓
                  BACKEND
                      ↓
          createNotification()
                      ↓
              Supabase DB
                      ↓
            notifications
                      ↓
             Supabase Realtime
                      ↓
      realtimeNotifications.ts
                      ↓
          notificationsStore
             ↙              ↘
      Notification UI      Header
                              ↓
                         🔔 3
```

### One thing I would **not** do yet

Don't add push notifications, Expo Notifications, FCM, APNs, device tokens, etc. yet.

First get this complete loop working:

**database → realtime → store → screen → badge → mark read.**

Once that works, we can move to **Phase 5.8.26+**, including connecting the actual **likes, comments, subscriptions/follows, and messaging backend operations** to `createLikeNotification()`, `createCommentNotification()`, `createFollowNotification()`, and `createMessageNotification()`. That is the point where notifications stop being test records and become a real part of WeUp.
