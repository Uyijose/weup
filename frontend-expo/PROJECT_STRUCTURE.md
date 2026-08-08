# 📁 Project Structure

This file is auto-generated. Unnecessary folders (node_modules, build, test_run, etc.) are excluded.

```
├── .expo
│   ├── dev
│   │   └── logs
│   ├── types
│   │   └── router.d.ts
│   ├── web
│   │   └── cache
│   │       └── production
│   │           └── images
│   │               └── favicon
│   │                   └── favicon-a4e030697a7571b3e95d31860e4da55d2f98e5e861e2b55e414f45a8556828ba-contain-transparent
│   │                       └── favicon-48.png
│   ├── devices.json
│   └── README.md
├── app
│   ├── (auth)
│   │   ├── _layout.tsx
│   │   ├── forgot-password.tsx
│   │   ├── signin.tsx
│   │   └── signup.tsx
│   ├── (tabs)
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── posts.tsx
│   │   ├── profile.tsx
│   │   ├── subscriptions.tsx
│   │   └── upload.tsx
│   ├── chat
│   │   ├── [id].tsx
│   │   └── new.tsx
│   ├── creator
│   │   ├── [id].tsx
│   │   ├── become-creator.tsx
│   │   └── videos.tsx
│   ├── legal
│   │   ├── about.tsx
│   │   ├── careers.tsx
│   │   ├── contact.tsx
│   │   ├── developers.tsx
│   │   ├── help.tsx
│   │   ├── newsroom.tsx
│   │   └── safety.tsx
│   ├── posts
│   │   ├── [id].tsx
│   │   └── index.tsx
│   ├── profile
│   │   └── edit.tsx
│   ├── search
│   │   └── index.tsx
│   ├── user
│   │   ├── [id].tsx
│   │   └── videos.tsx
│   ├── +not-found.tsx
│   ├── _layout.tsx
│   ├── index.tsx
│   └── modal.tsx
├── components
│   ├── auth
│   │   ├── AuthFooter.tsx
│   │   ├── AuthHeader.tsx
│   │   ├── AuthInput.tsx
│   │   ├── GoogleButton.tsx
│   │   └── PasswordInput.tsx
│   ├── comments
│   │   ├── CommentActions.tsx
│   │   ├── CommentInput.tsx
│   │   ├── CommentItem.tsx
│   │   └── CommentList.tsx
│   ├── common
│   │   ├── Avatar.tsx
│   │   ├── Button.tsx
│   │   ├── EmptyState.tsx
│   │   ├── Header.tsx
│   │   ├── Loader.tsx
│   │   └── Modal.tsx
│   ├── creator
│   │   ├── BecomeCreatorModal.tsx
│   │   ├── CreatorDescription.tsx
│   │   ├── CreatorHeader.tsx
│   │   ├── CreatorStats.tsx
│   │   ├── CreatorVideoCard.tsx
│   │   └── CreatorVideoGrid.tsx
│   ├── feed
│   │   ├── CommentSheet.tsx
│   │   ├── ExploreFeed.tsx
│   │   ├── ExploreHeader.tsx
│   │   ├── FeedViewer.tsx
│   │   ├── LikeButton.tsx
│   │   ├── PostActions.tsx
│   │   ├── PostCard.tsx
│   │   ├── ShareButton.tsx
│   │   ├── Tags.tsx
│   │   ├── TopicChips.tsx
│   │   ├── UserInfo.tsx
│   │   └── VideoPlayer.tsx
│   ├── layout
│   │   └── AppHeader.tsx
│   ├── legal
│   ├── messaging
│   │   ├── ChatBubble.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ConversationItem.tsx
│   │   └── TypingIndicator.tsx
│   ├── navigation
│   │   └── TabIcon.tsx
│   ├── profile
│   │   ├── AvatarPicker.tsx
│   │   ├── CreatorSection.tsx
│   │   ├── EditProfileForm.tsx
│   │   ├── FollowButton.tsx
│   │   ├── HistoryVideoCard.tsx
│   │   ├── PasswordSection.tsx
│   │   ├── ProfileActions.tsx
│   │   ├── ProfileHeader.tsx
│   │   ├── ProfileStats.tsx
│   │   ├── UserPosts.tsx
│   │   └── WatchedHistoryGrid.tsx
│   ├── search
│   │   ├── SearchAccountCard.tsx
│   │   ├── SearchAccountsSection.tsx
│   │   ├── SearchInput.tsx
│   │   ├── SearchPostCard.tsx
│   │   └── SearchPostsSection.tsx
│   ├── skeleton
│   └── upload
│       ├── UploadProgress.tsx
│       ├── VideoPicker.tsx
│       └── VideoPreview.tsx
├── constants
│   ├── config.ts
│   ├── permissions.ts
│   ├── routes.ts
│   └── topics.ts
├── context
│   ├── AuthProvider.tsx
│   ├── SocketProvider.tsx
│   └── ThemeProvider.tsx
├── hooks
│   └── useSelectFile.ts
├── lib
│   ├── api.ts
│   ├── queryClient.ts
│   ├── socket.ts
│   ├── storage.ts
│   └── supabase.ts
├── scripts
│   └── reset-project.js
├── services
│   ├── auth.service.ts
│   ├── comments.service.ts
│   ├── messaging.service.ts
│   ├── posts.service.ts
│   ├── search.service.ts
│   ├── upload.service.ts
│   └── users.service.ts
├── stores
│   ├── authStore.ts
│   ├── commentsStore.ts
│   ├── exploreStore.ts
│   ├── likesStore.ts
│   ├── messagesStore.ts
│   ├── postsStore.ts
│   ├── reportsStore.ts
│   ├── topicsStore.ts
│   ├── uploadVideoStore.ts
│   ├── usersStore.ts
│   └── watchedHistoryStore.ts
├── styles
│   ├── auth
│   │   ├── authFooter.styles.ts
│   │   ├── authHeader.styles.ts
│   │   ├── authInput.styles.ts
│   │   ├── googleButton.styles.ts
│   │   ├── passwordInput.styles.ts
│   │   ├── signin.styles.ts
│   │   └── signup.styles.ts
│   ├── comments
│   │   ├── commentActions.styles.ts
│   │   └── commentInput.styles.ts
│   ├── creator
│   │   ├── becomeCreator.styles.ts
│   │   ├── becomeCreatorModal.styles.ts
│   │   ├── creatorDescription.styles.ts
│   │   ├── creatorHeader.styles.ts
│   │   ├── creatorProfile.styles.ts
│   │   ├── creatorStats.styles.ts
│   │   ├── creatorVideoCard.styles.ts
│   │   └── creatorVideoGrid.styles.ts
│   ├── feed
│   │   ├── commentSheet.styles.ts
│   │   ├── exploreFeed.styles.ts
│   │   ├── exploreHeader.styles.ts
│   │   ├── likeButton.styles.ts
│   │   ├── postActions.styles.ts
│   │   ├── postCard.styles.ts
│   │   ├── shareButton.styles.ts
│   │   ├── tags.styles.ts
│   │   ├── topicChips.styles.ts
│   │   ├── userInfo.styles.ts
│   │   ├── videoControls.styles.ts
│   │   └── videoPlayer.styles.ts
│   ├── layout
│   │   └── appHeader.styles.ts
│   ├── navigation
│   │   └── tabIcon.styles.ts
│   ├── profile
│   │   ├── historyVideoCard.styles.ts
│   │   ├── profileActions.styles.ts
│   │   ├── profileHeader.styles.ts
│   │   ├── profileStats.styles.ts
│   │   ├── userProfile.styles.ts
│   │   └── watchedHistoryGrid.styles.ts
│   ├── search
│   │   ├── search.styles.ts
│   │   ├── searchAccountCard.styles.ts
│   │   ├── searchAccountsSection.styles.ts
│   │   ├── searchInput.styles.ts
│   │   ├── searchPostCard.styles.ts
│   │   └── searchPostsSection.styles.ts
│   ├── colors.ts
│   ├── global.ts
│   ├── shadows.ts
│   ├── spacing.ts
│   ├── theme.ts
│   └── typography.ts
├── types
│   ├── api.ts
│   ├── auth.ts
│   ├── message.ts
│   ├── post.ts
│   └── user.ts
├── utils
│   ├── compressVideo.ts
│   ├── constants.ts
│   ├── getAuthToken.ts
│   ├── gtag.ts
│   ├── messagesApi.ts
│   ├── realtimeChat.ts
│   └── safePopunder.ts
├── .gitignore
├── AGENTS.md
├── app.json
├── chatgpt-query.txt
├── CLAUDE.md
├── expo-env.d.ts
├── extra_plan.md
├── frontend-expo-file-structure.md
├── future_plan.md
├── LICENSE
├── package-lock.json
├── package.json
├── PROJECT_STRUCTURE.md
├── project_tree_cleaner.py
├── README.md
├── test.md
├── tsconfig.json
└── WeUp_Expo_Migration_Plan.md
```
