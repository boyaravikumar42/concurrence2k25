import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, Sparkles, Home, Users, MessageCircle, LogOut, Settings, Edit3, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import './Navbar.css';
import axios from 'axios';
import { useNotification } from './pages/NotificationContext';


const Navbar = () => {
  const { unreadCount,setUnreadCount,profilePhoto } = useNotification();
  const [showMenu, setShowMenu] = useState(false);
   const [user,setUser]=useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate(); 
  // Function to check authentication status
  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token); // Update state
  };

   useEffect(() => {
    checkAuthStatus(); // Initial check
    window.addEventListener('storage', checkAuthStatus); // Listen for storage changes
    return () => window.removeEventListener('storage', checkAuthStatus);
  }, []);
 useEffect(() => {
   const fetchUnreadCount = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const unread = res.data.filter(n => !n.read).length; // Count unread notifications
      setUnreadCount(unread);
     /*  console.log("Fetched notifications:", res.data); */
    } catch (error) {
      console.error("Error fetching notifications:", error);
     /*  alert("Failed to load notifications!"); */
    }
  };

  fetchUnreadCount();
}, []);


  const logoutHandler = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('activeChat');
    window.dispatchEvent(new Event('storage')); // 
    setIsAuthenticated(false);
    navigate('/');
  };


 useEffect(() => {
  const fetchLoggedUser = async () => {
    try {
      const userIdlog=localStorage.getItem("user");
      setUserId(userIdlog);
      console.log("userId2:",userIdlog);
      if (!userIdlog) {
        console.error("No user ID found in localStorage");
        return;
      }
       
      const { data } = await axios.get(`http://localhost:5000/api/users/${userIdlog}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      console.log("Logged User Data:", data);

      setUser(data);
    } catch (error) {
      console.error("Error fetching logged user:", error.response?.data || error.message);
    } 
  };
  fetchLoggedUser();
  
}, []);

 



  return (
    <>{console.log("isAuthenticated",isAuthenticated)}
      {isAuthenticated ? (
        <nav className="navbar-main magical-navbar">
          <div className="navbar-left">
            <Link to="/" className="nav-logo">
              <Sparkles className="logo-icon" />
              <span className="brand-name">CampusConnect</span>
            </Link>
          </div>

          <div className="navbar-center">
            <Link to="/home" className="nav-link"><Home /> Home</Link>
            <Link to="/leaderboard" className="nav-link"><Users /> Leaderboard</Link>
            <Link to="/messages" className="nav-link"><MessageCircle /> Messages</Link>
            <Link to="/create-post" className="nav-link"><Edit3 /> Create Post</Link>
          </div>

          <div className="navbar-right">
            <div className="notification-container">
             <Link to="/notifications"> <Bell className="notification-icon"  />
             {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}</Link>
            </div>

            <div className="profile-container-nav"  onMouseEnter={() => setShowMenu(true)}
              onMouseLeave={() => setShowMenu(false)}>
              <img src={profilePhoto} alt="Profile" className="profile-pic-img-id" />
              <span className="profile-name-id">{user.name}</span>
              <ChevronDown className="dropdown-icon" />
              {showMenu && (
                <motion.div className="dropdown-menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <ul>{console.log("userId5:",userId)}
                    <li><Link to={`/profile/${userId}`}>Profile</Link></li>
                    <li><Link to="/stats">Statistics</Link></li>
                    <li><Link to="/saved-posts">Saved Posts</Link></li>
                      <li><Link to={"/follows/" + userId}>FollowHandle</Link></li>
                    {/* <li><Link to="/friends">Friends</Link></li> */}
                    <li><Link to="/chatBot">College ChatBot</Link></li>
                    <li><Link to="/activity">Activity Log</Link></li>
                    <li><Link to="/help">Help</Link></li>
                    <li className="logout" onClick={logoutHandler}><LogOut /> Logout</li>
                  </ul>
                </motion.div>
              )}
            </div>
            <Link to="/settings" className="nav-link"><Settings /></Link>
          </div>

          <motion.div
            className="sticky-search-icon"
            onClick={() => navigate("/search")}
            initial={{ opacity: 0, scale: 0.3 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ duration: 0.3 }} 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9 }} 
          >
            <Search />
          </motion.div>
        </nav>
      ) : (
        <nav className="navbar">
          <h1 className="logo">CampusConnect</h1>
          <div className="nav-links">
            <Link to="/auth/?type=login" className="nav-button" onClick={() => {
              setTimeout(checkAuthStatus, 1000); // Delayed state update for login
            }}>
              Login
            </Link>
            <Link to="/auth/?type=register" className="nav-button register">Register</Link>
          </div>
        </nav>
      )}
    </>
  );
};

export default Navbar;
