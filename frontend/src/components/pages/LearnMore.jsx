import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import "./LearnMore.css";

const LearnMore = () => {
  const [users, setUsers] = useState(0);
  const [posts, setPosts] = useState(0);

  useEffect(() => {
    let userCount = 3000;
    let postCount = 10000;

    const userInterval = setInterval(() => {
      setUsers((prev) => (prev < userCount ? prev + 10 : userCount));
    }, 30);

    const postInterval = setInterval(() => {
      setPosts((prev) => (prev < postCount ? prev + 30 : postCount));
    }, 30);

    return () => {
      clearInterval(userInterval);
      clearInterval(postInterval);
    };
  }, []);

 

  return (
    <div className="learn-more-container">
      {/* 3D Animated Hero Section */}
      <div className="hero">
        <h1 >
          The Future of <span>Student Networking</span> is Here 🚀
        </h1>
        <p>AI-powered collaboration, limitless opportunities, and next-gen innovation.</p>
        <Link to="/auth/?type=register" className="cta-button">Get Started</Link>
      </div>

      {/* Features Section */}
      <div className="features">
        <h2>🔮 Unleash The Power</h2>
        <div className="feature-grid">
          {[ 
            { icon: "🧠", title: "AI-Powered Matching", desc: "Smart recommendations for expanding your network." },
            { icon: "⚡", title: "Instant Collaboration", desc: "Share PDFs, videos, and real-time content." },
            { icon: "🌍", title: "Global Student Hub", desc: "Connect with like-minded peers worldwide." },
            { icon: "🔗", title: "Next-Gen Learning", desc: "Get personalized learning content." }
          ].map((feature, index) => (
            <motion.div key={index} className="feature-card" whileHover={{ scale: 1.05 }}>
              <h3>{feature.icon} {feature.title}</h3>
              <p>{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Real-Time Stats Section */}
      <div className="stats">
        <h2>📊 We’re Growing Fast</h2>
        <div className="stats-grid">
          <div className="stat-box">
            <h3>{users.toLocaleString()}+</h3>
            <p>Active Students</p>
          </div>
          <div className="stat-box">
            <h3>{posts.toLocaleString()}+</h3>
            <p>Posts Shared</p>
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="cta-section">
        <h2>🌟 Be Part of the Future</h2>
        <Link to="/auth/?type=register" className="cta-button">Join Now</Link>
      </div>
    </div>
  );
};

export default LearnMore;
