import React, { useContext } from "react";
import { UserDataContext } from "../context/UserContext";

function Card({ image }) {
  const {
    selectImage,
    setSelectImage,
    backendImage,
    setBackendImage,
    frontImage,
    setFrontImage,
  } = useContext(UserDataContext);

  return (
    <div
      onClick={() =>{ setSelectImage(image)
          setSelectImage(image)
          setFrontImage(null)
      }}
      className={`w-[140px] md:w-[160px] h-[200px] md:h-[220px] 
        bg-gradient-to-b from-blue-900 to-blue-950 
        border border-blue-500 rounded-2xl shadow-lg shadow-blue-500/40 
        hover:scale-105 hover:shadow-blue-400/70 transition-transform duration-300 
        overflow-hidden cursor-pointer 
        ${selectImage === image ? "border-4 border-white shadow-blue-950" : ""}`}
    >
      <img
        src={image}
        alt="assistant"
        className="w-full h-full object-cover"
      />
    </div>
  );
}

export default Card;
