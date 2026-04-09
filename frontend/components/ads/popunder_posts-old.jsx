import React from "react";
import Post from "../Post";

const PopunderPostsAd = ({ post, index }) => {
  const handleClick = () => {
    console.log("PopunderPost: click detected → postId:", post.id, "index:", index);

    const key = `popunder_clicked_${post.id}`;

    const alreadyClicked = localStorage.getItem(key);

    if (alreadyClicked) return;

    const isFifthPost = (index + 1) % 5 === 0;
    const isAdsterraSlot = (index + 1) % 10 === 0;

    if (isFifthPost) {
      if (isAdsterraSlot) {
        const script = document.createElement("script");
        script.src =
          "https://pl29006554.profitablecpmratenetwork.com/52/a1/c0/52a1c09e0162f848b769d07e30c130fc.js";
        script.async = true;
        document.body.appendChild(script);

        console.log("ads click for ADSTERRA");
      } else {
        const adConfig = {
          ads_host: "a.pemsrv.com",
          syndication_host: "s.pemsrv.com",
          idzone: 5884826
        };

        const url =
          "https://" +
          adConfig.syndication_host +
          "/v1/link.php?idzone=" +
          adConfig.idzone;

        window.open(url, "_blank");

        console.log("ads click for EXOCLICK");
      }

      localStorage.setItem(key, "true");
    }
  };

  return (
    <div onClick={handleClick} style={{ cursor: "pointer" }}>
      <Post post={post} />
    </div>
  );
};

export default PopunderPostsAd;