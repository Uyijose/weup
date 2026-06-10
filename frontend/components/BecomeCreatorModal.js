import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { supabase } from "../utils/supabaseClient";
import ModalPortal from "./ModalPortal";

const BecomeCreatorModal = ({ onClose }) => {
  const router = useRouter();

  const [user, setUser] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session?.user) {
        setUser(data.session.user);
      } else {
        setUser(null);
      }
    };

    getUser();
  }, []);

  return (
    <ModalPortal>
      <div className="creator-modal-overlay">
        <div className="creator-modal">
          <h2>Become a Creator</h2>
          <p>
            You need a creator account to upload videos and grow your audience.
          </p>

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
                if (user) {
                  router.push("/creator/become-creator");
                  return;
                }
                toast.error("You must be logged in to become a creator", {
                  position: "top-center",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  className: "creator-toast",
                  bodyClassName: "creator-toast-body",
                  progressClassName: "creator-toast-progress"
                });
                setTimeout(() => {
                  router.push("/auth/signin");
                }, 5000);
              }}
            >
              Become a Creator
            </button>
          </div>
        </div>
      </div>
    </ModalPortal>
  );
};

export default BecomeCreatorModal;