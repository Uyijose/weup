# Optimize Existing Node + FFmpeg + R2 Video Pipeline

Existing flow:
User Browser
 │
 ▼
Upload to R2
 │
 ▼
Server downloads from R2
 │
 ▼
Server processes video
 │
 ▼
Server uploads processed videos to R2

Goal: make it asynchronous, parallel, and faster without changing the architecture.

## Key Goals

1. Keep direct upload to R2 (signed URLs). Server should not handle large uploads.
2. `/process` endpoint starts async background processing; return immediately.
3. Download video to temporary location; prepare for parallel operations.
4. Parallel metadata detection: duration + file size.
5. Smart compression:
   - 1 min ≈ 8–10 MB
   - AllowedSize = duration(min) × 10 MB
   - Compress only if actualFileSize > AllowedSize.
6. Fast compression with FFmpeg if needed:
   - ultrafast preset
   - threads=auto
   - max width 1280
7. Parallel video splitting using multiple CPU cores.
8. Pipeline processing: upload each part immediately after creation.
9. Parallel uploading: all parts upload simultaneously.
10. Database storage: insert main post + video parts metadata; first part URL as main post.

## Optimizations

- Async processing
- Parallel metadata detection
- Smart compression skipping
- Parallel FFmpeg splitting
- Parallel R2 uploads
- Pipeline-style split → upload
- Expected speed: ~90s → 15–35s.

## Architecture

Frontend
 │
 ▼
Request Signed URL
 │
 ▼
Upload Video → R2
 │
 ▼
POST /process
 │
 ▼
Async Background Processing
 │
 ▼
Download Video From R2
 │
 ▼
Parallel Metadata Detection
 ├── Detect Duration
 └── Detect File Size
 │
 ▼
Smart Compression Decision
 ├── Skip Compression
 └── Compress Video
 │
 ▼
Parallel Video Splitting
 │
 ▼
Pipeline Processing
 ├── Split Part → Upload
 ├── Split Part → Upload
 └── Split Part → Upload
 │
 ▼
Parallel Upload to R2
 │
 ▼
Insert Post in Database
 │
 ▼
Insert Video Parts Metadata
 │
 ▼
Processing Complete