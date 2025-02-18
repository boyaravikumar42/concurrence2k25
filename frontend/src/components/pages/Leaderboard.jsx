import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Leaderboard.css"; // Add styling

const Leaderboard = () => {
  const [rankedUsers, setRankedUsers] = useState([]);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/rankings/");
        setRankedUsers(data);
      } catch (error) {
        console.error("Error fetching rankings:", error);
      }
    };

    fetchRankings();
  }, []);

  return (
    <div className="leaderboard-container">{/* {console.log("ranked",rankedUsers)} */}
      <h2 className="leaderboard-title">🏆 Top Ranked Users</h2>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Profile</th>
            <th>Name</th>
            <th>Engagement Score</th>
          </tr>
        </thead>
        <tbody>
          {rankedUsers.map((user, index) => (
            <tr key={user.userId} className={`top-rank${index}`}>
              <td>#{index + 1}</td>
              <td>
                <img
                  src={user.profilePicture}
                  alt="Profile"
                  className="profile-pic"
                />
              </td>
              <td>{user.name}</td>
              <td>{user.engagementScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Leaderboard;
