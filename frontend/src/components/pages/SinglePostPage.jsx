// Frontend: SinglePostPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Delete, DeleteIcon, Eye, View } from "lucide-react";
import "./SinglePostPage.css";

const SinglePostPage = () => {
  const { postId} = useParams();
  console.log("postId",postId);
  const [like, setLike] = useState(false);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [comments, setComments] = useState([]);
  const [openComments, setOpenComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [likesList, setLikesList] = useState([]);
  const [openLikes, setOpenLikes] = useState(false);
  const [openSharePopup, setOpenSharePopup] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const [saved, setSaved] = useState(false);
  const navigate=useNavigate();

const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/${postId}`,{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setShareCount(response.data.shares);
        setPost(response.data);
        console.log("response data post :",response.data)
        
      } catch (err) {
        setError("Failed to fetch post");
      } finally {
        setLoading(false);
      }
    };
  useEffect(() => {
    fetchPost();
  }, [postId]);

  

  const handleLikes = async (id) => {
      
    try {
      const { data } = await axios.post(`http://localhost:5000/api/likes/post/${id}`, [],{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
       setLike(!like);
      console.log("Post Liked/Unlike:", data);
     fetchPost();
    } catch (error) {
      console.error("Error creating post:", error.response?.data || error.message);
      alert("Failed to like post. Please try again.");
    }
  };
  const toggleLike = () => {
    setLike(!like);
    handleLikes(post._id);
  };
  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/comments/post/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      setComments(response.data);
      console.log(response.data);
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
  };
 const handleOpenComments = async () => {
    await fetchComments();
    setOpenComments(true);
  };
const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await axios.post(`http://localhost:5000/api/comments/post/${postId}`,{ text: newComment },
        { headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setNewComment("");
      fetchPost();
      fetchComments();
    } catch (err) {
      console.error("Error adding comment:", err.response?.data || err.message);
    } 
  };
   
const fetchLikes = async () => {
     try {
      const response = await axios.get(`http://localhost:5000/api/likes/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setLikesList(response.data);
      console.log("likes",response.data);
    } catch (err) {
      console.error("Error fetching likes:", err);
    } 
  };

  const handleOpenLikes = async () => {
     await fetchLikes(); 
    setOpenLikes(true);
  };

  const handleShare = async () => {
    try {
       /* console.log("entered") */
      await axios.post(`http://localhost:5000/api/posts/share/${postId}`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
         
      setShareCount(shareCount + 1); // Update UI immediately
      fetchPost();// Refresh post
      setOpenSharePopup(true);// Open share popup
    } catch (error) {
      console.error("Error sharing post:", error);
    }
  };

const shareOnWhatsApp = () => {
  const message = `Check out this post: ${window.location.href}`;
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, "_blank");
};

const handleSave = async () => {
  try {
       console.log("entered");
    const response = await axios.post(`http://localhost:5000/api/posts/save/${postId}`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    
    setSaved(!saved);
    fetchPost(); 
  } catch (error) {
    console.error("Error saving post:", error);
  }
};
// Fetch saved status when component mounts
const checkSavedStatus = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/posts/check-save/${postId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setSaved(response.data.isSaved);
      } catch (error) {
        console.error("Error fetching saved status:", error);
      }
    };
const checkLikeStatus = async () => {
  try {
    const response = await axios.get(`http://localhost:5000/api/likes/check-like/${postId}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    setLike(response.data.isLiked);
  } catch (error) {
    console.error("Error fetching like status:", error);
  }
};
  useEffect(() => {
    checkSavedStatus();
    checkLikeStatus();
  }, [postId]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
   <div key={post._id} className="post-card-item animated" /* onClick={()=>{navigate(`/single-post/${post._id}`)}} */>
  <div className="post-card-header" onClick={()=>navigate(`/profile/${post.user._id}`)}>
       {post.user.profilePicture ? (
      <img
        src={post.user.profilePicture}
        alt="profile-pic"
        className="post-profile-pic"
      />
    ) : (
      <div className="profile-placeholder">
        {post.user?.name
          ? post.user.name
              .split(" ")
              .map((word) => word[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()
          : "NA"}
      </div>
    )}
    <div className="profile-info">
      <span className="post-card-user">{post.user?.name || "Unknown User"}</span>
      
    </div>
  </div>

      <p className="post-card-content">{post.text}</p>
      <p className="post-card-hashtags">{post.hashtags?.join("   ")} #rgmcet </p>

      {/* Media Display */}
      {post.media.length > 0 && (
        <div className="post-card-media">
          {post.media.map((file, index) => {
            const fileUrl = file;
            const fileExtension = file.split(".").pop().toLowerCase();

            if (["jpg", "jpeg", "png", "gif","webp"].includes(fileExtension)) {
              return <img key={index} src={fileUrl} alt="Post Media" className="media-image" />;
            } else if (["mp4", "mov"].includes(fileExtension)) {
              return (
                <video key={index} controls className="media-video">
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

      {/* Interaction Buttons */}
      <div className="post-card-interactions">
        
        <button className="interaction-button"><span onClick={toggleLike} >{  like ? '💚' : '❤️' } Likes {post.likes.length}</span><Eye className="like-eye-icon" onClick={handleOpenLikes}/></button>
        <button className="interaction-button" onClick={handleOpenComments}>💬 Comment {post.comments.length}</button>
        {/* <button className="interaction-button">🔁 Repost</button> */}
       < button className="interaction-button" onClick={handleShare}>📤 Share {shareCount}</button>
         <button className="interaction-button" onClick={handleSave}>🎖 {saved?"Saved ": "Save"}</button>
        {post.isFlagged && <p style={{ color: "red" }}>This post is flagged.</p>}
        {/* Comments Popup */}
      {openComments && (
        <div className="comments-popup">
          <div className="comments-header">
            <h3>Comments</h3>
            <button onClick={() => setOpenComments(false)} className="close-button">&times;</button>
          </div>
          <div className="comments-list">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id} className="comment-item">
                <img src={comment.user.profilePicture} alt="Profile" className="profile-pic" />
                <div className="comment-content">
                  <strong>{comment.user.name}</strong>
                  <p>{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
          </div>
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="comment-input"
            />
            <button type="submit" className="submit-comment">Post</button>
          </form>
        </div>
      )}
      {/* Likes Popup */}
        {openLikes && (
          <div className="likes-popup">
            <div className="likes-header">
              <h3>Likes</h3>
              <button onClick={() => setOpenLikes(false)} className="close-button">&times;</button>
            </div>
            <div className="likes-list">
              {likesList.length > 0 ? (
                likesList.map((like) => (
                  <div key={like._id} className="like-item">
                    <img src={like.user.profilePicture} alt="Profile" className="profile-pic" />
                    <p>{like.user.name}</p>
                  </div>
                ))
              ) : (
                <p>No likes yet.</p>
              )}
            </div>
          </div>
        )}

          {/* Share Popup */}
      {openSharePopup && (
        <div className="share-popup">
          <div className="share-header">
            <h3>Share Post</h3>
            <button onClick={() => setOpenSharePopup(false)} className="close-button">&times;</button>
          </div>
          <div className="share-options">
            <button
              onClick={() => navigator.clipboard.writeText(window.location.href)}
              className="share-button"
            >
              📋 Copy Link
            </button>
            <button
              onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`, "_blank")}
              className="share-button"
            >
              🔵 Share to Facebook
            </button>
            <button
              onClick={() => window.open(`https://twitter.com/intent/tweet?url=${window.location.href}&text=Check%20this%20out!`, "_blank")}
              className="share-button"
            >
              🐦 Share to Twitter
            </button>
             <button onClick={shareOnWhatsApp} className="share-button whatsapp">
        💚 WhatsApp
      </button>
          </div>
        </div>
      )}
      
      </div>
    </div>
  );
};

export default SinglePostPage;