import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

export const UserDataContext = createContext();

function UserContext({ children }) {
  const serverUrl = "http://localhost:8000";
  const [userData, setUserData] = useState(null);
  const [frontImage, setFrontImage] = useState(null);
  const [backendImage, setBackImage] = useState(null);
  const [selectImage, setSelectImage] = useState(null);
  

const handleCurrentUser = async () => {
  try {
    const res = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
    console.log("Current user:", res.data);
    setUserData(res.data); // 🔥 yeh zaroori hai
  } catch (err) {
    console.error("❌ Error fetching user:", err.response?.data || err.message);
  }
};


  const getGeminiResponse = async (command) => {
    try {
      const result = await axios.post(`${serverUrl}/api/user/askAssistant`, { command }, {
        withCredentials: true,
      });
      return result.data;
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    handleCurrentUser(); 
  }, []);

  const value = {
    serverUrl,
    userData,
    setUserData,
    backendImage,
    setBackImage,
    frontImage,
    setFrontImage,
    selectImage,
    setSelectImage,
    getGeminiResponse
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}

export default UserContext;
