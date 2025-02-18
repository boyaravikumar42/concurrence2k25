import axios from "axios";
import { Delete, DeleteIcon, Eye, View } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const PostCard = ({ postId,post,onUpdate  }) => {
  /* console.log("post:",post); */
  const [like, setLike] = useState(false);
  const navigate=useNavigate();
  const [comments, setComments] = useState([]);
  const [openComments, setOpenComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [likesList, setLikesList] = useState([]);
  const [openLikes, setOpenLikes] = useState(false);
  const [openSharePopup, setOpenSharePopup] = useState(false);
  const [shareCount, setShareCount] = useState(post.shares);
  const [saved, setSaved] = useState(false);
 
  
//likes
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

  const handleLikes = async (id) => {
      
    try {
      const { data } = await axios.post(`http://localhost:5000/api/likes/post/${id}`, [],{
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
       setLike(!like);
       /* console.log("Post Liked/Unlike:", data); */ 
       onUpdate(post._id, { likes: data.likes });
     /*  fetchPosts(); */
    } catch (error) {
      console.error("Error creating post:", error.response?.data || error.message);
      alert("Failed to like post. Please try again.");
    }
  };
  const toggleLike = () => {
    setLike(!like);
    handleLikes(post._id);
  };
  const fetchLikes = async () => {
     try {
      const response = await axios.get(`http://localhost:5000/api/likes/post/${postId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setLikesList(response.data);
      /* console.log("likes",response.data); */
    } catch (err) {
      console.error("Error fetching likes:", err);
    } 
  };
   const handleOpenLikes = async () => {
     await fetchLikes(); 
    setOpenLikes(true);
  };

//comments

  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/comments/post/${postId}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      setComments(response.data);
     /*  console.log(response.data); */
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
      /* alert("comment posted successfully"); */
      setNewComment("");
      onUpdate(post._id, { comments: response.data.comments });
      /* fetchPosts(); */
      fetchComments();
    } catch (err) {
      alert("error in comment posting");
      console.error("Error adding comment:", err.response?.data || err.message);
    } 
  };


  const handleShare = async () => {
    try {
       /* console.log("entered") */
      const response =await axios.post(`http://localhost:5000/api/posts/share/${postId}`, null, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
         
      setShareCount(shareCount + 1); // Update UI immediately
      onUpdate(post._id, { shares: response.data.shares });
      /* fetchPosts(); // Refresh posts */
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
    /* console.log("entered"); */
    const response = await axios.post(`http://localhost:5000/api/posts/save/${postId}`, null, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    
    setSaved(!saved);
     onUpdate(post._id, { savedBy: response.data.savedBy });
    /* fetchPosts();  */
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

useEffect(() => {
  checkSavedStatus();
  checkLikeStatus();
}, [postId]);


  return (
    <div key={post._id} className="post-card-items" >{/* {console.log("Posts are :",post)} */}
      <div className="post-header" >
       {post.user.profilePicture ? (
      <img
        src={post.user.profilePicture}
        alt="profile-pic"
        className="post-profile-pic" 
         onClick={(e) => {
              e.stopPropagation(); // Prevent triggering post click
              navigate(`/profile/${post.user._id}`);
            }}
      />
    ) : (
      <div className="profile-placeholder" 
       onClick={(e) => {
              e.stopPropagation(); // Prevent triggering post click
              navigate(`/profile/${post.user._id}`);
            }}>
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
        <div 
         onClick={(e) => {
              e.stopPropagation(); // Prevent triggering post click
              navigate(`/profile/${post.user._id}`);
            }} className="user-details">
          <span className="post-user">{post.user?.name || "Unknown User"}</span>
          <span className="post-college">{post.user?.year}Year</span>
          <span className="post-college">{post.user?.department}</span>
          <span className="post-college">{post.user?.category}</span>
        </div>
      </div>
     <div
        className="post-body"
        onClick={() => navigate(`/single-post/${post._id}`)}
      >
      <p className="post-content" >{post.text}</p>
      <p className="post-hashtags">{post.hashtags?.join("   ")} #rgmcet </p>

      {/* Media Display */}
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
      {/* Interaction Buttons */}
      <div className="post-interactions">
        
        <button className="interaction-button"><span onClick={toggleLike} >{  like ? '💚' : '❤️' }Likes {post.likes?.length}</span><Eye className="like-eye-icon" onClick={handleOpenLikes}/></button>
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

export default PostCard;
