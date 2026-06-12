import { faker } from "@faker-js/faker";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import React, { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import avatarFallback from "./assets/avatar-fallback.jpg";
import { BsFillPauseFill, BsFillPlayFill } from "react-icons/bs";
import { GoVerified } from "react-icons/go";
import { HiVolumeOff, HiVolumeUp } from "react-icons/hi";
import { IoIosShareAlt } from "react-icons/io";
import Comments from "./Comments";
import Like from "./Like";
import VideoBottomAd from "./ads/VideoBottomAd_Adstera";
import VideoTopAd from "./ads/VideoTopAd_Exo_Cl";
import { MdSecurity } from "react-icons/md";
import { FaTelegramPlane } from "react-icons/fa";
import SwipeUpHint from "./SwipeUpHint";
import { usePostsStore } from "../stores/postsStore";
import { useReportsStore } from "../stores/reportsStore";
import { useAuthStore } from "../stores/authStore";

const GLOBAL_MUTE_KEY = "global_video_muted";
const GLOBAL_VOLUME_KEY = "global_video_volume";

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return match[2];
    return null;
}

const Post = ({ post }) => {
  const allPosts = usePostsStore(state => state.allPosts);
  const postsMap = usePostsStore(state => state.postsMap);
  const router = useRouter();
  const partFromUrl = router.query.part ? Number(router.query.part) : null;
  const videoRef = useRef(null);
  const volumeTimeoutRef = useRef(null);
  const lastTapRef = useRef(0);
  const tapTimeoutRef = useRef(null);
  const singleTapTimeoutRef = useRef(null);
  const [user, setUser] = useState(null);
  const [postUser, setPostUser] = useState(null); // matched user object
  const [playing, setPlaying] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(() => {
    if (typeof window === "undefined") return true;
    const stored = localStorage.getItem(GLOBAL_MUTE_KEY);
    return stored === null ? true : stored === "true";
  });
  const [volume, setVolume] = useState(() => {
    if (typeof window === "undefined") return 0;
    const stored = localStorage.getItem(GLOBAL_VOLUME_KEY);
    return stored === null ? 0 : parseFloat(stored);
  });
  const [hasCountedView, setHasCountedView] = useState(false);
  const [isComOpem, setIsComOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tagCheck, setIsTagCheck] = useState();
  const [progress, setProgress] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const scrubRef = useRef(false);
  const [showProgress, setShowProgress] = useState(true);
  const progressTimeoutRef = useRef(null);
  const [showVolumeBar, setShowVolumeBar] = useState(false);
  const [showCenterAd, setShowCenterAd] = useState(false);
  const [showPauseAd, setShowPauseAd] = useState(false);
  const [showBottomAd, setShowBottomAd] = useState(false);
  const { id, caption, topic, song_name, video_url, user_id, part_number } = post;
  const item = post;
  const commentCount = item?.comments_count ?? post?.comments_count ?? 0;
  const commentModalRef = useRef(null);
  const [nextPart, setNextPart] = useState(null);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const lastMinuteShownRef = useRef(-1);
  const overlayTimeoutRef = useRef(null);
  const reportedMap = useReportsStore(state => state.reportedMap);
  const fetchUserReports = useReportsStore(state => state.fetchUserReports);
  const submitReport = useReportsStore(state => state.submitReport);
  const authUser = useAuthStore(state => state.user);

  const username = postUser?.username || "Unknown User";
  const isVideoPart = item?.type === "part";
  const commentKey = post.type === "part"
    ? post.video_part_id
    : post.id;

  useEffect(() => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const updateProgress = () => {
      if (!video.duration) return;
      const percent = (video.currentTime / video.duration) * 100;
      setProgress(percent);
    };
    video.addEventListener("timeupdate", updateProgress);
    return () => {
      video.removeEventListener("timeupdate", updateProgress);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const resetHideTimer = (source) => {

      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }

      if (video.paused) {
        setShowProgress(true);
        return;
      }

      setShowProgress(true);

      progressTimeoutRef.current = setTimeout(() => {
        setShowProgress(false);
        setTimeout(() => {
        }, 0);
      }, 5000);
    };

    const handlePlay = () => {
      resetHideTimer("play");
    };

    const handlePause = () => {
      setShowProgress(true);
      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };

    const handleActivity = () => {
      if (!video.paused) {
        resetHideTimer("activity");
      }
    };

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("mousemove", handleActivity);
    video.addEventListener("touchstart", handleActivity);
    video.addEventListener("pointermove", handleActivity);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("mousemove", handleActivity);
      video.removeEventListener("touchstart", handleActivity);
      video.removeEventListener("pointermove", handleActivity);

      if (progressTimeoutRef.current) {
        clearTimeout(progressTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!allPosts.length || !post) return;

    const basePostId =
      post.type === "part" ? post.post_id : post.id;

    const allParts = allPosts
      .filter(p => p.type === "part" && p.post_id === basePostId)
      .sort((a, b) => a.part_number - b.part_number);
    if (!allParts.length) {
      setNextPart(null);
      return;
    }

    const currentPartNumber =
      post.type === "part" ? post.part_number : 0;

    const next =
      allParts.find(p => p.part_number === currentPartNumber + 1) ||
      allParts.find(p => p.part_number === 1);

    if (next) {
      setNextPart(next);
    } else {
      setNextPart(null);
    }
  }, [post, allPosts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commentModalRef.current && !commentModalRef.current.contains(event.target)) {
        setIsComOpen(false);
      }
    };
    if (isComOpem) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isComOpem]);

  useEffect(() => {
    let timer;
    if (playing) {
      timer = setTimeout(() => {
        setShowCenterAd(true);
      }, 5000);
    } else {
      setShowCenterAd(false);
    }
    return () => clearTimeout(timer);
  }, [playing]);

  useEffect(() => {
    setShowBottomAd(true);
    return () => {
      setShowBottomAd(false);
    };
  }, [id]);

  useEffect(() => {
    const fetchPostUser = async () => {
      if (!user_id) return;
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", user_id)
        .single();
      if (error) {
        setPostUser(null);
      } else {
        setPostUser(data);
      }
    };

    fetchPostUser();
  }, [user_id]);

  // -------------------
  // Fetch current logged-in user
  // -------------------
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
    };

    getSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // -------------------
  // Video mute
  // -------------------
  useEffect(() => {
      if (!videoRef.current) return;
      const newMuted = volume === 0;
      if (isVideoMuted !== newMuted) {
        setIsVideoMuted(newMuted);
      }
      videoRef.current.muted = newMuted;
      videoRef.current.volume = newMuted ? 0 : volume;
      localStorage.setItem(GLOBAL_MUTE_KEY, newMuted.toString());
      localStorage.setItem(GLOBAL_VOLUME_KEY, volume.toString());
  }, [volume, isVideoMuted]);

  useEffect(() => {
    if (!showVolumeBar) return;
    if (volumeTimeoutRef.current) {
      clearTimeout(volumeTimeoutRef.current);
    }
    volumeTimeoutRef.current = setTimeout(() => {
      setShowVolumeBar(false);
    }, 3500);
    return () => {
      if (volumeTimeoutRef.current) {
        clearTimeout(volumeTimeoutRef.current);
      }
    };
  }, [showVolumeBar, volume, isVideoMuted]);

  useEffect(() => {
      if (!videoRef.current) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          const videoEl = videoRef.current;
          if (entry.isIntersecting) {
            const videos = document.querySelectorAll(".video-element");
            videos.forEach(v => v.pause());
            videoEl.muted = localStorage.getItem(GLOBAL_MUTE_KEY) === "true";
            videoEl.volume = parseFloat(localStorage.getItem(GLOBAL_VOLUME_KEY) || "0");
            videoEl.play();
            setPlaying(true);
          } else {
            videoEl.pause();
            setPlaying(false);
          }
        },
        { threshold: 0.75 }
      );
      observer.observe(videoRef.current);
      return () => {
        observer.disconnect();
      };
  }, []);

  // -------------------
  // Handle hashtags
  // -------------------
  useEffect(() => {
    if (topic) setIsTagCheck(topic.match(/#/g));
  }, [topic]);

  const seekFromPointer = (clientX, target) => {
  const rect = target.getBoundingClientRect();
  const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
  const percent = x / rect.width;
  if (!videoRef.current || !videoRef.current.duration) return;

  const newTime = percent * videoRef.current.duration;
  videoRef.current.currentTime = newTime;
  setProgress(percent * 100);
};

const handleProgressPointerDown = (e) => {
  e.stopPropagation();
  if (progressTimeoutRef.current) {
    clearTimeout(progressTimeoutRef.current);
  }
  setShowProgress(true);
  setIsScrubbing(true);
    scrubRef.current = true;

    const target = e.currentTarget;

    if (videoRef.current) {
      videoRef.current.pause();
    }

    seekFromPointer(e.clientX, target);

    target.setPointerCapture?.(e.pointerId);

    const move = (ev) => {
      if (!scrubRef.current) return;
      seekFromPointer(ev.clientX, target);
    };

    const up = (ev) => {
      setIsScrubbing(false);
      scrubRef.current = false;

      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", up);

      if (videoRef.current) {
        videoRef.current.play();
      }
    };

    document.addEventListener("pointermove", move);
    document.addEventListener("pointerup", up);
  };

  const handleShare = async () => {
    let postUrl = "";

    if (post.type === "part") {
      const basePostId = post.post_id;
      const partNumber = post.part_number;

      postUrl = `${window.location.origin}/posts/${basePostId}?part=${partNumber}`;
    } else {
      postUrl = `${window.location.origin}/posts/${post.id}`;
    }

    if (navigator.share) {
      try {
        await navigator.share({
          title: username,
          text: caption,
          url: postUrl,
        });
      } catch (err) {
        console.log("Native share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(postUrl);
      toast.success("Link copied to clipboard!", {
        duration: 2000,
        position: "bottom-right",
      });
    }
  };

  const resolveIds = (post) => {
    const rawId = post.id;

    console.log("[VIEW RESOLVE] raw id received:", rawId);

    let postId = null;
    let videoPartId = null;

    if (post.type === "part" || post.original_post_id) {
        postId = post.original_post_id || post.post_id;

        console.log("[VIEW RESOLVE] detected PART", {
            postId
        });

        const parts = post.original_post?.video_parts || [];

        console.log("[VIEW RESOLVE] available parts:", parts.length);

        const match = parts.find(p =>
            Number(p.part_number) === Number(post.part_number)
        );

        videoPartId = match?.id || post.video_part_id || null;

        console.log("[VIEW RESOLVE] matched part:", {
            videoPartId,
            part_number: post.part_number
        });

    } else {
        postId = rawId;
        videoPartId = null;

        console.log("[VIEW RESOLVE] detected POST", {
            postId
        });
    }

    return { postId, videoPartId };
  };

  useEffect(() => {
    if (!videoRef.current || hasCountedView) return;

    const handleViewThreshold = async () => {
        if (videoRef.current.currentTime >= 3 && !hasCountedView) {
            setHasCountedView(true);

            if (user?.id) {
              const { postId, videoPartId } = resolveIds(post);

              console.log("[VIEW DEBUG] FINAL IDS", {
                  postId,
                  videoPartId
              });

              const { data, error } = await supabase
                  .from("post_views")
                  .insert({
                      post_id: postId,
                      video_part_id: videoPartId,
                      viewer_id: user.id
                  })
                  .select();

              if (error) {
                  console.log("[VIEW DEBUG] insert error", error);
                  return;
              }

              console.log("[VIEW DEBUG] view inserted", data);

              if (videoPartId) {
                  console.log("[VIEW DEBUG] increment VIDEO PART views RPC", {
                      video_part_id: videoPartId
                  });

                  const { error: partErr } = await supabase.rpc(
                      "increment_video_part_views",
                      {
                          p_video_part_id: videoPartId.toString(),
                          p_viewer_id: user.id.toString()
                      }
                  );

                  if (partErr) {
                      console.log("[VIEW DEBUG] video part RPC error", partErr);
                  } else {
                      console.log("[VIEW DEBUG] video part views updated");
                  }

              } else {
                  console.log("[VIEW DEBUG] increment POST views RPC", {
                      post_id: postId,
                      creator_id: user_id
                  });

                  const { error: postErr } = await supabase.rpc(
                      "increment_post_views",
                      {
                          p_post_id: postId.toString(),
                          p_viewer_id: user.id.toString(),
                          p_creator_id: user_id?.toString()
                      }
                  );

                  if (postErr) {
                      console.log("[VIEW DEBUG] post RPC error", postErr);
                  } else {
                      console.log("[VIEW DEBUG] post views updated");
                  }
              }
          } else {
              let anonId = getCookie("anon_id");
              if (!anonId) {
                  anonId = crypto.randomUUID();
                  document.cookie = `anon_id=${anonId}; path=/; max-age=31536000`; // 1 year
              } else {
                  console.log("Using existing anon_id:", anonId);
              }
              await supabase.rpc("increment_post_views_anonymous", {
                  p_post_id: id.toString(),
                  p_anon_id: anonId,
                  p_video_part_id: post.original_post_id ? id : null
              });
          }
        }
    };

    const videoEl = videoRef.current;
    videoEl.addEventListener("timeupdate", handleViewThreshold);
    return () => {
        videoEl.removeEventListener("timeupdate", handleViewThreshold);
    };
  }, [user, hasCountedView, id, user_id]);
  
  useEffect(() => {
    if (!videoRef.current || !nextPart) return;
    const videoEl = videoRef.current;
    const handleOverlayTiming = () => {
      const currentTime = videoEl.currentTime;
      const duration = videoEl.duration;
      if (!duration || isNaN(duration)) return;
      const timeLeft = duration - currentTime;
      if (currentTime < 2) {
        setShowNextOverlay(true);
        return;
      }
      if (currentTime >= 2 && currentTime < 4) {
        setShowNextOverlay(false);
      }
      const minuteMark = Math.floor(currentTime / 60);
      if (
        minuteMark !== lastMinuteShownRef.current &&
        currentTime >= 60 &&
        timeLeft > 8
      ) {
        lastMinuteShownRef.current = minuteMark;
        setShowNextOverlay(true);
        clearTimeout(overlayTimeoutRef.current);
        overlayTimeoutRef.current = setTimeout(() => {
          setShowNextOverlay(false);
        }, 3000);
      }
      if (timeLeft <= 8) {
        setShowNextOverlay(true);
      }
    };
    videoEl.addEventListener("timeupdate", handleOverlayTiming);
    return () => {
      videoEl.removeEventListener("timeupdate", handleOverlayTiming);
      clearTimeout(overlayTimeoutRef.current);
    };
  }, [nextPart]);

  useEffect(() => {
    if (authUser?.id) {
      fetchUserReports(authUser.id);
    }
  }, [authUser]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSwipeHint(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id]);


  useEffect(() => {
    setShowNextOverlay(true);
  }, [id]);

  if (!post) {
    return null;
  }

  return (
    <>
      <Toaster />
      <motion.div style={{ height: "100vh", width: "100%" }}>
        {/* Post header */}
        {/* Video */}
        <div className="video-wrapper">
            <video
              ref={videoRef}
              src={video_url}
              loop
              muted={isVideoMuted}
              playsInline
              preload="metadata"
              controls={false}
              disablePictureInPicture
              controlsList="nodownload noplaybackrate nofullscreen"
              className="video-element no-download-video"
              onContextMenu={(e) => {
                e.preventDefault();
              }}
              onDragStart={(e) => {
                e.preventDefault();
              }}
              onTouchStart={() => {
                setShowSwipeHint(false);
              }}
              onClick={(e) => {
                setShowSwipeHint(false);

                const video = videoRef.current;
                const now = Date.now();
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const isLeft = x < rect.width / 2;

                const isDoubleTap = now - lastTapRef.current < 250;
                lastTapRef.current = now;
                if (tapTimeoutRef.current) {
                  clearTimeout(tapTimeoutRef.current);
                }

                if (isDoubleTap) {
                  console.log("[TAP] DOUBLE TAP → SEEK ONLY");

                  if (isLeft) {
                    const newTime = Math.max(video.currentTime - 5, 0);
                    video.currentTime = newTime;
                  } else {
                    const newTime = Math.min(video.currentTime + 5, video.duration);
                    video.currentTime = newTime;
                  }

                  return;
                }
                tapTimeoutRef.current = setTimeout(() => {
                  if (!videoRef.current) return;

                  if (videoRef.current.paused) {
                    videoRef.current.play();
                    setPlaying(true);
                  } else {
                    videoRef.current.pause();
                    setPlaying(false);
                  }
                }, 250);
              }}
            />
            <SwipeUpHint visible={showSwipeHint} />
            {/* {typeof window !== "undefined" && (
              <VideoTopAd videoId={id} />
            )} */}
            {showBottomAd && typeof window !== "undefined" && (
            <>
              {/* <VideoBottomAd videoId={id} /> */}
            </>
          )}
            <div
              className="video-progress-hit"
              style={{
                opacity: showProgress ? 1 : 0,
                pointerEvents: showProgress ? "auto" : "none",
                transition: "opacity 0.25s ease"
              }}
              onPointerDown={handleProgressPointerDown}
            >
              <div className="video-progress-bar">
                <div
                  className="video-progress-filled"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="video-progress-thumb"
                  style={{ left: `${progress}%` }}
                />
                {isScrubbing && (
                  <div style={{ position: "absolute", bottom: 90, left: 10, color: "white", fontSize: 12 }}>
                    SCRUBBING...
                  </div>
                )}
              </div>
            </div>
            {playing === false && (
              <div className="video-play-center">
                <BsFillPauseFill size={64} color="white" />
              </div>
            )}
            {playing === true && (
              <div className="video-play-center">
                <BsFillPlayFill size={64} color="white" />
              </div>
            )}
          <div className="video-gradient"></div>
          {nextPart && showNextOverlay && (
            <div className="next-part-overlay">
              <div
                className="next-part-close"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowNextOverlay(false);
                }}
              >
                ×
              </div>
              <div
                className="next-part-content"
                onClick={() => {
                  const basePostId =
                    post.type === "part"
                      ? post.post_id
                      : post.id;
                  router.push(`/posts/${basePostId}?part=${nextPart.part_number}`);
                }}
              >
                <div className="next-part-play">
                  ▶
                </div>
                <div className="next-part-text">
                  Watch Part {nextPart.part_number}
                </div>
              </div>
            </div>
          )}
          <div className="video-user flex-col items-start">
            <div className="video-user-row">
              <img
                src={postUser?.creator_avatar_url || avatarFallback.src}
                alt="avatar"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  router.push(`/creator/${postUser?.creator_username}`);
                }}
              />
              <span
                className="video-user-name flex items-center gap-1"
                style={{ cursor: "pointer" }}
                onClick={() => {
                  router.push(`/creator/${postUser?.creator_username}`);
                }}
              >
                @{postUser?.creator_username || "Unknown"}
                <GoVerified className="text-blue-400 text-sm" />
              </span>
            </div>
            <span className="video-caption text-sm font-normal mt-1">
              {caption}
              {post.type === "part" && ` (Part ${post.part_number})`}
            </span>
            <span className="video-topic text-sm font-semibold text-white mt-1">
              {topic
                ?.split(/\s+/)
                .filter(t => t) 
                .map(t => (t.startsWith('#') ? t : `#${t}`))
                .join(' ')
              }
            </span>
          </div>
          <div className="flex justify-center">
          <div className="video-actions">
            <div className="video-action-btn">
              <Like
                user={user}
                postId={id}
                videoPartId={post.video_part_id}
                isVideoPart={isVideoPart}
                likesCountProp={post.likes_count}
              />
            </div>
            <div className="video-action-btn">
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                <svg
                  onClick={() => setIsComOpen(!isComOpem)}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="black"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 00.44 1.223z"
                    clipRule="evenodd"
                  />
                </svg>
              </motion.div>
              <span>{commentCount}</span>
            </div>
            <div className="video-action-btn">
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    handleShare();
                  }}
                  className="cursor-pointer"
                >
                  <IoIosShareAlt size={28} />
                </div>
              </motion.div>
            </div>
            <div className="video-action-btn">
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                <div
                  onClick={async (e) => {
                    e.stopPropagation();
                    const user = authUser;
                    if (!user) {
                      toast.error("Only logged-in users can report videos");
                      return;
                    }

                    if (reportedMap[post.id]) {
                      toast("You have already reported this video. Your report is under review.");
                      return;
                    }

                    // already checked duplicate, now show prompt
                    const reason = prompt("Why are you reporting this video?");
                    if (!reason) {
                      return;
                    }

                    const result = await submitReport({
                      targetId: post.id,
                      type: "post",
                      reason,
                      reasonCode: "user_text",
                    });
                    if (result?.error) {
                      toast.error(result.error);
                      return;
                    }

                    toast.success("Report submitted");
                  }}
                  className="cursor-pointer text-sm font-semibold"
                  title="Report video"
                >
                  <MdSecurity
                    size={22}
                    className={
                      reportedMap[post.id]
                        ? "text-gray-400"
                        : "text-red-500"
                    }
                  />
                </div>

              </motion.div>
            </div>

            <div className="video-action-btn">
              <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    // window.open("https://t.me/+TG0J6XUUGxdmOThk", "_blank");
                    window.open("https://wa.me/2348082666215", "_blank");
                  }}
                  className="cursor-pointer"
                  title="Join Telegram"
                >
                  <FaTelegramPlane size={24} color="#0088cc" />
                </div>
              </motion.div>
            </div>
              <div className="video-action-btn volume-wrapper">
                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.95 }}>
                  <div
                    onClick={(e) => {
                      e.stopPropagation();

                      if (isVideoMuted) {
                          setVolume(0.5);
                      } else {
                          setVolume(0);
                      }
                      setShowVolumeBar(true);
                    }}
                    className="cursor-pointer"
                  >
                    {isVideoMuted ? (
                      <HiVolumeOff size={28} />
                    ) : (
                      <HiVolumeUp size={28} />
                    )}
                  </div>
                </motion.div>
                {showVolumeBar && (
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) => {
                      const newVolume = parseFloat(e.target.value);
                      setVolume(newVolume);
                      setShowVolumeBar(true);
                    }}
                    className="volume-slider"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Comments Section */}
        {isComOpem && (
          <div className="comment-modal" ref={commentModalRef}>
            <div className="comment-modal-body">

              <Comments
                postId={post.type === "part" ? post.post_id : post.id}
                videoPartId={post.type === "part" ? post.video_part_id : null}
                commentKey={commentKey}
                user={user}
                onClose={() => setIsComOpen(false)}
                onCountChange={(newCount) => {
                  usePostsStore.getState().updateCommentsCount(commentKey, newCount);
                }}
              />
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default Post;
