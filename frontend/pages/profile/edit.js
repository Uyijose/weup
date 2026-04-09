import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import { useUploadVideoStore } from "../../stores/uploadVideoStore";
import avatarFallback from "../../components/assets/avatar-fallback.jpg";

export default function EditProfile() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");

  const [isCreator, setIsCreator] = useState(false);
  const [creatorUsername, setCreatorUsername] = useState("");
  const [platformTitle, setPlatformTitle] = useState("");
  const [creatorDescription, setCreatorDescription] = useState("");

  const [avatarFile, setAvatarFile] = useState(null);
  const [creatorAvatarFile, setCreatorAvatarFile] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [creatorAvatarPreview, setCreatorAvatarPreview] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { uploadImage } = useUploadVideoStore();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      if (!sessionUser) {
        router.push("/login");
        return;
      }

      setUser(sessionUser);

      const { data: profile } = await supabase
        .from("users")
        .select("*")
        .eq("id", sessionUser.id)
        .single();

      if (profile) {
        setUsername(profile.username || "");
        setFullName(profile.full_name || "");
        setAvatarPreview(profile.avatar_url || null);

        setIsCreator(profile.is_creator || false);
        setCreatorUsername(profile.creator_username || "");
        setPlatformTitle(profile.platform_title || "");
        setCreatorDescription(profile.creator_description || "");
        setCreatorAvatarPreview(profile.creator_avatar_url || null);
      }
    };

    getUser();
  }, []);

  // const uploadAvatar = async (file) => {
  //   const formData = new FormData();
  //   formData.append("file", file);

  //   const r2Res = await fetch("/api/uploadVideo", {
  //     method: "POST",
  //     body: formData,
  //   });

  //   const r2Data = await r2Res.json();

  //   if (!r2Data.url) return null;

  //   return r2Data.url;
  // };

  const handleUpdate = async () => {
    let avatarUrl = avatarPreview;
    let creatorAvatarUrl = creatorAvatarPreview;

    if (avatarFile) {
      console.log("uploading profile avatar")
      avatarUrl = await uploadImage(avatarFile)
    }

    if (creatorAvatarFile && isCreator) {
      console.log("uploading creator avatar")
      creatorAvatarUrl = await uploadImage(creatorAvatarFile)
    }

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        alert("Password update failed");
        return;
      }
    }

    if (/\s/.test(username)) {
      alert("Username cannot contain spaces");
      return;
    }

    if (isCreator && /\s/.test(creatorUsername)) {
      alert("Creator Username cannot contain spaces");
      return;
    }

    if (newPassword && /\s/.test(newPassword)) {
      alert("Password cannot contain spaces");
      return;
    }

    const updateData = {
      username: username,
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date(),
    };

    if (isCreator) {
      updateData.creator_username = creatorUsername;
      updateData.platform_title = platformTitle;
      updateData.creator_description = creatorDescription;
      updateData.creator_avatar_url = creatorAvatarUrl;
    }

    const { error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", user.id);

    if (error) {
      console.log("Profile update error:", error);
      if (error.code === "23505" || error.details?.includes("username")) {
        alert("This username is already taken. Please choose another.");
        return;
      }
      alert("Failed to update profile. Try again.");
      return;
    }

    router.push(`/user/${user.id}`);

  };

  return (
    <div className="edit-profile-container">
      <div className="edit-header">
        <button
          className="edit-home-btn"
          onClick={() => router.push("/")}
        >
          Home
        </button>

        <h2 className="edit-profile-title">Edit Profile</h2>

        <img
          src={avatarPreview || avatarFallback.src}
          className="edit-header-avatar"
          onClick={() => router.push(`/user/${user?.id}`)}
        />
      </div>

      <h3 className="edit-section-title">User Profile</h3>

      <div className="edit-avatar-section">
        {avatarPreview && (
          <img src={avatarPreview} className="edit-avatar-preview" />
        )}

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setAvatarFile(e.target.files[0]);
            setAvatarPreview(URL.createObjectURL(e.target.files[0]));
          }}
        />
      </div>

      <div className="edit-field">
        <label>Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="edit-field">
        <label>Full Name</label>
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </div>

      {isCreator && (
        <>
          <h3 className="edit-section-title">Creator Profile</h3>

          <div className="edit-avatar-section">
            {creatorAvatarPreview && (
              <img src={creatorAvatarPreview} className="edit-avatar-preview" />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                setCreatorAvatarFile(e.target.files[0]);
                setCreatorAvatarPreview(
                  URL.createObjectURL(e.target.files[0])
                );
              }}
            />
          </div>

          <div className="edit-field">
            <label>Creator Username</label>
            <input
              value={creatorUsername}
              onChange={(e) => setCreatorUsername(e.target.value)}
            />
          </div>

          <div className="edit-field">
            <label>Platform Title</label>
            <input
              value={platformTitle}
              onChange={(e) => setPlatformTitle(e.target.value)}
            />
          </div>

          <div className="edit-field">
            <label>Creator Description</label>
            <input
              value={creatorDescription}
              onChange={(e) => setCreatorDescription(e.target.value)}
            />
          </div>
        </>
      )}
      <div className="edit-field" style={{ position: "relative" }}>
        <label>New Password</label>
        <input
          type={showNewPassword ? "text" : "password"}
          value={newPassword}
          onChange={(e) => {
            console.log("New Password typing:", e.target.value);
            setNewPassword(e.target.value);
          }}
        />
        <span
          className="edit-eye"
          onClick={() => {
            console.log("Toggle new password visibility");
            setShowNewPassword(!showNewPassword);
          }}
        >
          {showNewPassword ? (
            <svg viewBox="0 0 24 24">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zm10 4a4 4 0 100-8 4 4 0 000 8z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M1 1l22 22M2 12s3.5-7 10-7c2.1 0 4 .7 5.6 1.8M22 12s-3.5 7-10 7c-2.1 0-4-.7-5.6-1.8"/>
            </svg>
          )}
        </span>
      </div>

      <div className="edit-field" style={{ position: "relative" }}>
        <label>Confirm Password</label>
        <input
          type={showConfirmPassword ? "text" : "password"}
          value={confirmPassword}
          onChange={(e) => {
            console.log("Confirm Password typing:", e.target.value);
            setConfirmPassword(e.target.value);
          }}
        />
        <span
          className="edit-eye"
          onClick={() => {
            console.log("Toggle confirm password visibility");
            setShowConfirmPassword(!showConfirmPassword);
          }}
        >
          {showConfirmPassword ? (
            <svg viewBox="0 0 24 24">
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7zm10 4a4 4 0 100-8 4 4 0 000 8z"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24">
              <path d="M1 1l22 22M2 12s3.5-7 10-7c2.1 0 4 .7 5.6 1.8M22 12s-3.5 7-10 7c-2.1 0-4-.7-5.6-1.8"/>
            </svg>
          )}
        </span>
      </div>

      <button className="edit-save-btn" onClick={handleUpdate}>
        Save Changes
      </button>
    </div>
  );
}