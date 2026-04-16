# weup Ads System

This document explains all supported ad types and how they behave across the platform.

---

## 1. feed_inline
Appears inside feeds (Explore, Home).
Behaves like a normal post.
Counts impression when visible.
Click opens link_url.

---

## 2. video_overlay_top
Small banner at the top of a playing video.
Always visible while video plays.
Best for branding ads.

---

## 3. video_overlay_center
Appears inside the video area.
Can be timed (e.g after 5 seconds).
Dismissible.

---

## 4. video_pause_popup
Shows only when user pauses video.
Supports external links.
High engagement placement.

---

## 5. interstitial
Fullscreen ad.
Appears between videos or major navigation actions.
Must be rate-limited.

---

## 6. comment_section_ad
Injected between comments.
Styled like a comment.
Clearly labeled as Sponsored.

---

## Ad Rules

- Only ads with status = active are rendered
- Ads are filtered by date range
- Higher priority ads render first
- Impressions increment on render
- Clicks increment on user interaction

---

## Security

- Only admins can create, update or delete ads
- Everyone (logged in or not) can view ads
