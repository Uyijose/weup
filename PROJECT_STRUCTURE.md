# 📁 Project Structure

This file is auto-generated. Unnecessary folders (node_modules, build, test_run, etc.) are excluded.

```
├── backend
│   ├── src
│   │   ├── lib
│   │   │   └── supabase.js
│   │   ├── middleware
│   │   │   └── auth.middleware.js
│   │   ├── routes
│   │   │   ├── comments
│   │   │   │   └── comments.routes.js
│   │   │   ├── likes
│   │   │   │   └── likes.routes.js
│   │   │   ├── messaging
│   │   │   │   └── messaging.routes.js
│   │   │   ├── posts
│   │   │   │   └── posts.routes.js
│   │   │   ├── reports
│   │   │   │   ├── reports.admin.routes.js
│   │   │   │   └── reports.routes.js
│   │   │   ├── auth.routes.js
│   │   │   ├── delete.routes.js
│   │   │   ├── progress.routes.js
│   │   │   ├── upload.routes.js
│   │   │   └── video.routes.js
│   │   ├── scripts
│   │   │   ├── json
│   │   │   │   ├── postsReport.json
│   │   │   │   ├── user_conversations.json
│   │   │   │   └── usersReport.json
│   │   │   ├── chat_cyce.js
│   │   │   ├── chat_uyee.js
│   │   │   ├── generateLikes.js
│   │   │   ├── generatePostsReport.js
│   │   │   ├── generateSubscriptions.js
│   │   │   ├── generateThumbnails.js
│   │   │   ├── generateUsersReport.js
│   │   │   └── get_user_conversations.js
│   │   ├── services
│   │   │   ├── messaging
│   │   │   │   ├── conversations.service.js
│   │   │   │   ├── messages.service.js
│   │   │   │   ├── presence.service.js
│   │   │   │   └── reactions.service.js
│   │   │   ├── r2.service.js
│   │   │   ├── supabase.service.js
│   │   │   ├── video.service-fast-old.js
│   │   │   └── video.service.js
│   │   ├── utils
│   │   │   └── env.js
│   │   ├── app.js
│   │   └── server.js
│   ├── .env-fake
│   ├── package-lock.json
│   ├── package.json
│   └── README.md
├── docs
│   ├── admin_system_plan.md
│   ├── ads_system.md
│   ├── creator_system_plan.md
│   └── WhosUp_Ads_Frontend_Integration_Guide.md
├── frontend
│   ├── components
│   │   ├── ads
│   │   │   ├── CommentSectionAd.jsx
│   │   │   ├── FeedInlineAd.jsx
│   │   │   ├── FeedVideoAd.jsx
│   │   │   ├── InterstitialAd.jsx
│   │   │   ├── Popunder_exp.jsx
│   │   │   ├── popunder_posts-old.jsx
│   │   │   ├── popunder_posts.jsx
│   │   │   ├── PopunderAd-old.jsx
│   │   │   ├── VideoBottomAd_Adstera.jsx
│   │   │   ├── VideoBottomAd_Adstera_Exo_Cl.jsx
│   │   │   ├── VideoOverlayCenterAd.jsx
│   │   │   ├── VideoPausePopupAd.jsx
│   │   │   ├── VideoTopAd_Adstera.jsx
│   │   │   ├── VideoTopAd_Exo_Cl-old.jsx
│   │   │   └── VideoTopAd_Exo_Cl.jsx
│   │   ├── detailsPage
│   │   │   └── DetailFeed.js
│   │   ├── icon
│   │   │   ├── Other.js
│   │   │   └── Telegram.js
│   │   ├── legal
│   │   │   └── LegalHeader.jsx
│   │   ├── Skeleton
│   │   │   ├── Skeleton.js
│   │   │   └── UploadeSkeleton.js
│   │   ├── styles
│   │   │   ├── AdminHeader.css
│   │   │   ├── AdminPanel.css
│   │   │   ├── Auth.css
│   │   │   ├── BecomeCreator.css
│   │   │   ├── BecomeCreatorModal.css
│   │   │   ├── Chat.css
│   │   │   ├── commentModal.css
│   │   │   ├── createVideo-new.css
│   │   │   ├── createVideo.css
│   │   │   ├── CreatorList.css
│   │   │   ├── CreatorProfile.css
│   │   │   ├── EditProfile.css
│   │   │   ├── Explore.css
│   │   │   ├── Header.css
│   │   │   ├── left-side.css
│   │   │   ├── Legal.css
│   │   │   ├── Messages.css
│   │   │   ├── NewMessage.css
│   │   │   ├── right-side.css
│   │   │   ├── SearchPage.css
│   │   │   ├── Subscribers.css
│   │   │   ├── SwipeUpHint.css
│   │   │   ├── UserProfile.css
│   │   │   ├── videoModal.css
│   │   │   └── videoOverlay.css
│   │   ├── AdminHeader.jsx
│   │   ├── AuthRequiredModal.js
│   │   ├── BecomeCreatorModal.js
│   │   ├── Btns.js
│   │   ├── Comments.js
│   │   ├── CreateVideo.js
│   │   ├── CustomPosts.js
│   │   ├── Header.js
│   │   ├── LeftHandSide.js
│   │   ├── Like.js
│   │   ├── Links.js
│   │   ├── ModalPortal.js
│   │   ├── Post.js
│   │   ├── RightHandSide.js
│   │   ├── SwipeUpHint.js
│   │   ├── Tags.js
│   │   ├── UserProfile.js
│   │   └── VideoModal.js
│   ├── hooks
│   │   └── useSelectFile.js
│   ├── pages
│   │   ├── about
│   │   │   └── index.js
│   │   ├── admin
│   │   │   ├── ads.jsx
│   │   │   ├── analytics.jsx
│   │   │   ├── creator-requests.jsx
│   │   │   ├── dashboard.jsx
│   │   │   ├── payments.jsx
│   │   │   ├── reports.jsx
│   │   │   └── users.jsx
│   │   ├── advertise
│   │   │   └── index.js
│   │   ├── api
│   │   │   ├── hello.js
│   │   │   └── signup.js
│   │   ├── auth
│   │   │   ├── google-callback.js
│   │   │   ├── signin.js
│   │   │   └── signup.js
│   │   ├── careers
│   │   │   └── index.js
│   │   ├── contact
│   │   │   └── index.js
│   │   ├── creator
│   │   │   ├── [id]
│   │   │   │   └── videos.js
│   │   │   ├── [id].js
│   │   │   ├── become-creator.js
│   │   │   └── index.js
│   │   ├── developers
│   │   │   └── index.js
│   │   ├── explore
│   │   │   └── index.js
│   │   ├── help
│   │   │   └── index.js
│   │   ├── legal
│   │   │   └── index.js
│   │   ├── messages
│   │   │   ├── [id].js
│   │   │   ├── index.js
│   │   │   └── new.js
│   │   ├── newsroom
│   │   │   └── index.js
│   │   ├── posts
│   │   │   └── [id].js
│   │   ├── profile
│   │   │   └── edit.js
│   │   ├── safety
│   │   │   └── index.js
│   │   ├── search
│   │   │   └── index.js
│   │   ├── subscribers
│   │   │   └── index.js
│   │   ├── subscriptions
│   │   │   └── index.js
│   │   ├── upload
│   │   │   └── create.js
│   │   ├── user
│   │   │   ├── [id]
│   │   │   │   └── videos.js
│   │   │   └── [id].js
│   │   ├── _app.js
│   │   ├── index.js
│   │   └── posts.js
│   ├── public
│   │   ├── 9c574ee4280776f1932e3ae3ab8f4170.html
│   │   ├── buuny-swipeup.png
│   │   ├── favicon.ico
│   │   ├── test.mp4
│   │   ├── vercel.svg
│   │   ├── video-ads.html
│   │   └── whosup-icon.PNG
│   ├── stores
│   │   ├── authStore.js
│   │   ├── commentsStore.js
│   │   ├── likesStore.js
│   │   ├── messagesStore.js
│   │   ├── postsStore.js
│   │   ├── reportsStore.js
│   │   ├── topicsStore.js
│   │   ├── uploadVideoStore.js
│   │   ├── usersStore.js
│   │   └── watchedHistoryStore.js
│   ├── styles
│   │   └── globals.css
│   ├── utils
│   │   ├── compressVideo.js
│   │   ├── constants.js
│   │   ├── getAuthToken.js
│   │   ├── gtag.js
│   │   ├── messagesApi.js
│   │   ├── realtimeChat.js
│   │   ├── safePopunder.js
│   │   └── supabaseClient.js
│   ├── .env-example.local
│   ├── .eslintrc.json
│   ├── next.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
├── frontend-expo
│   ├── .expo
│   │   ├── dev
│   │   │   └── logs
│   │   ├── static-tmp
│   │   │   └── _error.js
│   │   ├── types
│   │   │   └── router.d.ts
│   │   ├── web
│   │   │   └── cache
│   │   │       └── production
│   │   │           └── images
│   │   │               └── favicon
│   │   │                   └── favicon-a4e030697a7571b3e95d31860e4da55d2f98e5e861e2b55e414f45a8556828ba-contain-transparent
│   │   │                       └── favicon-48.png
│   │   ├── devices.json
│   │   └── README.md
│   ├── app
│   │   ├── (auth)
│   │   │   ├── _layout.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   ├── signin.tsx
│   │   │   └── signup.tsx
│   │   ├── (tabs)
│   │   │   ├── _layout.tsx
│   │   │   ├── index.tsx
│   │   │   ├── posts.tsx
│   │   │   ├── profile.tsx
│   │   │   ├── subscriptions.tsx
│   │   │   └── upload.tsx
│   │   ├── chat
│   │   │   ├── [id].tsx
│   │   │   └── new.tsx
│   │   ├── creator
│   │   │   ├── [id].tsx
│   │   │   ├── become-creator.tsx
│   │   │   └── videos.tsx
│   │   ├── legal
│   │   │   ├── about.tsx
│   │   │   ├── careers.tsx
│   │   │   ├── contact.tsx
│   │   │   ├── developers.tsx
│   │   │   ├── help.tsx
│   │   │   ├── newsroom.tsx
│   │   │   └── safety.tsx
│   │   ├── posts
│   │   │   ├── [id].tsx
│   │   │   └── index.tsx
│   │   ├── profile
│   │   │   └── edit.tsx
│   │   ├── search
│   │   │   └── index.tsx
│   │   ├── user
│   │   │   ├── [id].tsx
│   │   │   └── videos.tsx
│   │   ├── +not-found.tsx
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── modal.tsx
│   ├── components
│   │   ├── auth
│   │   │   ├── AuthFooter.tsx
│   │   │   ├── AuthHeader.tsx
│   │   │   ├── AuthInput.tsx
│   │   │   ├── GoogleButton.tsx
│   │   │   └── PasswordInput.tsx
│   │   ├── common
│   │   │   ├── Avatar.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Loader.tsx
│   │   │   └── Modal.tsx
│   │   ├── creator
│   │   ├── feed
│   │   │   ├── CommentSheet.tsx
│   │   │   ├── ExploreFeed.tsx
│   │   │   ├── ExploreHeader.tsx
│   │   │   ├── FeedViewer.tsx
│   │   │   ├── LikeButton.tsx
│   │   │   ├── PostCard.tsx
│   │   │   ├── ShareButton.tsx
│   │   │   ├── Tags.tsx
│   │   │   ├── TopicChips.tsx
│   │   │   ├── UserInfo.tsx
│   │   │   └── VideoPlayer.tsx
│   │   ├── layout
│   │   │   └── AppHeader.tsx
│   │   ├── legal
│   │   ├── messaging
│   │   │   ├── ChatBubble.tsx
│   │   │   ├── ChatInput.tsx
│   │   │   ├── ConversationItem.tsx
│   │   │   └── TypingIndicator.tsx
│   │   ├── navigation
│   │   │   └── TabIcon.tsx
│   │   ├── profile
│   │   │   ├── EditProfileForm.tsx
│   │   │   ├── FollowButton.tsx
│   │   │   ├── ProfileHeader.tsx
│   │   │   └── UserPosts.tsx
│   │   ├── search
│   │   ├── skeleton
│   │   └── upload
│   │       ├── UploadProgress.tsx
│   │       ├── VideoPicker.tsx
│   │       └── VideoPreview.tsx
│   ├── constants
│   │   ├── config.ts
│   │   ├── permissions.ts
│   │   ├── routes.ts
│   │   └── topics.ts
│   ├── context
│   │   ├── AuthProvider.tsx
│   │   ├── SocketProvider.tsx
│   │   └── ThemeProvider.tsx
│   ├── hooks
│   │   └── useSelectFile.ts
│   ├── lib
│   │   ├── api.ts
│   │   ├── queryClient.ts
│   │   ├── socket.ts
│   │   ├── storage.ts
│   │   └── supabase.ts
│   ├── scripts
│   │   └── reset-project.js
│   ├── services
│   │   ├── auth.service.ts
│   │   ├── comments.service.ts
│   │   ├── messaging.service.ts
│   │   ├── posts.service.ts
│   │   ├── upload.service.ts
│   │   └── users.service.ts
│   ├── stores
│   │   ├── authStore.ts
│   │   ├── commentsStore.ts
│   │   ├── exploreStore.ts
│   │   ├── likesStore.ts
│   │   ├── messagesStore.ts
│   │   ├── postsStore.ts
│   │   ├── reportsStore.ts
│   │   ├── topicsStore.ts
│   │   ├── uploadVideoStore.ts
│   │   ├── usersStore.ts
│   │   └── watchedHistoryStore.ts
│   ├── styles
│   │   ├── auth
│   │   │   ├── authFooter.styles.ts
│   │   │   ├── authHeader.styles.ts
│   │   │   ├── authInput.styles.ts
│   │   │   ├── googleButton.styles.ts
│   │   │   ├── passwordInput.styles.ts
│   │   │   ├── signin.styles.ts
│   │   │   └── signup.styles.ts
│   │   ├── feed
│   │   │   ├── exploreFeed.styles.ts
│   │   │   ├── exploreHeader.styles.ts
│   │   │   ├── likeButton.styles.ts
│   │   │   ├── postCard.styles.ts
│   │   │   ├── shareButton.styles.ts
│   │   │   ├── tags.styles.ts
│   │   │   ├── topicChips.styles.ts
│   │   │   ├── userInfo.styles.ts
│   │   │   └── videoPlayer.styles.ts
│   │   ├── layout
│   │   │   └── appHeader.styles.ts
│   │   ├── navigation
│   │   │   └── tabIcon.styles.ts
│   │   ├── colors.ts
│   │   ├── global.ts
│   │   ├── shadows.ts
│   │   ├── spacing.ts
│   │   ├── theme.ts
│   │   └── typography.ts
│   ├── types
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── message.ts
│   │   ├── post.ts
│   │   └── user.ts
│   ├── utils
│   │   ├── compressVideo.ts
│   │   ├── constants.ts
│   │   ├── getAuthToken.ts
│   │   ├── gtag.ts
│   │   ├── messagesApi.ts
│   │   ├── realtimeChat.ts
│   │   └── safePopunder.ts
│   ├── .gitignore
│   ├── AGENTS.md
│   ├── app.json
│   ├── chatgpt-query.txt
│   ├── CLAUDE.md
│   ├── expo-env.d.ts
│   ├── extra_plan.md
│   ├── frontend-expo-file-structure.md
│   ├── LICENSE
│   ├── package-lock.json
│   ├── package.json
│   ├── PROJECT_STRUCTURE.md
│   ├── project_tree_cleaner.py
│   ├── README.md
│   ├── test.md
│   ├── tsconfig.json
│   └── WeUp_Expo_Migration_Plan.md
├── migration
│   ├── supabase
│   │   ├── .temp
│   │   │   ├── cli-latest
│   │   │   ├── gotrue-version
│   │   │   ├── linked-project.json
│   │   │   ├── pooler-url
│   │   │   ├── postgres-version
│   │   │   ├── project-ref
│   │   │   ├── rest-version
│   │   │   ├── storage-migration
│   │   │   └── storage-version
│   │   ├── migrations
│   │   │   ├── 20260409034358_remote_schema.sql
│   │   │   └── 20260409123239_remote_schema.sql
│   │   └── config.toml
│   └── readme.md
├── .gitignore
├── chatgpt-query.txt
├── db_sql_command.md
├── PROJECT_STRUCTURE.md
├── project_tree_cleaner.py
├── README.md
├── supabase_table_structure.md
├── video_upgrad_plan.md
└── whos_up_frontend_backend_split_plan.md
```
