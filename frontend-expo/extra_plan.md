# Phase 5.7 – Messages Migration

The Messages section allows authenticated users to view their conversations, search conversations, start new conversations, exchange messages in real time, see typing status, see online/offline presence, and navigate between conversations.

The migration should preserve the existing web messaging behavior while adapting the entire experience to React Native/Expo.

The Expo implementation should replace browser-specific APIs such as:

```text
document.querySelector()
document.addEventListener()
<input>
<div>
<button>
Next.js router
window/document scrolling
```

with native React Native and Expo APIs.

The existing messaging business logic should be reused where possible, especially:

```text
stores/messagesStore.ts
services/messaging.service.ts
utils/messagesApi.ts
utils/realtimeChat.ts
context/AuthProvider.tsx
stores/authStore.ts
```

The Expo implementation should use:

```text
expo-router
FlatList
TextInput
Pressable
KeyboardAvoidingView
SafeAreaView / react-native-safe-area-context
```

where appropriate.

---

# Objective

Port the complete Messages system from the Next.js frontend to Expo.

The Expo implementation should allow authenticated users to:

* Open the Messages screen
* View conversations
* Search conversations
* Display the last message
* Display empty conversation state
* Open an existing conversation
* Start a new conversation
* Search users
* Display user search results
* Create a conversation
* Send messages
* Receive messages in real time
* Display typing status
* Display online/offline presence
* Handle keyboard appearance correctly
* Keep the message composer visible above the keyboard
* Scroll naturally through messages
* Prevent empty messages from being sent
* Handle loading states
* Handle errors
* Handle unauthenticated users
* Navigate using Expo Router
* Return from a conversation using native navigation
* Reuse the existing Messages store
* Reuse the existing messaging service/API
* Reuse the existing realtime messaging functionality
* Keep styles outside component files
* Avoid web-only APIs

---

# Architecture

```text
Messages
│
├── Messages List Screen
│   ├── Header
│   ├── Search
│   ├── Conversation List
│   ├── Empty State
│   └── New Message Action
│
├── Conversation Screen
│   ├── Header
│   │   ├── Back Button
│   │   ├── Conversation Title
│   │   └── Online / Offline / Typing Status
│   │
│   ├── Message List
│   │   ├── Incoming Messages
│   │   └── Outgoing Messages
│   │
│   └── Message Composer
│       ├── Text Input
│       └── Send Button
│
├── New Message Screen
│   ├── Search Input
│   ├── User Results
│   └── Start Conversation
│
├── Existing State
│   ├── messagesStore.ts
│   └── authStore.ts
│
├── Services
│   ├── messaging.service.ts
│   └── messagesApi.ts
│
├── Realtime
│   └── realtimeChat.ts
│
└── Navigation
    ├── Messages
    ├── Conversation
    └── New Message
```

---

# Existing Web Implementation

The current web implementation consists of:

```text
frontend/pages/messages/index.js
frontend/pages/messages/[id].js
frontend/pages/messages/new.js

frontend/stores/messagesStore.js

frontend/utils/messagesApi.js
frontend/utils/realtimeChat.js
```

The Expo project already contains:

```text
app/chat/[id].tsx
app/chat/new.tsx

components/messaging/
├── ChatBubble.tsx
├── ChatInput.tsx
├── ConversationItem.tsx
└── TypingIndicator.tsx

stores/messagesStore.ts
services/messaging.service.ts
utils/messagesApi.ts
utils/realtimeChat.ts
```

Therefore, these existing files should be inspected and reused rather than creating duplicate messaging components.

---

# Phase 5.7.1 – Messages Screen

## Objective

Build the main native Messages screen.

The existing web screen is:

```text
frontend/pages/messages/index.js
```

The Expo Messages entry point should be:

```text
app/(tabs)/messages.tsx
```

If the Messages tab is intentionally represented by another existing route, use the existing route rather than creating a duplicate route.

---

## Responsibilities

The Messages screen should:

* Check authentication
* Wait for authentication hydration
* Redirect unauthenticated users appropriately
* Load conversations
* Display conversations
* Search conversations
* Display conversation titles
* Display the latest message
* Display an empty state
* Allow users to open conversations
* Allow users to start a new conversation
* Support pull-to-refresh
* Display loading state
* Display errors
* Use native scrolling

---

## Native UI

The web implementation:

```text
<input>
<div>
<button>
```

should become:

```text
TextInput
FlatList
Pressable
```

The conversation list should use `FlatList` rather than rendering a large array directly.

---

## Authentication

The Expo implementation should reuse:

```text
context/AuthProvider.tsx
stores/authStore.ts
```

The screen must wait for authentication hydration before deciding whether the user is authenticated.

Do not immediately redirect while authentication is still loading.

---

## Navigation

The web implementation currently uses:

```text
router.push("/messages/new")
router.push(`/messages/${conversationId}`)
router.push("/")
```

Expo should use:

```text
router.push("/chat/new")
router.push(`/chat/${conversationId}`)
router.back()
```

using:

```text
expo-router
```

No Next.js router should be used.

---

## Search

The conversation search should remain client-side because the existing web implementation filters the already-loaded conversation list.

The search should:

* Be case-insensitive
* Match conversation titles
* Update immediately as the user types
* Display all conversations when the search field is empty

---

## Files

Create if missing:

```text
app/(tabs)/messages.tsx
styles/messaging/messages.styles.ts
```

Reuse/update:

```text
components/messaging/ConversationItem.tsx
stores/messagesStore.ts
```

---

## Success Criteria

* Messages screen loads
* Authentication is checked
* Conversations load
* Conversations display correctly
* Search works
* Empty state works
* Loading state works
* Pull-to-refresh works
* Conversation can be opened
* New Message screen can be opened
* No browser APIs are used
* Expo Router is used

---

# Phase 5.7.2 – Conversation Item

## Objective

Create a native conversation list item.

The existing web implementation displays:

```text
conversation title
last message
```

The Expo version should provide a more native social-media experience.

---

## Responsibilities

Each conversation item should display:

* Conversation title
* Last message
* Optional timestamp if available
* Optional unread indicator if supported by existing data
* Optional avatar if available from the conversation data
* Press interaction

The component should not perform API calls.

It should remain presentational.

---

## Component

Reuse:

```text
components/messaging/ConversationItem.tsx
```

---

## Style

```text
styles/messaging/conversationItem.styles.ts
```

---

## Architecture Rule

Do not add messaging API logic to `ConversationItem.tsx`.

The component should receive its data through props.

---

# Phase 5.7.3 – Conversation Screen

## Objective

Port:

```text
frontend/pages/messages/[id].js
```

to the existing Expo route:

```text
app/chat/[id].tsx
```

---

## Responsibilities

The Conversation screen should:

* Read the conversation ID from Expo Router
* Check authentication
* Load conversations if necessary
* Open the selected conversation
* Load existing messages
* Display messages
* Subscribe to realtime messages
* Subscribe to typing events
* Subscribe to presence events
* Display conversation title
* Display online/offline status
* Display typing status
* Send messages
* Prevent empty messages
* Clear the composer after sending
* Handle loading
* Handle errors
* Allow navigation back
* Correctly handle the keyboard

---

# Conversation Initialization

The existing web flow is:

```text
loadConversations()
        ↓
openConversation(id)
        ↓
fetchMessages(id)
        ↓
display messages
```

The Expo version should preserve this behavior.

The screen should not duplicate message-fetching logic that already belongs inside:

```text
stores/messagesStore.ts
```

---

# Message List

The web implementation currently uses:

```text
convoMessages.map(...)
```

The Expo implementation should use:

```text
FlatList
```

for better mobile performance.

The list should support:

* Large conversations
* Smooth scrolling
* Automatic movement toward the latest message
* New realtime messages
* Keyboard interaction
* Native touch behavior

---

# Message Ordering

The implementation must inspect the order returned by:

```text
fetchMessages()
```

before deciding whether `FlatList` should use:

```text
inverted
```

Do not blindly use an inverted list.

The final Expo implementation should preserve the same visual message ordering as the existing web application.

---

# Message Bubble

The existing project already contains:

```text
components/messaging/ChatBubble.tsx
```

Reuse it.

The component should distinguish:

```text
sender_id === currentUser.id
```

from:

```text
sender_id !== currentUser.id
```

Outgoing messages should appear visually different from incoming messages.

---

# Component

```text
components/messaging/ChatBubble.tsx
```

Reuse/update rather than creating another message bubble component.

---

# Style

```text
styles/messaging/chatBubble.styles.ts
```

---

# Phase 5.7.4 – Chat Header

## Objective

Create the native conversation header.

The existing web header contains:

```text
Back button
Conversation title
Typing status
Online/offline status
```

The Expo version should preserve these functions.

---

## Header Layout

```text
┌──────────────────────────────────┐
│ ←   Conversation Name            │
│     online                       │
└──────────────────────────────────┘
```

When typing:

```text
┌──────────────────────────────────┐
│ ←   Conversation Name            │
│     typing...                    │
└──────────────────────────────────┘
```

---

## Responsibilities

The header should:

* Display back button
* Display conversation title
* Display typing state
* Display online state
* Display offline state
* Respect safe-area insets
* Avoid browser navigation

---

## Navigation

Use:

```text
router.back()
```

instead of:

```text
router.back()
```

from Next.js.

The actual implementation must import Router from:

```text
expo-router
```

---

# Phase 5.7.5 – Chat Input

## Objective

Replace the web:

```text
<input>
<button>
```

with a native message composer.

The existing component is:

```text
components/messaging/ChatInput.tsx
```

Reuse/update it.

---

## Responsibilities

The composer should:

* Accept text
* Update local text state
* Emit typing events
* Prevent empty messages
* Send the message
* Clear the input after successful send
* Handle send errors
* Remain visible when keyboard opens
* Support multiline text
* Allow the keyboard to submit/send where appropriate

---

## Native Components

Use:

```text
TextInput
Pressable
KeyboardAvoidingView
```

instead of browser elements.

---

# Keyboard Handling

The web implementation contains:

```text
document.querySelector(".chat-input input")
input.addEventListener("focus", ...)
input.scrollIntoView(...)
```

This must NOT be ported.

React Native should handle the keyboard through:

```text
KeyboardAvoidingView
```

and appropriate `FlatList` behavior.

Do not use:

```text
document
window
querySelector
scrollIntoView
```

---

# Phase 5.7.6 – Typing Indicator

## Objective

Display when another participant is typing.

The existing component is:

```text
components/messaging/TypingIndicator.tsx
```

Reuse/update it.

The existing realtime implementation already receives:

```text
onTyping
```

with states:

```text
typing
stop
```

---

## Behavior

When:

```text
data.state === "typing"
```

display:

```text
typing...
```

When:

```text
data.state === "stop"
```

remove the typing indicator.

The current user's own typing events must not cause the current user to see themselves as typing.

---

# Phase 5.7.7 – Presence

## Objective

Preserve the existing online/offline presence behavior.

The existing web implementation uses:

```text
onPresence
```

and checks whether another user's presence exists.

The Expo implementation should reuse the existing:

```text
utils/realtimeChat.ts
```

logic where possible.

---

## Status Priority

The UI should prioritize:

```text
typing...
```

over:

```text
online
```

and:

```text
offline
```

Therefore:

```text
typing...
```

should be displayed when another user is typing.

Otherwise:

```text
online
```

or:

```text
offline
```

should be displayed.

---

# Phase 5.7.8 – Realtime Messaging

## Objective

Port the existing realtime conversation subscription.

The existing web implementation calls:

```text
subscribeToConversation({
    conversationId,
    userId,
    onMessage,
    onTyping,
    onPresence
})
```

The Expo implementation should preserve this API where possible.

---

## Realtime Flow

```text
Conversation Screen
        │
        ▼
subscribeToConversation()
        │
        ├── New Message
        │      ↓
        │  appendMessage()
        │
        ├── Typing Event
        │      ↓
        │  Typing Indicator
        │
        └── Presence Event
               ↓
          Online / Offline
```

---

## Cleanup

The realtime subscription must be removed when the conversation screen unmounts.

The implementation should call the existing unsubscribe function.

This prevents:

* Duplicate subscriptions
* Duplicate messages
* Multiple typing indicators
* Memory leaks

---

# Phase 5.7.9 – Messages Store

## Objective

Reuse the existing:

```text
stores/messagesStore.ts
```

instead of creating another messaging store.

The existing web store contains:

```text
conversations
messages
activeConversation
loading
```

and:

```text
loadConversations
createConversation
openConversation
appendMessage
sendMessage
```

The Expo store should preserve these responsibilities.

---

# Important Expo Changes

The store must not depend on:

```text
Next.js
window
document
process.env.NEXT_PUBLIC_*
```

unless the project already has a properly configured Expo-compatible environment abstraction.

API configuration should use the existing Expo project configuration.

The store should remain responsible for state and orchestration, not UI navigation.

---

# Message Deduplication

The Expo implementation should guard against duplicate realtime messages.

Before appending a realtime message, check whether its ID already exists:

```text
messages[conversationId]
```

This is important because a sent message may potentially be returned through both:

```text
sendMessage()
```

and:

```text
realtime subscription
```

The store should avoid displaying the same message twice.

---

# Phase 5.7.10 – Messaging API

## Objective

Reuse the existing messaging API layer.

Existing files:

```text
utils/messagesApi.ts
services/messaging.service.ts
```

The final architecture should keep API/network operations outside UI components.

---

## Responsibilities

The API/service layer should handle:

```text
fetch conversations
fetch messages
send message
create conversation
```

where those operations already exist.

---

## Architecture

```text
UI
 ↓
messagesStore
 ↓
messaging.service / messagesApi
 ↓
Backend API
 ↓
Supabase / Database
```

The UI must not directly perform:

```text
fetch()
supabase.from()
```

for ordinary messaging operations when an existing service/API function already handles the operation.

---

# Phase 5.7.11 – New Message Screen

## Objective

Port:

```text
frontend/pages/messages/new.js
```

to:

```text
app/chat/new.tsx
```

---

## Responsibilities

The New Message screen should:

* Check authentication
* Display search input
* Search users
* Debounce search
* Display search results
* Display username
* Display full name
* Display creator username when available
* Handle no results
* Handle empty search
* Create a conversation
* Navigate to the newly created conversation
* Handle API errors
* Support back navigation

---

# User Search

The existing web implementation searches:

```text
users
```

using:

```text
username
full_name
creator_username
```

The Expo implementation should preserve this behavior.

Search should remain:

```text
case-insensitive
```

---

# Search Debouncing

The web implementation waits approximately:

```text
300ms
```

before performing the search.

The Expo implementation should preserve a similar debounce.

Do not send a Supabase request for every keystroke.

---

# User Search Architecture

Prefer:

```text
New Message Screen
        ↓
users/search service
        ↓
Supabase
```

rather than placing the entire Supabase query directly inside the component.

If an existing user/search service already supports the required query, reuse it.

Do not create a duplicate user-search service unnecessarily.

---

# User Result

The existing web result displays:

```text
username
full_name
@creator_username
```

The native version should display these in a more mobile-friendly layout.

Example:

```text
┌──────────────────────────────────┐
│ Avatar   username                │
│          Full Name               │
│          @creator_username       │
└──────────────────────────────────┘
```

If avatar information is available from the existing user data, the native implementation should display it.

---

# Phase 5.7.12 – Create Conversation

## Objective

Reuse the existing:

```text
createConversation()
```

logic.

The current web implementation passes:

```text
[user.id, targetUser.id]
false
null
```

representing:

```text
members
isGroup
title
```

The Expo implementation should preserve the same backend contract.

---

# Conversation Creation Flow

```text
User Search
     ↓
Select User
     ↓
createConversation()
     ↓
Conversation Created
     ↓
Get conversation.id
     ↓
router.push(`/chat/${id}`)
```

---

# Error Handling

If conversation creation fails:

* Do not crash the application
* Log the error
* Display a user-friendly error message
* Keep the user on the New Message screen
* Allow retry

Do not expose raw backend errors directly to users unless appropriate.

---

# Phase 5.7.13 – Messaging Components

The project already contains:

```text
components/messaging/
├── ChatBubble.tsx
├── ChatInput.tsx
├── ConversationItem.tsx
└── TypingIndicator.tsx
```

These should be treated as the starting point.

Do not create duplicate versions.

---

## Responsibilities

### ChatBubble

Responsible for:

```text
Message display
Sender/receiver styling
Message content
```

### ChatInput

Responsible for:

```text
Text input
Typing events
Send action
```

### ConversationItem

Responsible for:

```text
Conversation display
Title
Last message
Optional metadata
```

### TypingIndicator

Responsible for:

```text
Typing UI
```

---

# Phase 5.7.14 – Styling

All Messages styles should remain outside component files.

Create:

```text
styles/messaging/
├── messages.styles.ts
├── conversationItem.styles.ts
├── chatBubble.styles.ts
├── chatInput.styles.ts
├── typingIndicator.styles.ts
├── chat.styles.ts
└── newMessage.styles.ts
```

Only create files that are actually needed.

---

# Architecture Rule

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

# Native Messaging Layout

The Messages list should approximately follow:

```text
┌──────────────────────────────────┐
│ Messages                    +    │
├──────────────────────────────────┤
│ 🔍 Search conversations...       │
├──────────────────────────────────┤
│                                  │
│ 👤 John                          │
│    Hey, how are you?             │
│                                  │
│ 👤 Sarah                         │
│    See you tomorrow              │
│                                  │
│ 👤 Mike                          │
│    No messages yet               │
│                                  │
└──────────────────────────────────┘
```

The Conversation screen should approximately follow:

```text
┌──────────────────────────────────┐
│ ←  John                          │
│    online                        │
├──────────────────────────────────┤
│                                  │
│        Hello                     │
│                                  │
│ Hi!                              │
│                                  │
│        How are you?              │
│                                  │
│ typing...                        │
├──────────────────────────────────┤
│ Type a message...          Send  │
└──────────────────────────────────┘
```

The final UI should follow the existing application's theme and design system.

---

# Phase 5.7.15 – Safe Area and Keyboard

The messaging UI must work correctly on modern phones with:

* Notches
* Dynamic islands
* Home indicators
* Software keyboards
* Different screen sizes

The implementation should use the project's existing safe-area architecture.

The message composer must remain accessible when the keyboard opens.

---

# Phase 5.7.16 – Loading States

The following loading states should be handled.

## Messages List

Display a loading state while:

```text
loadConversations()
```

is running.

## Conversation

Display a loading state while:

```text
openConversation()
```

is loading messages.

## New Message

Display a search/loading state while searching users.

---

# Phase 5.7.17 – Empty States

Messages should provide useful empty states.

## No Conversations

```text
No messages yet

Start a conversation with someone.
```

Provide:

```text
Start a conversation
```

or the existing New Message action.

---

## No Search Results

```text
No conversations found
```

---

## New Message With Empty Search

```text
Search for someone to start a conversation.
```

---

## Conversation With No Messages

```text
No messages yet

Send the first message.
```

---

# Phase 5.7.18 – Authentication

Unauthenticated users must not access messaging functionality.

The Expo implementation should:

```text
Wait for auth hydration
        ↓
Check user
        ↓
Authenticated?
    ├── Yes → load messages
    └── No  → navigate to sign in
```

Do not load conversations before authentication is available.

Do not attempt messaging API calls without an authenticated session.

---

# Phase 5.7.19 – Error Handling

The Messages system should gracefully handle:

```text
Authentication errors
Network errors
Backend errors
Supabase errors
Realtime connection errors
Conversation creation errors
Message sending errors
User search errors
```

Use:

```text
console.log()
console.error()
```

for useful debugging.

Do not add unnecessary comments to the code.

---

# Phase 5.7.20 – Message Sending

The sending flow should be:

```text
User types message
        ↓
Text state updated
        ↓
Typing event emitted
        ↓
User presses Send
        ↓
Validate text
        ↓
sendMessage()
        ↓
Clear input
        ↓
Realtime message arrives
        ↓
appendMessage()
        ↓
Message displayed
```

---

# Empty Message Validation

The following should not be sent:

```text
""
" "
"     "
```

Use:

```text
text.trim()
```

before sending.

---

# Send Button

The Send button should:

* Be disabled when there is no meaningful text
* Prevent duplicate rapid submissions where necessary
* Display sending state if supported
* Clear the input after successful sending
* Handle failure without silently losing the message

---

# Phase 5.7.21 – Realtime Lifecycle

The realtime lifecycle should be:

```text
Open conversation
       ↓
Subscribe
       ↓
Receive messages
       ↓
Receive typing events
       ↓
Receive presence events
       ↓
User leaves conversation
       ↓
Unsubscribe
```

The subscription must not remain active after leaving the conversation.

---

# Phase 5.7.22 – Navigation

Expo Router should be the only navigation mechanism.

Use:

```text
router.push("/chat/new")
```

for New Message.

Use:

```text
router.push(`/chat/${conversationId}`)
```

for conversations.

Use:

```text
router.back()
```

for returning to the previous screen.

Do not use:

```text
next/router
router.query
router.replace("/auth/signin")
```

from the web implementation.

---

# Route Parameters

The web implementation uses:

```text
const { id } = router.query;
```

Expo should use:

```text
useLocalSearchParams()
```

from:

```text
expo-router
```

to retrieve the conversation ID.

---

# Phase 5.7.23 – Existing Files To Reuse

The migration should reuse:

```text
stores/messagesStore.ts
services/messaging.service.ts
utils/messagesApi.ts
utils/realtimeChat.ts
stores/authStore.ts
context/AuthProvider.tsx
components/messaging/ChatBubble.tsx
components/messaging/ChatInput.tsx
components/messaging/ConversationItem.tsx
components/messaging/TypingIndicator.tsx
```

Inspect these files before creating anything new.

---

# Phase 5.7.24 – Files To Create

If they do not already exist:

```text
app/(tabs)/messages.tsx

styles/messaging/messages.styles.ts
styles/messaging/conversationItem.styles.ts
styles/messaging/chatBubble.styles.ts
styles/messaging/chatInput.styles.ts
styles/messaging/typingIndicator.styles.ts
styles/messaging/chat.styles.ts
styles/messaging/newMessage.styles.ts
```

---

# Files To Update

Depending on their current implementation:

```text
app/chat/[id].tsx
app/chat/new.tsx

components/messaging/ChatBubble.tsx
components/messaging/ChatInput.tsx
components/messaging/ConversationItem.tsx
components/messaging/TypingIndicator.tsx

stores/messagesStore.ts
services/messaging.service.ts
utils/messagesApi.ts
utils/realtimeChat.ts
```

Only modify a file when the existing implementation does not already satisfy the requirement.

---

# Files That Must NOT Be Created

Do not create duplicate versions of:

```text
messagesStore.ts
messagesApi.ts
realtimeChat.ts
ChatBubble.tsx
ChatInput.tsx
ConversationItem.tsx
TypingIndicator.tsx
```

The existing messaging architecture should be extended rather than duplicated.

---

# Phase 5.7.25 – Native API Rules

The Messages migration must not use:

```text
document
window
document.querySelector()
document.addEventListener()
HTMLInputElement
HTMLDivElement
<button>
<input>
<div>
next/router
router.query
```

Use:

```text
View
Text
TextInput
Pressable
FlatList
KeyboardAvoidingView
SafeAreaView
expo-router
```

instead.

---

# Phase 5.7.26 – Debug Logging

Useful logs should remain during migration.

Examples:

```text
[MESSAGES] auth check
[MESSAGES] loading conversations
[MESSAGES] conversations loaded
[CHAT INIT] opening conversation
[CHAT] messages loaded
[CHAT REALTIME] subscribed
[CHAT LIVE MESSAGE] received
[CHAT TYPING] event
[CHAT PRESENCE] event
[CHAT SEND] sending message
[CHAT SEND] message sent
[NEW MESSAGE] searching users
[NEW MESSAGE] creating conversation
[NEW MESSAGE] conversation created
```

Avoid logging:

```text
passwords
access tokens
refresh tokens
private authentication credentials
```

The existing web store currently logs the Supabase session and access token during conversation creation. Those logs should be removed from the Expo implementation.

---

# Phase 5.7.27 – Performance

The Messages implementation should be optimized for mobile.

Use:

```text
FlatList
```

instead of rendering potentially large arrays using:

```text
.map()
```

for the main conversation/message lists.

Avoid unnecessary re-renders of:

```text
ChatBubble
ConversationItem
TypingIndicator
```

where practical.

Realtime listeners should be created only for the active conversation.

---

# Phase 5.7.28 – Pull To Refresh

The Messages list should support native pull-to-refresh.

Expected behavior:

```text
Pull down
   ↓
Refresh conversations
   ↓
Update list
   ↓
Stop refresh indicator
```

This should reuse:

```text
loadConversations()
```

rather than creating another API request implementation.

---

# Phase 5.7.29 – Duplicate Message Protection

The application should prevent the same message from appearing twice.

Before adding a message from realtime:

```text
message.id
```

should be checked against the existing conversation messages.

If the ID already exists:

```text
do not append
```

Otherwise:

```text
appendMessage()
```

---

# Phase 5.7.30 – Conversation State

The existing store uses:

```text
activeConversation
```

The Expo implementation should preserve this state.

The conversation title should be resolved in this order:

```text
activeConversation.title
        ↓
conversation from conversations list
        ↓
fallback title
```

For example:

```text
Chat
```

if no title is available.

---

# Phase 5.7.31 – New Message User Search

The search should support:

```text
username
full_name
creator_username
```

The query should be case-insensitive.

The search should be debounced.

The search should handle:

```text
loading
success
empty results
error
```

---

# Phase 5.7.32 – Conversation Creation

When a user selects another user:

```text
currentUser.id
targetUser.id
```

should be sent to:

```text
createConversation()
```

with:

```text
isGroup = false
title = null
```

unless the backend architecture requires a different contract.

After successful creation:

```text
conversation.id
```

must be obtained and used to navigate to:

```text
/chat/[id]
```

---

# Phase 5.7.33 – Testing

Test the Messages migration on a real Expo-compatible device whenever possible.

---

## Test 1 – Authentication

### Logged Out

Open Messages.

Expected:

```text
User is redirected to authentication.
```

### Logged In

Open Messages.

Expected:

```text
Messages screen loads.
```

---

## Test 2 – Conversation Loading

Open Messages.

Expected:

```text
Conversations appear.
```

Check:

```text
title
last message
```

---

## Test 3 – Conversation Search

Enter:

```text
john
```

Expected:

```text
Only matching conversations appear.
```

Test uppercase/lowercase differences.

---

## Test 4 – Open Conversation

Tap a conversation.

Expected:

```text
/chat/[id]
```

opens.

The existing messages should load.

---

## Test 5 – Message Sending

Type:

```text
Hello
```

Press Send.

Expected:

```text
Message is sent.
Input clears.
Message appears in conversation.
```

---

## Test 6 – Empty Message

Press Send with:

```text
""
```

Expected:

```text
Nothing is sent.
```

Test spaces:

```text
"   "
```

Expected:

```text
Nothing is sent.
```

---

## Test 7 – Realtime Message

Use another logged-in account/device.

Send a message to the current account.

Expected:

```text
Message appears without manually refreshing.
```

---

## Test 8 – Typing Indicator

From another account:

```text
Start typing.
```

Expected:

```text
typing...
```

appears.

Stop typing.

Expected:

```text
typing...
```

disappears.

---

## Test 9 – Presence

When another user is connected:

```text
online
```

should appear.

When they disconnect:

```text
offline
```

should appear.

---

## Test 10 – Keyboard

Open a conversation.

Tap the message input.

Expected:

```text
Keyboard opens.
Composer remains visible.
Messages remain accessible.
```

There should be no need for:

```text
document.querySelector()
scrollIntoView()
```

---

## Test 11 – New Message

Open:

```text
New Message
```

Search for an existing user.

Expected:

```text
User appears.
```

---

## Test 12 – Create Conversation

Tap a user.

Expected:

```text
Conversation is created.
User is navigated to the conversation.
```

---

## Test 13 – No Search Results

Search for:

```text
xxxxxxxxxxxx
```

Expected:

```text
No users found.
```

---

## Test 14 – Empty Search

Open New Message without typing.

Expected:

```text
Type to search users
```

or the equivalent native empty state.

---

## Test 15 – Back Navigation

From a conversation:

```text
←
```

Expected:

```text
Returns to previous screen.
```

From New Message:

```text
←
```

Expected:

```text
Returns to Messages.
```

---

## Test 16 – Realtime Cleanup

Open Conversation A.

Leave Conversation A.

Open Conversation B.

Send a message to Conversation A.

Expected:

```text
Conversation A does not update the active Conversation B screen.
```

This confirms realtime subscriptions are being cleaned up correctly.

---

## Test 17 – Duplicate Message Protection

Send one message.

Expected:

```text
Message appears exactly once.
```

It must not appear twice because of:

```text
sendMessage()
```

and:

```text
realtime subscription
```

both updating the UI.

---

# Overall Success Criteria

## Messages List

* [ ] Messages screen loads correctly
* [ ] Authentication is checked
* [ ] Authentication hydration is respected
* [ ] Conversations load
* [ ] Conversations display correctly
* [ ] Last messages display
* [ ] Search works
* [ ] Search is case-insensitive
* [ ] Empty state works
* [ ] Loading state works
* [ ] Pull-to-refresh works
* [ ] New Message action works

## Conversation

* [ ] Conversation opens
* [ ] Conversation title displays
* [ ] Existing messages load
* [ ] Incoming messages display correctly
* [ ] Outgoing messages display correctly
* [ ] Messages use FlatList
* [ ] Empty conversation state works
* [ ] Back navigation works

## Chat Input

* [ ] Text can be entered
* [ ] Multiline input works
* [ ] Empty messages are prevented
* [ ] Whitespace-only messages are prevented
* [ ] Send works
* [ ] Input clears after successful send
* [ ] Sending errors are handled
* [ ] Keyboard behavior works correctly

## Realtime

* [ ] Realtime subscription works
* [ ] New messages appear automatically
* [ ] Typing events work
* [ ] Typing indicator works
* [ ] Presence works
* [ ] Online status works
* [ ] Offline status works
* [ ] Realtime subscriptions are cleaned up
* [ ] Duplicate messages are prevented

## New Message

* [ ] New Message screen loads
* [ ] User search works
* [ ] Search is debounced
* [ ] Username search works
* [ ] Full-name search works
* [ ] Creator username search works
* [ ] Search results display
* [ ] No-results state works
* [ ] User selection works
* [ ] Conversation creation works
* [ ] New conversation opens automatically

## Navigation

* [ ] Expo Router is used
* [ ] No Next.js router is used
* [ ] Conversation IDs are read using Expo Router
* [ ] Back navigation works
* [ ] New Message navigation works
* [ ] Conversation navigation works

## Architecture

* [ ] Existing `messagesStore.ts` is reused
* [ ] Existing `messaging.service.ts` is reused
* [ ] Existing `messagesApi.ts` is reused
* [ ] Existing `realtimeChat.ts` is reused
* [ ] Existing messaging components are reused
* [ ] No duplicate messaging store is created
* [ ] No duplicate messaging API is created
* [ ] Supabase remains the data source
* [ ] UI does not contain unnecessary API logic
* [ ] All messaging styles live under `styles/messaging/`
* [ ] No inline styles are used for normal styling
* [ ] No browser APIs are used
* [ ] Useful debugging logs are included
* [ ] Authentication tokens are never logged
* [ ] No code comments are added

---

# Phase 5.7 Completion

The Messages migration is complete when an authenticated user can open Messages, view and search conversations, open a conversation, view existing messages, send messages, receive messages in real time, see typing and presence status, start a new conversation by searching for another user, and navigate naturally throughout the messaging system.

The Expo implementation should preserve the existing WeUp messaging business logic while replacing browser-specific functionality with native React Native and Expo functionality.

The final architecture should be:

```text
                         ┌─────────────────────────┐
                         │   Messages Screen        │
                         │ app/(tabs)/messages.tsx │
                         └────────────┬────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
                    ▼                 ▼                 ▼
              Conversation      Search            New Message
                 List                                Screen
                    │                                  │
                    ▼                                  ▼
          Conversation Screen                  User Search
          app/chat/[id].tsx                         │
                    │                                ▼
          ┌─────────┼─────────┐              Create Conversation
          │         │         │                       │
          ▼         ▼         ▼                       ▼
       Messages   Typing   Presence              Conversation
          │         │         │                       │
          └─────────┼─────────┘                       │
                    ▼                                 │
             messagesStore.ts ◄──────────────────────┘
                    │
          ┌─────────┴─────────┐
          │                   │
          ▼                   ▼
   messagesApi.ts       realtimeChat.ts
          │                   │
          ▼                   ▼
      Backend API        Supabase Realtime
          │
          ▼
       Supabase
```

---

# Final Messages Project Structure

After Phase 5.7 is complete, the relevant Messages-related structure should be:

```text
app/
├── (tabs)/
│   └── messages.tsx
│
└── chat/
    ├── [id].tsx
    └── new.tsx

components/
└── messaging/
    ├── ChatBubble.tsx
    ├── ChatInput.tsx
    ├── ConversationItem.tsx
    └── TypingIndicator.tsx

services/
└── messaging.service.ts

stores/
└── messagesStore.ts

utils/
├── messagesApi.ts
└── realtimeChat.ts

styles/
└── messaging/
    ├── messages.styles.ts
    ├── conversationItem.styles.ts
    ├── chatBubble.styles.ts
    ├── chatInput.styles.ts
    ├── typingIndicator.styles.ts
    ├── chat.styles.ts
    └── newMessage.styles.ts
```

---

# Phase 5 – Port Screens Progress

The screen migration order is:

```text
1. Explore       ✅
2. Post Viewer   ✅
3. Comments      ✅
4. Profile       ✅
5. Search        ✅
6. Upload        ✅
7. Messages      ⬅ CURRENT PHASE
```

Messages is complete when all Phase 5.7 success criteria have been verified on the Expo application.
