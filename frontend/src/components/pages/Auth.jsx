import React, { useState } from "react";
import "./Auth.css";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import axios from "axios"; 
import Loader from "./Loader";
import CustomAlert from "../interfaces/CustomAlert"; // Import the CustomAlert component

const Auth = () => {
  const [name, setName] = useState("");
  const [collegeEmail, setCollegeEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState(""); // 'success' or 'error'
  const [searchParams] = useSearchParams(); // for search params
  const navigate = useNavigate();

  const type = searchParams.get("type"); // ?type=register/login

  const handleGoogleSuccess = async(credentialResponse) => {
    if (credentialResponse && credentialResponse.credential) {
      const idToken = credentialResponse.credential; // Get the ID token
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/users/google', { 
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token: idToken }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Login failed');
        }

        const data = await response.json();

        setLoading(false);
        showAlertMessage("success", "Login successful!");
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', data.user._id); // Store user details
        window.dispatchEvent(new Event('storage')); // ✅ Trigger update in all tabs
        navigate("/home");

      } catch (err) {
        setLoading(false);
        showAlertMessage("error", err.message || "An error occurred while logging in.");
      }
    } else {
      showAlertMessage("error", "Token not found in response.");
    }
  };

  const handleGoogleFailure = (error) => {
    showAlertMessage("error", "Google sign-in failed.");
    console.log("Google login failed", error);
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (type === "login") {
      try {
        setLoading(true);
        const { data } = await axios.post(`http://localhost:5000/api/users/login`, {
          collegeEmail,
          password,
        });

        localStorage.setItem("token", data.token);
        localStorage.setItem('user', data.user._id);
        showAlertMessage("success", "Login successful!");
        setLoading(false);
        setCollegeEmail('');
        setPassword('');
        window.dispatchEvent(new Event('storage')); // ✅ Trigger update in all tabs
        navigate("/home");
      } catch (error) {
        setLoading(false);
        showAlertMessage("error", error.response?.data?.message || "Login failed");
        setCollegeEmail('');
        setPassword('');
      }
    } else {
      if (password !== confirmPassword) {
        showAlertMessage("error", "Passwords do not match!");
        return;
      }

      try {
        setLoading(true);
        await axios.post(`http://localhost:5000/api/users/register`, {
          collegeEmail,
          name,
          password,
        });
        setLoading(false);
        showAlertMessage("success", "Registration successful! Please login.");
        setCollegeEmail('');
        setConfirmPassword('');
        setName('');
        setPassword('');
        navigate("/auth/?type=login");
      } catch (error) {
        setLoading(false);
        showAlertMessage("error", error.response?.data?.message || "Registration failed");
        setCollegeEmail('');
        setConfirmPassword('');
        setName('');
        setPassword('');
      }
    }
  };

  const showAlertMessage = (type, message) => {
    setAlertType(type);
    setAlertMessage(message);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 10000); // Hide the alert after 3 seconds
  };

  return (
    <GoogleOAuthProvider clientId="452038178344-tjjj23oaptmmqs93tr6vvpafpn54aect.apps.googleusercontent.com">
      <div className="auth-container">
        <div className="auth-box">
          <h2>{type === "login" ? "Login to CampusConnect" : "Register for CampusConnect"}</h2>
          <input
            type="text"
            placeholder="College Email"
            value={collegeEmail}
            onChange={(e) => setCollegeEmail(e.target.value)}
          />
          {type === "register" && (
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          )}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {type === "register" && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          )}
          <button className="auth-button" onClick={onSubmitHandler}>
            {type === "login" ? "Login" : "Register"}
          </button>
          <GoogleLogin onSuccess={handleGoogleSuccess} onError={handleGoogleFailure} />
          <p>
            {type === "login" ? "New here?" : "Already have an account?"}
            <Link to={type === "login" ? "/auth/?type=register" : "/auth/?type=login"}>
              {type === "login" ? " Register" : " Login"}
            </Link>
          </p>
        </div>
      </div>

      {/* Show Custom Alert */}
      {showAlert && <CustomAlert message={alertMessage} type={alertType} onClose={() => setShowAlert(false)} />}
    </GoogleOAuthProvider>
  );
};

export default Auth;
