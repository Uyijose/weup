Yes. Since the in-app notification system is now working, **Phase 5.8.38 should be implemented separately from the existing notification table**.

I recommend we do this in stages:

1. Create `user_devices`
2. Install/configure `expo-notifications`
3. Get the Expo push token on the device
4. Send that token to your backend
5. Store/update the token in Supabase
6. When a like/comment notification is created, send a push notification
7. Test with a direct push first
8. Then connect it to likes/comments
9. Finally handle notification taps

Expo's current documentation confirms that push notifications require `expo-notifications`, an Expo push token, notification credentials, and a development build rather than Expo Go for remote push notifications. ([Expo Documentation][1])

---

# 1. First: Supabase

We need a new table.

## Table: `user_devices`

Run this in **Supabase → SQL Editor**:

```sql
create table public.user_devices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  push_token text not null,
  platform text not null,
  device_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index user_devices_push_token_key
on public.user_devices(push_token);

create index user_devices_user_id_idx
on public.user_devices(user_id);
```

This gives you:

```text
user_devices
│
├── id
├── user_id
├── push_token
├── platform
├── device_name
├── created_at
└── updated_at
```

One user can therefore have:

```text
User A
│
├── Android phone
├── iPhone
└── Tablet
```

---

# 2. Enable RLS

Because the frontend should **not directly manage arbitrary devices**, don't simply make the entire table publicly writable.

Run:

```sql
alter table public.user_devices enable row level security;
```

For our architecture, the backend will manage the table using `supabaseAdmin`.

That means we don't need an anon policy that lets clients insert arbitrary `user_id` values.

---

# 3. Add a unique constraint

We already created a unique index on the push token.

That's important because the same token should not be registered repeatedly.

For example:

```text
User A
ExponentPushToken[abc123]
```

shouldn't produce:

```text
row 1 → abc123
row 2 → abc123
row 3 → abc123
row 4 → abc123
```

The backend will update the existing token instead.

---

# 4. Install Expo packages

Go to your Expo project:

```bash
cd frontend-expo
```

Then:

```bash
npx expo install expo-notifications expo-constants
```

Expo officially recommends these packages for obtaining the Expo push token and determining the EAS project ID. ([Expo Documentation][1])

---

# 5. Important: Expo Go will NOT be enough

This is important because you've been testing with Expo.

For remote push notifications, **Expo Go is not sufficient on current SDKs**. You need a development build. ([Expo Documentation][2])

So don't waste time trying to make the remote push work inside Expo Go.

We'll eventually use:

```bash
eas build --profile development --platform android
```

and install that build on your Android phone.

Since you're currently working with Android, let's get Android working first. Then we'll add iOS.

---

# 6. Configure `app.json`

I need you to locate:

```text
frontend-expo/app.json
```

You probably already have an Expo configuration.

Find:

```json
"plugins": []
```

or whatever your current `plugins` array is.

### OLD

If you currently have something like:

```json
"plugins": []
```

### REPLACE WITH

```json
"plugins": [
  "expo-notifications"
]
```

If you already have other plugins, **do not delete them**.

For example:

### OLD

```json
"plugins": [
  "expo-router"
]
```

### NEW

```json
"plugins": [
  "expo-router",
  "expo-notifications"
]
```

The notifications config plugin is required for the native configuration. ([Expo Documentation][1])

---

# 7. Create the frontend notification registration service

Create this file:

```text
frontend-expo/services/pushNotifications.service.ts
```

Git Bash:

```bash
mkdir -p services
touch services/pushNotifications.service.ts
```

Then put **this complete code** inside:

```ts
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { Platform } from "react-native";

export async function registerForPushNotificationsAsync() {
  console.log(
    "[PUSH] Starting push notification registration"
  );

  if (Platform.OS === "web") {
    console.log(
      "[PUSH] Web platform detected - skipping push registration"
    );

    return null;
  }

  const existingPermissions =
    await Notifications.getPermissionsAsync();

  console.log(
    "[PUSH] Existing permission:",
    existingPermissions.status
  );

  let finalStatus =
    existingPermissions.status;

  if (finalStatus !== "granted") {
    const requestedPermissions =
      await Notifications.requestPermissionsAsync();

    finalStatus =
      requestedPermissions.status;

    console.log(
      "[PUSH] Requested permission:",
      finalStatus
    );
  }

  if (finalStatus !== "granted") {
    console.log(
      "[PUSH] Notification permission was not granted"
    );

    return null;
  }

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  console.log(
    "[PUSH] Project ID:",
    projectId
  );

  if (!projectId) {
    console.error(
      "[PUSH] EAS project ID is missing"
    );

    return null;
  }

  try {
    const token =
      await Notifications.getExpoPushTokenAsync({
        projectId,
      });

    console.log(
      "[PUSH] Expo push token:",
      token.data
    );

    return token.data;
  } catch (error) {
    console.error(
      "[PUSH] Failed to get Expo push token:",
      error
    );

    return null;
  }
}
```

---

# 8. Create backend device service

Create:

```text
backend/src/services/devices/devices.service.js
```

Git Bash:

```bash
mkdir -p backend/src/services/devices
touch backend/src/services/devices/devices.service.js
```

Put:

```js
import { supabaseAdmin } from "../../lib/supabaseAdmin.js";

export async function registerDevice({
  userId,
  pushToken,
  platform,
  deviceName = null,
}) {
  if (!userId) {
    throw new Error("User ID is required");
  }

  if (!pushToken) {
    throw new Error("Push token is required");
  }

  if (!platform) {
    throw new Error("Platform is required");
  }

  console.log(
    "[DEVICES] Registering device",
    {
      userId,
      pushToken,
      platform,
      deviceName,
    }
  );

  const { data, error } =
    await supabaseAdmin
      .from("user_devices")
      .upsert(
        {
          user_id: userId,
          push_token: pushToken,
          platform,
          device_name: deviceName,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "push_token",
        }
      )
      .select()
      .single();

  if (error) {
    console.error(
      "[DEVICES] REGISTER ERROR",
      error
    );

    throw error;
  }

  console.log(
    "[DEVICES] DEVICE REGISTERED",
    data
  );

  return data;
}
```

Notice that this uses:

```js
supabaseAdmin
```

not the anon client.

That's intentional.

---

# 9. Create device route

Create:

```text
backend/src/routes/devices/devices.routes.js
```

Git Bash:

```bash
mkdir -p backend/src/routes/devices
touch backend/src/routes/devices/devices.routes.js
```

Put:

```js
import express from "express";

import { requireAuth } from "../../middleware/auth.middleware.js";

import {
  registerDevice,
} from "../../services/devices/devices.service.js";

const router = express.Router();

router.post(
  "/register",
  requireAuth,
  async (req, res) => {
    try {
      const {
        pushToken,
        platform,
        deviceName,
      } = req.body;

      console.log(
        "[DEVICES ROUTE] REGISTER REQUEST",
        {
          userId: req.user.id,
          pushToken,
          platform,
          deviceName,
        }
      );

      const device =
        await registerDevice({
          userId: req.user.id,
          pushToken,
          platform,
          deviceName,
        });

      return res.status(201).json({
        device,
      });
    } catch (error) {
      console.error(
        "[DEVICES ROUTE] REGISTER ERROR",
        error
      );

      return res.status(500).json({
        error:
          error?.message ||
          "Failed to register device",
      });
    }
  }
);

export default router;
```

---

# 10. Register the route in `app.js`

File:

```text
backend/src/app.js
```

### ADD THIS IMPORT

Find:

```js
import notificationsRoutes from "./routes/notifications/notifications.routes.js";
```

Immediately **AFTER** it, add:

```js
import devicesRoutes from "./routes/devices/devices.routes.js";
```

So you have:

```js
import notificationsRoutes from "./routes/notifications/notifications.routes.js";
import devicesRoutes from "./routes/devices/devices.routes.js";
```

---

### ADD THIS ROUTE

Find:

```js
app.use("/api/notifications", requireAuth, notificationsRoutes);
```

Immediately **AFTER** it, add:

```js
app.use("/api/devices", devicesRoutes);
```

So:

```js
app.use("/api/notifications", requireAuth, notificationsRoutes);
app.use("/api/devices", devicesRoutes);
```

Don't add `requireAuth` here because the route itself already has:

```js
requireAuth
```

---

# 11. Add frontend registration API

File:

```text
frontend-expo/services/pushNotifications.service.ts
```

We need to add another function.

At the **very bottom of the file**, after:

```ts
export async function registerForPushNotificationsAsync() {
```

and its closing `}` — add:

```ts
export async function registerDevicePushToken(
  pushToken: string
) {
  const API_BASE =
    process.env.EXPO_PUBLIC_BACKEND_URL;

  if (!API_BASE) {
    console.error(
      "[PUSH] Backend URL is missing"
    );

    return null;
  }

  const { getAuthToken } =
    await import("../utils/getAuthToken");

  const token = await getAuthToken();

  if (!token) {
    console.log(
      "[PUSH] No auth token available"
    );

    return null;
  }

  const url =
    `${API_BASE}/api/devices/register`;

  console.log(
    "[PUSH] Registering token with backend:",
    url
  );

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      pushToken,
      platform: Platform.OS,
      deviceName: null,
    }),
  });

  const data = await response.json();

  console.log(
    "[PUSH] Backend registration response:",
    data
  );

  if (!response.ok) {
    throw new Error(
      data?.error ||
      "Failed to register push token"
    );
  }

  return data;
}
```

---

# 12. Now we need to actually call registration

This part is important.

We don't want to register the device every time some random component renders.

We should do it **once after the user is authenticated**.

You need to show me the file where your authentication state is initialized.

From your existing architecture, it may be something like:

```text
frontend-expo/
├── app/
├── providers/
├── stores/
└── ...
```

I don't want to guess and tell you to modify the wrong file.

### For now, DON'T add the registration call anywhere.

First run the installation/configuration above.

Then tell me the file that currently contains your authentication initialization/provider.

---

# 13. One more thing: EAS project ID

Your code needs:

```ts
Constants.expoConfig?.extra?.eas?.projectId
```

or:

```ts
Constants.easConfig?.projectId
```

You need an EAS project.

From:

```text
frontend-expo
```

run:

```bash
eas project:info
```

If that says there is no EAS project, run:

```bash
eas init
```

This will associate your Expo project with an EAS project.

The project ID is required when calling `getExpoPushTokenAsync`. Expo specifically recommends using the EAS `projectId`. ([Expo Documentation][1])

---

# 14. Create the Android development build

Once the above is done:

```bash
cd frontend-expo
```

Then:

```bash
eas build --profile development --platform android
```

You will need to configure Android push credentials during this process. Expo's current setup documentation describes Android FCM credentials as part of push notification setup. ([Expo Documentation][1])

Install the resulting development build on your physical Android device.

**Do not use Expo Go for this test.**

---

# 15. What we should see

Once we add the registration call, your Metro console should show something like:

```text
[PUSH] Starting push notification registration

[PUSH] Existing permission: denied

[PUSH] Requested permission: granted

[PUSH] Project ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

[PUSH] Expo push token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxx]

[PUSH] Registering token with backend:
https://.../api/devices/register

[PUSH] Backend registration response:
{
  device: {
    ...
  }
}
```

And your backend should show:

```text
[DEVICES ROUTE] REGISTER REQUEST
[DEVICES] Registering device
[DEVICES] DEVICE REGISTERED
```

---

# 16. Check Supabase

After registering the device, go to:

**Supabase → Table Editor → `user_devices`**

You should see something like:

| user_id   | push_token               | platform  |
| --------- | ------------------------ | --------- |
| user UUID | `ExponentPushToken[...]` | `android` |

That confirms:

```text
Android
 ↓
Expo
 ↓
push token
 ↓
Backend
 ↓
Supabase
```

is working.

---

# 17. Don't connect likes/comments yet

This is important.

We should **not** immediately modify:

```text
likes.routes.js
comments.routes.js
notifications.service.js
```

until we prove that basic push delivery works.

First prove:

```text
Device
 ↓
Permission
 ↓
ExpoPushToken
 ↓
Backend
 ↓
user_devices
```

Then:

```text
Backend
 ↓
Expo Push Service
 ↓
Android
```

Then we'll connect:

```text
Like
 ↓
createLikeNotification()
 ↓
sendPushNotification()
```

and:

```text
Comment
 ↓
createCommentNotification()
 ↓
sendPushNotification()
```

This makes debugging much easier.

Expo's push service is designed specifically for this architecture: your server sends the Expo push token and notification payload to Expo's push API, which then handles delivery through FCM/APNs. ([Expo Documentation][3])

---

# 18. The final architecture we're building

You'll eventually have:

```text
                         USER ACTION
                             │
                    ┌────────▼────────┐
                    │ Express Backend │
                    └────────┬────────┘
                             │
                   createNotification()
                             │
                    ┌────────▼────────┐
                    │   Supabase DB   │
                    │ notifications   │
                    └────────┬────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
          Supabase Realtime       Push Service
                 │                       │
                 ▼                       ▼
          In-app notification      Expo Push API
                                         │
                              ┌──────────┴──────────┐
                              │                     │
                              ▼                     ▼
                           Android                iOS
```

And:

```text
user_devices
│
├── User A → Android
├── User A → iPhone
├── User B → Android
└── User C → iPad
```

This is the right foundation for the future notification-preferences system you described.

### Do these steps first

Run these:

```bash
cd frontend-expo
npx expo install expo-notifications expo-constants
```

Create:

```text
frontend-expo/services/pushNotifications.service.ts
backend/src/services/devices/devices.service.js
backend/src/routes/devices/devices.routes.js
```

Create the Supabase table with the SQL above.

Add the route to `app.js`.

Then run:

```bash
eas project:info
```

**Stop there before modifying your authentication/provider file.** Send me the output of `eas project:info` and, more importantly, the file where your current authenticated-user initialization happens. Then we can add the token registration in exactly the right place without guessing. ([Expo Documentation][1])

[1]: https://docs.expo.dev/push-notifications/push-notifications-setup/?utm_source=chatgpt.com "Expo push notifications setup - Expo Documentation"
[2]: https://docs.expo.dev/push-notifications/faq/?utm_source=chatgpt.com "Push notifications troubleshooting and FAQ - Expo Documentation"
[3]: https://docs.expo.dev/push-notifications/sending-notifications/?utm_source=chatgpt.com "Send notifications with the Expo Push Service - Expo Documentation"
