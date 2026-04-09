import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import { useUploadVideoStore } from "../../stores/uploadVideoStore";

const BecomeCreator = () => {
  const router = useRouter();

  const [pageLoading, setPageLoading] = useState(true);
  const [creatorUsername, setCreatorUsername] = useState("");
  const [platformTitle, setPlatformTitle] = useState("");
  const [platformDescription, setPlatformDescription] = useState("");
  const [creatorAvatarFile, setCreatorAvatarFile] = useState(null);
  const [creatorAvatarPreview, setCreatorAvatarPreview] = useState(null);
  const { uploadImage } = useUploadVideoStore();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking auth for become creator page");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      console.log("Become creator page user:", user);

      if (!user) {
        console.log("No authenticated user found, redirecting to signin");
        router.replace("/auth/signin");
        return;
      }

      console.log("Authenticated user allowed on become creator page");
      setPageLoading(false);
    };

    checkAuth();
  }, [router]);

  const handleConfirm = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("User not logged in");
      return;
    }

    if (
      !creatorUsername.trim() ||
      !platformTitle.trim() ||
      !platformDescription.trim()
    ) {
      alert("All fields are required");
      return;
    }
    const { data: existingRequest, error: fetchError } = await supabase
      .from("creator_requests")
      .select("id, status")
      .eq("user_id", user.id)
      .maybeSingle();

    if (fetchError) {
      alert("Unable to verify creator request status");
      return;
    }

    if (creatorUsername.length > 20) {
      console.log("Creator username exceeds max length:", creatorUsername.length);
      alert("Creator username cannot exceed 20 characters");
      return;
    }

    if (existingRequest) {
      if (existingRequest.status === "pending") {
        alert("You already submitted a creator request. It is still pending.");
        return;
      }

      if (existingRequest.status === "rejected") {
        alert("Sorry, your previous creator request was rejected.");
        return;
      }

      if (existingRequest.status === "approved") {
        alert("You are already an approved creator.");
        return;
      }
    }
    let creatorAvatarUrl = null;

    if (creatorAvatarFile) {
      console.log("Uploading creator avatar to R2...");
      creatorAvatarUrl = await uploadImage(creatorAvatarFile);
      console.log("Creator avatar uploaded:", creatorAvatarUrl);
    }

    const { error: insertError } = await supabase
      .from("creator_requests")
      .insert({
        user_id: user.id,
        creator_username: creatorUsername.trim(),
        platform_title: platformTitle.trim(),
        platform_description: platformDescription.trim(),
        creator_avatar_url: creatorAvatarUrl,
      });

    if (insertError) {
      alert("Error submitting request: " + insertError.message);
      return;
    }
    alert("Creator request submitted! Wait for admin approval.");
    router.push(`/user/${user.id}`);
  };

  const handleCancel = async () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      router.push(`/user/${user.id}`);
      return;
    }

    router.push("/");
  };

  if (pageLoading) {
    console.log("Become creator page still loading auth state");

    return (
      <div className="creator-page-container">
        <div className="creator-page-card">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="creator-page-container">
      <div className="creator-page-card">
        <h1>Create Your Creator Profile</h1>

        <p className="creator-intro-text">
          You need to input the following details to set up your creator profile.
          This information will represent your platform and brand.
        </p>

        <div className="creator-form-group">
          <label>Creator Profile Image (optional)</label>
          {creatorAvatarPreview && (
            <img
              src={creatorAvatarPreview}
              alt="Creator Avatar Preview"
              style={{ width: "120px", height: "120px", borderRadius: "50%", marginBottom: "10px" }}
            />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              console.log("Creator avatar selected:", file.name);
              setCreatorAvatarFile(file);
              setCreatorAvatarPreview(URL.createObjectURL(file));
            }}
          />
        </div>

        <div className="creator-form-group">
          <label>Creator Username (max 20 characters)</label>
          <input
            type="text"
            placeholder="Enter your creator username"
            value={creatorUsername}
            onChange={(e) => {
              let value = e.target.value.replace(/\s+/g, "_");
              if (value.length > 20) {
                console.log("Username too long:", value.length);
                value = value.slice(0, 20);
                alert("Creator username cannot exceed 20 characters");
              }
              console.log("Creator username updated:", value);
              setCreatorUsername(value);
            }}
          />
        </div>

        <div className="creator-form-group">
          <label>Your Platform Title</label>
          <input
            type="text"
            placeholder="Enter your platform title"
            value={platformTitle}
            onChange={(e) => setPlatformTitle(e.target.value)}
          />
        </div>

        <div className="creator-form-group">
          <label>Platform Description / Creator Description</label>
          <textarea
            rows="4"
            placeholder="Describe your platform or what you create..."
            value={platformDescription}
            onChange={(e) => setPlatformDescription(e.target.value)}
          />
        </div>

        <div className="creator-page-actions">
          <button
            className="creator-confirm-btn"
            onClick={handleConfirm}
          >
            Confirm Profile Setup
          </button>

          <button
            className="creator-cancel-btn"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BecomeCreator;
