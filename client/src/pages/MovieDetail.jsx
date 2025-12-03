import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const MovieDetail = () => {
    const { id } = useParams();
    const [movie, setMovie] = useState(null);
    const [showtimes, setShowtimes] = useState([]);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        const fetchMovieData = async () => {
            try {
                const movieRes = await fetch(`http://localhost:5000/api/movies/${id}`);
                const movieData = await movieRes.json();
                setMovie(movieData);

                const showtimeRes = await fetch(`http://localhost:5000/api/theaters/showtimes/${id}`);
                const showtimeData = await showtimeRes.json();
                setShowtimes(showtimeData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchMovieData();
    }, [id]);

    if (!movie) return <div className="text-center mt-8">Loading...</div>;

    // Group showtimes by date
    const groupedByDate = showtimes.reduce((acc, showtime) => {
        const date = new Date(showtime.startTime).toLocaleDateString();
        if (!acc[date]) acc[date] = [];
        acc[date].push(showtime);
        return acc;
    }, {});

    // Group showtimes by theater
    const groupedByTheater = showtimes.reduce((acc, showtime) => {
        const theaterName = showtime.theater.name;
        if (!acc[theaterName]) acc[theaterName] = [];
        acc[theaterName].push(showtime);
        return acc;
    }, {});

    // Filter showtimes by selected date
    const filteredShowtimes = selectedDate
        ? showtimes.filter(showtime => {
            const showtimeDate = new Date(showtime.startTime).toLocaleDateString();
            const filterDate = new Date(selectedDate).toLocaleDateString();
            return showtimeDate === filterDate;
        })
        : showtimes;

    return (
        <div className="bg-white rounded shadow-lg p-6">
            <div className="flex flex-col md:flex-row gap-8">
                <img src={movie.poster} alt={movie.title} className="w-full md:w-1/3 rounded shadow-md object-cover max-h-[500px] object-top" />
                <div className="w-full md:w-2/3">
                    <h1 className="text-4xl font-bold mb-4">{movie.title}</h1>
                    <p className="text-gray-600 mb-2"><strong>Genre:</strong> {movie.genre}</p>
                    <p className="text-gray-600 mb-2"><strong>Duration:</strong> {movie.duration} min</p>
                    <p className="text-gray-600 mb-4"><strong>Release Date:</strong> {new Date(movie.releaseDate).toLocaleDateString()}</p>
                    <p className="text-gray-800 mb-6">{movie.description}</p>

                    <h2 className="text-2xl font-bold mb-4">Available Showtimes</h2>

                    {/* View Mode Toggle */}
                    <div className="flex gap-4 mb-4">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`px-4 py-2 rounded-lg transition ${viewMode === 'list'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            List View
                        </button>
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`px-4 py-2 rounded-lg transition ${viewMode === 'calendar'
                                ? 'bg-red-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Calendar View
                        </button>
                    </div>

                    {/* Date Filter for Calendar View */}
                    {viewMode === 'calendar' && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Date</label>
                            <input
                                type="date"
                                className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                            {selectedDate && (
                                <button
                                    onClick={() => setSelectedDate('')}
                                    className="ml-2 text-sm text-red-600 hover:underline"
                                >
                                    Clear
                                </button>
                            )}
                        </div>
                    )}

                    {showtimes.length === 0 ? (
                        <p className="text-gray-500">No showtimes available for this movie.</p>
                    ) : (
                        <>
                            {/* List View */}
                            {viewMode === 'list' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-700">Grouped by Theater</h3>
                                    {Object.entries(groupedByTheater).map(([theaterName, theaterShowtimes]) => (
                                        <div key={theaterName} className="border rounded-lg p-4 bg-gray-50">
                                            <h4 className="font-bold text-lg mb-3 text-gray-800">{theaterName}</h4>
                                            <div className="space-y-2">
                                                {theaterShowtimes.map(showtime => (
                                                    <div key={showtime._id} className="flex justify-between items-center p-3 bg-white rounded border hover:bg-gray-100 transition">
                                                        <div>
                                                            <p className="text-sm text-gray-600">{showtime.theater.location} - Screen {showtime.screen}</p>
                                                            <p className="text-blue-600 font-semibold">
                                                                {new Date(showtime.startTime).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <Link
                                                            to={`/booking/${showtime._id}`}
                                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                                        >
                                                            Select Seats
                                                        </Link>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Calendar View */}
                            {viewMode === 'calendar' && (
                                <div className="space-y-6">
                                    <h3 className="text-xl font-semibold text-gray-700">
                                        {selectedDate ? `Showtimes for ${new Date(selectedDate).toLocaleDateString()}` : 'Grouped by Date'}
                                    </h3>
                                    {Object.entries(selectedDate ?
                                        filteredShowtimes.reduce((acc, showtime) => {
                                            const date = new Date(showtime.startTime).toLocaleDateString();
                                            if (!acc[date]) acc[date] = [];
                                            acc[date].push(showtime);
                                            return acc;
                                        }, {}) :
                                        groupedByDate
                                    ).map(([date, dateShowtimes]) => (
                                        <div key={date} className="border rounded-lg p-4 bg-gray-50">
                                            <h4 className="font-bold text-lg mb-3 text-gray-800">{date}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {dateShowtimes.map(showtime => (
                                                    <div key={showtime._id} className="p-3 bg-white rounded border hover:bg-gray-100 transition">
                                                        <div className="mb-2">
                                                            <p className="font-semibold text-gray-800">{showtime.theater.name}</p>
                                                            <p className="text-sm text-gray-600">{showtime.theater.location} - Screen {showtime.screen}</p>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <p className="text-blue-600 font-semibold">
                                                                {new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                            <Link
                                                                to={`/booking/${showtime._id}`}
                                                                className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                                                            >
                                                                Book
                                                            </Link>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {filteredShowtimes.length === 0 && selectedDate && (
                                        <p className="text-gray-500 text-center">No showtimes available for the selected date.</p>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MovieDetail;
