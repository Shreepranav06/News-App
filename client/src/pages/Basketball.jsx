import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useParams } from "react-router-dom";

const NEWS_API_KEY = "249a2a2bee1f4a01b5fe8f7d2858e25b";
const NEWS_BASE_URL = "https://newsapi.org/v2/everything";
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const BasketballPage = () => {
  const { category } = useParams();
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(""); // Store the logged-in username
  const [votes, setVotes] = useState({}); // State for upvotes and downvotes
  const [comments, setComments] = useState({}); // State for comments
  const [newComment, setNewComment] = useState({}); // State for new comment input

  const fetchNews = async () => {
    try {
      const response = await axios.get(
        `${NEWS_BASE_URL}?q=basketball&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
      );
      return response.data.articles || [];
    } catch (error) {
      console.error("Error fetching basketball news:", error);
      return [];
    }
  };

  const fetchUserInteractions = async (newsArticles) => {
    if (!username) return;
    try {
      const response = await axios.get(`/api/interact/${username}`);
      const interactions = response.data.interactions;

      // Map interactions to votes and comments state
      const votesData = {};
      const commentsData = {};
      interactions.forEach((interaction) => {
        const newsIndex = newsArticles.findIndex(
          (article) => article.url === interaction.newsUrl
        );
        if (newsIndex !== -1) {
          votesData[newsIndex] = { up: interaction.upvotes, down: interaction.downvotes };
          commentsData[newsIndex] = interaction.comments;
        }
      });
      setVotes(votesData);
      setComments(commentsData);
    } catch (error) {
      console.error("Error fetching user interactions:", error);
    }
  };

  useEffect(() => {
    // Get the logged-in username from localStorage
    const loggedInUser = localStorage.getItem("username");
    if (loggedInUser) {
      setUsername(loggedInUser);
    } else {
      window.location.href = "/login";
      return; // Exit early to prevent further execution
    }

    const fetchAllData = async () => {
      setLoading(true);
      const newsData = await fetchNews();
      setNews(newsData);
      await fetchUserInteractions(newsData);
      setLoading(false);
    };

    fetchAllData();
  }, []); // Empty dependency array to run only once on mount

  const handleVote = async (index, type) => {
    const article = news[index];
    const newsUrl = article.url;

    try {
      const response = await axios.post(`/api/interact/vote`, {
        username,
        newsUrl,
        type: type === "up" ? "upvote" : "downvote",
      });

      setVotes((prevVotes) => ({
        ...prevVotes,
        [index]: {
          up: response.data.upvotes,
          down: response.data.downvotes,
        },
      }));
    } catch (error) {
      console.error("Error recording vote:", error);
    }
  };

  const handleCommentSubmit = async (index) => {
    const article = news[index];
    const newsUrl = article.url;
    const comment = newComment[index]?.trim();

    if (!comment) return; // Don't submit empty comments

    try {
      const response = await axios.post(`/api/interact/comment`, {
        username,
        newsUrl,
        comment,
      });

      setComments((prevComments) => ({
        ...prevComments,
        [index]: response.data.comments,
      }));

      // Clear the input field after submission
      setNewComment((prev) => ({
        ...prev,
        [index]: "",
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleCommentChange = (index, value) => {
    setNewComment((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold capitalize mb-6">{category || "Basketball"} News</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow-md">
              {article.urlToImage && (
                <img
                  src={article.urlToImage}
                  alt={article.title}
                  className="w-full h-40 object-cover rounded-md mb-4"
                />
              )}
              <h2 className="text-lg font-semibold">{article.title}</h2>
              <p className="text-gray-600 text-sm">{article.description?.slice(0, 100)}...</p>
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 font-semibold mt-2 inline-block"
              >
                Read More →
              </a>
              <div className="mt-4 flex items-center space-x-4">
                <button
                  onClick={() => handleVote(index, "up")}
                  className="flex items-center space-x-1 text-green-600 hover:text-green-800"
                >
                  <span>👍</span>
                  <span>{votes[index]?.up || 0}</span>
                </button>
                <button
                  onClick={() => handleVote(index, "down")}
                  className="flex items-center space-x-1 text-red-600 hover:text-red-800"
                >
                  <span>👎</span>
                  <span>{votes[index]?.down || 0}</span>
                </button>
              </div>
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700">Comments</h4>
                <div className="max-h-24 overflow-y-auto space-y-2">
                  {(comments[index] || []).map((comment, i) => (
                    <p key={i} className="text-gray-600 text-sm">{comment}</p>
                  ))}
                </div>
                <div className="mt-2 flex space-x-2">
                  <input
                    type="text"
                    value={newComment[index] || ""}
                    onChange={(e) => handleCommentChange(index, e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 p-2 border rounded-md text-sm"
                  />
                  <button
                    onClick={() => handleCommentSubmit(index)}
                    className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                  >
                    Post
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BasketballPage;