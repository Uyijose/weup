# Phase 5.6 – Upload Migration

The Upload section allows authenticated users to select a video, preview it, add a caption, select up to three topics, optionally create a custom topic, and publish the video.

The migration should preserve the existing web upload behavior while adapting the entire experience to React Native/Expo.

The Expo implementation should use native file/video APIs instead of browser APIs such as:

```text
<input type="file">
document.createElement("video")
URL.createObjectURL()
document.getElementById()
```

The existing upload business logic should be reused where possible, especially:

```text
stores/uploadVideoStore.ts
services/upload.service.ts
stores/topicsStore.ts
```

---

# Objective

Port the complete Upload system from the Next.js frontend to Expo.

The Expo implementation should allow authenticated users to:

* Open the Upload screen
* Select a video from the device
* Read video metadata
* Validate video duration
* Display a native video preview
* Remove the selected video
* Enter a caption
* Search available topics
* Select up to 3 topics
* Create a custom topic
* Remove selected topics
* Validate caption
* Validate video selection
* Validate topic selection
* Upload the video
* Display upload/compression progress
* Display upload status
* Prevent duplicate uploads
* Handle upload errors
* Reset the upload state
* Navigate to the created post after upload
* Cancel/discard the upload
* Work correctly with Expo Router
* Reuse the existing Supabase client
* Reuse the existing upload store/service where appropriate
* Keep styles in separate style files
* Use native Expo/React Native APIs
* Avoid web-only APIs

---

# Architecture

```text
Upload
├── Upload Screen
│   ├── Video Picker
│   ├── Video Preview
│   ├── Caption Input
│   ├── Topic Search
│   ├── Topic Selection
│   ├── Custom Topic
│   └── Upload Actions
│
├── Upload Logic
│   ├── File Selection
│   ├── Video Metadata
│   ├── Validation
│   ├── Compression
│   ├── Upload
│   ├── Progress
│   ├── Error Handling
│   └── Reset
│
├── Existing State
│   ├── uploadVideoStore.ts
│   └── topicsStore.ts
│
├── Services
│   └── upload.service.ts
│
└── Navigation
    └── Post Viewer
```

---

# Phase 5.6.1 – Upload Screen

## Objective

Build the main native Upload screen.

The existing web screen is:

```text
frontend/pages/upload/create.js
```

The main web upload component is:

```text
frontend/components/CreateVideo.js
```

The Expo screen should be:

```text
app/(tabs)/upload.tsx
```

---

## Responsibilities

The Upload screen should:

* Check authentication
* Reset upload state when entering the screen
* Display the video picker
* Display the selected video preview
* Display caption input
* Display topic selection
* Display custom topic input
* Display upload progress
* Display upload button
* Display cancel button
* Handle upload errors
* Handle successful upload
* Navigate to the created post

---

## Authentication

The web implementation currently performs an authentication guard.

The Expo version should use the existing authentication architecture:

```text
context/AuthProvider.tsx
stores/authStore.ts
```

The upload screen must not allow unauthenticated users to publish a video.

The screen should wait for authentication hydration before deciding whether the user is authenticated.

---

## Files

```text
app/(tabs)/upload.tsx
styles/upload/upload.styles.ts
```

---

## Success Criteria

* Upload screen loads
* Authentication is checked
* Upload state is reset appropriately
* Video picker is displayed
* Caption input is displayed
* Topic selector is displayed
* Upload button is displayed
* Cancel button is displayed
* Native mobile layout works correctly

---

# Phase 5.6.2 – Video Picker

## Objective

Replace the browser file input with a native Expo video picker.

The web implementation currently uses:

```text
<input type="file">
```

This cannot be used in React Native.

Expo should use the existing:

```text
hooks/useSelectFile.ts
```

where appropriate.

If the existing hook does not provide the required video-selection behavior, it should be updated rather than creating duplicate file-selection logic.

---

## Responsibilities

The video picker should:

* Open the device media picker
* Allow video selection
* Return the selected video URI
* Return available video metadata
* Handle cancellation
* Handle picker errors
* Log selection events

---

## Native API

The implementation should use the Expo-compatible media picker already supported by the project.

The selected asset should provide information such as:

```text
uri
fileName
mimeType
fileSize
duration
```

where available.

---

## Component

```text
components/upload/VideoPicker.tsx
```

---

## Style

```text
styles/upload/videoPicker.styles.ts
```

---

## Success Criteria

* User can tap Select Video
* Native video picker opens
* User can select a video
* Selected video URI is returned
* Picker cancellation does not produce an error
* Picker errors are handled
* Selected video is passed to upload state

---

# Phase 5.6.3 – Video Metadata and Validation

## Objective

Replace the browser-based video metadata logic.

The web implementation currently uses:

```js
document.createElement("video")
URL.createObjectURL(file)
video.onloadedmetadata
```

This must not be ported to Expo.

Expo should obtain video metadata through the selected media asset/native APIs.

---

## Duration Rules

The existing web implementation has two important duration rules.

### Maximum duration

```text
30 minutes
```

If the video exceeds 30 minutes:

```text
Video must not exceed 30 minutes
```

The video should not be accepted.

---

### Part splitting notification

Videos longer than:

```text
3 minutes
```

are allowed.

The existing system informs the user that the video will be split into parts.

Example:

```text
Your video is 8 mins long. It will be split into 3 parts.
```

Expo should preserve this behavior.

The actual splitting/upload behavior should remain in the existing upload logic rather than being duplicated inside the UI.

---

## File Size

The web UI currently displays:

```text
Maximum file size for 3 mins video: 50MB
```

The Expo implementation should preserve the existing backend/upload constraints.

The exact file-size validation should be implemented only if the existing upload service/store already enforces or exposes that rule.

---

## Success Criteria

* Video duration is detected
* Videos over 30 minutes are rejected
* Videos over 3 minutes receive the appropriate notification
* Valid videos continue to preview
* Validation occurs before upload
* Validation errors are visible to the user

---

# Phase 5.6.4 – Video Preview

## Objective

Display the selected video using a native React Native video component.

The web implementation uses:

```jsx
<video
  className="video-preview"
  controls
  loop
  src={selectedFile.preview}
/>
```

Expo must replace this with the project's existing native video implementation where appropriate.

Existing component:

```text
components/feed/VideoPlayer.tsx
```

If that component already supports the required preview behavior, it should be reused.

If it is specifically designed for feed playback and is not appropriate for upload previews, use:

```text
components/upload/VideoPreview.tsx
```

---

## Component

```text
components/upload/VideoPreview.tsx
```

---

## Style

```text
styles/upload/videoPreview.styles.ts
```

---

## Responsibilities

Display:

```text
Selected Video
       ↓
Native Video Preview
       ↓
Delete / Remove
```

The preview should:

* Display the selected video
* Allow basic playback controls where appropriate
* Not start an upload
* Allow the user to remove the selected video

---

## Remove Video

The web implementation uses:

```text
MdDelete
```

and:

```js
setSelectedFile("")
```

Expo should provide a native delete/remove button.

When pressed:

```text
Selected video
      ↓
Remove
      ↓
Video picker displayed again
```

The selected video state should be cleared.

---

# Phase 5.6.5 – Caption Input

## Objective

Port the caption input from the web implementation.

The web uses:

```text
<input type="text">
```

Expo should use:

```text
TextInput
```

---

## Responsibilities

* Display caption input
* Update caption state
* Preserve existing upload store state
* Validate minimum caption length

---

## Validation

The existing web implementation requires:

```text
Caption must be at least 3 characters
```

Therefore:

```text
Empty caption
    ↓
Reject

1–2 characters
    ↓
Reject

3+ characters
    ↓
Continue
```

---

## Component

The caption input can remain inside the Upload screen unless a reusable component is needed.

If separated:

```text
components/upload/CaptionInput.tsx
```

---

## Style

```text
styles/upload/captionInput.styles.ts
```

---

## Success Criteria

* Caption can be entered
* Caption is stored correctly
* Empty captions are rejected
* Captions shorter than 3 characters are rejected
* Valid captions continue to upload validation

---

# Phase 5.6.6 – Topic Selection

## Objective

Port the topic selection system from the web.

The web obtains topics using:

```text
stores/topicsStore.ts
```

The Expo implementation should reuse the existing topic store.

---

## Responsibilities

* Fetch topics
* Display topics
* Search topics
* Select topics
* Deselect topics
* Display post counts
* Limit selection to 3 topics
* Display selected topics
* Remove selected topics

---

## Topic Data

The existing web UI displays:

```text
Topic Name
Total Posts
```

Example:

```text
Music (125)
Sports (82)
Technology (51)
```

Expo should preserve this information.

---

## Component

```text
components/upload/TopicSelector.tsx
```

---

## Style

```text
styles/upload/topicSelector.styles.ts
```

---

## Selection Limit

The existing web implementation allows a maximum of:

```text
3 topics
```

If the user attempts to select a fourth topic:

```text
You can select up to 3 topics
```

should be displayed.

---

## Success Criteria

* Topics load from the existing topic store
* Topics are displayed
* User can select topics
* User can deselect topics
* Maximum of 3 topics is enforced
* Selected topics are clearly displayed
* Selected topics can be removed

---

# Phase 5.6.7 – Topic Search

## Objective

Port the web topic search functionality.

The web implementation filters topics using:

```js
topics.filter(t =>
  t.name.toLowerCase().includes(searchQuery.toLowerCase())
)
```

Expo should implement the same behavior.

---

## Responsibilities

* Search topic names
* Case-insensitive filtering
* Update results as the user types
* Reset pagination/filter state appropriately

---

## Component

The topic search can remain inside:

```text
components/upload/TopicSelector.tsx
```

unless the implementation becomes large enough to justify:

```text
components/upload/TopicSearchInput.tsx
```

---

## Success Criteria

Example:

```text
User enters:

music

↓

Music
Music Videos
Music Production
```

Only matching topics should be displayed.

---

# Phase 5.6.8 – Topic Pagination / List Handling

The web implementation displays:

```text
15 topics per page
```

and provides:

```text
Prev
Next
```

For mobile, the preferred implementation should be a native scrollable list rather than reproducing the desktop pagination UI unnecessarily.

The Expo implementation should display topics efficiently using a native list such as:

```text
FlatList
```

---

## Responsibilities

* Efficiently render topics
* Support scrolling
* Avoid rendering unnecessary topic elements
* Work with topic search
* Maintain the maximum 3-selection rule

---

## Success Criteria

* Large topic lists remain performant
* Topics can be scrolled
* Search continues to work
* Selection state remains correct

---

# Phase 5.6.9 – Custom Topic

## Objective

Port the web "Other" topic behavior.

The web allows:

```text
Other
```

to create a custom topic.

Expo should provide the same capability using native controls.

---

## Responsibilities

When the user selects:

```text
Other
```

display:

```text
Type custom topic
```

and:

```text
Done
```

The custom topic should be converted to the format expected by the existing upload system.

The web implementation currently converts whitespace to underscores:

```text
hello world
```

becomes:

```text
hello_world
```

---

## Component

Can remain inside:

```text
components/upload/TopicSelector.tsx
```

---

## Validation

The custom topic must not be empty.

The existing upload flow also contains custom-topic/tag validation.

The Expo implementation should preserve the existing business rule used by:

```text
stores/uploadVideoStore.ts
```

rather than creating a second custom-topic validation system.

---

## Success Criteria

* Other can be selected
* Custom topic input appears
* User can enter a topic
* Whitespace handling matches the web behavior
* Custom topic can be confirmed
* Custom topic becomes one of the selected topics
* Maximum of 3 topics still applies

---

# Phase 5.6.10 – Upload Validation

## Objective

Validate the complete upload form before calling the upload logic.

The web implementation validates:

```text
Caption
Video
Topics
Custom Topic
```

---

## Validation Order

Expo should validate in this order:

```text
1. Caption
      ↓
2. Video
      ↓
3. Topic
      ↓
4. Custom topic
      ↓
5. Upload
```

---

## Caption

Reject:

```text
Empty
Less than 3 characters
```

Display:

```text
Caption must be at least 3 characters
```

---

## Video

If no video is selected:

```text
Please upload a video
```

---

## Topic

If no topic is selected:

```text
Please select a topic
```

---

## Success Criteria

Invalid uploads never reach the upload service.

Valid uploads continue to:

```text
handlePost()
```

or the appropriate existing upload-store method.

---

# Phase 5.6.11 – Upload Progress

## Objective

Port the existing upload/compression progress UI to native mobile.

The web implementation displays:

```text
uploadMessage
uploadProgress
```

with a progress bar.

The existing state already comes from:

```text
stores/uploadVideoStore.ts
```

---

## Existing State

Reuse:

```text
loading
uploadProgress
uploadMessage
redirecting
```

where these states already represent the existing upload process.

Do not create duplicate upload progress state inside the Upload screen unless necessary.

---

## Component

Existing component:

```text
components/upload/UploadProgress.tsx
```

should be used.

---

## Style

```text
styles/upload/uploadProgress.styles.ts
```

---

## UI

The native UI should display:

```text
Compressing video...
```

or the current:

```text
uploadMessage
```

followed by:

```text
[████████████------] 70%
```

The exact message should come from the upload store.

---

## Success Criteria

* Progress appears immediately after upload starts
* Progress percentage updates
* Current upload message displays
* User understands that upload is still running
* Upload button cannot trigger duplicate uploads

---

# Phase 5.6.12 – Upload Action

## Objective

Connect the native Upload button to the existing upload business logic.

The web implementation ultimately calls:

```js
handlePost(router)
```

The Expo implementation should not pass a Next.js router object into the store.

Instead, the upload store/service should perform the upload operation and return enough information for the Expo screen to navigate using Expo Router.

---

## Responsibilities

The Upload action should:

* Validate the form
* Save selected topics
* Start upload
* Display progress
* Handle errors
* Handle success
* Navigate to the created post

---

## Existing Logic

Primary state:

```text
stores/uploadVideoStore.ts
```

Primary service:

```text
services/upload.service.ts
```

These should be inspected before creating any new upload logic.

---

## Success Criteria

```text
Tap Post
   ↓
Validate
   ↓
Upload
   ↓
Progress
   ↓
Success
   ↓
Navigate to created post
```

---

# Phase 5.6.13 – Upload Error Handling

## Objective

Improve the existing upload error behavior for Expo.

The native implementation should visibly handle errors rather than silently failing.

---

## Handle

* Video picker failure
* Invalid video
* Video metadata failure
* Compression failure
* Network failure
* Supabase failure
* Storage upload failure
* Post creation failure
* Authentication failure
* Unexpected upload failure

---

## Error UI

Display a clear message such as:

```text
Unable to upload video.

Try again
```

The exact error returned by the upload service should be logged for debugging.

---

## Logging

The implementation should include useful:

```text
console.log()
console.error()
```

statements around:

```text
Video selected
Video metadata
Validation
Topic selection
Upload started
Upload progress
Upload completed
Upload failed
Navigation
State reset
```

No comments should be added to the implementation.

---

# Phase 5.6.14 – Cancel / Discard Upload

## Objective

Port the web Cancel functionality.

The web implementation does:

```js
resetUpload();
router.push("/");
```

Expo should:

```text
resetUpload()
      ↓
Expo Router navigation
```

---

## Responsibilities

* Clear selected video
* Clear caption
* Clear selected topics
* Clear upload progress
* Clear upload message
* Clear upload errors
* Reset upload state
* Navigate away from Upload

---

## Success Criteria

When the user taps Cancel:

```text
Upload state cleared
       ↓
Upload screen exited
```

Returning to Upload should start with a clean state.

---

# Phase 5.6.15 – Successful Upload Navigation

## Objective

Replace the Next.js router navigation used by the web implementation.

The Expo implementation should use:

```text
expo-router
```

---

## Flow

```text
Upload completed
       ↓
Post created
       ↓
Get post ID
       ↓
router.push(...)
       ↓
Post Viewer
```

The exact route should match the existing Expo implementation:

```text
app/posts/[id].tsx
```

---

## Success Criteria

* Successful upload does not leave the user stuck on Upload
* Created post ID is available
* Correct post viewer opens
* Upload state is reset appropriately

---

# Phase 5.6.16 – Existing Upload Components

The current Expo project already contains:

```text
components/upload/
├── UploadProgress.tsx
├── VideoPicker.tsx
└── VideoPreview.tsx
```

These components should be treated as the starting point rather than creating duplicate components.

---

## Components

### VideoPicker

```text
components/upload/VideoPicker.tsx
```

Responsible for native video selection.

### VideoPreview

```text
components/upload/VideoPreview.tsx
```

Responsible for selected-video preview and removal.

### UploadProgress

```text
components/upload/UploadProgress.tsx
```

Responsible for compression/upload progress.

Additional components may be introduced only where they provide a clear separation of responsibilities.

---

# Phase 5.6.17 – Upload Service

The existing service is:

```text
services/upload.service.ts
```

This should remain the central location for upload-related API/storage operations.

---

## Responsibilities

The service should handle operations such as:

```text
Video upload
Storage upload
Post creation
Upload-related Supabase operations
```

The UI should not directly contain Supabase upload business logic.

---

## Success Criteria

* Upload logic remains centralized
* UI components remain presentational
* Supabase operations are not duplicated
* Existing upload functionality is preserved

---

# Phase 5.6.18 – Upload Store

The existing store is:

```text
stores/uploadVideoStore.ts
```

This store already contains important upload state.

The migration should reuse the existing state rather than introducing a second upload store.

---

## Existing State

The web component currently consumes:

```text
caption
topic
hashTags
selectedFile
loading
uploadProgress
uploadMessage
redirecting
```

and methods including:

```text
setCaption
setTopic
setSelectedFile
handlePost
resetUpload
```

The Expo implementation should preserve these responsibilities where possible.

---

## Important Expo Change

The store must not depend on:

```text
Next.js router
```

or other browser-specific APIs.

Navigation should remain in the Expo screen using:

```text
expo-router
```

---

# Phase 5.6.19 – Styling

All Upload styles should remain outside the component files.

Create:

```text
styles/upload/
```

with:

```text
upload.styles.ts
videoPicker.styles.ts
videoPreview.styles.ts
uploadProgress.styles.ts
topicSelector.styles.ts
captionInput.styles.ts
```

Additional style files should only be created when needed.

---

## Architecture Rule

Do not use:

```text
style={{ ... }}
```

for normal component styling.

Use:

```text
StyleSheet.create()
```

inside the appropriate style file.

---

# Proposed Files

After Phase 5.6 is complete, the Upload-related files should be:

```text
app/
└── (tabs)/
    └── upload.tsx

components/
└── upload/
    ├── UploadProgress.tsx
    ├── VideoPicker.tsx
    ├── VideoPreview.tsx
    ├── TopicSelector.tsx
    └── CaptionInput.tsx

services/
└── upload.service.ts

stores/
├── uploadVideoStore.ts
└── topicsStore.ts

hooks/
└── useSelectFile.ts

styles/
└── upload/
    ├── upload.styles.ts
    ├── videoPicker.styles.ts
    ├── videoPreview.styles.ts
    ├── uploadProgress.styles.ts
    ├── topicSelector.styles.ts
    └── captionInput.styles.ts
```

---

# Upload Architecture

```text
                         ┌─────────────────────┐
                         │ app/(tabs)/upload   │
                         │      .tsx           │
                         │                     │
                         │ Upload Screen       │
                         │ Validation          │
                         │ Navigation          │
                         └──────────┬──────────┘
                                    │
             ┌──────────────────────┼──────────────────────┐
             │                      │                      │
             ▼                      ▼                      ▼
    ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
    │  Video Picker   │    │ Topic Selector  │    │ Caption Input   │
    │                 │    │                 │    │                 │
    │ Native Picker   │    │ Topic Search    │    │ TextInput       │
    │ Video Metadata  │    │ Max 3 Topics    │    │ Validation      │
    └────────┬────────┘    └────────┬────────┘    └────────┬────────┘
             │                      │                      │
             └──────────────────────┼──────────────────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ uploadVideoStore.ts │
                         │                     │
                         │ State               │
                         │ Validation          │
                         │ Progress            │
                         │ Upload Control      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ upload.service.ts   │
                         │                     │
                         │ Storage Upload      │
                         │ Post Creation       │
                         └──────────┬──────────┘
                                    │
                                    ▼
                              ┌───────────┐
                              │ Supabase  │
                              └─────┬─────┘
                                    │
                                    ▼
                              Created Post
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ app/posts/[id].tsx  │
                         │                     │
                         │ Post Viewer         │
                         └─────────────────────┘
```

---

# Overall Success Criteria

## Upload Screen

* [ ] Upload screen loads correctly
* [ ] Authentication is checked
* [ ] Upload state resets appropriately
* [ ] Native mobile layout works
* [ ] No browser APIs are used

## Video

* [ ] Native video picker works
* [ ] Video can be selected
* [ ] Video metadata is obtained
* [ ] Video preview works
* [ ] Video can be removed
* [ ] Videos over 30 minutes are rejected
* [ ] Videos over 3 minutes receive the splitting notification

## Caption

* [ ] Caption can be entered
* [ ] Caption is stored correctly
* [ ] Minimum 3-character validation works

## Topics

* [ ] Topics load from Supabase/existing topic store
* [ ] Topics display correctly
* [ ] Topic search works
* [ ] Search is case-insensitive
* [ ] Maximum 3 topics is enforced
* [ ] Selected topics display correctly
* [ ] Topics can be removed
* [ ] Other/custom topic works
* [ ] Custom topic validation works

## Upload

* [ ] Upload validation works
* [ ] Upload starts correctly
* [ ] Compression/upload progress displays
* [ ] Upload message displays
* [ ] Duplicate uploads are prevented
* [ ] Network errors are handled
* [ ] Supabase errors are handled
* [ ] Upload failures are visible
* [ ] Successful upload returns the created post

## Navigation

* [ ] Cancel resets upload state
* [ ] Cancel exits Upload
* [ ] Successful upload navigates to the correct post
* [ ] Expo Router is used
* [ ] No Next.js router is used

## Architecture

* [ ] Existing `uploadVideoStore.ts` is reused
* [ ] Existing `topicsStore.ts` is reused
* [ ] Existing `upload.service.ts` is reused
* [ ] Existing `VideoPicker.tsx` is reused/updated
* [ ] Existing `VideoPreview.tsx` is reused/updated
* [ ] Existing `UploadProgress.tsx` is reused/updated
* [ ] Existing `useSelectFile.ts` is reused where appropriate
* [ ] Supabase remains the data source
* [ ] Upload business logic is not duplicated
* [ ] All styles live under `styles/upload/`
* [ ] No unnecessary Zustand store is created
* [ ] No web-only APIs are used
* [ ] No inline styles are used
* [ ] Expo Router handles navigation
* [ ] Useful `console.log`/`console.error` debugging is included
* [ ] No code comments are added

---

# Phase 5.6 Completion

The Upload migration is complete when an authenticated user can select a video from their device, preview and remove it, enter a caption, select up to three topics or create a custom topic, validate the upload, upload the video with visible progress, receive clear error feedback when something fails, and navigate to the newly created post after a successful upload.

The implementation should preserve the existing WeUp upload business logic while replacing browser-specific functionality with native Expo/React Native functionality.
