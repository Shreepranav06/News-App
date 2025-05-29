import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-6 py-4 shadow-md">
      <h1 className="text-2xl font-bold">
        <Link to="/">Sport News</Link>
      </h1>
      <ul className="hidden md:flex space-x-6">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/category">Category</Link>
        </li>
        <li>
          <Link to="/trending">Trending News</Link>
        </li>
        <li>
          <Link to="/recent">Recent News</Link>
        </li>
        <li>
          <Link to="/clubs-ranking">Clubs Ranking</Link>
        </li>
        <li>
          <Link to="/category/politics">Politics</Link>
        </li>
        <li></li> {/* ✅ Added Politics link */}
      </ul>
      <button className="bg-gray-200 px-4 py-2 rounded-md">Search</button>
    </nav>
  );
};

export default Navbar;
