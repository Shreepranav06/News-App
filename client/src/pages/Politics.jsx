import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { normalizeUrl } from "../utils/normalizeURL";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;



const apiConfig = {
  Breaking: {
    url: `${BACKEND_URL}/api/breaking-news`, // fetch from your backend
    extractArticles: (data) => data.articles,
  },
  
  India: {
    url: `https://newsdata.io/api/1/news?country=in&category=politics&apikey=pub_7529455eb791a7aa5ed73d7c18d8b653bea67`,
    extractArticles: (data) => data.results,
  },
  USA: {
    url: `https://newsdata.io/api/1/latest?apikey=pub_7529455eb791a7aa5ed73d7c18d8b653bea67&q=politics&country=us`,
    extractArticles: (data) => data.results,
  },
  UK: {
    url: `https://content.guardianapis.com/politics?api-key=92a7cb18-7399-4f89-8a93-56aa51e9649c&show-fields=thumbnail,trailText`,
    extractArticles: (data) =>
      data.response.results.map((item) => ({
        title: item.webTitle,
        url: item.webUrl,
        urlToImage: item.fields?.thumbnail,
        description: item.fields?.trailText,
      })),
  },
  Canada: {
    url: `https://api.mediastack.com/v1/news?access_key=9f90fdf99fd0029fca33489f895cd16e&countries=ca`,
    extractArticles: (data) => data.data,
  },
};

const PoliticsPage = () => {
  const { category } = useParams();
  const [selectedCountry, setSelectedCountry] = useState("Breaking");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [votes, setVotes] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [darkMode, setDarkMode] = useState(false);

  const fetchArticles = async () => {
    const config = apiConfig[selectedCountry];
    if (!config) return;

    setLoading(true);
    try {
      const res = await axios.get(config.url);
      const newsList = config.extractArticles(res.data) || [];
      setArticles(newsList);
      await fetchUserInteractions(newsList);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInteractions = async (newsList) => {
    if (!username) return;
    try {
      const response = await axios.get(`${BACKEND_URL}/api/interact/${username}`);

      const interactions = response.data.interactions || [];

      const votesData = {};
      const commentsData = {};
      interactions.forEach((interaction) => {
        const newsIndex = newsList.findIndex(
          (a) => a.url === interaction.newsUrl
        );
        if (newsIndex !== -1) {
          votesData[newsIndex] = {
            up: interaction.upvotes,
            down: interaction.downvotes,
          };
          commentsData[newsIndex] = interaction.comments;
        }
      });
      setVotes(votesData);
      setComments(commentsData);
    } catch (err) {
      console.error("Interaction fetch failed:", err);
    }
  };

  const handleVote = async (index, type) => {
    const article = articles[index];
    const articleUrl = normalizeUrl(articles[index].url);
    try {
      const res = await axios.post(`${BACKEND_URL}/api/interact/vote`, {
        username,
        newsUrl: articleUrl,
        type: type === "up" ? "upvote" : "downvote",
      });

      setVotes((prev) => ({
        ...prev,
        [index]: {
          up: res.data.upvotes,
          down: res.data.downvotes,
        },
      }));
    } catch (err) {
      console.error("Voting error:", err);
    }
  };

  const handleCommentSubmit = async (index) => {
    const comment = newComment[index]?.trim();
    if (!comment) return;

    try {
      const res = await axios.post(`${BACKEND_URL}/api/interact/comment`, {

          username,
          newsUrl: normalizeUrl(articles[index].url),
          comment,
        }
      );
      setComments((prev) => ({
        ...prev,
        [index]: res.data.comments,
      }));
      setNewComment((prev) => ({
        ...prev,
        [index]: "",
      }));
    } catch (err) {
      console.error("Comment error:", err);
    }
  };

  const handleCommentChange = (index, value) => {
    setNewComment((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  useEffect(() => {
    const user = localStorage.getItem("username");
    if (!user) {
      window.location.href = "/login";
      return;
    }
    setUsername(user);
  }, []);

  useEffect(() => {
    fetchArticles();
  }, [selectedCountry]);

  return (
    <div
      className={`${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      } min-h-screen p-6`}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">
          {category || "Politics"} News - {selectedCountry}
        </h1>
        <button
          onClick={() => setDarkMode((prev) => !prev)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        {Object.keys(apiConfig).map((country) => (
          <button
            key={country}
            onClick={() => setSelectedCountry(country)}
            className={`px-4 py-2 rounded ${
              selectedCountry === country
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border"
            }`}
          >
            {country === "Breaking" ? "🌍 Breaking" : country}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.length > 0 ? (
            articles.slice(0, 9).map((article, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md transition duration-300"
              >
                {article.urlToImage && (
                  <img
                    src={article.urlToImage}
                    alt={article.title}
                    className="w-full h-40 object-cover rounded mb-3"
                  />
                )}
                <h3 className="font-semibold text-lg mb-2">{article.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                  {article.description?.slice(0, 100)}...
                </p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-500 font-semibold hover:underline"
                >
                  Read More →
                </a>

                <div className="flex space-x-4 mt-4">
                  <button
                    onClick={() => handleVote(index, "up")}
                    className="text-green-600 hover:text-green-800"
                  >
                    👍 {votes[index]?.up || 0}
                  </button>
                  <button
                    onClick={() => handleVote(index, "down")}
                    className="text-red-600 hover:text-red-800"
                  >
                    👎 {votes[index]?.down || 0}
                  </button>
                </div>

                <div className="mt-4">
                  <h4 className="text-sm font-semibold mb-1">Comments</h4>
                  <div className="max-h-24 overflow-y-auto space-y-1 text-sm text-gray-700 dark:text-gray-200">
                    {(comments[index] || []).map((c, i) => (
                      <p key={i}>- {c}</p>
                    ))}
                  </div>
                  <div className="flex mt-2 space-x-2">
                    <input
                      type="text"
                      placeholder="Add comment..."
                      className="flex-1 p-2 border rounded text-sm"
                      value={newComment[index] || ""}
                      onChange={(e) =>
                        handleCommentChange(index, e.target.value)
                      }
                    />
                    <button
                      onClick={() => handleCommentSubmit(index)}
                      className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Post
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500">
              No articles found
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default PoliticsPage;
