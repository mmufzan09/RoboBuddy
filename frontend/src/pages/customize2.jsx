import React, { useState, useContext } from "react";
import axios from "axios";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { IoArrowBackSharp } from "react-icons/io5";

function Customize2() {
  const { userData, setUserData, selectImage } = useContext(UserDataContext);
  const [assistantName, setAssistantName] = useState(userData?.assistantName || "");
  const navigate = useNavigate();

  const serverUrl = import.meta.env.VITE_SERVER_URL || "http://localhost:8000";

  const handleUpdateAssistant = async () => {
    try {
      const formData = new FormData();
      formData.append("assistantName", assistantName);

      if (selectImage instanceof File) {
        formData.append("assistantImage", selectImage); // ✅ upload wali file
      } else if (typeof selectImage === "string") {
        formData.append("imageUrl", selectImage); // ✅ predefined image
      }

      const res = await axios.post(
        `${serverUrl}/api/user/UpdateAssistant`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          withCredentials: true,
        }
      );

      console.log("Assistant updated successfully:", res.data);
      setUserData(res.data);
      navigate("/");
    } catch (error) {
      console.error("Error updating assistant:", error);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-t from-black to-blue-950 flex flex-col justify-start items-center py-8 md:py-16 gap-6 relative">
      
      {/* 🔙 Back button */}
      <IoArrowBackSharp
        className="absolute top-6 left-4 md:top-8 md:left-8 text-white w-6 h-6 md:w-7 md:h-7 cursor-pointer"
        onClick={() => navigate("/customize")}
      />

      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent text-center">
        Enter Your Assistant Name
      </h1>

      {/* ✅ Selected Image Preview */}
      {selectImage && (
        <img
          src={selectImage instanceof File ? URL.createObjectURL(selectImage) : selectImage}
          alt="assistant"
          className="w-[150px] h-[150px] rounded-full object-cover border-2 border-white shadow-lg"
        />
      )}

      <input
        type="text"
        value={assistantName}
        onChange={(e) => setAssistantName(e.target.value)}
        placeholder="Type assistant name..."
        className="w-[85%] max-w-[350px] h-12 md:h-14 px-4 rounded-lg 
          text-white bg-gradient-to-r from-blue-900 to-blue-950 
          border border-blue-800 shadow-md shadow-blue-900/30 
          focus:outline-none focus:ring-2 focus:ring-cyan-900 text-base md:text-lg"
      />

      <button
        disabled={!assistantName}
        className={`w-[85%] max-w-[350px] h-12 md:h-14 rounded-full font-semibold text-base md:text-lg mt-4 shadow-lg transition-all duration-300 ease-in-out
          ${assistantName 
            ? "bg-gradient-to-r from-cyan-700 to-blue-900 text-white hover:scale-105 hover:shadow-cyan-400/70" 
            : "hidden"
          }`}
        onClick={handleUpdateAssistant}
      >
        Finally, Your Assistant is Created
      </button>
    </div>
  );
}

export default Customize2;
