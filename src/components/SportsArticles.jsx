import { useEffect, useState } from "react";

const API_KEY = "249a2a2bee1f4a01b5fe8f7d2858e25b";
const API_URL = `https://newsapi.org/v2/top-headlines?category=sports&country=us&apiKey=${API_KEY}`;

const Card = ({ children }) => (
  <div className="p-4 rounded-lg shadow-lg bg-white relative overflow-hidden">
    {children}
  </div>
);
const CardContent = ({ children }) => <div className="mt-4 px-4 pb-4">{children}</div>;
const Button = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
  >
    {children}
  </button>
);

const SportsArticles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setArticles(data.articles.slice(0, 3)); // Display 3 articles
        setLoading(false);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold mb-6">Sports Article</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <Card key={index}>
              <img
                src={article.urlToImage || "https://via.placeholder.com/400"}
                alt={article.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <span className="absolute top-2 right-2 bg-black text-white px-3 py-1 text-xs rounded-full">Sports</span>
              <CardContent>
                <div className="flex items-center gap-2 text-gray-600 text-sm">
                  <img
                    src="https://via.placeholder.com/40"
                    className="w-8 h-8 rounded-full"
                    alt="Author"
                  />
                  <span>{article.author || "Unknown Author"}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(article.publishedAt).toDateString()}
                </p>
                <h3 className="text-lg font-bold mt-2">{article.title}</h3>
                <p className="text-gray-700 mt-2">{article.description}</p>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-semibold mt-4 inline-block"
                >
                  Read More
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SportsArticles;
