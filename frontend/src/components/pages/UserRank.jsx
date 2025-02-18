import React, { useEffect, useState } from "react";
import axios from "axios";
import Loader from "./Loader";
import { FireExtinguisher } from "lucide-react";

const UserRank = ({ userId }) => {
  const [rank, setRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRank = async () => {
      try {
        const { data } = await axios.get("http://localhost:5000/api/rankings/");
        console.log(data);
        // Find the rank of the specific user
        const userRank = data.findIndex(user => user.userId === userId) + 1;
        
        setRank(userRank );
      } catch (error) {
        console.error("Error fetching user rank:", error);
        setRank("Error");
      } finally {
        setLoading(false);
      }
    };

    fetchUserRank();
  }, [userId]);

  return (<>
  {loading ? <Loader/>:  `${rank}🔥`}
  </>
      
   
  );
};

export default UserRank;
