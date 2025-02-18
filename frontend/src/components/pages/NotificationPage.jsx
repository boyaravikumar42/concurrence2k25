import axios from "axios";
import { useEffect, useState } from "react";
import { Bell, CheckCircle, Heart, MessageSquare, Trash2, UserPlus, Users } from 'lucide-react';
import moment from 'moment'; // Assuming moment is used to display time
import './NotificationPage.css';
import { useNotification } from "./NotificationContext";
import { useNavigate } from "react-router-dom";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
 const { unreadCount, setUnreadCount } = useNotification();
 const navigate=useNavigate();
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/notifications", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications(res.data);
      const unread = res.data.filter(n => !n.read).length; // Count unread notifications
      setUnreadCount(unread);
      console.log("Fetched notifications:", res.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      alert("Failed to load notifications!");
    }
  };

  const markAsRead = async (id) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/notifications/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(unreadCount - 1); // Decrease unread count
      alert("Notification marked as read!");
    } catch (error) {
      console.error("Error marking as read:", error);
      alert("Failed to mark notification as read.");
    }
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setNotifications(notifications.filter(n => n._id !== id));
      setUnreadCount(unreadCount - 1); // Adjust unread count when deleted
      alert("Notification deleted!");
    } catch (error) {
      console.error("Error deleting notification:", error);
      alert("Failed to delete notification.");
    }
  };

  const renderIcon = (type) => {
    switch (type) {
      case "like": return <Heart size={20} color="red" />;
      case "comment": return <MessageSquare size={20} color="blue" />;
      case "followed": return <UserPlus size={20} color="green" />;
      case "message": return <Users size={20} color="purple" />;
      default: return <Bell size={20} />;
    }
  };

  return (
    <div className="notification-container-page">
      <h2 className="notification-title"><Bell size={32} /> Notifications</h2>
      <div className="notification-list">
        {notifications.length === 0 ? (
          <p className="no-notifications">No new notifications 🎉</p>
        ) : (
          notifications.map((notif) => (
            <div key={notif._id} className={`notification-card ${notif.read ? "read" : "unread"}`}>
              <div className="notif-icon">{renderIcon(notif.type)}</div>
              <div className="notif-content" onClick={() => navigate(`/single-post/${notif.post._id}`)}>
                <p>
                  <strong>{notif.sender.name} </strong>
                  {notif.type === "like" && "liked your post"}
                  {notif.type === "comment" && "commented on your post"}
                  {notif.type === "followed" && "requested you to accept follow"}
                  {notif.type === "message" && "sent you a message"}
                  {notif.type === "unlike" && "unliked your post"}
                  {notif.type === "rejected" && "rejected your follow request"}
                </p>
                <span className="notif-time">{moment(notif.createdAt).fromNow()}</span>
              </div>
              <div className="notif-actions">
                {!notif.read && (
                  <button className="mark-read" onClick={() => markAsRead(notif._id)}>
                    <CheckCircle size={20} /> 
                  </button>
                )}
                <button className="delete" onClick={() => deleteNotification(notif._id)}>
                  <Trash2 size={20} /> 
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPage;
