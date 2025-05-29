import React, { useState, useEffect } from "react";
import axios from "axios";
import "/node_modules/slick-carousel/slick/slick.css";
import "/node_modules/slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";

const API_KEY = "1189d61c-60eb-4962-bbed-08e4f89f761b";
const COUNTRY_SPORTS = {
  us: "NBA",
  uk: "Premier League",
  au: "Cricket",
  fr: "Rugby",
  de: "Bundesliga",
  in: "IPL",
  ca: "Hockey",
  es: "La Liga",
  it: "Serie A",
  br: "Football",
};

const SportsNewsSlider = () => {
  const [news, setNews] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        let fetchedNews = [];

        for (const [country, sport] of Object.entries(COUNTRY_SPORTS)) {
          const response = await axios.get(
            `https://content.guardianapis.com/search?section=sport&q=${sport}&show-fields=thumbnail,byline&order-by=newest&page-size=5&api-key=${API_KEY}`
          );

          const articles = response.data.response.results.filter(
            (article) => article.fields?.thumbnail
          );

          if (articles.length > 0) {
            fetchedNews.push({ country, article: articles[0] });
          }
        }

        setNews(fetchedNews);
      } catch (error) {
        console.error("Error fetching news:", error);
      }
    };

    fetchNews();
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  return (
    <div className="w-screen h-[90vh] mx-0 p-4">
      {news.length > 0 && (
        <Slider {...settings}>
          {news.map(({ country, article }, index) => (
            <div
              key={index}
              className="relative bg-white shadow-lg rounded-lg overflow-hidden w-screen h-[90vh]"
            >
              <img
                src={article.fields.thumbnail}
                alt={article.webTitle}
                className="w-full h-[80vh] object-cover"
              />
              <div className="p-4 absolute bottom-0 left-0 bg-black bg-opacity-50 w-full text-white">
                <span className="bg-gray-800 text-white px-2 py-1 rounded text-sm">
                  {country.toUpperCase()}
                </span>
                <h2 className="text-xl font-bold mt-2">{article.webTitle}</h2>
                <p className="text-sm mt-1">{new Date(article.webPublicationDate).toDateString()}</p>
                <a
                  href={article.webUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Read More
                </a>
              </div>
            </div>
          ))}
        </Slider>
      )}
    </div>
  );
};

export default SportsNewsSlider;