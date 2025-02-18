import React, { useState } from "react";
import "./HelpPage.css";
import { Info, LifeBuoy, MessageCircle, Phone, Mail, Facebook, Instagram, Youtube } from "lucide-react";
import { motion } from "framer-motion";
import {  useNavigate } from "react-router-dom";

const HelpPage = () => {
  const [showSupportModal, setShowSupportModal] = useState(false);
  const navigate=useNavigate();
  const learnMoreHandler=()=>{
  navigate('/chatBot');
  }
  return ( 
  <div className="help-container-page">
      <motion.div 
      className="help-container"
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      transition={{ duration: 1 }}
    >
      <h1 className="help-title">💁‍♂️Need Help? Feel Free To Contact! 💁‍♂️ </h1>

      <div className="help-section">
        <motion.div className="help-card" whileHover={{ scale: 1.1, rotate: 2 }} onClick={learnMoreHandler}>
          <Info size={50} className="help-icon" />
          <h3>General Info</h3>
          <p>Find answers to FAQs and guides on using the platform.</p>
          <button className="help-btn" >Learn More</button>
        </motion.div>

        <motion.div 
          className="help-card" 
          whileHover={{ scale: 1.1, rotate: -2 }}
          onClick={() => setShowSupportModal(true)}
        >
          <LifeBuoy size={50} className="help-icon" />
          <h3>Support Handler</h3>
          <p>Need help? Contact us anytime!</p>
          <button className="help-btn">Contact Support</button>
        </motion.div>

       
      </div>

      {/* Custom Support Modal */}
      {showSupportModal && (
        <div className="support-modal">
          <div className="support-modal-content">
            <h2>📞 Contact Support</h2>
            <p><Mail size={20} /> Email: <a href="mailto:22091a05c6@rgmcet.edu.in">22091a05c6@rgmcet.edu.in</a></p>
            <p><Phone size={20} /> Phone: +91 9177975108</p>
            <p><Facebook size={20} /> Facebook: <a href="https://facebook.com/yourprofile" target="_blank">facebook.com/rgmcet</a></p>
            <p><Instagram size={20} /> Instagram: <a href="https://instagram.com/yourprofile" target="_blank">instagram.com/rgmcet</a></p>
            <p><Youtube size={20} /> YouTube: <a href="https://youtube.com/yourchannel" target="_blank">youtube.com/rgmcet</a></p>
            <button className="close-btn" onClick={() => setShowSupportModal(false)}>Close</button>
          </div>
        </div>
      )}
    </motion.div>
  </div>
    
  );
};

export default HelpPage;
