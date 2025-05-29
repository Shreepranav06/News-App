import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const API_KEY = "1189d61c-60eb-4962-bbed-08e4f89f761b";
const SPORTS_CATEGORY = "sport";
const API_URL = `https://content.guardianapis.com/search?section=${SPORTS_CATEGORY}&api-key=${API_KEY}&show-fields=thumbnail,headline,trailText,byline,publication`;

const TrendingNews = () => {
  const [sportsNews, setSportsNews] = useState([]);
  const [featuredSportNews, setFeaturedSportNews] = useState(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchSportsNews = async () => {
      try {
        const response = await fetch(API_URL);
        const data = await response.json();
        
        if (data.response && data.response.results) {
          const validNews = data.response.results.map(article => ({
            title: article.webTitle,
            url: article.webUrl,
            image: article.fields?.thumbnail,
            description: article.fields?.trailText,
            source: "The Guardian",
            publishedAt: article.webPublicationDate
          })).filter(article => article.image);

          console.log("Fetched News Articles:", validNews);
          
          setSportsNews(validNews.slice(0, 5));
          
          if (validNews.length > 0) {
            const randomIndex = Math.floor(Math.random() * validNews.length);
            setFeaturedSportNews(validNews[randomIndex]);
            console.log("Selected Featured News:", validNews[randomIndex]);
          }
        }
      } catch (error) {
        console.error("Error fetching sports news:", error);
      }
    };

    fetchSportsNews();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Trending Sports News</h2>
        {sportsNews.map((article, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="flex items-start space-x-4 bg-white shadow-lg rounded-lg p-4"
          >
            <img 
              src={article.image} 
              alt={article.title} 
              className="w-24 h-24 object-cover rounded-md"
              onError={(e) => e.target.style.display = "none"} 
            />
            <div>
              <p className="text-sm text-gray-500">{article.source} - {new Date(article.publishedAt).toLocaleDateString()}</p>
              <h3 className="text-lg font-semibold">{article.title}</h3>
              <p className="text-sm text-gray-600">{article.description?.slice(0, 100)}...</p>
            </div>
          </motion.div>
        ))}
      </div>

      {featuredSportNews && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative text-white p-6 rounded-lg shadow-lg flex flex-col justify-end h-full"
          style={{
            background: `url(${featuredSportNews.image}) center/cover no-repeat`
          }}
        >
          <div className="absolute inset-0"></div>
          <div className="relative">
            <span className="bg-white text-black px-3 py-1 rounded-md text-sm">{SPORTS_CATEGORY.toUpperCase()}</span>
            <p className="mt-2 text-sm">{featuredSportNews.source} - {new Date(featuredSportNews.publishedAt).toLocaleDateString()}</p>
            <h3 className="text-2xl font-bold mt-2">{featuredSportNews.title}</h3>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TrendingNews;
