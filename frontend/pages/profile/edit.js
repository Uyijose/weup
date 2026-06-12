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
  const [isSaving, setIsSaving] = useState(false);
  const { uploadImage } = useUploadVideoStore();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;

      if (!sessionUser) {
        router.push("/login");
        setIsSaving(false);
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

  const handleUpdate = async () => {
    if (isSaving) {
      console.log("[SAVE] Blocked duplicate click");
      return;
    }

    console.log("[SAVE] Started");
    setIsSaving(true);

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
      console.log("[PASSWORD] Update requested");

      if (newPassword !== confirmPassword) {
        console.log("[PASSWORD] Mismatch");
        alert("Passwords do not match");
        setIsSaving(false);
        return;
      }

      if (/\s/.test(newPassword)) {
        console.log("[PASSWORD] Contains spaces");
        alert("Password cannot contain spaces");
        setIsSaving(false);
        return;
      }

      if (newPassword.length < 6) {
        console.log("[PASSWORD] Too short");
        alert("Password must be at least 6 characters");
        setIsSaving(false);
        return;
      }

      console.log("[PASSWORD] Sending update to Supabase");

      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      console.log("[PASSWORD] Supabase response:", { data, error });

      if (error) {
        console.log("[PASSWORD] Update failed:", error.message);

        if (
          error.message &&
          error.message.toLowerCase().includes("different from the old password")
        ) {
          alert(
            "You entered your current password. Please enter a new password different from your old one. If you do not want to change your password, leave the password fields empty."
          );
          setIsSaving(false);
          return;
        }

        alert("Password update failed. Please try a different password.");
        setIsSaving(false);
        return;
      }

      console.log("[PASSWORD] Update successful");
    }

    if (/\s/.test(username)) {
      alert("Username cannot contain spaces");
      setIsSaving(false);
      return;
    }

    if (isCreator && /\s/.test(creatorUsername)) {
      alert("Creator Username cannot contain spaces");
      setIsSaving(false);
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
        setIsSaving(false);
        return;
      }
      alert("Failed to update profile. Try again.");
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
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

      <button
        className={`edit-save-btn ${isSaving ? "loading" : ""}`}
        onClick={handleUpdate}
        disabled={isSaving}
      >
        {isSaving ? (
          <span className="wave-loader">
            <span />
            <span />
            <span />
          </span>
        ) : (
          "Save Changes"
        )}
      </button>
    </div>
  );
}