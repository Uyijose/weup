# WeUp Expo Migration

# Phase 5 – Post Viewer Migration Plan

The goal of this phase is to migrate the web Post Viewer into a native Expo React Native implementation while keeping the existing business logic (stores, services, Supabase, etc.) and rewriting only the UI.

---

# Overall Roadmap

```
Phase 5.1
├── Route
├── Fetch post
├── Fullscreen video
├── Basic autoplay

Phase 5.2
├── Native Video Player
├── Play/Pause
├── Mute
├── Progress Bar
├── Seek/Scrubbing

Phase 5.3
├── User Information
├── Caption
├── Topic Tags
├── Verified Badge

Phase 5.4
├── Like Button
├── Comment Button
├── Share Button
├── Report Button

Phase 5.5
├── Comments Bottom Sheet
├── Comment Count Updates

Phase 5.6
├── Swipe Between Posts
├── Preload Videos
├── Infinite Feed

Phase 5.7
├── Multi-part Videos
├── Next Part Overlay

Phase 5.8
├── Loading States
├── Skeleton UI
├── Animations
├── Error Handling
├── Performance Optimizations
```

---

# Phase 5.1 – Basic Post Viewer

## Objective

Build the first working version of the Post Viewer.

At this stage we are **not** implementing:

- Likes
- Comments
- Shares
- Reports
- Next Part Overlay
- Progress Bar
- Volume Controls
- Gestures

The only goal is to successfully display and play a video.

---

## Features

The screen should:

- Open from `/posts/[id]`
- Load the selected post
- Display the video full-screen
- Auto-play the video
- Loop the video
- Tap once to play/pause

Nothing more.

---

# Folder Structure

Create the following folders and files.

```
app/
└── posts/
    └── [id].tsx

components/
└── post/
    ├── PostViewer.tsx
    └── PostVideo.tsx

styles/
└── post/
    ├── postViewer.styles.ts
    └── postVideo.styles.ts
```

---

# Future Components

These will be created in later phases.

```
components/post/

ActionBar.tsx

PostHeader.tsx

PostCaption.tsx

ProgressBar.tsx

NextPartOverlay.tsx

CommentsSheet.tsx

ReportSheet.tsx
```

---

# Existing Files We'll Reuse

The following file already exists and will continue to be used.

```
stores/postsStore.ts
```

We will only extend it with helper methods where necessary.

No major refactoring should be required.

---

# Phase 5.2 – Video Controls

After Phase 5.1 is working, implement native video controls using Expo Video.

Features:

- Play
- Pause
- Mute
- Progress Bar
- Seek
- Loop
- Playback State

This replaces the web `<video>` implementation.

---

# Phase 5.3 – User Information

Port the creator information section.

Components:

- Avatar
- Username
- Verified Badge
- Caption
- Topic Hashtags

---

# Phase 5.4 – Action Buttons

Migrate the action buttons.

Components:

- Like
- Comments
- Share
- Report
- Telegram/Community Button

---

# Phase 5.5 – Comments

Replace the web modal with a native bottom sheet.

Recommended package:

```
@gorhom/bottom-sheet
```

Features:

- Open comments
- Close comments
- Update comment count
- Reply support (future)

---

# Phase 5.6 – TikTok Style Feed

Replace the web scrolling container.

Instead of:

```
RightHandSide.js
```

Use:

```
FlatList

pagingEnabled

viewabilityConfig

onViewableItemsChanged
```

This gives native TikTok-style vertical paging.

---

# Phase 5.7 – Multi-Part Videos

Implement:

- Next Part Overlay
- Automatic Part Detection
- Continue Watching
- Next Part Navigation

The overlay should be implemented using React Native animations.

---

# Phase 5.8 – Final Polish

Finish the Post Viewer with:

- Loading Skeleton
- Error States
- Offline Handling
- Video Preloading
- Smooth Animations
- Performance Improvements

---








# Phase 5.4 & 5.5 – Actions and Comments

## Objective

Complete the right-side interaction panel and migrate comments to a native bottom sheet.

At the end of these phases, every fullscreen post should support:

- Like
- Comment
- Share
- Report
- Telegram / Community
- Native Comment Bottom Sheet

---

# Recommended Package

```bash
npm install @gorhom/bottom-sheet
npx expo install react-native-reanimated react-native-gesture-handler
```

---

# Files to Edit

```text
components/feed/PostCard.tsx
components/feed/LikeButton.tsx
components/feed/ShareButton.tsx
components/feed/CommentSheet.tsx
styles/feed/postCard.styles.ts
styles/feed/likeButton.styles.ts
styles/feed/shareButton.styles.ts
```

---

# Files to Create

```text
components/feed/PostActions.tsx
styles/feed/postActions.styles.ts
styles/feed/commentSheet.styles.ts
```

---

# Phase Order

## Phase 5.4.1

Create

```text
components/feed/PostActions.tsx
```

Responsibilities

- Right-side action container
- Like button
- Comment button
- Share button
- Report button
- Telegram / Community button

---

## Phase 5.4.2

Update

```text
components/feed/LikeButton.tsx
```

Responsibilities

- Toggle like
- Display like count
- Update UI immediately

---

## Phase 5.4.3

Update

```text
components/feed/ShareButton.tsx
```

Responsibilities

- Native Share API
- Display share count (if available)

---

## Phase 5.4.4

Update

```text
components/feed/PostCard.tsx
```

Responsibilities

Render

```text
VideoPlayer

↓

UserInfo

↓

PostActions
```

No business logic.

---

## Phase 5.4.5

Create

```text
styles/feed/postActions.styles.ts
```

Responsibilities

Style

- Right-side floating buttons
- Spacing
- Count labels

---

# Phase 5.5

---

## Phase 5.5.1

Update

```text
components/feed/CommentSheet.tsx
```

Responsibilities

- Replace modal
- Use Bottom Sheet
- Open
- Close
- Snap points

---

## Phase 5.5.2

Create

```text
styles/feed/commentSheet.styles.ts
```

Responsibilities

Style

- Bottom sheet
- Header
- Comment list
- Input area

---

## Phase 5.5.3

Connect

```text
components/feed/PostActions.tsx
```

Responsibilities

- Open CommentSheet
- Close CommentSheet
- Display comment count

---

# Component Flow

```text
FeedViewer

↓

PostCard

├── VideoPlayer
├── UserInfo
└── PostActions
        │
        ├── LikeButton
        ├── Comment
        ├── ShareButton
        ├── Report
        └── Telegram

↓

CommentSheet
```

---

# Success Criteria

- Right-side action buttons are displayed.
- Like button updates correctly.
- Share uses the native share dialog.
- Comment button opens a native Bottom Sheet.
- Bottom Sheet can be dismissed by swipe or backdrop.
- Comment count is displayed.
- PostCard remains a layout component only.
- FeedViewer continues to own playback only.