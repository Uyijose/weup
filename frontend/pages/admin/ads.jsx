import React, { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useRouter } from "next/router";
import AdminHeader from "../../components/AdminHeader";

const AdsAdmin = () => {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isClickable, setIsClickable] = useState(true);
  const [adType, setAdType] = useState("feed_inline");
  const [status, setStatus] = useState("active");
  const [priority, setPriority] = useState(0);
  const [bgColor, setBgColor] = useState("#1A0033");
  const [textColor, setTextColor] = useState("#EDEDED");
  const [mediaUrl, setMediaUrl] = useState("");
  const [commentImageUrl, setCommentImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const router = useRouter();

  const fetchAds = async () => {
    const { data, error } = await supabase
      .from("ads")
      .select("*")
      .order("priority", { ascending: false });
    setAds(data || []);
  };

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUser = sessionData.session?.user;

      if (!currentUser) {
        router.push("/");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("is_admin")
        .eq("id", currentUser.id)
        .single();

      if (!profile?.is_admin) {
        router.push("/");
        return;
      }
      await fetchAds();
      setLoading(false);
    };

    checkAdmin();
  }, []);

  const createAd = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUser = sessionData.session?.user;

    const { data, error } = await supabase.from("ads").insert([
      {
        title,
        content,
        ad_type: adType,
        status,
        priority,
        bg_color: bgColor,
        text_color: textColor,
        media_url: mediaUrl,
        comment_image_url: commentImageUrl || null,
        link_url: linkUrl,
        start_date: startDate || null,
        end_date: endDate || null,
        is_clickable: isClickable,
        created_by: currentUser?.id || null
      }
    ]);
    if (!error) {
      setTitle("");
      setContent("");
      setMediaUrl("");
      setLinkUrl("");
      setPriority(0);
      setStartDate("");
      setEndDate("");
      setIsClickable(true);
      await fetchAds();
    }
  };

  if (loading) return <p style={{ color: "#EDEDED" }}>Loading ads...</p>;
    const totalPages = Math.ceil(ads.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedAds = ads.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="admin-container">
      <div className="admin-header">
        <AdminHeader title="Ads Dashboard" />
        <button
          onClick={() => {
            setShowCreateForm((prev) => !prev);
          }}
        >
          {showCreateForm ? "Close Create Ad" : "Create New Ad"}
        </button>
      </div>

      {showCreateForm && (
        <div className="card admin-form-card">
          <h3>Create New Ad</h3>

          <label>Ad Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short internal name for this ad"
          />

          <label>Ad Content</label>
            <input
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Text shown inside the ad"
            />

          <label>Media URL</label>
          <input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="Image or video URL"
          />

          <label>Comment Image URL</label>
          <input
            value={commentImageUrl}
            onChange={(e) => setCommentImageUrl(e.target.value)}
            placeholder="Optional image for comment section ad"
          />

          <label>Click Destination URL</label>
          <input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="Where users go when ad is clicked"
          />

          <label>Ad Placement Type</label>
          <select value={adType} onChange={(e) => setAdType(e.target.value)}>
            <option value="feed_inline">Feed Inline</option>
            <option value="video_overlay_top">Video Overlay Top</option>
            <option value="video_overlay_bottom">Video Overlay Bottom</option>
            <option value="video_overlay_center">Video Overlay Center</option>
            <option value="video_pause_popup">Video Pause Popup</option>
            <option value="interstitial">Interstitial</option>
            <option value="comment_section_ad">Comment Section</option>
          </select>

          <label>Ad Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="expired">Expired</option>
          </select>

          <label>Priority (Higher shows first)</label>
          <input
            type="number"
            value={priority}
            onChange={(e) => setPriority(Number(e.target.value))}
          />

          <label>Background Color</label>
          <input
            type="color"
            value={bgColor}
            onChange={(e) => setBgColor(e.target.value)}
          />

          <label>Text Color</label>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
          />

          <label>Is Clickable</label>
          <select
            value={isClickable}
            onChange={(e) => setIsClickable(e.target.value === "true")}
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>

          <label>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />

          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />

          <button
            onClick={() => {
              createAd();
              setShowCreateForm(false);
            }}
          >
            Create Ad
          </button>
        </div>
      )}

      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Title</th>
              <th>Content</th>
              <th>Type</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Clickable</th>
              <th>Media</th>
              <th>Link</th>
              <th>Start</th>
              <th>End</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAds.map((ad, index) => (
              <tr key={ad.id}>
                <td>{startIndex + index + 1}</td>
                <td>{ad.title}</td>
                <td>{ad.content}</td>
                <td>{ad.ad_type}</td>
                <td>{ad.status}</td>
                <td>{ad.priority}</td>
                <td>{ad.is_clickable ? "Yes" : "No"}</td>
                <td style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {ad.media_url}
                </td>
                <td style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {ad.link_url}
                </td>
                <td>{ad.start_date}</td>
                <td>{ad.end_date}</td>
                <td>{ad.impressions}</td>
                <td>{ad.clicks}</td>
                <td>{new Date(ad.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
        >
          Prev
        </button>

        <span>
          Page {currentPage} of {totalPages}
        </span>

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdsAdmin;
