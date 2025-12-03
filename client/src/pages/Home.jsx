import React, { useState, useEffect } from 'react';
import MovieCard from '../components/MovieCard';
import { useNavigate } from 'react-router-dom';

const Home = () => {
    const [movies, setMovies] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedDate, setSelectedDate] = useState('');
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [genres, setGenres] = useState([]);

    // TMDB Search State
    const [tmdbResults, setTmdbResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/movies');
                const data = await response.json();
                setMovies(data);
                setFilteredMovies(data);

                // Extract unique genres
                const uniqueGenres = [...new Set(data.map(movie => movie.genre))];
                setGenres(uniqueGenres);
            } catch (error) {
                console.error('Error fetching movies:', error);
            }
        };

        fetchMovies();
    }, []);

    useEffect(() => {
        let results = movies;

        // Filter by search term (title)
        if (searchTerm) {
            results = results.filter(movie =>
                movie.title.toLowerCase().includes(searchTerm.toLowerCase())
            );

            // Trigger TMDB search if query is long enough
            if (searchTerm.length >= 2) {
                searchTMDB(searchTerm);
            } else {
                setTmdbResults([]);
            }
        } else {
            setTmdbResults([]);
        }

        // Filter by genre
        if (selectedGenre) {
            results = results.filter(movie => movie.genre === selectedGenre);
        }

        // Filter by release date
        if (selectedDate) {
            results = results.filter(movie => {
                const movieDate = new Date(movie.releaseDate);
                const filterDate = new Date(selectedDate);
                return movieDate.toDateString() === filterDate.toDateString();
            });
        }

        setFilteredMovies(results);
    }, [searchTerm, selectedGenre, selectedDate, movies]);

    const searchTMDB = async (query) => {
        setIsSearching(true);
        try {
            const res = await fetch(`http://localhost:5000/api/cinema/search?query=${query}`);
            const data = await res.json();
            // Filter out movies that are already in our local list to avoid duplicates in dropdown
            const localTitles = movies.map(m => m.title.toLowerCase());
            const newResults = data.filter(m => !localTitles.includes(m.title.toLowerCase()));
            setTmdbResults(newResults);
        } catch (err) {
            console.error('Error searching TMDB:', err);
        } finally {
            setIsSearching(false);
        }
    };

    const importAndBook = async (tmdbMovie) => {
        try {
            // Import the movie
            const res = await fetch('http://localhost:5000/api/cinema/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tmdbId: tmdbMovie.tmdbId })
            });
            const importedMovie = await res.json();

            // Navigate to movie details
            navigate(`/movie/${importedMovie._id}`);
        } catch (err) {
            console.error('Error importing movie:', err);
            alert('Failed to load movie details. Please try again.');
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedGenre('');
        setSelectedDate('');
        setTmdbResults([]);
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">Now Showing</h1>

                {/* Search and Filter Section */}
                <div className="bg-white p-6 rounded-lg shadow-md mb-6 relative z-20">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        {/* Search by Title - Medium (spans 4 columns) */}
                        <div className="md:col-span-4 relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Search Movies</label>
                            <input
                                type="text"
                                placeholder="Search for any movie..."
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {/* TMDB Search Results Dropdown */}
                            {searchTerm.length >= 2 && tmdbResults.length > 0 && (
                                <div className="absolute w-full bg-white border border-gray-200 rounded-lg shadow-xl mt-1 max-h-96 overflow-y-auto z-50">
                                    <div className="p-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0">
                                        More from TMDB
                                    </div>
                                    {tmdbResults.map(movie => (
                                        <div
                                            key={movie.tmdbId}
                                            onClick={() => importAndBook(movie)}
                                            className="p-3 hover:bg-red-50 cursor-pointer flex items-center gap-3 border-b border-gray-100 last:border-0 transition-colors"
                                        >
                                            <img
                                                src={movie.poster}
                                                alt={movie.title}
                                                className="w-12 h-16 object-cover rounded shadow-sm"
                                                onError={(e) => e.target.src = 'https://via.placeholder.com/50x75?text=No+Img'}
                                            />
                                            <div>
                                                <p className="font-bold text-gray-800">{movie.title}</p>
                                                <p className="text-xs text-gray-500">{movie.year} • {movie.genre}</p>
                                                <span className="text-xs text-red-500 font-medium mt-1 block">Click to Book</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Filter by Genre - Small (spans 3 columns) */}
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Genre</label>
                            <select
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                            >
                                <option value="">All Genres</option>
                                {genres.map(genre => (
                                    <option key={genre} value={genre}>{genre}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filter by Release Date - Small (spans 3 columns) */}
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Release Date</label>
                            <input
                                type="date"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>

                        {/* Clear Filters Button - Small (spans 2 columns) */}
                        <div className="md:col-span-2 flex items-end">
                            <button
                                onClick={clearFilters}
                                className="w-full bg-gray-500 text-white p-3 rounded-lg hover:bg-gray-600 transition text-sm"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    {/* Active Filters Display */}
                    {(searchTerm || selectedGenre || selectedDate) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            <span className="text-sm text-gray-600">Active Filters:</span>
                            {searchTerm && (
                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                                    Title: {searchTerm}
                                </span>
                            )}
                            {selectedGenre && (
                                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                                    Genre: {selectedGenre}
                                </span>
                            )}
                            {selectedDate && (
                                <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                                    Date: {new Date(selectedDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Results Count */}
                <div className="text-center mb-4">
                    <p className="text-gray-600">
                        Showing <span className="font-bold text-red-600">{filteredMovies.length}</span> of {movies.length} movies
                    </p>
                </div>
            </div>

            {/* Movies Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative z-10">
                {filteredMovies.map(movie => (
                    <MovieCard key={movie._id} movie={movie} />
                ))}
            </div>

            {filteredMovies.length === 0 && (
                <div className="text-center mt-8">
                    <p className="text-gray-500 text-lg">No movies found matching your criteria.</p>
                    <button
                        onClick={clearFilters}
                        className="mt-4 bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default Home;
