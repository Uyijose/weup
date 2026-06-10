# 📁 Project Structure

This file is auto-generated. Unnecessary folders (node_modules, build, test_run, etc.) are excluded.

```
├── backend
│   ├── src
│   │   ├── controller
│   │   ├── lib
│   │   │   └── supabase.js
│   │   ├── middleware
│   │   │   ├── auth.middleware-old.js
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
│   │   │   │   └── usersReport.json
│   │   │   ├── chat_cyce-old.js
│   │   │   ├── chat_cyce.js
│   │   │   ├── chat_uyee-old.js
│   │   │   ├── chat_uyee.js
│   │   │   ├── generateLikes.js
│   │   │   ├── generatePostsReport.js
│   │   │   ├── generateSubscriptions.js
│   │   │   ├── generateThumbnails.js
│   │   │   └── generateUsersReport.js
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
│   └── WeUp_Ads_Frontend_Integration_Guide.md
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
│   │   │   ├── DetailFeed.js
│   │   │   └── VideoDetail.js
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
│   │   │   ├── right-side-prev.css
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
│   │   ├── CreateVideo-new.js
│   │   ├── CreateVideo.js
│   │   ├── CustomPosts.js
│   │   ├── Header.js
│   │   ├── LeftHandSide.js
│   │   ├── Like.js
│   │   ├── Links.js
│   │   ├── ModalPortal.js
│   │   ├── Post-old.js
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
│   │   │   ├── google-callback-old.js
│   │   │   ├── google-callback.js
│   │   │   ├── signin-old.js
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
│   │   ├── newsroom
│   │   │   └── index.js
│   │   ├── posts
│   │   │   ├── [id]-dev.js
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
│   │   ├── ads.js
│   │   ├── banner-ads.js
│   │   ├── index.js
│   │   ├── interstitial-ads.js
│   │   ├── popup-ads.js
│   │   └── posts.js
│   ├── public
│   │   ├── 9c574ee4280776f1932e3ae3ab8f4170.html
│   │   ├── buuny-swipeup.png
│   │   ├── favicon.ico
│   │   ├── feed-inline-ads.jpg
│   │   ├── feedinline-ads.html
│   │   ├── interstitial-ads.html
│   │   ├── native-banner-ads.html
│   │   ├── popunder-ads-2.jpg
│   │   ├── popunder-ads.html
│   │   ├── popunder-ads.jpg
│   │   ├── popup-ads.html
│   │   ├── test.mp4
│   │   ├── vercel.svg
│   │   ├── video-ads.html
│   │   └── whosup-icon.PNG
│   ├── stores
│   │   ├── authStore.js
│   │   ├── commentsStore.js
│   │   ├── likesStore.js
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
│   │   └── supabaseClient.js
│   ├── .env-example.local
│   ├── .eslintrc.json
│   ├── next.config.js
│   ├── package-lock.json
│   ├── package.json
│   ├── postcss.config.js
│   └── tailwind.config.js
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
