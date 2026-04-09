# WhosUp Frontend & Backend Split Plan

This document describes how to split the WhosUp project into a **frontend (Vercel)** and **backend (Render)** architecture using **Supabase** and **Cloudflare R2**.

---

## 1. Architecture Overview

### Frontend (Vercel)
- UI and pages (Next.js)
- Client-side Supabase (anon key only)
- Calls backend APIs for uploads, video creation, deletion

### Backend (Render)
- Express.js API
- Supabase service-role access
- Cloudflare R2 signed uploads
- Video processing and sensitive logic

---

## 2. Root Structure

```bash
whosup/
├── frontend/
├── backend/
```

---

## 3. Frontend Structure (Vercel)

```bash
frontend/
├── components/
│   ├── ads/
│   │   ├── CommentSectionAd.jsx
│   │   ├── FeedInlineAd.jsx
│   │   ├── InterstitialAd.jsx
│   │   ├── VideoBottomAd.jsx
│   │   ├── VideoOverlayCenterAd.jsx
│   │   ├── VideoPausePopupAd.jsx
│   │   └── VideoTopAd.jsx
│   ├── detailsPage/
│   │   ├── DetailFeed.js
│   │   └── VideoDetail.js
│   ├── icon/
│   │   ├── Other.js
│   │   └── Telegram.js
│   ├── Skeleton/
│   │   ├── Skeleton.js
│   │   └── UploadeSkeleton.js
│   ├── styles/
│   │   └── *.css
│   ├── AdminHeader.jsx
│   ├── BecomeCreatorModal.js
│   ├── Btns.js
│   ├── Comments.js
│   ├── CreateVideo.js
│   ├── CustomPosts.js
│   ├── Header.js
│   ├── LeftHandSide.js
│   ├── Links.js
│   ├── Post.js
│   ├── RightHandSide.js
│   ├── Tags.js
│   └── UserProfile.js
│
├── hooks/
│   └── useSelectFile.js
│
├── pages/
│   ├── admin/*.jsx
│   ├── auth/*.js
│   ├── creator/*.js
│   ├── detail/[id].js
│   ├── explore/index.js
│   ├── upload/create.js
│   ├── profile/edit.js
│   ├── search/index.js
│   ├── subscribers/index.js
│   ├── subscriptions/index.js
│   ├── user/[id].js
│   ├── _app.js
│   └── index.js
│
├── utils/
│   ├── constants.js
│   └── supabaseClient.js
│
├── public/
│   └── assets
│
├── styles/globals.css
├── .env.local
├── package.json
├── next.config.js
└── tailwind.config.js
```

### Frontend Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_BASE_URL=https://whosup-backend.onrender.com
```

---

## 4. Backend Structure (Render)

```bash
backend/
├── src/
│   ├── routes/
│   │   ├── upload.routes.js      # signed R2 uploads
│   │   ├── video.routes.js       # create/delete videos
│   │   └── auth.routes.js        # auth verification
│   ├── services/
│   │   ├── r2.service.js         # R2 client
│   │   ├── supabase.service.js   # Supabase service role
│   │   └── video.service.js      # ffmpeg logic
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT verification
│   ├── utils/
│   │   └── env.js                # env loader
│   ├── app.js
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

### Backend Environment Variables

```env
PORT=5000
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_BUCKET_NAME=whosup
R2_ENDPOINT=...
R2_PUBLIC_URL=...
```

---

## 5. Backend package.json

```json
{
  "name": "whosup-backend",
  "type": "module",
  "scripts": {
    "start": "node src/server.js"
  },
  "dependencies": {
    "@aws-sdk/client-s3": "^3.1000.0",
    "@aws-sdk/s3-request-presigner": "^3.1000.0",
    "@supabase/supabase-js": "^2.95.3",
    "cors": "^2.8.5",
    "dotenv": "^17.3.1",
    "express": "^4.19.2"
  }
}
```

---

## 6. Deployment Summary

- **Frontend** → Vercel
- **Backend** → Render
- **Database & Auth** → Supabase
- **Video Storage** → Cloudflare R2

This split ensures security, scalability, and production readiness.




STEP 6 — WHAT TO DELETE (IMPORTANT)

Delete these frontend files entirely:

frontend/pages/api/signup.js
frontend/pages/api/getUploadUrl.js
frontend/pages/api/processVideo.js
frontend/pages/api/uploadVideo.js