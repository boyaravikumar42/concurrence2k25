import React, { useEffect, useState } from "react";
import "./SettingsPage.css";
import { Moon, Sun, ShieldCheck, Lock, User, Key, CheckCircle, Bell, Eye, Star, Wand2, Settings } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [magicTheme, setMagicTheme] = useState(false);
  const [userId, setUserId] = useState(null);
  const [user,setUser]=useState([]);
  const navigate=useNavigate();
useEffect(() => {
  const fetchLoggedUser = async () => {
    try {
      const userId=localStorage.getItem("user");
      setUserId(userId);
      if (!userId) {
        console.error("No user ID found in localStorage");
        return;
      }
       
      const { data } = await axios.get(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Logged User Data:", data);

      setUser(data);
    } catch (error) {
      console.error("Error fetching logged user:", error.response?.data || error.message);
    } 
  };
  fetchLoggedUser();
  
}, []);
  return (
    <div className={`settings-container-page ${darkMode ? "dark-theme" : "light-theme"} ${true ? "magic-active" : ""}`}>
      <h1 className="settings-title"><Settings /> Settings</h1>

      {/* Profile Section */}
      <section className="settings-section-theme">
        <h2><User /> Profile Information</h2>
        <p type="text"  className="settings-input">{user.name}</p>
       <p type="text"  className="settings-input">{user.email}</p>
       <p type="text"  className="settings-input">{user.bio ? user.bio : " Bio Empty"}</p>
      </section>

      {/* Verifications */}
      <section className="settings-section-theme">
        <h2><CheckCircle /> Verifications</h2>
        <input type="email" placeholder="Email Address (Verified)" className="settings-input verified" disabled/>
        <input type="tel" placeholder="Mobile Number (Unverified)" className="settings-input" disabled/>
      </section>

      {/* Display Settings */}
      <section className="settings-section-theme">
        <h2><Eye /> Display Preferences</h2>
        <button className="toggle-btn" onClick={() => setDarkMode(!darkMode)} disabled>
          {darkMode ? <Sun /> : <Moon />} {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </section>

      {/* General Preferences */}
      <section className="settings-section-theme">
        <h2><Bell /> General Preferences</h2>
        <label>
          <input type="checkbox" checked={autoplay} onChange={() => setAutoplay(!autoplay)}  disabled/>
          Autoplay Videos
        </label>
      </section>

      {/* Security & Privacy */}
      <section className="settings-section-theme">
        <h2><ShieldCheck /> Security & Privacy</h2>
        <button className="settings-btn"><Lock /> Change Password</button>
        <button className="settings-btn" onClick={() => setTwoFactor(!twoFactor)} disabled>
          {twoFactor ? "Disable" : "Enable"} Two-Factor Authentication
        </button>
      </section>

      {/* Magical Theme */}
      <section className="settings-section-theme">
        <h2> Go to</h2>
        <button className="toggle-btn magic-btn" onClick={()=>{navigate('/home')}}>
           Go to Home
        </button>
      </section>
    </div>
  );
};

export default SettingsPage;
