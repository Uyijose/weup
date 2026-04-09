import { useEffect } from "react";

const PopunderAd = ({ triggerKey }) => {
  useEffect(() => {
    if (!triggerKey) return;

    const storageKey = `popunder_shown_${triggerKey}`;

    const alreadyShown = sessionStorage.getItem(storageKey);
    if (alreadyShown) {
      return;
    }
    const timer = setTimeout(() => {
      const pageNumber = parseInt(triggerKey.split("_").pop());
      if (pageNumber % 2 === 1) {
        const adsterraUrl =
          "https://pl29006554.profitablecpmratenetwork.com/52/a1/c0/52a1c09e0162f848b769d07e30c130fc.js";
        window.open(adsterraUrl, "_blank");
      } else {
        const adConfig = {
          ads_host: "a.pemsrv.com",
          syndication_host: "s.pemsrv.com",
          idzone: 5884826
        };

        window.open(
          "https://" +
            adConfig.syndication_host +
            "/v1/link.php?idzone=" +
            adConfig.idzone,
          "_blank"
        );
      }

      sessionStorage.setItem(storageKey, "true");
    }, 1000);

    return () => clearTimeout(timer);
  }, [triggerKey]);

  return null;
};

export default PopunderAd;