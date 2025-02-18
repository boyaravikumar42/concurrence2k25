import React, { useEffect, useState } from "react";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Sparkles, TrendingUp, Flame, Users, ThumbsUp, Zap } from "lucide-react";
import axios from "axios";
import "./StatisticsPage.css";
import Loader from "./Loader";
import UserRank from "./UserRank";

const StatisticsPage = () => {
  const [lastMonthStats, setLastMonthStats] = useState(null);
  const [lastWeekStats, setLastWeekStats] = useState(null);
  const [liveCounter, setLiveCounter] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId=localStorage.getItem("user");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/users/stats",
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        console.log("response:",response.data)
        setLastMonthStats(response.data.lastMonthStats);
        setLastWeekStats(response.data.lastWeekStats);
        setLoading(false);
      } catch (err) {
        setError("Failed to load statistics");
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (lastWeekStats) {
      let count = 0;
      const interval = setInterval(() => {
        if (count >= lastWeekStats.likes) {
          clearInterval(interval);
        } else {
          count += 1;
          setLiveCounter(count);
        }
      }, 50);
    }
  }, [lastWeekStats]);

  if (loading) return <Loader/>;
  if (error) return <div className="error">{error}</div>;

  const pieData = [
    { name: "Engagement", value: lastWeekStats.likes },
    { name: "Growth", value: lastWeekStats.followers },
  ];
  const colors = ["#00d4ff", "#006eff"];

  return (
    <div className="statistics-container">
      <h1 className="stats-title">
        <Sparkles size={30} /> Statistics & Insights
      </h1>

      {/* Live Stats Counter */}
      <div className="live-stats">
        <h2><Zap size={25} /> Live Likes Count: {liveCounter}</h2>
      </div>

      {/* Overview Cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <ThumbsUp size={40} /> 
          <h3>{lastWeekStats.likes} Likes</h3>
          <p>Last Week</p>
        </div>

        <div className="stats-card">
          <Users size={40} /> 
          <h3>{lastWeekStats.followers} New Followers</h3>
          <p>Last Week</p>
        </div>

        <div className="stats-card">
          <TrendingUp size={40} /> 
          <h3>Ranking <UserRank userId={userId}/></h3>
          <p>Your Ranking level</p>
        </div>

        <div className="stats-card">
          <Flame size={40} /> 
          <h3>{lastWeekStats.posts} New Posts</h3>
          <p>Last Week</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="chart-section">
        <div className="chart-box">
          <h2>Likes Growth</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={[{ name: "Last Month", likes: lastMonthStats.likes }, { name: "Last Week", likes: lastWeekStats.likes }]}>
              <XAxis dataKey="name" stroke="#fff" />
              <YAxis stroke="#fff" />
              <Tooltip />
              <Line type="monotone" dataKey="likes" stroke="#00d4ff" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-box">
          <h2>Engagement Stats</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={100}>
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage;
