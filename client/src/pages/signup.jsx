import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../assets/news_login.json"; // You can use the same Lottie animation
import axios from "axios";

const Signup = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState(""); // Username input state
  const [password, setPassword] = useState(""); // Password input state
  const [message, setMessage] = useState(""); // Success/error message state

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.REACT_APP_BACKEND_URL}/api/register`,
        {
          username,
          password,
        }
      );
      

      console.log("Signup response:", response.data);
      setMessage("Signup successful! Redirecting to login...");

      // Redirect to login after delay
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      console.error("Signup error:", error.response?.data || error);
      setMessage(error.response?.data?.message || "Error during signup");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex bg-white rounded-lg shadow-lg p-10 w-3/5">
        {/* Signup Form */}
        <div className="w-1/2 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
          <form onSubmit={handleSignup}>
            <label className="mb-2">Username</label>
            <input
              type="text"
              className="border p-2 mb-4 w-full"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <label className="mb-2">Password</label>
            <input
              type="password"
              className="border p-2 mb-4 w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="submit"
              className="bg-green-500 text-white p-2 rounded"
            >
              Sign Up
            </button>
          </form>
          {message && <p className="mt-4 text-blue-500">{message}</p>}
        </div>

        {/* Animation Section */}
        <div className="w-1/2 flex justify-center">
          <Lottie animationData={animationData} className="w-4/5" />
        </div>
      </div>
    </div>
  );
};

export default Signup;
