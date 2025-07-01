import React, { useEffect, useState } from "react";
import axios from "axios";
import Backendaxios from "../api/axios";
import { useParams } from "react-router-dom";
import Lottie from "react-lottie-player";
import animationData from "../assets/Cricket_bat.json";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const NEWS_API_KEY = "249a2a2bee1f4a01b5fe8f7d2858e25b";
const NEWS_BASE_URL = "https://newsapi.org/v2/everything";
const RAPIDAPI_KEY = "a1b5987cffmsh1bab8f14268620bp10db03jsn5a8135a79eba";
const CRICBUZZ_HOST = "unofficial-cricbuzz.p.rapidapi.com";

const CricketPage = () => {
  const { category } = useParams();
  const [standings, setStandings] = useState([]);
  const [rankings, setRankings] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");
  const [votes, setVotes] = useState({});
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});

  const fetchStandings = async () => {
    const options = {
      method: "GET",
      url: "https://unofficial-cricbuzz.p.rapidapi.com/stats/get-icc-standings",
      params: { matchType: "1" },
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": CRICBUZZ_HOST,
      },
    };
    try {
      const response = await axios.request(options);
      const standingsData = response.data.values || [];
      setStandings(
        standingsData.map((item) => ({
          rank: item.value[0],
          flag: item.value[1],
          teamName: item.value[2],
          pct: item.value[3],
        }))
      );
    } catch (error) {
      console.error("Error fetching standings:", error);
    }
  };

  const fetchRankings = async () => {
    const options = {
      method: "GET",
      url: "https://unofficial-cricbuzz.p.rapidapi.com/stats/get-icc-rankings",
      params: { category: "batsmen", formatType: "odi", isWomen: "0" },
      headers: {
        "x-rapidapi-key": RAPIDAPI_KEY,
        "x-rapidapi-host": CRICBUZZ_HOST,
      },
    };
    try {
      const response = await axios.request(options);
      setRankings(response.data.rank || []);
    } catch (error) {
      console.error("Error fetching rankings:", error);
    }
  };

  const fetchNews = async () => {
    try {
      const response = await axios.get(
        `${NEWS_BASE_URL}?q=cricket&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
      );
      return response.data.articles || [];
    } catch (error) {
      console.error("Error fetching cricket news:", error);
      return [];
    }
  };

  const fetchUserInteractions = async (newsArticles) => {
    if (!username) return;
    try {
      const response = await Backendaxios.get(`/api/interact/${username}`);
      const interactions = response.data.interactions;

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
      const [standingsData, rankingsData, newsData] = await Promise.all([
        fetchStandings(),
        fetchRankings(),
        fetchNews(),
      ]);
      setNews(newsData); // Set news state after fetching
      await fetchUserInteractions(newsData); // Fetch interactions after news is set
      setLoading(false);
    };

    fetchAllData();
  }, []); // Empty dependency array to run only once on mount

  const handleVote = async (index, type) => {
    const article = news[index];
    const newsUrl = article.url;

    try {
      const response = await Backendaxios.post(`/api/interact/vote`, {
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

    if (!comment) return;

    try {
      const response = await Backendaxios.post(`/api/interact/comment`, {
        username,
        newsUrl,
        comment,
      });

      setComments((prevComments) => ({
        ...prevComments,
        [index]: response.data.comments,
      }));

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
    <div className="min-h-screen bg-gradient-to-r from-neutral-300 to-stone-400 p-6">
      <h1 className="text-4xl md:text-5xl font-extrabold text-center text-blue-800 capitalize mb-10">
        {category || "Cricket"} Dashboard
      </h1>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">ICC Standings</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {standings.length > 0 ? (
                  standings.map((team, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="font-semibold text-gray-700 w-8">{team.rank}</span>
                        <span className="font-semibold text-gray-700">{team.teamName}</span>
                      </div>
                      <span className="text-blue-600 font-medium">{team.pct}%</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No standings available</p>
                )}
              </div>
            </section>
            <div className="flex justify-center items-center ml-8">
              <Lottie
                loop
                animationData={animationData}
                play
                style={{ width: 300, height: 300 }}
              />
            </div>

            <section className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Top ODI Batsmen</h2>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {rankings.length > 0 ? (
                  rankings.map((player, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-blue-50 transition"
                    >
                      <span className="font-semibold text-gray-700">{player.name}</span>
                      <span className="text-blue-600 font-medium">{player.rating}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No rankings available</p>
                )}
              </div>
            </section>
          </div>

          <section className="bg-white rounded-xl shadow-lg p-6 mt-10">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Latest Cricket News</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {news.length > 0 ? (
                news.slice(0, 9).map((article, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg hover:shadow-md transition duration-300"
                  >
                    {article.urlToImage && (
                      <img
                        src={article.urlToImage}
                        alt={article.title}
                        className="w-full h-40 object-cover rounded-md mb-3"
                      />
                    )}
                    <h3 className="text-lg font-semibold text-gray-800">{article.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {article.description?.slice(0, 100)}...
                    </p>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 font-semibold hover:underline"
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
                ))
              ) : (
                <p className="text-gray-500 col-span-3">No news available</p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default CricketPage;