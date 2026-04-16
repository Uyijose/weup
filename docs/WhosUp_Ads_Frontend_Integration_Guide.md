# weup Ads Frontend Integration Guide

This document explains exactly which frontend files must be updated to
integrate each ad type.

------------------------------------------------------------------------

## 1. feed_inline

Appears inside: - Home Feed - Explore Feed

### Files To Update:

-   components/RightHandSide.js
-   pages/explore/index.js (if injecting into Explore grid)

------------------------------------------------------------------------

## 2. video_overlay_top

## 3. video_overlay_center

## 4. video_pause_popup

These belong inside the video player component.

### File To Update:

-   components/Post.js

------------------------------------------------------------------------

## 5. interstitial

Appears: - Between videos - On navigation - After major actions

### Files To Update:

-   components/RightHandSide.js (feed-based interstitials) OR
-   pages/\_app.js (global navigation interstitials)

------------------------------------------------------------------------

## 6. comment_section_ad

Appears inside comments.

### File To Update:

-   components/Comments.js

------------------------------------------------------------------------

## Recommended Architecture

Create reusable ad components:

components/ads/ - FeedInlineAd.js - VideoOverlayTopAd.js -
VideoOverlayCenterAd.js - VideoPausePopupAd.js - InterstitialAd.js -
CommentSectionAd.js

Then import them into the appropriate files above.

------------------------------------------------------------------------



🧠 Summary — EXACT FILES YOU WILL TOUCH
Ad Type	File To Update
feed_inline	components/RightHandSide.js
feed_inline (Explore grid)	pages/explore/index.js
video_overlay_top	components/Post.js
video_overlay_center	components/Post.js
video_pause_popup	components/Post.js
interstitial	components/RightHandSide.js OR pages/_app.js
comment_section_ad	components/Comments.js



## Files You Should NOT Modify For Ads

-   Header.js
-   LeftHandSide.js
-   Admin files
-   API routes

type AdType =
  | "video_overlay_top"
  | "video_overlay_center"
  | "video_pause_popup"
  | "interstitial"
  | "comment_section_ad"
  | "feed_inline"
  | "video_overlay_bottom";



Ads should only be injected into user-facing content components.
