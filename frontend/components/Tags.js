import React, { useState, useEffect } from "react";
import { topics } from "../utils/constants";

const Tags = () => {
  const [active, setActive] = useState("");

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://pl28841479.effectivegatecpm.com/784e727a328c0c9ed4fa05f9131d6916/invoke.js";
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="tags pb-6 mt-10 ml-8 w-[90%] border-t border-[#7A00F4]">
     
      <div className="native-ad mt-4 w-full flex justify-center">
        <div id="container-784e727a328c0c9ed4fa05f9131d6916"></div>
      </div>
    </div>
  );
};

export default Tags;