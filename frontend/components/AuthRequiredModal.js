import React from "react";
import { useRouter } from "next/router";
import ModalPortal from "./ModalPortal";

const AuthRequiredModal = ({ onClose }) => {
  const router = useRouter();

  return (
    <ModalPortal>
        <div className="creator-modal-overlay">
        <div className="creator-modal">
            <h2>Login Required</h2>
            <p>You must be logged in to view your creator profile.</p>

            <div className="creator-modal-actions">
            <button
                className="creator-secondary-btn"
                onClick={onClose}
            >
                Cancel
            </button>

            <button
                className="creator-primary-btn"
                onClick={() => {
                onClose();
                router.push("/auth/signin");
                }}
            >
                Login
            </button>
            </div>
            </div>
        </div>
    </ModalPortal>
    );
};

export default AuthRequiredModal;
