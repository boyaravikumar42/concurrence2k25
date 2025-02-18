import React from "react";
import "./NotFoundPage.css";
import{ FishIcon }from 'lucide-react'
import { Link, Navigate } from "react-router-dom";
import { LucideAArrowDown } from "lucide-react";


const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="magic-hat">🎩</div>
      <h1 className="glowing-text">404</h1>
      <p className="magic-text">Oops! The page has vanished into thin air...</p>
      <FishIcon className="magic-icon" />
      <Link to="/" ><span style={{color:"red",fontSize:"20px"}}>back</span></Link>
      
     
    </div>
    
  );
};

export default NotFound;