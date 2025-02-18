import React, { useEffect, useRef, useState } from "react";
import "./PostsPage.css";
import axios from 'axios'
import { useNavigate } from "react-router-dom";
import PostCard from "./PostCard";
import Loader from './Loader'
import UserRank from "./UserRank";
import { useNotification } from "./NotificationContext";
const PostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const {profilePhoto,setProfilePhoto}=useNotification();

  const isFirstRender = useRef(true);
  const [user,setUser]=useState([]);
  const navigate = useNavigate();
   const [rankedUsers, setRankedUsers] = useState([]);
   const [trendingTopics, setTrendingTopics] = useState([]);
const [previousPostIds, setPreviousPostIds] = useState([]); // Track previous posts
  
const fetchPosts = async () => {
  try {
    const { data } = await axios.get(`http://localhost:5000/api/posts?page=${page}&previousPosts=${previousPostIds.join(",")}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    setPosts((prevPosts) => [...prevPosts, ...data.posts]); // Append new posts
    setPreviousPostIds(data.previousPostIds); // Update previous posts list
    setPage((prevPage) => prevPage + 1); // Move to next page
  } catch (error) {
    console.error("Error fetching posts:", error.response?.data || error.message);
  }
};


    // Function to handle like, comment, save, or share without refetching all posts
  const handlePostUpdate = (postId, updatedData) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => (post._id === postId ? { ...post, ...updatedData } : post))
    );
  };

useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    fetchPosts();
  }
}, []);

  useEffect(() => {
  const fetchLoggedUser = async () => {
    try {
      const userId = localStorage.getItem("user"); // Ensure user ID is stored in localStorage
      console.log("userId",userId);
      
      if (!userId) {
        console.error("No user ID found in localStorage");
        return;
      }
       setLoading(true);
      const { data } = await axios.get(`http://localhost:5000/api/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      
      console.log("Logged User Data:", data);
      setUser(data);
      setProfilePhoto(data.profilePicture);
    } catch (error) {
      console.error("Error fetching logged user:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  fetchLoggedUser();
}, []);


useEffect(() => {
    const fetchRankings = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/rankings/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
        setRankedUsers(data);
      } catch (error) {
        console.error("Error fetching rankings:", error);
      }
    };

    fetchRankings();
  }, []);
useEffect(() => {
   const fetchTrendingTopics = async () => {
  try {
    const response = await axios.get("http://localhost:5000/api/users/trending/topic", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    setTrendingTopics(response.data.trendingTopics); // Extract the data correctly
  } catch (error) {
    console.error("Error fetching trending topics:", error);
  }
};


    fetchTrendingTopics();
  }, []);

//console.log(user);

  return (
    <div className="page-container-posts enhanced-ui ">
      
      {/* Left Sidebar */}
     <div className="left-sidebar">
        <div className="profile-card special-glow" onClick={()=>navigate(`/profile/${user._id}`)}>
           <img src={user.profilePicture} width={100} height={100}  className="large"/>
          <p className="profile-name">{user.name}</p>
          <p className="profile-college"> {user.department || 'DEPARTMENT_NIL'}🌐{user.year || 'YEAR_NIL'}  Year</p>
          <p className="profile-xp">Rank: <UserRank userId={user._id}/></p>
          <p className="profile-badges">🏅Badges: 🎗️{user?.badges?.[0]}🎗️</p>
        </div>
        
      </div>

      {/* Main Posts Section */}
      <div className="posts-container-main">
        {/* Post Creation Section */}
        <div className="post-card-items highlight-main">
          <div className="post-input-section">
            <div className="avatar"></div>
            <input type="text" placeholder="Start a post, try helping-other / skill-enhancing now itself" className="post-input" onClick={()=>{navigate('/create-post')}}/>
          </div>
          <div className="post-actions">
            <button className="action-button" onClick={()=>{navigate('/create-post')}}>📷 Media</button>
            <button className="action-button" onClick={()=>{navigate('/create-post')}}>📅 Event</button>
            <button className="action-button" onClick={()=>{navigate('/create-post')}}>✍ Write Article</button>
            <button className="action-button" onClick={()=>{navigate('/create-post')}}>🔒 Post Anonymously</button>
            <button className="action-button" onClick={()=>{navigate('/create-post')}}>🎯 Daily Challenge</button>
            {/* <button className="action-button" onClick={()=>{navigate('/create-post')}}>📊 Create Poll</button> */}
          </div>
        </div>

                {/* Posts Feed */}
                {posts.map((post) => (
                          <PostCard postId={post._id} post={post}  onUpdate={handlePostUpdate}/>
                ))}
        <button onClick={fetchPosts} disabled={loading} id="see-more-button">
             {loading ? <Loader/> : "See More"}
        </button>
  
      </div>

      {/* Right Sidebar */}
         <div className="right-sidebar">
        <div className="leaderboard-card special-glow">
          <h3>🏆 Leaderboard</h3>
          {rankedUsers?.slice(0, 3).map((user, index) => (
            <p key={index} onClick={()=>{navigate('/leaderboard')}}>
              {index + 1}. {user.name} - {user.engagementScore} Score🏅{" "}
            </p>
          ))}
        </div>
        <div className="trending-container special-glow">
                <h3>Trending Today</h3>
            {trendingTopics.length > 0 ? (
              trendingTopics.map((item, index) => (
                <p key={index} className="trending-topic">
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    🔥 {item.topic}
                  </a>
                </p>
              ))
            ) : (
              <p className="trending-topic">Loading trending topics...</p>
            )}
          </div>
        
        <div className="puzzles-card special-effect " >
          <h3>🎯 Today's Challenges</h3>
          <p onClick={()=>{navigate('/create-post')}}>📚 Post a study tip</p>
          <p onClick={()=>{navigate('/create-post')}}>✍️ Share an inspiring college story</p>
        </div>
      </div>
      
    </div>
  );
};

export default PostsPage;
