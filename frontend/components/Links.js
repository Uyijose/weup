import React, { useEffect, useState } from "react";
import Link from "next/link";
import moment from "moment";
import { useRouter } from "next/router";
import { supabase } from "../utils/supabaseClient";
import BecomeCreatorModal from "./BecomeCreatorModal";
import AuthRequiredModal from "./AuthRequiredModal";
import { footerLinks } from "../utils/constants";

const Links = () => {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [showCreatorModal, setShowCreatorModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user ?? null;
      setUser(sessionUser);

      if (sessionUser) {
        const { data: profile } = await supabase
          .from("users")
          .select("is_creator, creator_username")
          .eq("id", sessionUser.id)
          .single();

        setUserData(profile);
      }
    };

    loadUser();
  }, []);

  const handleCreatorPortal = () => {
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (userData?.is_creator && userData?.creator_username) {
      router.push(`/creator/${userData.creator_username}`);
      return;
    }

    setShowCreatorModal(true);
  };

  return (
    <div className="links">
      {footerLinks.map((group) => (
        <div key={group.title} className="link-group">
          <h6>{group.title}</h6>

          <div className="link-list">
            {group.links.map((item) =>
              item.action === "creator-portal" ? (
                <a
                  key={item.label}
                  onClick={handleCreatorPortal}
                  style={{ cursor: "pointer" }}
                >
                  {item.label}
                </a>
              ) : (
                <Link key={item.label} href={item.path}>
                  {item.label}
                </Link>
              )
            )}
          </div>
        </div>
      ))}

      <div className="copyright">
        <h6>&copy; {moment().format("YYYY")} weup</h6>
      </div>

      {showCreatorModal && (
        <BecomeCreatorModal onClose={() => setShowCreatorModal(false)} />
      )}
      {showAuthModal && (
        <AuthRequiredModal onClose={() => setShowAuthModal(false)} />
      )}
    </div>
  );
};

export default Links;
