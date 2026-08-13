````md
# WeUp – Notification System Implementation Plan

## Overview

The current WeUp web application does not have a notification system. The Expo application will therefore introduce notifications as a new feature rather than attempting to directly port an existing implementation.

The notification architecture should follow the same separation already established for messaging:

```text
Expo UI
   ↓
notificationsStore
   ↓
notification.service.ts
   ↓
Backend notification API
   ↓
Supabase
````

Notification creation should happen primarily on the backend, while the Expo application should retrieve, display, update, and subscribe to notifications.

The implementation will support:

* Likes
* Comments
* Followers/subscriptions
* Messages
* System notifications
* Future mentions/tags
* In-app realtime notifications
* Unread notification count
* Read/unread state
* Notification navigation
* Future push notifications

---

# Phase 5.8 – Notification System

## Phase 5.8.1 – Notification Architecture

### Objective

Introduce a complete notification architecture across the backend, Supabase, and Expo frontend.

The architecture will consist of four major layers:

```text
                    ┌─────────────────────┐
                    │     User Action     │
                    │ Like / Comment /    │
                    │ Follow / Message    │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │      Backend        │
                    │ Notification Logic  │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │     Supabase        │
                    │   notifications     │
                    │       table         │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Supabase Realtime   │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │    Expo Store       │
                    │ notificationsStore  │
                    └──────────┬──────────┘
                               ↓
                    ┌─────────────────────┐
                    │ Notification UI     │
                    │ + unread badge      │
                    └─────────────────────┘
```

The backend is responsible for creating notifications.

The Expo frontend is responsible for displaying and managing them.

---

# Phase 5.8.2 – Notification Types

## Objective

Define the notification types supported by WeUp.

Initial notification types:

```text
like
comment
follow
message
system
```

Future types:

```text
mention
tag
subscription
post
creator
```

The initial system should be designed so additional notification types can be added without restructuring the database.

---

# Phase 5.8.3 – Supabase Notifications Table

## Objective

Create a dedicated:

```text
notifications
```

table in Supabase.

Recommended structure:

```text
notifications
├── id
├── recipient_id
├── actor_id
├── type
├── title
├── body
├── reference_id
├── reference_type
├── read
├── created_at
```

### Column definitions

| Column         | Type        | Purpose                            |
| -------------- | ----------- | ---------------------------------- |
| id             | uuid        | Unique notification ID             |
| recipient_id   | uuid        | User receiving notification        |
| actor_id       | uuid        | User who caused notification       |
| type           | text        | Notification type                  |
| title          | text        | Notification title                 |
| body           | text        | Notification message               |
| reference_id   | uuid/text   | Related object ID                  |
| reference_type | text        | post/comment/conversation/etc.     |
| read           | boolean     | Whether notification has been read |
| created_at     | timestamptz | Creation timestamp                 |

Example:

```text
id:
a8f...

recipient_id:
USER_B

actor_id:
USER_A

type:
like

title:
New like

body:
John liked your video.

reference_id:
POST_123

reference_type:
post

read:
false
```

---

# Phase 5.8.4 – Database Indexes

Create indexes for the most common notification queries.

Recommended:

```text
recipient_id
recipient_id + created_at
recipient_id + read
```

The most important query will be:

```text
WHERE recipient_id = current_user
ORDER BY created_at DESC
```

Unread count will use:

```text
WHERE recipient_id = current_user
AND read = false
```

---

# Phase 5.8.5 – Row Level Security

## Objective

Ensure users can only access their own notifications.

The notification recipient should be the controlling field.

Recommended policies:

### SELECT

Users can only read:

```text
recipient_id = auth.uid()
```

### UPDATE

Users can only update their own notifications.

This is required for:

```text
markAsRead()
markAllAsRead()
```

### INSERT

Normal users should not be allowed to arbitrarily insert notifications from the client.

Notification creation should happen through the trusted backend/server-side logic.

This prevents a malicious client from creating fake notifications such as:

```text
"I received 1,000 likes"
```

or creating notifications for another user.

---

# Phase 5.8.6 – Backend Notification Service

## Objective

Create the backend notification service.

New file:

```text
backend/src/services/notifications/notification.service.js
```

Recommended backend structure:

```text
src
├── services
│   ├── notifications
│   │   └── notification.service.js
```

The service will centralize notification creation.

Responsibilities:

```text
createNotification()
createLikeNotification()
createCommentNotification()
createFollowNotification()
createMessageNotification()
createSystemNotification()
```

The most important function should be:

```text
createNotification()
```

Conceptually:

```text
createNotification({
    recipientId,
    actorId,
    type,
    title,
    body,
    referenceId,
    referenceType
})
```

This allows all other backend services to use the same notification mechanism.

---

# Phase 5.8.7 – Backend Notification Routes

## Objective

Create API endpoints for the Expo application.

New file:

```text
backend/src/routes/notifications/notifications.routes.js
```

Recommended routes:

```text
GET    /api/notifications
GET    /api/notifications/unread-count
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/read-all
```

The backend should authenticate every request using the existing:

```text
src/middleware/auth.middleware.js
```

---

# Phase 5.8.8 – Notification API

The backend API should provide:

## Get notifications

```text
GET /api/notifications
```

Returns the authenticated user's notifications.

Recommended response:

```json
{
  "notifications": [],
  "unreadCount": 0
}
```

---

## Get unread count

```text
GET /api/notifications/unread-count
```

Recommended response:

```json
{
  "unreadCount": 3
}
```

---

## Mark notification as read

```text
PATCH /api/notifications/:id/read
```

The backend must verify that the notification belongs to the authenticated user.

---

## Mark all notifications as read

```text
PATCH /api/notifications/read-all
```

Only notifications belonging to the authenticated user should be updated.

---

# Phase 5.8.9 – Register Notification Routes

Update:

```text
backend/src/app.js
```

Register:

```text
/api/notifications
```

using the new notification router.

The final architecture should resemble:

```text
/api/auth
/api/posts
/api/comments
/api/likes
/api/messaging
/api/reports
/api/notifications
```

---

# Phase 5.8.10 – Like Notifications

## Objective

Create a notification when a user likes another user's post.

Flow:

```text
User A
   ↓
Likes Post
   ↓
likes.routes.js
   ↓
Like succeeds
   ↓
Determine post owner
   ↓
Create notification
   ↓
notifications table
```

Example:

```text
John liked your video.
```

Notification:

```text
type:
like

reference_type:
post

reference_id:
POST_ID

actor_id:
JOHN_ID

recipient_id:
POST_OWNER_ID
```

### Important

Do not notify users when they like their own post.

---

# Phase 5.8.11 – Comment Notifications

## Objective

Create a notification when someone comments on a user's post.

Flow:

```text
User A
   ↓
Comments on Post
   ↓
comments.routes.js
   ↓
Comment succeeds
   ↓
Determine post owner
   ↓
Create notification
```

Example:

```text
Sarah commented on your video.
```

Notification:

```text
type:
comment

reference_type:
post

reference_id:
POST_ID
```

The comment ID can also be stored if later notification navigation requires opening the exact comment.

---

# Phase 5.8.12 – Follow/Subscription Notifications

## Objective

Create a notification when someone follows/subscribes to another user.

Flow:

```text
User A
   ↓
Follows User B
   ↓
Subscription/follow logic
   ↓
Create notification
```

Example:

```text
David followed you.
```

Notification:

```text
type:
follow

actor_id:
DAVID_ID

recipient_id:
YOUR_ID
```

The implementation should use whatever follow/subscription mechanism currently exists in the backend.

Before implementing this phase, inspect the existing subscription/follow backend logic rather than creating a second relationship system.

---

# Phase 5.8.13 – Message Notifications

## Objective

Connect messaging to notifications.

Flow:

```text
User A sends message
       ↓
messaging.routes.js
       ↓
message created
       ↓
Determine recipient(s)
       ↓
Create notification
```

Example:

```text
Sarah sent you a message.
```

Notification:

```text
type:
message

reference_type:
conversation

reference_id:
CONVERSATION_ID
```

When the user taps the notification:

```text
/chat/[conversationId]
```

should open.

---

# Phase 5.8.14 – Avoid Duplicate Notifications

The backend should avoid creating duplicate notifications where appropriate.

For example, if an operation is retried, it should not unnecessarily create multiple identical notifications.

For likes, the database relationship itself should normally prevent duplicate likes.

For other notification types, the implementation can use an appropriate uniqueness strategy where required.

Do not make all notifications globally unique because multiple comments or messages from the same user should produce separate notifications.

---

# Phase 5.8.15 – Expo Notification Service

## Objective

Create the Expo service layer.

New file:

```text
frontend-expo/services/notification.service.ts
```

Responsibilities:

```text
fetchNotifications()
fetchUnreadCount()
markNotificationAsRead()
markAllNotificationsAsRead()
```

Architecture:

```text
notificationsStore
       ↓
notification.service.ts
       ↓
backend
```

The UI should not directly call:

```text
fetch()
```

for notification operations.

---

# Phase 5.8.16 – Expo Notification Types

Notification types should preferably live in:

```text
frontend-expo/types/notification.ts
```

Example model:

```text
Notification
├── id
├── recipient_id
├── actor_id
├── type
├── title
├── body
├── reference_id
├── reference_type
├── read
├── created_at
└── actor
```

The optional actor object can contain:

```text
id
username
full_name
avatar_url
```

This allows the UI to display:

```text
[Avatar] John liked your video
```

without requiring a separate user lookup for every notification.

---

# Phase 5.8.17 – Expo Notifications Store

## Objective

Create:

```text
frontend-expo/stores/notificationsStore.ts
```

The store should contain:

```text
notifications
unreadCount
loading
error
```

Actions:

```text
loadNotifications()
loadUnreadCount()
markAsRead()
markAllAsRead()
addNotification()
```

The store should be responsible for state management and orchestration.

It should not contain UI navigation logic.

---

# Phase 5.8.18 – Realtime Notification Subscription

## Objective

Allow new notifications to appear immediately without refreshing.

New file:

```text
frontend-expo/utils/realtimeNotifications.ts
```

Architecture:

```text
Database INSERT
      ↓
Supabase Realtime
      ↓
Expo
      ↓
notificationsStore.addNotification()
```

The subscription should listen only to the authenticated user's notifications.

Conceptually:

```text
notifications:recipient_id=eq.USER_ID
```

When a notification arrives:

```text
addNotification(notification)
```

and:

```text
unreadCount += 1
```

---

# Phase 5.8.19 – Realtime Cleanup

The notification realtime subscription must be removed when the relevant screen/provider unmounts.

This prevents:

```text
duplicate notifications
duplicate subscriptions
memory leaks
multiple unread-count increments
```

The implementation should expose an unsubscribe function:

```text
const unsubscribe =
    subscribeToNotifications(...);

return unsubscribe;
```

---

# Phase 5.8.20 – Notifications Screen

## Objective

Create:

```text
frontend-expo/app/notifications/index.tsx
```

The screen should display:

```text
Notifications

❤️ John liked your video
   2 minutes ago

💬 Mary commented on your video
   10 minutes ago

👤 David followed you
   1 hour ago

💬 Sarah sent you a message
   2 hours ago
```

The screen should support:

* Loading state
* Empty state
* Error state
* Pull-to-refresh
* Read/unread styling
* Notification navigation
* Mark as read

---

# Phase 5.8.21 – Notification Navigation

Each notification should know what object it relates to.

Example:

```text
like
↓
post
↓
reference_id = POST_ID
```

Tapping it should navigate to:

```text
/posts/POST_ID
```

Comment:

```text
/posts/POST_ID
```

Follow:

```text
/user/USER_ID
```

Message:

```text
/chat/CONVERSATION_ID
```

System notification:

```text
Depends on notification metadata
```

Navigation should be handled by the notification UI rather than the notification service.

---

# Phase 5.8.22 – Notification Item Component

Create:

```text
frontend-expo/components/notifications/NotificationItem.tsx
```

Responsibilities:

* Display avatar
* Display title/body
* Display timestamp
* Display unread state
* Handle press
* Trigger mark-as-read

The component should not directly perform API requests.

Architecture:

```text
NotificationItem
      ↓
notificationsStore
      ↓
notification.service
```

---

# Phase 5.8.23 – Notification Styles

Create:

```text
frontend-expo/styles/notifications/notifications.styles.ts
```

This keeps notification styling separate from the screen component.

Recommended states:

```text
notification
notificationUnread
avatar
content
title
body
timestamp
emptyState
loading
error
```

---

# Phase 5.8.24 – App Header Notification Button

The existing:

```text
frontend-expo/components/layout/AppHeader.tsx
```

should eventually contain a notification button.

Example:

```text
🔔
```

When unread notifications exist:

```text
🔔 3
```

or:

```text
🔔
 ●
```

Pressing it should navigate to:

```text
/notifications
```

The unread count should come from:

```text
notificationsStore
```

not from the UI maintaining its own count.

---

# Phase 5.8.25 – Notification Badge

The unread count should be synchronized with:

```text
notificationsStore.unreadCount
```

Example:

```text
0
```

No badge should be shown.

```text
1
```

Show:

```text
1
```

For larger numbers:

```text
99+
```

This prevents the header from becoming excessively wide.

---

# Phase 5.8.26 – Global Realtime Notification Listener

The realtime notification subscription should ideally not exist only on the notification screen.

Otherwise:

```text
User is on Home
   ↓
Someone likes their video
   ↓
Notification arrives
```

would not work if the subscription only exists on:

```text
/notifications
```

Instead, the final implementation should place the realtime subscription at an authenticated-app level.

Possible location:

```text
frontend-expo/app/_layout.tsx
```

or a dedicated provider:

```text
frontend-expo/context/NotificationProvider.tsx
```

Recommended architecture:

```text
Authenticated App
       ↓
NotificationProvider
       ↓
Realtime Subscription
       ↓
notificationsStore
```

The provider should:

1. Detect authenticated user
2. Subscribe to that user's notifications
3. Add incoming notifications to the store
4. Update unread count
5. Unsubscribe when the user logs out/unmounts

---

# Phase 5.8.27 – Initial Notification Loading

When a user logs in:

```text
Authentication
      ↓
NotificationProvider
      ↓
loadNotifications()
      ↓
loadUnreadCount()
      ↓
Realtime subscription
```

This ensures that the application has the correct state before realtime events begin arriving.

---

# Phase 5.8.28 – Notification State Synchronization

The system should handle these cases:

### User receives notification while app is open

```text
Backend
↓
Supabase
↓
Realtime
↓
Store
↓
Badge increases
```

### User opens notification

```text
Notification
↓
markAsRead()
↓
Unread count decreases
```

### User marks everything as read

```text
markAllAsRead()
↓
unreadCount = 0
```

### User refreshes app

```text
Backend
↓
Existing notifications loaded
↓
Unread count restored
```

---

# Phase 5.8.29 – Backend Integration Order

The existing backend structure should be extended rather than reorganized.

Current:

```text
src
├── routes
│   ├── comments
│   ├── likes
│   ├── messaging
│   └── posts
│
└── services
    ├── messaging
    ├── r2.service.js
    └── video.service.js
```

Target:

```text
src
├── routes
│   ├── comments
│   ├── likes
│   ├── messaging
│   ├── notifications
│   │   └── notifications.routes.js
│   ├── posts
│   └── ...
│
└── services
    ├── messaging
    ├── notifications
    │   └── notification.service.js
    ├── r2.service.js
    └── ...
```

---

# Phase 5.8.30 – Backend Files To Create

The initial backend implementation will create:

```text
backend/src/services/notifications/notification.service.js

backend/src/routes/notifications/notifications.routes.js
```

Potentially later:

```text
backend/src/services/notifications/notification.types.js
```

but this should not be created unless the implementation actually needs it.

---

# Phase 5.8.31 – Expo Files To Create

Initial Expo files:

```text
frontend-expo/types/notification.ts

frontend-expo/services/notification.service.ts

frontend-expo/stores/notificationsStore.ts

frontend-expo/utils/realtimeNotifications.ts

frontend-expo/app/notifications/index.tsx

frontend-expo/components/notifications/NotificationItem.tsx

frontend-expo/styles/notifications/notifications.styles.ts
```

Later:

```text
frontend-expo/context/NotificationProvider.tsx
```

if the global realtime architecture is implemented as a provider.

---

# Phase 5.8.32 – Existing Backend Files To Modify

The following existing backend files will eventually be integrated with notifications:

```text
src/app.js

src/routes/likes/likes.routes.js

src/routes/comments/comments.routes.js

src/routes/messaging/messaging.routes.js
```

The follow/subscription route will also need to be identified from the existing backend before modification.

We should not assume its filename until the existing follow/subscription implementation is inspected.

---

# Phase 5.8.33 – Existing Expo Files To Modify

Eventually:

```text
frontend-expo/app/_layout.tsx

frontend-expo/components/layout/AppHeader.tsx
```

Potentially:

```text
frontend-expo/stores/authStore.ts
```

only if authentication lifecycle integration requires it.

---

# Phase 5.8.34 – Notification Creation Rules

The backend should follow these rules.

### Like

Notify post owner.

Do not notify if:

```text
actor_id === recipient_id
```

### Comment

Notify post owner.

Do not notify if:

```text
actor_id === recipient_id
```

### Follow  (this should be subscribe)

Notify followed user.

Do not notify yourself.

### Message

Notify conversation recipient.

Do not create unnecessary notifications for the sender.

### System

Backend/admin generated.

---

# Phase 5.8.35 – Notification Data Example

A like:

```json
{
  "id": "notification-id",
  "recipient_id": "user-b",
  "actor_id": "user-a",
  "type": "like",
  "title": "New like",
  "body": "John liked your video.",
  "reference_id": "post-id",
  "reference_type": "post",
  "read": false,
  "created_at": "2026-08-12T15:00:00Z"
}
```

A comment:

```json
{
  "type": "comment",
  "title": "New comment",
  "body": "Mary commented on your video.",
  "reference_id": "post-id",
  "reference_type": "post",
  "read": false
}
```

A message:

```json
{
  "type": "message",
  "title": "New message",
  "body": "Sarah sent you a message.",
  "reference_id": "conversation-id",
  "reference_type": "conversation",
  "read": false
}
```

---

# Phase 5.8.36 – Pagination

The initial version can load a limited number of notifications.

For example:

```text
20 notifications
```

Later, add:

```text
GET /api/notifications?page=2
```

or cursor-based pagination.

Cursor-based pagination is preferable if the notification volume becomes large.

Do not over-engineer this in the first implementation.

---

# Phase 5.8.37 – Notification Retention

Notifications should eventually have a retention policy.

For example:

```text
Delete notifications older than 90 days
```

However, this does not need to be implemented in the first version.

The initial system should focus on correctness.

---

# Phase 5.8.38 – Push Notifications

Push notifications should come after the in-app system is stable.

Architecture:

```text
User Action
    ↓
Backend
    ↓
Notification Created
    ↓
Supabase
    ├──→ Expo Realtime
    │
    └──→ Push Notification Service
             ↓
        Android / iOS
```

Push notifications will require:

```text
Expo Notifications
Android notification configuration
iOS notification configuration
device push token storage
backend push delivery
notification permissions
```

The device token should eventually be stored in a separate table such as:

```text
user_devices
```

rather than directly in the users table.

---

# Phase 5.8.39 – Future Push Notification Architecture

Potential table:

```text
user_devices
├── id
├── user_id
├── push_token
├── platform
├── device_name
├── created_at
├── updated_at
```

Example:

```text
user_id:
USER123

push_token:
ExponentPushToken[...]

platform:
android
```

This allows one user to have:

```text
Android phone
iPhone
tablet
```

and receive notifications on all registered devices.

---

# Phase 5.8.40 – Notification Preferences

A future notification preferences system can allow users to control:

```text
Likes
Comments
Followers
Messages
System notifications
Push notifications
```

Possible structure:

```text
notification_preferences
├── user_id
├── likes
├── comments
├── follows
├── messages
├── system
├── push_enabled
```

This should be implemented only after the core notification system works.

---

# Phase 5.8.41 – Testing Strategy

Testing should happen progressively.

## Test 1 – Database

Create a notification manually from the trusted backend and verify:

```text
notifications table
```

contains the record.

---

## Test 2 – Backend GET

Call:

```text
GET /api/notifications
```

and verify only the authenticated user's notifications are returned.

---

## Test 3 – Unread count

Call:

```text
GET /api/notifications/unread-count
```

and verify:

```text
unreadCount
```

is correct.

---

## Test 4 – Mark read

Call:

```text
PATCH /api/notifications/:id/read
```

and verify:

```text
read = true
```

---

## Test 5 – Mark all read

Call:

```text
PATCH /api/notifications/read-all
```

and verify:

```text
unreadCount = 0
```

---

## Test 6 – Like

User A likes User B's post.

Expected:

```text
User B receives notification.
```

User A should not receive a notification for liking their own post.

---

## Test 7 – Comment

User A comments on User B's post.

Expected:

```text
User B receives notification.
```

---

## Test 8 – Follow

User A follows User B.

Expected:

```text
User B receives notification.
```

---

## Test 9 – Message

User A sends User B a message.

Expected:

```text
User B receives notification.
```

---

## Test 10 – Realtime

Keep User B's Expo application open.

From User A:

```text
Like
```

Expected:

```text
Notification appears without refreshing.
```

---

## Test 11 – Badge

When a new notification arrives:

```text
unreadCount
```

should increase.

The header badge should update immediately.

---

## Test 12 – Navigation

Tap:

```text
John liked your video
```

Expected:

```text
/posts/[postId]
```

Tap:

```text
Sarah sent you a message
```

Expected:

```text
/chat/[conversationId]
```

Tap:

```text
David followed you
```

Expected:

```text
/user/[userId]
```

---

# Phase 5.8.42 – Error Handling

The system should gracefully handle:

```text
Backend unavailable
Supabase unavailable
Authentication expired
Notification does not exist
Notification already read
Realtime disconnected
Invalid reference ID
```

The notification screen should not crash because one notification has invalid metadata.

---

# Phase 5.8.43 – Security Requirements

The following rules are mandatory:

```text
Users can only read their own notifications.

Users can only mark their own notifications as read.

Users cannot create arbitrary notifications from the Expo client.

Backend notification creation must verify the recipient.

Notification navigation must not bypass existing authorization.

Realtime subscriptions must be scoped to the authenticated user.
```

---

# Phase 5.8.44 – Recommended Implementation Sequence

The actual implementation should proceed in this order:

```text
5.8.1
Database table
       ↓
5.8.2
Indexes + RLS
       ↓
5.8.3
Backend notification service
       ↓
5.8.4
Backend notification routes
       ↓
5.8.5
Register backend routes
       ↓
5.8.6
Expo notification types
       ↓
5.8.7
Expo notification service
       ↓
5.8.8
notificationsStore
       ↓
5.8.9
Notifications screen
       ↓
5.8.10
Notification item
       ↓
5.8.11
Realtime notifications
       ↓
5.8.12
Global realtime provider
       ↓
5.8.13
Header notification badge
       ↓
5.8.14
Like notifications
       ↓
5.8.15
Comment notifications
       ↓
5.8.16
Follow notifications
       ↓
5.8.17
Message notifications
       ↓
5.8.18
Navigation
       ↓
5.8.19
Testing
       ↓
5.8.20
Push notifications
```

---

# Phase 5.8.45 – Final Architecture

When complete, the system should look like this:

```text
                         WEUP NOTIFICATIONS
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
        USER ACTIONS                         SYSTEM EVENTS
              │                                   │
       ┌──────┼──────┐                            │
       │      │      │                            │
      Like  Comment Follow                     System
       │      │      │                            │
       └──────┼──────┘                            │
              ↓                                   │
       Backend Services                            │
              │                                   │
              └──────────────┬────────────────────┘
                             ↓
                 notification.service.js
                             ↓
                       Supabase DB
                             │
                 ┌───────────┴───────────┐
                 │                       │
             REST API               Realtime
                 │                       │
                 ↓                       ↓
       notification.service.ts   realtimeNotifications.ts
                 │                       │
                 └───────────┬───────────┘
                             ↓
                  notificationsStore.ts
                             │
              ┌──────────────┼──────────────┐
              │              │              │
              ↓              ↓              ↓
       Notifications       Header        Badge
          Screen          Bell Icon      Counter
              │
              ↓
       NotificationItem
              │
              ↓
         Navigation
              │
       ┌──────┼────────┐
       ↓      ↓        ↓
      Post   User     Chat
```

---

# Phase 5.8.46 – Important Architectural Decision

The notification system should **not** be implemented as a frontend-only feature.

The correct architecture is:

```text
Action
  ↓
Backend
  ↓
Notification creation
  ↓
Supabase
  ↓
Expo
```

rather than:

```text
Action
  ↓
Expo
  ↓
Create notification directly
```

This is important for security, consistency, and future push notifications.

It also means the same notification system can eventually serve:

```text
Expo mobile app
Web application
Push notifications
Email notifications
Admin/system notifications
```

without each client implementing its own notification creation logic.

---

# Phase 5.8.47 – Final Target Feature Set

The completed notification system will provide:

* [x] Notification database
* [x] Notification security/RLS
* [x] Backend notification service
* [x] Notification API
* [x] Expo notification service
* [x] Zustand notification store
* [x] Notification screen
* [x] Notification item
* [x] Read/unread state
* [x] Unread count
* [x] Realtime notifications
* [x] Header notification badge
* [x] Like notifications
* [x] Comment notifications
* [x] Follow notifications
* [x] Message notifications
* [x] Notification navigation
* [x] Error handling
* [x] Duplicate protection
* [ ] Push notifications
* [ ] Device token management
* [ ] Notification preferences
* [ ] Notification retention
* [ ] Mentions/tags

The first implementation should stop at **in-app realtime notifications**. Push notifications, device management, preferences, and advanced notification types should be treated as subsequent phases after the core system has been tested successfully.

```
```
