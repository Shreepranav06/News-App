import React from "react";
import HeroSection from "../components/HeroSection";
import CategoryList from "../components/CategoryList";
import TrendingNews from "../components/TrendingNews";
import SportsNewsSlider from "../components/SportsNewsSlider";
import SportsArticles from "../components/SportsArticles";
const Home = () => {
  return (
    <div>
      <HeroSection />
      <CategoryList />
      <TrendingNews />
      <SportsNewsSlider />
      <SportsArticles />
    </div>
  );
};

export default Home;
