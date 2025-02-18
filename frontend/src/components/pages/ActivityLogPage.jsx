import React, { useEffect, useState } from "react";
import axios from "axios";
import { Heart, UserPlus, FileText, Bookmark, Share, MessageSquare, UserCheck, UserX, Search, FileTextIcon } from "lucide-react";
import "./ActivityLogPage.css";
import Loader from "./Loader";

const ActivityLogPage = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const fetchActivityLogs = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/logs/activity", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        setActivities(res.data.activityLogs || []);
        setUserName(res.data.name || "User");
        setLoading(false);
      } catch (err) {
        setLoading(false);
        console.error("Error fetching activity logs", err);
      }
    };

    fetchActivityLogs();
  }, []);

  const getIcon = (action) => {
    console.log("called");
    switch (action) {
      case "created_post":
        return <FileText size={20} className="icon created" />;
      case "liked_post":
        return <Heart size={20} className="icon liked" />;
      case "saved_post":
        return <Bookmark size={20} className="icon saved" />;
      case "shared_post":
        return <Share size={20} className="icon shared" />;
      case "commented_posted":
        return <MessageSquare size={20} className="icon commented" />;
      case "requested_to_follow":
        return <UserPlus size={20} className="icon follow-request" />;
      case "accepted_follow":
        return <UserCheck size={20} className="icon follow-accepted" />;
      case "rejected_follow":
        return <UserX size={20} className="icon follow-rejected" />;
      case "searched_something":
        return <Search size={20} className="icon searched" />;
      default:
        return <FileTextIcon size={20} className="icon default" />;
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="activity-container">
          <h1 className="activity-title">Recent Activity</h1>
          <ul className="activity-list">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <li key={activity._id} className="activity-item">
                  {getIcon(activity.action)}
                  <div className="activity-details">
                    <p>
                      <strong>{userName}</strong>{" "}
                      {activity.action.replace(/_/g, " ")}{" "}
                      {activity.targetPost ? "on a post" : activity.targetUser ? `with ${activity.targetUser.name}` : ""}
                    </p>
                    <span className="timestamp">{new Date(activity.timestamp).toLocaleString()}</span>
                  </div>
                </li>
              ))
            ) : (
              <p className="no-activity">No recent activity.</p>
            )}
          </ul>
        </div>
      )}
    </>
  );
};

export default ActivityLogPage;
