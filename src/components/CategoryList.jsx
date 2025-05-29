import React from "react";
import { Link } from "react-router-dom";

const categories = [
  { name: "football", image: "/src/assets/football.jpg" },
  { name: "basketball", image: "/src/assets/basketball.jpeg" },
  { name: "f1", image: "/src/assets/f1.jpeg" },
  { name: "cricket", image: "/src/assets/hero.jpg" },
];

const CategorySection = () => {
  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-4">Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category, index) => (
          <div key={index} className="flex flex-col items-center justify-center space-y-3">
            {index % 2 === 0 ? (
              <>
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-48 h-48 object-cover rounded-lg shadow-lg"
                />
                <Link to={`/category/${category.name.toLowerCase()}`}>
                  <button className="text-6xl font-bold bg-gradient-to-b from-gray-900 to-gray-300 text-transparent bg-clip-text">
                    {category.name}
                  </button>
                </Link>
              </>
            ) : (
              <>
                <Link to={`/category/${category.name.toLowerCase()}`}>
                  <button className="text-6xl font-bold bg-gradient-to-b from-gray-900 to-gray-300 text-transparent bg-clip-text">
                    {category.name}
                  </button>
                </Link>
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-48 h-48 object-cover rounded-lg shadow-lg"
                />
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategorySection;
