
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

help me state the files to create/edit the file path to add them and the command to create (i am using git bash) these files also the complete corrected code for these files, or the extra code to add or to delete or to replace (state the old code to be replaced and then new code to replace it, you dont need to return the complete code for every file if it is code to change just state the old code to be replaced, and then new code to replace it). and also let me know what to do to know if it is working
