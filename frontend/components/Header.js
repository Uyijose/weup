import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import { useAuthStore } from "../stores/authStore";
import { FiSearch, FiUpload, FiMenu } from "react-icons/fi";
import BecomeCreatorModal from "./BecomeCreatorModal";
import avatarFallback from "./assets/avatar-fallback.jpg";
// import LeftHandSide from "./LeftHandSide";

const Header = ({ mobileMenu = false, setMobileMenu = () => {} }) => {
  const router = useRouter();
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [mobileSearch, setMobileSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const user = useAuthStore(state => state.user);
  const authLoading = useAuthStore(state => state.loading);

  const isCreator = user?.is_creator || false;
  const logout = useAuthStore(state => state.logout);

  const [headerVisible, setHeaderVisible] = useState(true);
    const scrollRef = React.useRef(0);
    const hideTimer = React.useRef(null);

    useEffect(() => {
      const feed = document.querySelector(".right");
      if (!feed) return;

      hideTimer.current = setTimeout(() => {
        setHeaderVisible(false);
      }, 5000);

      const onScroll = () => {
        const current = feed.scrollTop;

        if (current < scrollRef.current) {
          setHeaderVisible(true);

          clearTimeout(hideTimer.current);
          hideTimer.current = setTimeout(() => {
            setHeaderVisible(false);
          }, 5000);
        }

        scrollRef.current = current;
      };

      feed.addEventListener("scroll", onScroll);

      return () => {
        feed.removeEventListener("scroll", onScroll);
        clearTimeout(hideTimer.current);
      };
    }, []);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return;
    }

    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="header-shell">
      <div className="header-stack">
        <nav className={`navbar ${headerVisible ? "show" : "hide"}`}>
          <button
            className="mobile-menu-btn"
            onClick={() => {
              setMobileMenu(!mobileMenu);
            }}
          >
            ☰
          </button>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <img
              className="logo"
              onClick={() => router.push("/")}
              src="https://res.cloudinary.com/djfjuy99t/image/upload/e_background_removal/f_png/v1771442418/whosup-icon_ykirb1.jpg"
              // src="https://res.cloudinary.com/djfjuy99t/image/upload/e_background_removal/f_png/v1771442418/whosup-icon_ykirb1.jpg"
              alt="whosup"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className={`search-bar ${mobileSearch ? "show-mobile-search" : ""}`}
          >
            <input
              type="text"
              className="search-input"
              placeholder="Search accounts and videos"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
            />

            <button className="search-btn" onClick={handleSearch}>
              <FiSearch />
            </button>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="nav-right"
          >
            <button
              className="mobile-search-btn"
              onClick={() => {
                setMobileSearch(!mobileSearch);
              }}
            >
              <FiSearch className="mobile-icon" />
            </button>
            {!authLoading && (
              <button
                onClick={() => {
                  if (user && isCreator) {
                    router.push("/upload/create");
                    return;
                  }

                  if (!user) {
                    console.log("No logged in user, opening creator modal");
                  } else {
                    console.log("User is logged in but not creator, opening creator modal");
                  }

                  setShowCreatorModal(true);
                }}
                type="button"
                className={`upload-btn ${!user ? "upload-btn-logged-out" : ""}`}
              >
                <FiUpload />
              </button>
            )}
            {authLoading ? (
              <div className="header-auth-skeleton">
                <div className="header-upload-skeleton shimmer"></div>
                <div className="header-avatar-skeleton shimmer"></div>
              </div>
            ) : user ? (
              <div className="flex items-center profile-container">
                <img
                  src={user?.avatar_url || avatarFallback.src}
                  className="nav-avatar"
                  alt="Avatar"
                  onClick={() => {
                    router.push(`/user/${user.id}`);
                  }}
                />
              </div>
            ) : (
              <button
                className={`login-btn ${!user ? "login-btn-logged-out" : ""}`}
                onClick={() => {
                  router.push("/auth/signin");
                }}
              >
                Log in
              </button>
            )}
            {router.pathname.includes("/user/") && user && (
              <button
                className="logout-btn mr-2"
                onClick={async () => {
                  await logout();
                  router.push("/auth/signin");
                }}
              >
                Logout
              </button>
            )}
          </motion.div>
        </nav>
        <button
          className={`floating-search-btn ${headerVisible ? "hide-floating-search" : "show-floating-search"}`}
          onClick={() => {
            setMobileSearch(true);
            setHeaderVisible(true);

            clearTimeout(hideTimer.current);

            hideTimer.current = setTimeout(() => {
              setHeaderVisible(false);
              setMobileSearch(false);
            }, 5000);
          }}
        >
          <FiSearch />
        </button>
      </div>
      {showCreatorModal && (
        <BecomeCreatorModal onClose={() => setShowCreatorModal(false)} />
      )}
      {/* <LeftHandSide mobileMenu={mobileMenu} setMobileMenu={setMobileMenu} /> */}
    </header>
  );
};

export default Header;
