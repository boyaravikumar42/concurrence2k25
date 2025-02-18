import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SearchPage.css";
import {
  FaSearch,
  FaUser,
  FaHashtag,
  FaFilter,
  FaMagic,
  FaHeart,
  FaComment,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const SearchPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState("all");
  
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(
        `http://localhost:5000/api/search?query=${searchQuery}&type=${filters}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      /* console.log("response:",response.data) */
      setSearchResults(response.data.results);
    } catch (err) {
      setError("Error fetching results. Try again.");
    }

    setLoading(false);
  };

  useEffect(() => {
    if (searchQuery) {
      handleSearch();
    }
  }, [filters]); // Runs when filters change
  return (
    <div className="search-page-container">
      <h2 className="glowing-text">🔍 Search for Users & Posts</h2>

      {/* 🔍 Search Bar */}
      <div className="search-bar">
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search for users, posts, or hashtags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
        <button className="magic-search-btn" onClick={handleSearch}>
          <FaMagic /> Search
        </button>
      </div>

      {/* 🔎 Filters */}
      <div className="filters">
        <button
          className={filters === "user" ? "active" : "filter-btn"}
          onClick={() => setFilters("user")}
        >
          <FaUser /> Users
        </button>
        <button
          className={filters === "post" ? "active" : "filter-btn"}
          onClick={() => setFilters("post")}
        >
          <FaHashtag /> Posts
        </button>
        <button
          className={filters === "all" ? "active" : "filter-btn"}
          onClick={() => setFilters("all")}
        >
          <FaFilter /> All
        </button>
      </div>

      {/* ⏳ Loading & Error Handling */}
      {loading && <p className="loading-text">Searching...</p>}
      {error && <p className="error-text">{error}</p>}

      {/* 📌 Search Results */}
      <div className="search-results">
        {searchResults.length > 0 ? (
          searchResults.map((result) =>
            result.type === "user" ? (
              <UserCard key={result.id} user={result} />
            ) : (
              <PostCard key={result.id} post={result} />
            )
          )
        ) : (
          <p className="no-results">No results found.</p>
        )}
      </div>
    </div>
  );
};

// 👤 UserCard Component
const UserCard = ({ user }) => {
  const navigate=useNavigate();
  return (
     <div 
         onClick={(e) => {
              e.stopPropagation(); // Prevent triggering post click
              navigate(`/profile/${user.id}`);
            }}>
    <div className="user-card">
      <img src={user.profilePicture} alt={user.name} className="user-pic" />
      <div className="user-info">
        <h3>{user.name}</h3>
        <p>📍 {user.location || "Not specified"}</p>
        <p>🎓 {user.department || "Department not specified"}</p>
        <p>🏆 {user.badges.length > 0 ? user.badges.join(", ") : "No badges"}</p>
        <p>🛠️ Skills: {user.skills.length > 0 ? user.skills.join(", ") : "No skills listed"}</p>
      </div>
    </div>
    </div>
  );
};

// 📝 PostCard Component
const PostCard = ({ post }) => {
   const navigate=useNavigate();
  return (
    <div
        className="post-body"
        onClick={() => navigate(`/single-post/${post.id}`)}
      >
    <div className="post-card">
      <div className="post-header">
        <img src={post.user.profilePicture} alt={post.user.name} className="post-user-pic" />
        <p className="post-user-name">{post.user.name}</p>
      </div>
      <p className="post-text">{post.text}</p>
       {post.media.length > 0 && (
        <div className="post-media">
          {post.media.map((file, index) => {
            const fileUrl = file;
            const fileExtension = file.split(".").pop().toLowerCase();

            if (["jpg", "jpeg", "png", "gif","webp"].includes(fileExtension)) {
              return <img key={index} src={fileUrl} alt="Post Media" className="media-image" />;
            } else if (["mp4", "mov"].includes(fileExtension)) {
              return (
                <video key={index} controls className="media-video" onClick={(e) => e.stopPropagation()}>
                  <source src={fileUrl} type={`video/${fileExtension}`} />
                  Your browser does not support the video tag.
                </video>
              );
            } else if (["pdf"].includes(fileExtension)) {
              return <iframe key={index} src={fileUrl} className="media-pdf" title="PDF Viewer"></iframe>;
            } else if (["ppt", "pptx"].includes(fileExtension)) {
              return (
                <a key={index} href={fileUrl} target="_blank" rel="noopener noreferrer" className="media-link">
                  📂 View PowerPoint Presentation
                </a>
              );
            } else {
              return <p key={index}>Unsupported file type</p>;
            }
          })}
        </div>
      )}
      <div className="post-stats">
        <p><FaHeart /> {post.likes} Likes</p>
        <p><FaComment /> {post.comments} Comments</p>
      </div>
    </div>
    </div>
  );
};

export default SearchPage;
