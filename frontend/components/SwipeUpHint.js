import { motion } from "framer-motion";

const SwipeUpHint = ({ visible }) => {
  if (!visible) return null;

  return (
    <div className="swipe-up-hint">
      <motion.div
        className="swipe-up-arrow"
        initial={{ opacity: 0, y: 20 }}
        animate={{
          opacity: [0, 1, 1, 0],
          y: [20, -30, -30, 20],
        }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        ↑
      </motion.div>

      <motion.div
        className="swipe-up-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 1, 0] }}
        transition={{
          duration: 1.4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        Swipe up
      </motion.div>
    </div>
  );
};

export default SwipeUpHint;
