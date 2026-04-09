import React from "react";
import { motion } from "framer-motion";

import Btns from "./Btns";
import Tags from "./Tags";
import Links from "./Links";

const LeftHandSide = ({ mobileMenu, setMobileMenu }) => {
  return (
    <>
      {mobileMenu && (
        <div
          className="left-overlay"
          onClick={() => setMobileMenu(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`left ${mobileMenu ? "left-open" : ""}`}
      >
        <Btns />
        <Tags />
        <Links />
      </motion.div>
    </>
  );
};

export default LeftHandSide;
