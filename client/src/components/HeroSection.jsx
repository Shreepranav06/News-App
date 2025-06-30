import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";

const HeroSection = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(
          "https://newsdata.io/api/1/news?apikey=pub_7384294c852777c2cde47b6a829ab911812ca&category=sports&language=en"
        );
        setNews(response.data.results.slice(0, 3)); // Get top 3 news
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  if (news.length === 0) return <div>Loading...</div>;

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center bg-gray-100 px-6">
      {/* Background Image */}
      <img
        src={news[0]?.image_url || "https://via.placeholder.com/150"}
        alt="Hero"
        className="absolute inset-0 w-full h-full object-cover opacity-40"
      />

      {/* Hero Content */}
      <div className="text-center z-10 max-w-2xl">
        <motion.h1
          className="text-5xl font-bold uppercase bg-gradient-to-r from-black to-gray-500 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
        >
          {news[0]?.title || "Top Scorer to the Final Match"}
        </motion.h1>
        <p className="mt-4 text-gray-700">
          {news[0]?.description || "EuroLeague Finals Top Scorer is the player who gained the highest points."}
        </p>
        <a
          href={news[0]?.link || "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition"
        >
          Continue Reading
        </a>
      </div>

      {/* Trending News Side Panel with Fade Effect */}
      <div className="absolute right-6 top-1/4 -translate-y-30 space-y-4">
        {news.slice(1, 3).map((item, index) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="relative block bg-white shadow-lg rounded-lg w-60 h-60 overflow-hidden hover:shadow-xl transition"
          >
            {/* Image with fade effect */}
            <div className="relative w-full h-40">
              <img
                src={item.image_url || "https://via.placeholder.com/100"}
                alt={item.title}
                className="w-full h-full object-cover "
              />
              <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-b from-transparent to-white"></div>
            </div>

            {/* Text Content */}
            <div className="p-4">
              <p className="text-[10px] text-gray-800 font-semibold">{item.title}</p>
              <span className="text-[10px] text-gray-500">
                {new Date(item.pubDate).toDateString()}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default HeroSection;