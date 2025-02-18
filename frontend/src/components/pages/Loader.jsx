import React from "react";
import { motion } from "framer-motion";

import "./Loader.css"; // Import the CSS file
import { FaFish } from "react-icons/fa";
import { FaCat, FaDog, FaCrow } from "react-icons/fa";

const Loader = () => {
  return (
    <div className="loader-container">
      <motion.div
        className="loader-icon"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1 }}
      >
      <FaFish size={50} />
   
      </motion.div>
      <motion.p
        className="loader-text"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
      >
        Loading...
      </motion.p>
    </div>
  );
};

export default Loader;
