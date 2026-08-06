# WeUp → Expo React Native Migration Plan

## Phase 1 – Create the Expo App
Create a fresh Expo project (`weup-mobile`) and install:
- Expo Router
- Zustand
- Supabase
- Axios
- React Native Gesture Handler
- React Native Reanimated
- Expo Secure Store
- Async Storage
- Expo Image
- Expo Video

## Phase 2 – Reuse Shared Logic
Copy these folders into the Expo project:
- stores/
- utils/
- hooks/

Update imports and remove browser-only APIs.

## Phase 3 – Authentication
Implement:
- Login
- Signup
- hydrateAuth()
- logout()
- Auth listener

Replace browser storage with Expo Secure Store or Async Storage.

## Phase 4 – Navigation
Create the main app navigation:
- Explore
- posts
- Upload
- subscriptions
- Profile

## Phase 5 – Port Screens
Migrate screens in this order:
1. Explore
2. Post Viewer
3. Comments
4. Profile
5. Search
6. Upload
7. Messages

## Phase 6 – Remove Web-only Code
Remove:
- next/head
- next/router
- next/script
- CSS files
- window/document usage
- Popunder web ads

Replace with React Native/Expo equivalents:
- React Navigation or Expo Router
- StyleSheet
- RefreshControl
- Native ad SDKs
- Expo Video

## Reusable Code
These can largely be reused:
- backend/
- stores/
- hooks/
- utils/
- Supabase configuration
- API layer
- Zustand business logic

## Rewrite Required
These must be rewritten:
- pages/
- components/
- CSS
- HTML elements (<div>, <img>, <button>, etc.)
- Next.js-specific APIs

## Estimated Effort
- Business logic reused: 70–80%
- UI rewritten: nearly 100%
