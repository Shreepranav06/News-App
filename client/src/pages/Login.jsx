import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Lottie from "lottie-react";
import animationData from "../assets/news_login.json";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `${import.meta.env.REACT_APP_BACKEND_URL}/api/login`,
        {
          username,
          password,
        }
      );
      

      if (response.status === 200) {
        setMessage("Login successful! Redirecting...");
        localStorage.setItem("username", username);
        setTimeout(() => navigate("/home"), 1000);
      }
    } catch (error) {
      console.error("Login error:", error.response?.data || error);
      setMessage(error.response?.data?.message || "Error logging in");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="flex bg-white rounded-lg shadow-lg p-10 w-3/5">
        {/* Login Form */}
        <div className="w-1/2 flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-4">Login</h2>
          <form onSubmit={handleLogin}>
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
              className="bg-blue-500 text-white p-2 rounded"
            >
              Login
            </button>
          </form>
          {message && <p className="mt-4 text-red-500">{message}</p>}
          <p className="mt-2 text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600 underline">
              Sign up here
            </Link>
          </p>
        </div>

        {/* Lottie Animation */}
        <div className="w-1/2 flex justify-center">
          <Lottie animationData={animationData} className="w-4/5" />
        </div>
      </div>
    </div>
  );
};

export default Login;
