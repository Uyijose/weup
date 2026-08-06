# WeUp Expo Migration

# Phase 5.3 – Comments Screen Migration

## Objective

Migrate the complete web **Comments** experience into a native Expo React Native implementation while preserving the existing business logic.

The current Bottom Sheet implemented during the Post Viewer migration will become the root container for the native comments interface.

This phase focuses on rebuilding the UI while continuing to reuse:

- Supabase
- Stores
- Services
- Authentication
- Existing API layer

No business logic should be rewritten.

---

# Overall Roadmap

```text
Phase 5.3.1
├── Native Bottom Sheet
├── Load Comments
├── Loading State
├── Empty State

Phase 5.3.2
├── Comment List
├── Comment Item
├── Avatar
├── Username
├── Timestamp
├── Verified Badge

Phase 5.3.3
├── Comment Input
├── Send Comment
├── Keyboard Handling
├── Character Counter

Phase 5.3.4
├── Replies
├── Nested Replies
├── Reply Count
├── Collapse Replies

Phase 5.3.5
├── Comment Actions
├── Like Comment
├── Report Comment
├── Delete Comment
├── Edit Comment

Phase 5.3.6
├── Realtime Updates
├── Optimistic Updates
├── Live Comment Count
├── Auto Refresh

Phase 5.3.7
├── Pagination
├── Infinite Scroll
├── Pull To Refresh
├── Performance

Phase 5.3.8
├── Skeleton UI
├── Empty State
├── Error State
├── Offline Handling
├── Final Polish
```

---

# Existing Files We'll Reuse

The following files already exist and will continue to be used.

```text
components/feed/CommentSheet.tsx

services/comments.service.ts

stores/commentsStore.ts

lib/supabase.ts
```

No duplicate business logic should be introduced.

---

# Existing Files We'll Extend

```text
components/feed/PostActions.tsx

components/feed/CommentSheet.tsx
```

---

# Folder Structure

## Components

Create the following folder.

```text
components/
└── comments/
    ├── CommentList.tsx
    ├── CommentItem.tsx
    ├── CommentInput.tsx
    ├── ReplyItem.tsx
    ├── ReplyInput.tsx
    ├── CommentActions.tsx
    ├── EmptyComments.tsx
    └── LoadingComments.tsx
```

---

## Styles

Create the following folder.

```text
styles/
└── comments/
    ├── commentList.styles.ts
    ├── commentItem.styles.ts
    ├── commentInput.styles.ts
    ├── commentActions.styles.ts
    ├── replyItem.styles.ts
    ├── loadingComments.styles.ts
    └── emptyComments.styles.ts
```

---

# Component Architecture

```text
FeedViewer

↓

PostCard

↓

PostActions

↓

CommentSheet

├── CommentList
│      │
│      ├── CommentItem
│      │      │
│      │      └── CommentActions
│      │
│      └── ReplyItem
│
└── CommentInput
```

---

# Phase 5.3.1 – Bottom Sheet Integration

## Objective

Replace the temporary placeholder with a fully functional native comments container.

---

## Files to Edit

```text
components/feed/CommentSheet.tsx
```

---

## Responsibilities

- Load comments
- Display loading indicator
- Display empty state
- Scrollable comment list
- Close Bottom Sheet
- Connect to existing comment service

---

# Phase 5.3.2 – Comment List

## Objective

Render the complete list of comments.

---

## Files to Create

```text
components/comments/CommentList.tsx

components/comments/CommentItem.tsx
```

---

## Responsibilities

Display:

- User avatar
- Username
- Verified badge
- Timestamp
- Comment text
- Like count

---

# Phase 5.3.3 – Comment Input

## Objective

Allow authenticated users to post comments.

---

## Files to Create

```text
components/comments/CommentInput.tsx
```

---

## Responsibilities

- Text input
- Send button
- Keyboard avoidance
- Character counter
- Disable while posting
- Clear input after successful send

---

# Phase 5.3.4 – Replies

## Objective

Support threaded conversations.

---

## Files to Create

```text
components/comments/ReplyItem.tsx

components/comments/ReplyInput.tsx
```

---

## Responsibilities

- Reply to comment
- View replies
- Collapse replies
- Reply count
- Nested rendering

---

# Phase 5.3.5 – Comment Actions

## Objective

Support user interaction on comments.

---

## Files to Create

```text
components/comments/CommentActions.tsx
```

---

## Responsibilities

- Like comment
- Report comment
- Delete own comment
- Edit own comment

---

# Phase 5.3.6 – Realtime Updates

## Objective

Synchronize comments instantly across users.

---

## Files to Edit

```text
stores/commentsStore.ts

services/comments.service.ts

components/feed/CommentSheet.tsx
```

---

## Responsibilities

- Live comments
- Live comment count
- Optimistic updates
- Automatic refresh
- Supabase realtime integration

---

# Phase 5.3.7 – Pagination

## Objective

Handle large comment threads efficiently.

---

## Responsibilities

- Infinite scrolling
- Pull to refresh
- Load more comments
- Preserve scroll position
- Reduce unnecessary re-renders

---

# Phase 5.3.8 – Final Polish

## Objective

Complete the production-ready experience.

---

## Responsibilities

- Skeleton loading
- Empty state
- Error state
- Offline support
- Smooth animations
- Keyboard polish
- Performance optimization

---

# Success Criteria

- Comment button opens the Bottom Sheet.
- Comments load using the existing comment service.
- Loading indicator is displayed while comments are fetched.
- Empty state appears when no comments exist.
- Users can add comments.
- Users can reply to comments.
- Comment count updates automatically.
- Like comment functionality works.
- Report comment functionality works.
- Delete and edit work for comment owners.
- Real-time updates synchronize across users.
- Pagination supports long discussions.
- Keyboard interaction is smooth on both Android and iOS.
- Existing stores and services remain the single source of truth.
- No business logic is duplicated.
- UI remains fully native and consistent with the rest of the Expo application.