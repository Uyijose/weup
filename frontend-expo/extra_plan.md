# Phase 5.4 – Profile Migration

The Profile section is significantly larger than the previous screens because it contains **three distinct user experiences**:

1. **Normal User Profile**
2. **Creator Profile**
3. **Profile Editing**

Additionally, there are **admin-specific actions** layered on top of these experiences.

Rather than building the Creator page as a completely separate feature, the migration should first establish the standard User Profile and then extend it for creators. A creator is still a user, so this approach avoids duplicating business logic and keeps the architecture maintainable.

---

# Objective

Port the complete Profile system from the Next.js web frontend to Expo while preserving the existing stores and services as the single source of truth.

---

# Architecture

```text
Profile

├── User Profile
│   ├── Owner View
│   ├── Visitor View
│   └── Admin View
│
├── Creator Extension
│   ├── Creator Header
│   ├── Creator Stats
│   ├── Subscribe
│   ├── Creator Videos
│   └── Creator Messaging
│
└── Edit Profile
    ├── User Details
    ├── Creator Details
    ├── Password
    └── Avatar Upload
```

---

# Phase 5.4.1 — User Profile Screen

## Objective

Build the standard user profile.

---

## Responsibilities

- Load user profile
- Load watched history
- Display avatar
- Display username
- Display profile statistics
- Empty state
- Pagination
- Pull-to-refresh

---

## Components

```text
ProfileHeader
ProfileStats
WatchedHistoryGrid
ProfileActions
```

---

## Files

```text
app/user/[id].tsx

components/profile/ProfileHeader.tsx
components/profile/ProfileStats.tsx
components/profile/ProfileActions.tsx
components/profile/WatchedHistoryGrid.tsx

styles/profile/
```

---

## Success Criteria

- User loads correctly
- Avatar is displayed
- Username is displayed
- Watched history loads
- Pagination works
- Empty state works

---

# Phase 5.4.2 — Owner vs Visitor vs Admin

## Objective

Handle profile permissions.

---

## Owner View

Display:

- Edit Profile
- Messages
- Creator Page
- Subscriptions

---

## Visitor View

Display:

- Message button

Hide:

- Edit Profile
- Admin Panel

---

## Admin View

Can access any profile.

Display:

- Admin Panel

---

## Responsibilities

- Detect owner
- Detect admin
- Detect visitor

---

## Success Criteria

Correct actions and buttons appear for each user type.

---

# Phase 5.4.3 — Messaging Integration

Reuse the existing `messagesStore`.

---

## Responsibilities

- Create conversation
- Navigate to chat
- Open existing conversation
- Redirect unauthenticated users to login

---

## Success Criteria

The Message button behaves exactly like the web version.

---

# Phase 5.4.4 — Watched History

## Responsibilities

Load watched history and display:

```text
Video Thumbnail

Caption

Play

Open Post
```

---

## Features

- Empty state
- Pagination
- View All

---

## Files

```text
components/profile/WatchedHistoryGrid.tsx
components/profile/HistoryVideoCard.tsx
```

---

## Success Criteria

Watched history behaves exactly like the web frontend.

---

# Phase 5.4.5 — Creator Extension

This phase only activates when:

```ts
user.is_creator === true
```

---

## Responsibilities

Display:

- Creator button
- Creator avatar
- Creator username
- Platform title
- Creator description

Navigate to:

```text
/creator/[id]
```

---

## Success Criteria

Users who are not creators do not see any creator-specific UI.

---

# Phase 5.4.6 — Creator Profile

Ports:

```text
frontend/pages/creator/[id].js
```

---

## Responsibilities

### Creator Hero

- Creator avatar
- Platform title
- Creator username

### Creator Statistics

- Videos
- Subscribers
- Views
- WUP

### Creator Description

### Uploaded Videos

- Display uploaded videos
- View All
- Delete own videos

---

## Components

```text
CreatorHeader
CreatorStats
CreatorVideoGrid
CreatorDescription
SubscribeButton
```

---

## Files

```text
app/creator/[id].tsx

components/creator/
    CreatorHeader.tsx
    CreatorStats.tsx
    CreatorDescription.tsx
    CreatorVideoGrid.tsx
    CreatorVideoCard.tsx
```

---

## Success Criteria

Creator Profile matches the web experience.

---

# Phase 5.4.7 — Subscribe System

## Responsibilities

- Subscribe
- Unsubscribe
- Update subscriber count
- Loading state

---

## Uses

Reuse the existing:

```text
usersStore
```

or the existing subscription service.

---

## Success Criteria

Subscriber count updates immediately after subscribing or unsubscribing.

---

# Phase 5.4.8 — Creator Messaging

Reuse:

```text
messagesStore
```

Exactly like the web frontend.

---

## Success Criteria

Creator messaging behaves identically to the User Profile messaging flow.

---

# Phase 5.4.9 — Edit Profile

Ports:

```text
frontend/pages/profile/edit.js
```

---

## Responsibilities

### User Information

- Avatar
- Username
- Full Name

### Creator Information

- Creator Avatar
- Creator Username
- Platform Title
- Creator Description

### Password

- Validation
- Confirm password

### Upload

- User avatar upload
- Creator avatar upload

### Save

- Save profile
- Navigate back

---

## Components

```text
EditProfileForm
AvatarPicker
PasswordSection
CreatorSection
```

---

## Files

```text
app/profile/edit.tsx

components/profile/
    EditProfileForm.tsx
    AvatarPicker.tsx
    PasswordSection.tsx
    CreatorSection.tsx
```

---

## Success Criteria

Profile updates successfully.

---

# Phase 5.4.10 — Become Creator

## Responsibilities

Port the existing:

```text
BecomeCreatorModal
```

to Expo.

---

## Responsibilities

- Creator requirements
- Become creator
- Success flow

---

## Files

```text
app/creator/become-creator.tsx

components/creator/
    BecomeCreatorModal.tsx
```

---

## Success Criteria

Users can successfully become creators.

---

# Phase 5.4.11 — Profile Polish

## Responsibilities

- Skeleton loading
- Error state
- Offline support
- Optimistic updates
- Avatar caching
- Smooth animations
- RefreshControl
- Keyboard handling
- Image placeholders
- Performance optimization

---

# Overall Success Criteria

- ✅ User Profile matches the web experience.
- ✅ Owner, Visitor, and Admin permissions behave correctly.
- ✅ Watched History supports pagination and empty states.
- ✅ Messaging integrates with the existing `messagesStore`.
- ✅ Creator accounts extend the User Profile without duplicating business logic.
- ✅ Creator pages support subscriptions, messaging, video management, and statistics.
- ✅ Edit Profile supports avatar uploads, creator fields, password updates, and validation.
- ✅ Existing stores and services remain the single source of truth.
- ✅ No business logic is duplicated.
- ✅ UI remains fully native and consistent with the rest of the Expo application.