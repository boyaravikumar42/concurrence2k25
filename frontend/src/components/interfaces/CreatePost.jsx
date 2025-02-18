import React, { useState } from "react";
import { Image, Video, FileText, Send, FileUp } from "lucide-react";
import { motion } from "framer-motion";
import "./CreatePost.css";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import axios from "axios";
import Loader from "../pages/Loader";
import { useNavigate } from "react-router-dom";

const CreatePost = () => {
  const [postContent, setPostContent] = useState("");
  const [attachments, setAttachments] = useState([]);
   const [loading, setLoading] = useState(false);
  const navigate=useNavigate();
  const handlePost = async () => {
    if (!postContent.trim() && attachments.length === 0) {
      alert("Post content and media is required!");
      return;
    }

    const formData = new FormData();
    formData.append("text", postContent); 

    attachments.forEach((file) => {
      formData.append("media", file);
    });
    setLoading(true);
    try {
      const { data } = await axios.post("http://localhost:5000/api/posts/", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`
          
        },
      });

      console.log("Post Created:", data);
      setLoading(false);
      alert("Post uploaded successfully!");
      
      setPostContent("");
      setAttachments([]);
      navigate('/home');
    } catch (error) {
      setLoading(false);
      console.error("Error creating post:", error.response?.data || error.message);
      alert("Failed to upload post. Please try again, MakeSure files less in size ");
    }
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    // Prevent duplicate files
    const newFiles = files.filter(
      (file) => !attachments.some((existingFile) => existingFile.name === file.name)
    );

    setAttachments([...attachments, ...newFiles]);
  };
  
  return (
   <div className="create-post-container magical-theme blue-theme"> 
   {loading ? <Loader /> : 
      <motion.div className="post-box" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h2 className="title">✨Create a Magical Post </h2>
        <textarea
          className="post-input"
          placeholder="Share your thoughts..."
          value={postContent}
          onChange={(e) => setPostContent(e.target.value)} required
        ></textarea>

        <div className="post-actions">
          <label className="icon-button" data-tooltip-id="images-tooltip" data-tooltip-content="Images">
            <Image />
            <input type="file" accept="image/*" onChange={handleFileUpload} hidden multiple />
          </label>
          <Tooltip id="images-tooltip" />

          <label className="icon-button" data-tooltip-id="video-tooltip" data-tooltip-content="Videos">
            <Video />
            <input type="file" accept="video/*" onChange={handleFileUpload} hidden multiple />
          </label>
          <Tooltip id="video-tooltip" />

          <label className="icon-button" data-tooltip-id="pdf-tooltip" data-tooltip-content="PDFs/Word">
            <FileText />
            <input type="file" accept=".pdf,.doc,.txt" onChange={handleFileUpload} hidden multiple />
          </label>
          <Tooltip id="pdf-tooltip" />

          <label className="icon-button" data-tooltip-id="ppt-tooltip" data-tooltip-content="PPTs">
            <FileUp />
            <input type="file" accept=".ppt,.pptx,.pptm,.pps,.ppsx" onChange={handleFileUpload} hidden multiple />
          </label>
          <Tooltip id="ppt-tooltip" />
        </div>

        {attachments.length > 0 && (
          <div className="attachment-preview">
            {attachments.map((file, index) => (
              <div key={index} className="attachment-item">{file.name}</div>
            ))}
          </div>
        )}
       {attachments.length==0 && (<span className="attachment-preview">select atleast 1 file</span>)}
        <motion.button
          className="post-btn magical-button blue-glow"
          onClick={handlePost}
          whileHover={{ scale: 1.1 }}
        >
          Post <Send />
        </motion.button>
      </motion.div>}
    </div>
  );
};

export default CreatePost;
