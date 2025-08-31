import React, { useRef, useContext, useState } from "react";
import Card from "../compnents/card";
import image1 from "../assets/image1.png";
import image2 from "../assets/image2.jpg";
import image3 from "../assets/authBg.png";  
import image4 from "../assets/image4.png";
import image5 from "../assets/image5.png";
import image6 from "../assets/image6.jpeg";
import { FaFileUpload } from "react-icons/fa";
import { UserDataContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";

function Customize() {
  const { selectImage, setSelectImage } = useContext(UserDataContext);

  const navigate = useNavigate();
  const InputImage = useRef(null);

  const [uploadedImage, setUploadedImage] = useState(null);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedImage(url);
      setSelectImage(file); // ✅ file ko save karna hai (sirf url nahi)
    }
  };

  const handleUploadClick = () => {
    InputImage.current.click();
  };

  const predefinedImages = [image1, image2, image3, image4, image5, image6];

  return (
    <div className="w-full min-h-screen bg-gradient-to-t from-black to-blue-950 flex flex-col justify-start items-center py-8 md:py-16 gap-6">
      
      <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4 text-center">
        Select Your Assistant Image
      </h1>

      <div className="w-[95%] md:w-[70%] lg:w-[60%] flex flex-wrap justify-center items-start gap-4 md:gap-6 px-2 md:px-6">
        
        {/* Predefined Images */}
        {predefinedImages.map((img, idx) => (
          <Card 
            key={idx} 
            image={img} 
            selected={selectImage === img}
            onClick={() => setSelectImage(img)}
          />
        ))}

        {/* Upload Box */}
        <div
          onClick={handleUploadClick}
          className={`cursor-pointer w-[140px] md:w-[160px] h-[200px] md:h-[220px] flex flex-col items-center justify-center 
            bg-gradient-to-b from-blue-900 to-blue-950 border border-blue-500 rounded-2xl 
            shadow-lg shadow-blue-500/40 hover:scale-105 hover:shadow-blue-400/70 
            transition-transform duration-300 overflow-hidden
            ${uploadedImage && selectImage instanceof File ? "border-4 border-white shadow-white/80" : ""}`}  
        >
          {uploadedImage ? (
            <img
              src={uploadedImage}
              alt="assistant"
              className="w-full h-full object-cover rounded-2xl"
            />
          ) : (
            <>
              <FaFileUpload className="text-white w-[30px] h-[30px] md:w-[35px] md:h-[35px]" />
              <span className="text-xs md:text-sm text-white mt-2">Upload Image</span>
            </>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          ref={InputImage}
          className="hidden"
          onChange={handleImage}
        />
      </div>

      {/* Next Button */}
      <button
        disabled={!selectImage}
        onClick={() => navigate("/customize2")}
        className={`min-w-[160px] md:min-w-[180px] h-12 md:h-[60px] rounded-full 
          text-white font-semibold text-sm md:text-lg shadow-lg mt-6 
          transition-all duration-300 ease-in-out
          ${selectImage 
            ? "bg-gradient-to-r from-cyan-700 to-blue-900 shadow-blue-500/40 hover:scale-105 hover:shadow-cyan-400/70 cursor-pointer" 
            : "bg-gray-500 opacity-50 cursor-not-allowed"}`}
      >
        Next
      </button>
    </div>
  );
}

export default Customize;
