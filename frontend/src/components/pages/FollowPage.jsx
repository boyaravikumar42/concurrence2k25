import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import "./FollowPage.css"; // Import CSS
import { Check, X } from "lucide-react"; // Icons

const FollowPage = () => {
  const { id } = useParams();
  const [tab, setTab] = useState("followers");
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading,setLoading]=useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    fetchFollowData();
  }, [id]);

  const fetchFollowData = async () => {
    try {
      setLoading(true);
      const [followersRes, followingRes, requestsRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/follow/${id}/followers`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`http://localhost:5000/api/follow/${id}/following`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }), 
        axios.get(`http://localhost:5000/api/follow/${id}/follow-requests`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
      ]);
      setFollowers(followersRes.data);
      setFollowing(followingRes.data);
      setRequests(requestsRes.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Error fetching follow data:", error);
    }
  };

  const handleAccept = async (requestId) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/follow/accept-follow/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setLoading(false);
      fetchFollowData();
    } catch (error) {
      setLoading(false);
      console.error("Error accepting request:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      setLoading(true);
      await axios.put(
        `http://localhost:5000/api/follow/reject-follow/${requestId}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
     setLoading(false);
      fetchFollowData();
    } catch (error) {
      setLoading(false);
      console.error("Error rejecting request:", error);
    }
  };

  return (
    <div className="follow-container">
      <h2 className="follow-title">Follow Management</h2>

      {/* Tabs */}
      <div className="tabs">{/* {console.log("f f p :",followers,following,requests)} */}
        <button className={tab === "followers" ? "active" : ""} onClick={() => setTab("followers")}>
          Followers ({followers.length})
        </button>
        <button className={tab === "following" ? "active" : ""} onClick={() => setTab("following")}>
          Following ({following.length})
        </button>
        <button className={tab === "requests" ? "active" : ""} onClick={() => setTab("requests")}>
          Requests ({requests.length})
        </button>
      </div>

      {/* Followers Tab */}
      {tab === "followers" && (
        <div className="follow-grid">
          {followers.map((user) => (
            <div key={user._id} className="follow-card" onClick={()=>navigate(`/profile/${user._id}`)}>
              <img className="follow-avatar" src={user.profilePicture } alt={user.name} />
              <span className="follow-name">{user.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Following Tab */}
      {tab === "following" && (
        <div className="follow-grid">
          {following.map((user) => (
            <div key={user._id} className="follow-card" onClick={()=>navigate(`/profile/${user._id}`)}>
              <img className="follow-avatar" src={user.profilePicture } alt={user.name} />
              <span className="follow-name">{user.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Follow Requests Tab */}
      {tab === "requests" && (
        <div className="follow-grid">
          {requests.map((req) => (
            <div key={req._id} className="follow-card">
              <div className="follow-info" onClick={()=>navigate(`/profile/${user._id}`)}>
                <img className="follow-avatar" src={req.follower.profilePicture } alt={req.follower.name} />
                <span className="follow-name">{req.follower.name}</span>
              </div>
              <div className="follow-actions">
                <button onClick={() => handleAccept(req._id)} className="accept-btn">
                  <Check size={16} />
                </button>
                <button onClick={() => handleReject(req._id)} className="reject-btn">
                  <X size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowPage;
