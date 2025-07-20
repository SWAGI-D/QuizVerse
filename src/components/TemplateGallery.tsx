import React from 'react';
import { FaBrain, FaHistory, FaFootballBall, FaFilm } from 'react-icons/fa';

const templates = [
  {
    id: 1,
    title: 'Science Quiz',
    description: 'Test your science knowledge',
    icon: <FaBrain size={48} className="text-pink-400 mb-4" />,
    img: '/images/science.png', // make sure these images exist in your public folder
  },
  {
    id: 2,
    title: 'History Quiz',
    description: 'Explore historical facts',
    icon: <FaHistory size={48} className="text-pink-400 mb-4" />,
    img: '/images/history.png',
  },
  {
    id: 3,
    title: 'Sports Quiz',
    description: 'For sports fans',
    icon: <FaFootballBall size={48} className="text-pink-400 mb-4" />,
    img: '/images/sports.png',
  },
  {
    id: 4,
    title: 'Movies Quiz',
    description: 'Film trivia and more',
    icon: <FaFilm size={48} className="text-pink-400 mb-4" />,
    img: '/images/movies.png',
  },
];

const TemplateGallery: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white px-6 py-16">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-5xl font-extrabold mb-16 text-center text-pink-400 drop-shadow-lg">
          Choose a Quiz Template
        </h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12">
          {templates.map(({ id, title, description, icon, img }) => (
            <div
              key={id}
              className="bg-gradient-to-tr from-pink-700 to-purple-900 rounded-3xl p-6 shadow-lg cursor-pointer transform transition-transform hover:scale-110 hover:shadow-pink-600/80"
              onClick={() => alert(`You selected: ${title}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && alert(`You selected: ${title}`)}
            >
              {/* Icon */}
              <div className="flex justify-center">{icon}</div>
              {/* Image */}
              <img
                src={img}
                alt={title}
                className="mx-auto rounded-lg mb-4 w-32 h-32 object-cover object-center filter brightness-90 transition duration-300 hover:brightness-110"
              />
              <h2 className="text-2xl font-semibold mb-3 text-pink-300 text-center">{title}</h2>
              <p className="text-pink-100 text-center text-sm">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateGallery;

