import React from 'react';
import { Link } from 'react-router-dom';

const MovieCard = ({ movie }) => {
    return (
        <div className="bg-white rounded shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <img src={movie.poster} alt={movie.title} className="w-full h-64 object-cover" />
            <div className="p-4">
                <h3 className="text-xl font-bold mb-2 truncate">{movie.title}</h3>
                <p className="text-gray-600 text-sm mb-2">{movie.genre} | {movie.duration} min</p>
                <Link
                    to={`/movie/${movie._id}`}
                    className="block w-full bg-red-500 text-white text-center py-2 rounded hover:bg-red-600"
                >
                    Book Now
                </Link>
            </div>
        </div>
    );
};

export default MovieCard;
