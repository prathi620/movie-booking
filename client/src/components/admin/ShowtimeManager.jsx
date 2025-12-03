import React, { useState, useEffect } from 'react';

const ShowtimeManager = () => {
    const [theaters, setTheaters] = useState([]);
    const [movies, setMovies] = useState([]);
    const [selectedTheater, setSelectedTheater] = useState('');
    const [selectedMovie, setSelectedMovie] = useState('');
    const [showtimes, setShowtimes] = useState([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [editingShowtime, setEditingShowtime] = useState(null);
    const [newShowtime, setNewShowtime] = useState({
        screen: '', startTime: '', price: 10
    });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchTheaters();
        fetchMovies();
    }, []);

    useEffect(() => {
        if (selectedMovie && selectedTheater) {
            fetchShowtimes();
        } else {
            setShowtimes([]);
        }
    }, [selectedMovie, selectedTheater]);

    const fetchTheaters = async () => {
        const res = await fetch('http://localhost:5000/api/theaters');
        const data = await res.json();
        setTheaters(data);
    };

    const fetchMovies = async () => {
        const res = await fetch('http://localhost:5000/api/movies');
        const data = await res.json();
        setMovies(data);
    };

    const fetchShowtimes = async () => {
        setLoading(true);
        try {
            // Fetch all showtimes for the movie, then filter by theater client-side
            // Ideally backend should support filtering by both, but we have /api/theaters/showtimes/:movieId
            const res = await fetch(`http://localhost:5000/api/theaters/showtimes/${selectedMovie}`);
            const data = await res.json();
            const theaterShowtimes = data.filter(st => st.theater._id === selectedTheater);
            setShowtimes(theaterShowtimes);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveShowtime = async (e) => {
        e.preventDefault();

        const url = editingShowtime
            ? `http://localhost:5000/api/theaters/showtimes/${editingShowtime._id}`
            : 'http://localhost:5000/api/theaters/showtimes';

        const method = editingShowtime ? 'PUT' : 'POST';

        const body = editingShowtime ? {
            startTime: newShowtime.startTime,
            price: newShowtime.price
        } : {
            movie: selectedMovie,
            theater: selectedTheater,
            screen: newShowtime.screen,
            startTime: newShowtime.startTime,
            price: newShowtime.price
        };

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify(body),
            });

            if (res.ok) {
                alert(editingShowtime ? 'Showtime updated!' : 'Showtime added!');
                fetchShowtimes();
                cancelEdit();
            } else {
                const data = await res.json();
                alert(data.message || 'Error saving showtime');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving showtime');
        }
    };

    const handleDeleteShowtime = async (id) => {
        if (!window.confirm('Are you sure you want to delete this showtime?')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/theaters/showtimes/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (res.ok) {
                alert('Showtime deleted');
                fetchShowtimes();
            } else {
                alert('Error deleting showtime');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const startEdit = (showtime) => {
        setEditingShowtime(showtime);
        setNewShowtime({
            screen: showtime.screen,
            startTime: new Date(showtime.startTime).toISOString().slice(0, 16), // Format for datetime-local
            price: showtime.seats[0]?.price || 10 // Get price from first seat or default
        });
        setShowForm(true);
    };

    const cancelEdit = () => {
        setEditingShowtime(null);
        setNewShowtime({ screen: '', startTime: '', price: 10 });
        setShowForm(false);
    };

    // Get screens for selected theater
    const currentTheaterObj = theaters.find(t => t._id === selectedTheater);
    const screens = currentTheaterObj ? currentTheaterObj.screens : [];

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Manage Showtimes</h2>

            <div className="bg-white p-6 rounded shadow-md mb-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Theater</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedTheater}
                            onChange={e => setSelectedTheater(e.target.value)}
                        >
                            <option value="">-- Select Theater --</option>
                            {theaters.map(t => (
                                <option key={t._id} value={t._id}>{t.name} ({t.location})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Movie</label>
                        <select
                            className="w-full p-2 border rounded"
                            value={selectedMovie}
                            onChange={e => setSelectedMovie(e.target.value)}
                        >
                            <option value="">-- Select Movie --</option>
                            {movies.map(m => (
                                <option key={m._id} value={m._id}>{m.title}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {selectedTheater && selectedMovie && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold">Showtimes</h3>
                        <button
                            onClick={() => { setEditingShowtime(null); setShowForm(true); }}
                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                        >
                            Add New Showtime
                        </button>
                    </div>

                    {showForm && (
                        <div className="bg-gray-50 p-6 rounded border border-gray-200 mb-6">
                            <h4 className="font-bold mb-4">{editingShowtime ? 'Edit Showtime' : 'Add New Showtime'}</h4>
                            <form onSubmit={handleSaveShowtime}>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Screen</label>
                                        <select
                                            className="w-full p-2 border rounded"
                                            value={newShowtime.screen}
                                            onChange={e => setNewShowtime({ ...newShowtime, screen: e.target.value })}
                                            required
                                            disabled={!!editingShowtime} // Cannot change screen/layout on edit easily without resetting seats
                                        >
                                            <option value="">-- Select Screen --</option>
                                            {screens.map((s, idx) => (
                                                <option key={idx} value={s.name}>{s.name} ({s.seats} seats)</option>
                                            ))}
                                        </select>
                                        {editingShowtime && <p className="text-xs text-gray-500 mt-1">Screen cannot be changed for existing showtime</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                                        <input
                                            type="datetime-local"
                                            className="w-full p-2 border rounded"
                                            value={newShowtime.startTime}
                                            onChange={e => setNewShowtime({ ...newShowtime, startTime: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                                        <input
                                            type="number"
                                            className="w-full p-2 border rounded"
                                            value={newShowtime.price}
                                            onChange={e => setNewShowtime({ ...newShowtime, price: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                                    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{editingShowtime ? 'Update Showtime' : 'Save Showtime'}</button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? <p>Loading showtimes...</p> : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {showtimes.length === 0 ? (
                                <p className="text-gray-500 col-span-full text-center py-8">No showtimes found for this movie at this theater.</p>
                            ) : (
                                showtimes.map(st => (
                                    <div key={st._id} className="bg-white p-4 rounded shadow border-l-4 border-blue-500">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-lg">{new Date(st.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                <p className="text-sm text-gray-600">{new Date(st.startTime).toLocaleDateString()}</p>
                                                <p className="text-sm font-medium mt-1">{st.screen}</p>
                                                <p className="text-sm text-gray-500">Price: ${st.seats[0]?.price || 'N/A'}</p>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <button onClick={() => startEdit(st)} className="text-blue-500 hover:text-blue-700 text-sm">Edit</button>
                                                <button onClick={() => handleDeleteShowtime(st._id)} className="text-red-500 hover:text-red-700 text-sm">Delete</button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ShowtimeManager;
