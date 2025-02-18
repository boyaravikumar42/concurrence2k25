import React, { useEffect } from "react";
import "./Homepage.css";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem("token");
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [navigate]);

  return (
    <div className="home-container-main">
      {/* Hero Section */}
      <div className="hero-section">
        <h2>Empowering College Students Like Never Before!</h2>
        <p>Connect, share, and grow with peers in an exclusive student-driven platform.</p>
        <div className="cta-buttons">
          <Link to="/auth/?type=register" className="cta">Join Now</Link>
          <Link to="/learn-more" className="cta secondary">Learn More</Link>
        </div>
      </div>

      {/* Information Section */}
      <div className="info-section">
        <div className="info-card">
          <h3>🌟 Top Engaged Students</h3>
          <p>Discover and connect with the most active contributors on the platform.</p>
        </div>
        <div className="info-card">
          <h3>📚 Knowledge Hub</h3>
          <p>Access shared resources like PDFs, PPTs, videos, and images for learning.</p>
        </div>
        <div className="info-card">
          <h3>🤝 Expand Your Network</h3>
          <p>Post valuable content and build meaningful connections with peers.</p>
        </div>
        <div className="info-card">
          <h3>🎉 Upcoming Events</h3>
          <p>Stay ahead with the latest college events, hackathons, and workshops.</p>
        </div>
        <div className="info-card">
          <h3>🔥 Trending Topics</h3>
          <p>Explore hot discussions and top-rated content from your community.</p>
        </div>
        <div className="info-card">
          <h3>🏆 Track Your Rank</h3>
          <p>See where you stand among students in engagement and contributions.</p>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>&copy; 2025 CampusConnect. All Rights Reserved.</p>
      </div>
      <div className="magic-effect"></div>
    </div>
  );
};

export default Home;
