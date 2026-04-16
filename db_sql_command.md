-- 🔥 Periodic Resync Function
-- 🔥 Corrected Periodic Resync Function
CREATE OR REPLACE FUNCTION public.periodic_resync_counts()
RETURNS void
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Resync post comments
  UPDATE posts p
  SET comments_count = (
    SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id
  );

  -- Resync video_parts comments
  UPDATE video_parts vp
  SET comments_count = (
    SELECT COUNT(*) FROM comments c WHERE c.video_part_id = vp.id
  );

  -- Resync post likes
  UPDATE posts p
  SET likes_count = (
    SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id
  );

  -- Resync video_parts likes
  UPDATE video_parts vp
  SET likes_count = (
    SELECT COUNT(*) FROM likes l WHERE l.video_part_id = vp.id
  );

  -- Resync post views
  UPDATE posts p
  SET views_count = (
    SELECT COUNT(*) FROM post_views pv WHERE pv.post_id = p.id
  );

  -- Resync video_parts views
  UPDATE video_parts vp
  SET views_count = (
    SELECT COUNT(*) FROM post_views pv WHERE pv.video_part_id = vp.id
  );

  -- Resync user videos_watched
  UPDATE users u
  SET videos_watched = (
    SELECT COUNT(DISTINCT pv.post_id) FROM post_views pv WHERE pv.viewer_id = u.id
  );

  -- Resync creator_views
  UPDATE users u
  SET creator_views = (
    SELECT COALESCE(SUM(p.views_count), 0) FROM posts p WHERE p.user_id = u.id
  );

END;
$function$;


select cron.schedule(
  'resync_all_counts_every_5min',  -- Job name
  '*/5 * * * *',                   -- Every 5 minutes
  'select periodic_resync_counts();' -- SQL command
);


## To check all scheduled cron jobs:

select * from cron.job;







CREATE OR REPLACE FUNCTION public.periodic_resync_counts()
RETURNS void AS $$
BEGIN
    -- Step 1: Aggregate single-word topics from posts and video_parts
    WITH post_topics AS (
        SELECT unnest(string_to_array(topic, ' ')) AS topic_name
        FROM posts
        WHERE topic IS NOT NULL
    ),
    video_part_topics AS (
        SELECT unnest(string_to_array(p.topic, ' ')) AS topic_name
        FROM video_parts vp
        JOIN posts p ON vp.post_id = p.id
        WHERE p.topic IS NOT NULL
    ),
    combined AS (
        SELECT LOWER(topic_name) AS topic_name, COUNT(*) AS total_posts
        FROM (
            SELECT topic_name FROM post_topics
            UNION ALL
            SELECT topic_name FROM video_part_topics
        ) t
        WHERE topic_name NOT LIKE '% %'   -- Ignore multi-word topics
          AND topic_name <> ''            -- Ignore empty strings
        GROUP BY LOWER(topic_name)
    )
    -- Step 2: Upsert into topics table
    INSERT INTO topics (name, total_posts, created_at, updated_at)
    SELECT topic_name, total_posts, now(), now()
    FROM combined
    ON CONFLICT (name) 
    DO UPDATE SET total_posts = EXCLUDED.total_posts, updated_at = now();
END;
$$ LANGUAGE plpgsql;


-- Run the resync once
SELECT public.periodic_resync_counts();


SELECT cron.schedule(
    'resync_topics_every_hour',          -- Job name
    '0 * * * *',                         -- Every hour at minute 0
    'SELECT public.periodic_resync_counts();' -- Call the function
);

select * from cron.job;







DELETE FROM public.post_views
WHERE id IN (
    SELECT id
    FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY anon_id, post_id, video_part_id
                   ORDER BY viewed_at
               ) AS rn
        FROM public.post_views
        WHERE anon_id IS NOT NULL
    ) t
    WHERE t.rn > 1
);




SELECT * FROM post_views WHERE anon_id = '216bbe94-b4d8-4bc0-b1c4-a3f951a02d76';




INSERT INTO public.post_views (anon_id, post_id, video_part_id)
VALUES ('216bbe94-b4d8-4bc0-b1c4-a3f951a02d76', 'd045110b-388f-472b-bd6a-14f4a72e46a2', NULL);


SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'post_views';


SELECT add_anon_view(
    '216bbe94-b4d8-4bc0-b1c4-a3f951a02d76',
    'd045110b-388f-472b-bd6a-14f4a72e46a2',
    NULL
);


DELETE FROM public.post_views
WHERE anon_id = '216bbe94-b4d8-4bc0-b1c4-a3f951a02d76';



# command to see all policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN (
    'conversations',
    'conversation_members',
    'messages',
    'message_reactions'
  )
ORDER BY tablename, policyname;



# to list all functions
SELECT
  routine_name,
  routine_type,
  data_type AS return_type
FROM information_schema.routines
WHERE specific_schema = 'public'
ORDER BY routine_name;



# to list all functions for conversatiion and messages
SELECT
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (
    pg_get_functiondef(p.oid) ILIKE '%conversations%' OR
    pg_get_functiondef(p.oid) ILIKE '%conversation_members%' OR
    pg_get_functiondef(p.oid) ILIKE '%messages%' OR
    pg_get_functiondef(p.oid) ILIKE '%message_reactions%'
  )
ORDER BY function_name;



# to get all functions definitions; 

SELECT
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
ORDER BY function_name;





# foreign key relations; 
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name IN (
    'conversations',
    'conversation_members',
    'messages',
    'message_reactions'
  );