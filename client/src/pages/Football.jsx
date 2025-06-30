import React, { useEffect, useState } from "react";
import axios from "axios";
import Slider from "react-slick";
import { motion } from "framer-motion";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Import local images for League Standings
import santiagoBernabeu from '../assets/Real_madrid_stadium.jpg';
import parcDesPrinces from '../assets/Real_madrid_stadium.jpg';
import wembleyStadium from '../assets/Real_madrid_stadium.jpg';
import allianzArena from '../assets/Real_madrid_stadium.jpg';

const NEWS_API_KEY = "249a2a2bee1f4a01b5fe8f7d2858e25b";
const FOOTBALL_API_KEY = "96e9d5735b94ad4230deb3f007105673";
const NEWS_BASE_URL = "https://newsapi.org/v2/everything";
const FOOTBALL_BASE_URL = "https://v3.football.api-sports.io";
const BACKEND_URL = import.meta.env.REACT_APP_BACKEND_URL;


// Stadium backgrounds for League Standings (mapped to league IDs)
const stadiumBackgrounds = {
  140: santiagoBernabeu, // Santiago Bernabeu (La Liga - Real Madrid)
  61: parcDesPrinces,    // Parc des Princes (Ligue 1 - PSG)
  39: wembleyStadium,    // Wembley Stadium (Premier League)
  78: allianzArena,      // Allianz Arena (Bundesliga)
};

const FootballPage = () => {
  const [matches, setMatches] = useState([]);
  const [standings, setStandings] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [votes, setVotes] = useState({});
  const [comments, setComments] = useState({});
  const [username, setUsername] = useState(""); // Store the logged-in username

  useEffect(() => {
    // Get the logged-in username from localStorage (set during login)
    const loggedInUser = localStorage.getItem("username");
    if (loggedInUser) {
      setUsername(loggedInUser);
    } else {
      // Redirect to login if no user is logged in
      window.location.href = "/login";
    }

    const fetchFootballData = async () => {
      try {
        const matchResponse = await axios.get(
          `${FOOTBALL_BASE_URL}/fixtures?live=all`,
          { headers: { "x-apisports-key": FOOTBALL_API_KEY } }
        );
        setMatches(matchResponse.data.response);

        const leagues = [39, 140, 61, 78];
        let standingsData = [];
        for (const league of leagues) {
          const standingResponse = await axios.get(
            `${FOOTBALL_BASE_URL}/standings?league=${league}&season=2023`,
            { headers: { "x-apisports-key": FOOTBALL_API_KEY } }
          );
          standingsData.push({ league, data: standingResponse.data.response });
        }
        setStandings(standingsData);
      } catch (error) {
        console.error("Error fetching football data:", error);
      }
    };

    const fetchNews = async () => {
      try {
        const response = await axios.get(
          `${NEWS_BASE_URL}?q=football&language=en&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
        );
        setNews(response.data.articles);
      } catch (error) {
        console.error("Error fetching football news:", error);
      }
    };

    const fetchUserInteractions = async () => {
      if (!loggedInUser) return;
      try {
        const response = await axios.get(`${BACKEND_URL}/api/interact/${loggedInUser}`);
        const interactions = response.data.interactions;

        // Map interactions to votes and comments state
        const votesData = {};
        const commentsData = {};
        interactions.forEach((interaction) => {
          const newsIndex = news.findIndex((article) => article.url === interaction.newsUrl);
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

    fetchFootballData();
    fetchNews().then(() => {
      fetchUserInteractions(); // Fetch interactions after news is loaded
    });
    setLoading(false);
  }, [news]); // Re-run when news changes to map interactions

  const handleVote = async (index, type) => {
    const article = news[index];
    const newsUrl = article.url;

    try {
      const response = await axios.post(`${BACKEND_URL}/api/interact/vote`, {
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

  const handleComment = async (index, comment) => {
    const article = news[index];
    const newsUrl = article.url;

    try {
      const response = await axios.post(`${BACKEND_URL}/api/interact/comment`, {
        username,
        newsUrl,
        comment,
      });

      setComments((prevComments) => ({
        ...prevComments,
        [index]: response.data.comments,
      }));
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const sliderSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    customPaging: (i) => (
      <motion.div
        whileHover={{ scale: 1.2 }}
        className="w-3 h-3 bg-gray-400 rounded-full cursor-pointer"
      />
    ),
    dotsClass: "slick-dots mt-4 flex justify-center space-x-2",
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-6 text-gray-800">Football</h1>
      {loading ? (
        <p className="text-center text-lg">Loading...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Live Matches */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-700">Live Matches</h2>
              <Slider {...sliderSettings} className="bg-white p-4 rounded-lg shadow-md">
                {matches.length > 0 ? (
                  matches.map((match, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                      className="p-4 text-center bg-transparent"
                      style={{ background: 'none' }}
                    >
                      <h3 className="text-xl md:text-2xl font-semibold text-gray-800">
                        {match.teams.home.name} vs {match.teams.away.name}
                      </h3>
                      <p className="text-lg text-gray-600 mt-1">
                        Score: {match.goals.home} - {match.goals.away}
                      </p>
                    </motion.div>
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="p-4 text-center bg-transparent"
                    style={{ background: 'none' }}
                  >
                    <p className="text-lg text-gray-600">No live matches at the moment.</p>
                  </motion.div>
                )}
              </Slider>
            </div>

            {/* League Standings */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-700">League Standings</h2>
              <Slider {...sliderSettings}>
                {standings.map((leagueData, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="p-4 text-center rounded-lg shadow-md relative overflow-hidden"
                    style={{
                      backgroundImage: `url(${stadiumBackgrounds[leagueData.league] || santiagoBernabeu})`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                      height: "300px",
                    }}
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg"></div>
                    <div className="relative z-10">
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        League {leagueData.league}
                      </h3>
                      <ul className="mt-4 space-y-3">
                        {leagueData.data[0]?.league?.standings[0]?.slice(0, 5).map((team, idx) => (
                          <li
                            key={idx}
                            className="text-lg text-gray-200 flex items-center justify-center space-x-2"
                          >
                            <span>{idx + 1}.</span>
                            {team.team.logo && (
                              <img src={team.team.logo} alt={team.team.name} className="w-6 h-6" />
                            )}
                            <span>{team.team.name}</span>
                            <span className="text-gray-300">({team.points} pts)</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </motion.div>
                ))}
              </Slider>
            </div>
          </div>

          {/* Football News */}
          <h2 className="text-2xl md:text-3xl font-bold mt-10 mb-6 text-gray-700">Latest Football News</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {news.slice(0, 9).map((article, index) => (
              <div key={index} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold text-gray-800">{article.title}</h3>
                <p className="text-gray-600 text-sm mt-2">{article.description}</p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm mt-2 block hover:underline"
                >
                  Read More
                </a>
                <div className="flex justify-between mt-4">
                  <button onClick={() => handleVote(index, "up")} className="text-blue-500 font-bold">
                    ⬆️ {votes[index]?.up || 0}
                  </button>
                  <button onClick={() => handleVote(index, "down")} className="text-red-500 font-bold">
                    ⬇️ {votes[index]?.down || 0}
                  </button>
                </div>
                <div className="mt-4">
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    className="border rounded p-1 w-full"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleComment(index, e.target.value);
                        e.target.value = "";
                      }
                    }}
                  />
                  <ul className="mt-2 text-gray-700">
                    {(comments[index] || []).map((comment, i) => (
                      <li key={i} className="text-sm mt-1">🗨 {comment}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default FootballPage;