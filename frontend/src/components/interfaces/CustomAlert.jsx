import React from "react";
import "./CustomAlert.css";  // Add custom styles

const CustomAlert = ({ message, type, onClose }) => {
  return (
    <div className={`alert-container ${type}`}>
      <div className="alert-box">
        <span className="alert-message">{message}</span>
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default CustomAlert;
