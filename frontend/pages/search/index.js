import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import avatarFallback from "../../components/assets/avatar-fallback.jpg";

const SearchPage = () => {
  const router = useRouter();
  const { q } = router.query;

  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) {
      return;
    }

    const runSearch = async () => {
      setLoading(true);

      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, creator_username, creator_avatar_url")
        .ilike("creator_username", `%${q}%`);
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select("id, caption, topic, video_url, user_id")
        .or(`caption.ilike.%${q}%,topic.ilike.%${q}%`);
      setUsers(usersData || []);
      setPosts(postsData || []);
      setLoading(false);
    };

    runSearch();
  }, [q]);

  return (
    <div className="search-page">
      <h2>Search results for: {q}</h2>

      {loading && <p className="loading">Loading...</p>}

      {!loading && (
        <>
          <h3>Accounts</h3>
          {users.length === 0 && <p className="no-results">No accounts found</p>}
          <div className="accounts-container">
            {users.map((user) => (
              <div
                key={user.id}
                className="account-item"
                onClick={() => {
                  router.push(`http://localhost:3000/creator/${user.creator_username}`);
                }}
              >
                <img src={user.creator_avatar_url || avatarFallback.src} alt="avatar" />
                <span>{user.creator_username}</span>
              </div>
            ))}
          </div>

          <div className="posts-container">
            {posts.map((post) => (
              <div
                key={post.id}
                className="post-item"
                onClick={() => {
                  window.location.href = `https://www.weup.fun/posts/${post.id}`;
                }}
              >
                <video
                  src={post.video_url}
                  muted
                  controls={false}
                  className="post-video"
                />
                <p>{post.caption || post.topic}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SearchPage;
