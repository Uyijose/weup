import React, { useState, useEffect, useRef } from "react";
import { MdDelete } from "react-icons/md";
import { useRouter } from "next/router";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { useUploadVideoStore } from "../stores/uploadVideoStore";
import { useTopicsStore } from "../stores/topicsStore";

const CreateVideo = () => {
  const { user } = useAuthStore();
  const router = useRouter();
  const { topics, fetchTopics } = useTopicsStore();
  const [redirecting, setRedirecting] = useState(false);

  const {
    caption,
    topic,
    hashTags,
    selectedFile,
    loading,
    uploadProgress,
    uploadMessage,
    setCaption,
    setTopic,
    setSelectedFile,
    handlePost,
    resetUpload
  } = useUploadVideoStore();

  const [selectedTopics, setSelectedTopics] = useState([]);
  const [customTopicInput, setCustomTopicInput] = useState("");
  const [customTopicInputVisible, setCustomTopicInputVisible] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const topicsPerPage = 15;

  const filteredTopics = topics.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTopics.length / topicsPerPage);
  const startIndex = (currentPage - 1) * topicsPerPage;
  const paginatedTopics = filteredTopics.slice(startIndex, startIndex + topicsPerPage);

  const [isDragging, setIsDragging] = useState(false);
  const selectedFileRef = useRef(null);

  const checker = caption.match(/#/g);
  const tagCheck = hashTags.match(/#/g);

  const handleChecker = () => {

    if (checker) {
      setCaption(caption.replace("#", ""));
    } else {
      if (topic === "Other") {
        useUploadVideoStore.setState({ tagShow: true });

        if (tagCheck) {
          useUploadVideoStore.setState({ tagError: "" });
        } else {
          useUploadVideoStore.setState({
            tagError: "You Must Add a # Tag To your Custom Topic"
          });
        }
      } else {
        useUploadVideoStore.setState({
          tagShow: false,
          hashTags: "#"
        });
      }
    }
  };
  
  const handleDiscard = () => {
    resetUpload();
    router.push("/");
  };

  useEffect(() => {
    if (loading) return;

    if (!user) {
      console.log("No user found, redirecting to home");
      router.push("/");
    } else {
      console.log("User from store:", user.id);
    }
  }, [loading, user]);


  useEffect(() => {
    fetchTopics();
  }, []);

  useEffect(() => {
    handleChecker();
  }, [caption, topic, hashTags]);

  return (
    <div className="create-container">
      <Toaster />
      {redirecting && (
        <div className="redirect-overlay fixed inset-0 z-50 flex items-center justify-center">
          <div className="redirect-backdrop fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
          <div className="redirect-content z-10 flex flex-col items-center justify-center p-6 bg-[#1a0033] rounded-xl shadow-xl">
            <p className="text-white text-3xl font-bold mb-4">Redirecting to video page...</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-16 h-16 animate-spin text-white"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16" />
            </svg>
          </div>
        </div>
      )}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="create-wrapper"
      >
        <div>
          <div className="flex flex-col items-center mb-4">
            <p className="text-3xl font-extrabold text-white mb-2">Upload Video</p>
          </div>
          <div className="upload-box">
            <div>
              {!selectedFile ? (
                <label className="cursor-pointer">
                  <p className="text-lg font-semibold text-white mb-2 text-center">
                    Select video to upload
                  </p>
                  <div className="flex flex-col items-center justify-center h-full">

                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-6 h-6 mt-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>

                    
                    <p className="text-white bg-gradient-to-br from-pink-500 mt-8 to-orange-400 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center mr-2 w-52">
                      Select file
                    </p>
                  </div>
                  <input
                    type="file"
                    name="upload-video"
                    ref={selectedFileRef}
                    className="w-0 h-0"
                    onChange={async (e) => {
                      let file = e.target.files[0];
                      if (!file) return;
                      const video = document.createElement("video");
                      video.preload = "metadata";
                      video.src = URL.createObjectURL(file);

                      video.onloadedmetadata = () => {
                        URL.revokeObjectURL(video.src);

                        const duration = video.duration;
                        if (duration > 180) {
                          toast(`Your video is ${Math.ceil(duration / 60)} mins long. It will be split into ${Math.ceil(duration / 180)} parts.`, {
                            duration: 4000,
                            position: "top-right",
                            style: { background: "#fff", color: "#015871", fontWeight: "bolder", fontSize: "17px", padding: "20px" }
                          });
                        }

                        setSelectedFile({
                          file:file,
                          preview:URL.createObjectURL(file),
                          duration:duration
                        })
                      };
                    }}
                  />
                  <p className="text-[#1A0033] text-center mt-4 text-sm leading-6 max-w-xs mx-auto">
                      Videos longer than 3 mins will be split into parts if too long <br />
                      Maximum file size for 3 mins vidoe: 50MB
                    </p>
                </label>
              ) : (
                <div className="flex flex-col items-center">
                  {selectedFile && (
                    <div className="flex flex-col items-center">
                      <video
                        className="video-preview"
                        controls
                        loop
                        src={selectedFile.preview}
                      />
                      
                      <div className="preview-actions">
                        <p className="preview-label">video</p>

                        <button
                          type="button"
                          className="delete-video-btn"
                          onClick={() => setSelectedFile("")}
                        >
                          <MdDelete />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {loading && (
            <div>
              {console.log("rendering progress UI", uploadProgress, uploadMessage)}
              <div className="compression-box">
              <p className="compression-text">{uploadMessage}</p>

              <div className="compression-bar">
              <div
              className="compression-progress"
              style={{width:`${uploadProgress}%`}}
              ></div>
              </div>

              <p className="compression-percent">{uploadProgress}%</p>
              </div>
            </div>
          )}
          {/* {wrongFileType && (
            <p className="text-center text-xl text-red-400 font-semibold mt-4 w-[260px]">
              Please select a video file (mp4 or webm or ogg)
            </p>
          )} */}
        </div>
        <div className="form-section">
          <label className="text-md font-medium text-[#1A0033]">Caption</label>
          <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="custom-input"
            />
          <label className="text-md font-semibold text-[#1A0033] flex items-center gap-2">
            Choose a topic
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-[#FF4FA3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </label>
          <label className="text-md font-semibold text-[#1A0033] flex flex-col gap-2">
            Search topic
            <div className="topic-select-container">
              <input
                type="text"
                placeholder="Search topic..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="rounded w-full outline-none text-md border-2 border-gray-200 p-2 text-[#1A0033] mb-2"
              />
              <div className="topic-select">
                {paginatedTopics.map((item) => {
                  const isSelected = selectedTopics.includes(item.name);
                  return (
                    <div
                      key={item.name}
                      className={`topic-item ${isSelected ? "selected" : ""}`}
                      onClick={() => {
                        if (isSelected) {
                          const filtered = selectedTopics.filter(t => t !== item.name);
                          setSelectedTopics(filtered);
                        } else {
                          if (selectedTopics.length >= 3) {
                            toast.error("You can select up to 3 topics");
                            return;
                          }
                          const newSelected = [...selectedTopics, item.name];
                          setSelectedTopics(newSelected);
                        }
                      }}
                    >
                      {item.name} ({item.total_posts})
                    </div>
                  );
                })}
                <div
                  className={`topic-item other-topic ${customTopicInputVisible ? "selected" : ""}`}
                  onClick={() => {
                    if (selectedTopics.length >= 3 && !customTopicInputVisible) {
                      toast.error("You can only select up to 3 topics");
                      return;
                    }
                    setCustomTopicInputVisible(!customTopicInputVisible);
                    if (!customTopicInputVisible) {
                      setCustomTopicInput("");
                      setTimeout(() => {
                        const input = document.getElementById("custom-topic-input");
                        if (input) input.focus();
                      }, 0);
                      console.log("Other clicked → showing input for custom topic");
                    } else {
                      console.log("Other clicked → hiding input");
                    }
                  }}
                >
                  Other
                </div>

                {customTopicInputVisible && (
                  <div className="flex flex-col gap-3 mt-3 w-full max-w-md">
                    <input
                      type="text"
                      id="custom-topic-input"
                      placeholder="Type custom topic"
                      value={customTopicInput}
                      onChange={(e) => {
                        const val = e.target.value.toLowerCase().replace(/\s+/g, '_');
                        setCustomTopicInput(val);
                      }}
                      className="custom-input"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = customTopicInput.trim();
                        if (!trimmed) return;
                        if (selectedTopics.length >= 3) {
                          toast.error("You can only select up to 3 topics");
                          return;
                        }
                        const newSelected = selectedTopics.filter(t => t !== "Other");
                        setSelectedTopics([...newSelected, trimmed]);
                        setCustomTopicInput("");
                        setCustomTopicInputVisible(false);
                      }}
                      className="done-btn"
                    >
                      Done
                    </button>
                  </div>
                )}
              </div>
              <div className="selected-topics flex gap-2 mt-2">
                {selectedTopics.map((t) => (
                  <div key={t} className="selected-topic bg-pink-500 text-white px-2 py-1 rounded flex items-center gap-1">
                    <span>{t}</span>
                    <button
                      onClick={() => {
                        const filtered = selectedTopics.filter(topic => topic !== t);
                        setSelectedTopics(filtered);
                      }}
                    >
                      x
                    </button>
                  </div>
                ))}
              </div>
              <div className="topic-pagination flex justify-between mt-2">
                <button
                  type="button"
                  onClick={() => currentPage > 1 && setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => currentPage < totalPages && setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </label>
          {selectedTopics.includes("Other") && (
            <>
              <input
                type="text"
                placeholder="Type custom topic and press Enter"
                value={customTopicInput}
                onChange={(e) => setCustomTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const trimmed = customTopicInput.trim();
                    if (!trimmed) return;
                    if (selectedTopics.length >= 3) {
                      toast.error("You can only select up to 3 topics");
                      return;
                    }
                    const newSelected = selectedTopics.filter(t => t !== "Other");
                    setSelectedTopics([...newSelected, trimmed]);
                    setCustomTopicInput("");
                  }
                }}
                className="custom-input"
              />
            </>
          )}

          {loading ? (
            <div className="mt-10">
              <button
                type="button"
                className="text-white text-center animate-pulse cursor-not-allowed bg-gradient-to-r w-48 lg:w-80 from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-xl px-5 py-2.5 flex justify-center mr-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-10 h-10 animate-spin"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                  />
                </svg>
              </button>
            </div>
          ) : (
            <div className="form-buttons">
              <button
                onClick={handleDiscard}
                type="button"
                className="discard-btn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancel
              </button>
              <button
                disabled={selectedFile ? redirecting : true}
                onClick={() => {
                  if (!caption || caption.trim().length < 3 ) {
                    toast.error("Caption must be at least 3 characters");
                    return;
                  }

                  if (!selectedFile) {
                    toast.error("Please upload a video");
                    return;
                  }

                  if (!selectedTopics.length) {
                    toast.error("Please select a topic");
                    return;
                  }

                  // Save topics as space-separated string in Zustand
                  const topicsToSave = selectedTopics.join(" ");
                  setTopic(topicsToSave);
                  if (topic === "Other" && (!hashTags || hashTags.trim().length < 3)) {
                    toast.error("Custom topic must be at least 3 characters");
                    return;
                  }
                  toast.success("Uploading your video...");
                  console.log("Start upload");
                  handlePost(router).then(() => {
                      console.log("Upload finished, showing redirect overlay");
                      setRedirecting(true);
                  });
                }}
                type="button"
                className="post-btn"
              >
                Post
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default CreateVideo;
