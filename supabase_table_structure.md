# Supabase Table Structure for whosUp

## 1. users table
**Purpose:** store user account info, profile, and avatar

| Column         | Type       | Constraints                  |
|----------------|------------|------------------------------|
| id             | UUID       | Primary Key, default `gen_random_uuid()` |
| email          | text       | Unique                       |
| username       | text       | Not null                     |
| avatar_url     | text       | Nullable                     |
| created_at     | timestamp  | Default `now()`              |
| updated_at     | timestamp  | Default `now()`              |

---

## 2. posts table
**Purpose:** store videos uploaded by users

| Column         | Type       | Constraints                                    |
|----------------|------------|------------------------------------------------|
| id             | UUID       | Primary Key, default `gen_random_uuid()`       |
| user_id        | UUID       | Foreign Key → `users.id`                       |
| caption        | text       | Not null                                      |
| topic          | text       | Not null                                      |
| song_name      | text       | Not null                                      |
| profile_image  | text       | Nullable (redundant with avatar_url)          |
| company        | text       | Nullable                                      |
| video_url      | text       | Not null                                      |
| likes_count    | integer    | Default 0                                     |
| created_at     | timestamp  | Default `now()`                               |
| updated_at     | timestamp  | Default `now()`                               |

---

## 3. comments table
**Purpose:** store comments on posts

| Column        | Type       | Constraints                             |
|---------------|------------|-----------------------------------------|
| id            | UUID       | Primary Key, default `gen_random_uuid()`|
| post_id       | UUID       | Foreign Key → `posts.id`                |
| user_id       | UUID       | Foreign Key → `users.id`                |
| username      | text       | Optional (denormalized for display)     |
| user_image    | text       | Optional (denormalized)                 |
| comment       | text       | Not null                                |
| created_at    | timestamp  | Default `now()`                          |

---

## 4. likes table
**Purpose:** track likes per post

| Column        | Type       | Constraints                             |
|---------------|------------|-----------------------------------------|
| id            | UUID       | Primary Key, default `gen_random_uuid()`|
| post_id       | UUID       | Foreign Key → `posts.id`                |
| user_id       | UUID       | Foreign Key → `users.id`                |
| username      | text       | Optional (denormalized)                 |
| created_at    | timestamp  | Default `now()`                          |

---

## 5. Optional: followers table
**Purpose:** track user follow relationships

| Column        | Type  | Constraints                      |
|---------------|-------|----------------------------------|
| id            | UUID  | Primary Key, default `gen_random_uuid()` |
| follower_id   | UUID  | Foreign Key → `users.id`         |
| following_id  | UUID  | Foreign Key → `users.id`         |
| created_at    | timestamp | Default `now()`               |

---

**Notes:**
- `likes_count` in posts is optional, can be computed dynamically.
- `profile_image` and `username` are denormalized in comments/likes for convenience.

