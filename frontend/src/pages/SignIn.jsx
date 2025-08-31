import React, { useState, useContext } from "react";
import bgImage from "../assets/authBg.png";
import { useNavigate } from "react-router-dom";
import { UserDataContext } from "../context/UserContext";
import axios from "axios";

function SignIn() {
  const navigate = useNavigate();
  const { serverUrl } = useContext(UserDataContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading,setLoading] =useState(false)

const handleSignin = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const result = await axios.post(
      `${serverUrl}/api/auth/signin`,
      { email, password },
      { withCredentials: true }
    );
    console.log(result.data);
    setLoading(false);
    navigate("/");
  } catch (err) {
    console.error("Signin error:", err.response?.data || err.message);
    setLoading(false);
    setError(err.response?.data?.message || "Signin failed");
  }
};

  return (
    <div
      className="w-full min-h-screen bg-cover flex justify-center items-center px-4 py-8 md:py-0"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <form
        className="w-full max-w-md h-auto bg-black/30 backdrop-blur-md shadow-lg rounded-lg flex flex-col justify-center items-center gap-4 p-6 md:p-8"
        onSubmit={handleSignin}
      >
        <h1 className="text-white text-2xl md:text-3xl font-semibold mb-4 text-center">
          Welcome Back to{" "}
          <span className="text-blue-300 text-3xl md:text-4xl font-semibold">
            Virtual Assistant
          </span>
        </h1>

        <input
          type="email"
          placeholder="Enter Your Email"
          className="w-full h-12 md:h-14 outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-4 md:px-6 rounded-full text-sm md:text-lg"
          required
          onChange={(e) => setEmail(e.target.value)}
          value={email}
        />

        <input
          type="password"
          placeholder="Enter Password"
          className="w-full h-12 md:h-14 outline-none border-2 border-white bg-transparent text-white placeholder-gray-300 px-4 md:px-6 rounded-full text-sm md:text-lg"
          required
          onChange={(e) => setPassword(e.target.value)}
          value={password}
        />

        {error.length > 0 && (
          <p className="text-red-500 text-sm">* {error}</p>
        )}

        <button
          type="submit"
          className="w-full md:w-auto min-w-[150px] h-12 md:h-14 bg-white rounded-full text-black font-bold text-sm md:text-lg mt-4"
         disabled={loading}
        >
          {loading?"loading":"SignIn"}
        </button>

        <p
          className="text-white text-sm md:text-base cursor-pointer mt-3 text-center"
          onClick={() => navigate("/signup")} 
        >
          Don’t have an account?{" "}
          <span className="text-blue-400">Sign Up</span>
        </p>
      </form>
    </div>
  );
}

export default SignIn;
