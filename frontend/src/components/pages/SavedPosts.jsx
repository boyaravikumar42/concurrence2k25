import React, { useEffect, useState } from "react";
import axios from "axios";
import "./SavedPosts.css";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";

const SavedPosts = () => {
  const [savedPosts, setSavedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");
  const navigate=useNavigate();
  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/api/posts/user/saved-posts", {
          headers: { Authorization: `Bearer ${token}` },
        });
        /* console.log("response:::",response.data); */ 
        setSavedPosts(response.data);
      } catch (error) {
        console.error("Error fetching saved posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  return (
    <div className="saved-posts-container">
      <h2>Saved Posts</h2>
      {loading ? (
        <Loader/>
      ) : savedPosts.length === 0 ? (
        <p>No saved posts yet.</p>
      ) : (
        savedPosts.map((post) => (
          <div key={post._id} className="saved-post" onClick={() => navigate(`/single-post/${post._id}`)}>
            <img src={ post.user.profilePicture} alt="Post" className="post-image" />
            <div className="post-content">
              <h3>{post.user.name}</h3>
              <p>{post.text}</p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default SavedPosts;
