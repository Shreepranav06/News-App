import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CategorySection from "./components/CategoryList";
import CricketPage from "./pages/Cricket";
import FootballDashboard from "./pages/Football";
import BasketballPage from "./pages/Basketball";
import F1Page from "./pages/F1";
import Home from "./pages/Home";
import Login from "./pages/Login";
import PoliticsPage from "./pages/Politics";
import Signup from "./pages/signup";

const App = () => {
  return (
    <div className="font-sans">
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/categories" element={<CategorySection />} />
        <Route path="/category/cricket" element={<CricketPage />} />
        <Route path="/category/football" element={<FootballDashboard />} />
        <Route path="/category/basketball" element={<BasketballPage />} />
        <Route path="/category/f1" element={<F1Page />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/category/politics" element={<PoliticsPage />} />{" "}
        {/* ✅ New Route */}
      </Routes>
      {/* <Footer /> */}
    </div>
  );
};

export default App;
