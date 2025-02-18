import React, { useEffect, useState } from "react";
import "./ProfilePage.css";
import { MapPin, ThumbsUp, Users, Layers, Image } from "lucide-react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { FaTrash } from "react-icons/fa";
import Loader from "./Loader";

const ProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("Follow"); // Default status

  const currentUserId = localStorage.getItem("user"); // Logged-in user ID

  // Fetch Profile Data
  const fetchProfile = async () => {
    try {
      console.log("id:",id);
      const { data } = await axios.get(
        `http://localhost:5000/api/users/${id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      setUser(data);
      checkFollowStatus(); // Check follow status after fetching profile
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Check if the user is already followed
  const checkFollowStatus = async () => {
    try {
      const { data } = await axios.get(
        `http://localhost:5000/api/follow/${id}/is-followed`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      console.log("data:",data);
      setStatus(data.pending ? "Req-Pending" : data.followed ? "Followed" : data.rejected ? "Rejected" : "Follow");
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [id]); // Re-fetch on user change

  // Send Follow Request
  const sendFollowRequest = async () => {
    try {
      const { data } = await axios.post(
        `http://localhost:5000/api/follow/send-follow`,
        { followerId: currentUserId, followingId: id },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert(data.message);
      setStatus(data.status === "Pending" ? "Req-Pending" : "Followed"); // Update status dynamically
    } catch (error) {
      console.log("errorreeeeee in follow")
      console.error("Error sending follow request:", error);
    }
  };


   const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      try {
        await axios.delete("http://localhost:5000/api/users/delete-account", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        // Clear user data & redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("activeChat");
        navigate("/");
      } catch (error) {
        console.error("Error deleting account:", error);
        alert("Failed to delete account. Please try again.");
      }
    }
  };


  if (!user) return <Loader />;

  return (
    <div className="profile-container">
      {/* Cover Photo */}
      <div className="cover-photo">
        <img src={user.coverPicture || "/default-cover.jpg"} alt="Cover" />
        <button className="edit-cover" onClick={() => navigate("/update-profile")}>
          <Image size={20} /> Edit Cover
        </button>
      </div>

      {/* Profile Header */}
      <div className="profile-header">
        <div className="avatar">
          {user.profilePicture ? (
            <img src={user.profilePicture} alt="User Avatar" />
          ) : (
            <div className="avatar-placeholder">
              {user.name ? user.name.substring(0, 2).toUpperCase() : "NA"}
            </div>
          )}
        </div>
        <h1 className="user-name">{user.name}</h1>
        <p className="user-bio">{user.bio || "No bio available"}</p>
        <div className="user-location">
          <MapPin size={16} /> <span>{user.location || "Location not set"}</span>
        </div>
      </div>

      {/* Follow Button */}
      {currentUserId !== user._id && (
        <button
          className={status === "Followed" ? "follow-btn followed" : "follow-btn"}
          onClick={sendFollowRequest}
        >
          {status}
        </button>
      )}

      {/* Profile Stats */}
      <div className="profile-stats">
        <div className="stat">
          <ThumbsUp size={30} />
          <span>{user.totalLikes || 0} Likes</span>
        </div>
        <div className="stat">
          <Users size={30} />
          <span>
            {user.followersCount || 0} Followers
          </span>
        </div>
        <div className="stat">
          <Layers size={30} />
          <span >
            {user.followingCount || 0} Following
          </span>
        </div>
      </div>

      {/* User Posts */}
      <div className="user-posts">
        <h3>Recent Posts</h3>
        {user.posts?.length ? (
          user.posts.map((post, index) => (
            <div className="post-card" key={index}>
              <div className="post-header">
                <img
                  src={post.profilePicture || "/default-avatar.png"}
                  alt="User"
                  className="profile-pic"
                />
                <div className="post-info">
                  <h3>{post.user?.name || "Unknown User"}</h3>
                  <p className="timestamp">{new Date(post.createdAt).toLocaleString()}</p>
                </div>
              </div>

              <div className="post-content">
                <p>{post.text}</p>
                {post.media.length > 0 && (
                  <div className="post-media">
              {post.media?.map((file, index) => {
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
              </div>
              {/* Post Stats: Likes, Comments, Shares */}
              <div className="post-stats">
                <span>👍 {post.likes.length || 0} Likes</span>
                <span>💬 {post.comments.length || 0} Comments</span>
                <span>🔄 {post.shares || 0} Shares</span>
              </div>
            </div>
          ))
        ) : (
          <p>No posts yet.</p>
        )}
      </div>
      {currentUserId == user._id && (
             <button className="delete-btn"  onClick={handleDeleteAccount} >
        <FaTrash size={18} /> Delete Account
      </button>
            )}
      
      
    </div>
  );
};

export default ProfilePage;
