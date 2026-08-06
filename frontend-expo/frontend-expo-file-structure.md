frontend-expo
├── app
│   ├── (auth)
│   │   ├── _layout.tsx
│   │   ├── signin.tsx
│   │   ├── signup.tsx
│   │   └── forgot-password.tsx
│   │
│   ├── (tabs)
│   │   ├── _layout.tsx
│   │   ├── index.tsx                 // Explore / Home
│   │   ├── search.tsx
│   │   ├── upload.tsx
│   │   ├── messages.tsx
│   │   └── profile.tsx
│   │
│   ├── creator
│   │   ├── [id].tsx
│   │   ├── videos.tsx
│   │   └── become-creator.tsx
│   │
│   ├── user
│   │   ├── [id].tsx
│   │   └── videos.tsx
│   │
│   ├── posts
│   │   └── [id].tsx
│   │
│   ├── chat
│   │   ├── [id].tsx
│   │   └── new.tsx
│   │
│   ├── profile
│   │   └── edit.tsx
│   │
│   ├── search
│   │   └── index.tsx
│   │
│   ├── legal
│   │   ├── about.tsx
│   │   ├── contact.tsx
│   │   ├── help.tsx
│   │   ├── safety.tsx
│   │   ├── careers.tsx
│   │   ├── developers.tsx
│   │   └── newsroom.tsx
│   │
│   ├── modal.tsx
│   ├── _layout.tsx
│   └── +not-found.tsx
│
├── assets
│   ├── fonts
│   ├── icons
│   ├── images
│   ├── splash
│   └── videos
│
├── components
│   ├── auth
│   │   ├── AuthInput.tsx
│   │   ├── PasswordInput.tsx
│   │   ├── GoogleButton.tsx
│   │   ├── AuthHeader.tsx
│   │   └── AuthFooter.tsx
│   │
│   ├── common
│   │   ├── Avatar.tsx
│   │   ├── Button.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Header.tsx
│   │   ├── Loader.tsx
│   │   └── Modal.tsx
│   │
│   ├── creator
│   │
│   ├── feed
│   │   ├── CommentSheet.tsx
│   │   ├── LikeButton.tsx
│   │   ├── PostCard.tsx
│   │   ├── ShareButton.tsx
│   │   ├── Tags.tsx
│   │   ├── UserInfo.tsx
│   │   └── VideoPlayer.tsx
│   │
│   ├── legal
│   │
│   ├── messaging
│   │   ├── ChatBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ConversationItem.tsx
│   │   └── TypingIndicator.tsx
│   │
│   ├── profile
│   │   ├── EditProfileForm.tsx
│   │   ├── FollowButton.tsx
│   │   ├── ProfileHeader.tsx
│   │   └── UserPosts.tsx
│   │
│   ├── search
│   │
│   ├── skeleton
│   │
│   └── upload
│       ├── UploadProgress.tsx
│       ├── VideoPicker.tsx
│       └── VideoPreview.tsx
│
├── constants
│   ├── config.ts
│   ├── permissions.ts
│   └── routes.ts
│
├── context
│   ├── AuthProvider.tsx
│   ├── SocketProvider.tsx
│   └── ThemeProvider.tsx
│
├── hooks
│   ├── useAuth.ts
│   ├── useInfiniteFeed.ts
│   ├── usePermissions.ts
│   ├── useSelectFile.ts
│   └── useVideo.ts
│
├── lib
│   ├── api.ts
│   ├── axios.ts
│   ├── queryClient.ts
│   ├── socket.ts
│   ├── storage.ts
│   └── supabase.ts
│
├── services
│   ├── auth.service.ts
│   ├── comments.service.ts
│   ├── messaging.service.ts
│   ├── posts.service.ts
│   ├── upload.service.ts
│   └── users.service.ts
│
├── stores
│   ├── authStore.ts
│   ├── commentsStore.ts
│   ├── likesStore.ts
│   ├── messagesStore.ts
│   ├── postsStore.ts
│   ├── reportsStore.ts
│   ├── topicsStore.ts
│   ├── uploadVideoStore.ts
│   ├── usersStore.ts
│   └── watchedHistoryStore.ts
│
├── styles
│   ├── colors.ts
│   ├── global.ts
│   ├── shadows.ts
│   ├── spacing.ts
│   ├── theme.ts
│   └── typography.ts
│
├── types
│   ├── api.ts
│   ├── auth.ts
│   ├── message.ts
│   ├── post.ts
│   └── user.ts
│
├── utils
│   ├── compressVideo.ts
│   ├── constants.ts
│   ├── formatDate.ts
│   ├── getAuthToken.ts
│   ├── helpers.ts
│   ├── messagesApi.ts
│   ├── realtimeChat.ts
│   ├── supabaseClient.ts
│   └── validators.ts
│
├── .env
├── app.json
├── babel.config.js
├── expo-env.d.ts
├── package.json
├── tsconfig.json
└── README.md