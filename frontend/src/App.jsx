import React, { useEffect, useState } from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';

import PostsPage from './components/pages/PostsPage';
import MessagingPage from './components/pages/MessagingPage';

import NotificationPage from './components/pages/NotificationPage';

import SettingsPage from './components/pages/SettingsPage';
import ChatBot from './components/interfaces/ChatBot';
import NotFound from './components/pages/NotFoundPage';
import Auth from './components/pages/Auth';
import Home from './components/pages/Homepage';
import SearchPage from './components/pages/SearchPage';
import CreatePost from './components/interfaces/CreatePost';
import ProfilePage from './components/pages/ProfilePage';
import StatisticsPage from './components/pages/StatisticsPage';
import SavedPosts from './components/pages/SavedPosts';
import ActivityLogPage from './components/pages/ActivityLogPage';
import HelpPage from './components/pages/HelpPage';
import UpdateProfile from './components/pages/updateProfile';
import Leaderboard from './components/pages/Leaderboard';
import FollowPage from './components/pages/FollowPage';
import SinglePostPage from './components/pages/SinglePostPage';
import LearnMore from './components/pages/LearnMore';


const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    const checkIsLoggedIn = () => {
      const token = localStorage.getItem('token');
      return !!token; // Use !! to ensure a boolean value
    };

    setIsLoggedIn(checkIsLoggedIn()); 
  }, []); 

  return (
    <div id="main">
       <Navbar />  
      <Routes>
       {/* ----------- Before login Routes ----------  */}
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/learn-more" element={<LearnMore />}/> 
        

      {/* ----------- After login Routes ----------  */}
      {/* -----------Main-Key Routes ----------  */}
        <Route path="/home" element={<PostsPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/messages" element={<MessagingPage />} />
        <Route path="/create-post" element={<CreatePost/>} />
        
       
      {/* ----------- Key Routes ----------  */}
        <Route path="/notifications" element={<NotificationPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/settings" element={<SettingsPage />} />
         <Route path="/single-post/:postId" element={<SinglePostPage />} />
         <Route path="/update-profile" element={<UpdateProfile/>}/>
        <Route path="/chatBot" element={<ChatBot />} />
      {/* ----------- Normal Routes ----------  */}
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/follows/:id" element={<FollowPage />} />
        <Route path="/stats" element={<StatisticsPage />} />
        <Route path="/saved-posts" element={<SavedPosts />} />
        
        <Route path="/activity" element={<ActivityLogPage />} />
        <Route path="/help" element={<HelpPage />} />
       
      {/* ----------- Additional Routes ----------  */}
        <Route path="*" element={<NotFound />} />
      </Routes>      
    </div>
  );
};

export default App;