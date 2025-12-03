import TheaterManager from '../components/admin/TheaterManager';
import ShowtimeManager from '../components/admin/ShowtimeManager';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('movies');
    const [movies, setMovies] = useState([]);
    const [newMovie, setNewMovie] = useState({
        title: '', description: '', genre: '', duration: '', poster: '', releaseDate: ''
    });

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (activeTab === 'movies') {
            fetchMovies();
        }
    }, [activeTab]);

    const fetchMovies = async () => {
        const res = await fetch('http://localhost:5000/api/movies');
        const data = await res.json();
        setMovies(data);
    };

    const handleAddMovie = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/movies', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify(newMovie),
            });
            if (res.ok) {
                alert('Movie added!');
                fetchMovies();
                setNewMovie({ title: '', description: '', genre: '', duration: '', poster: '', releaseDate: '' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                <button
                    className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'movies' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => setActiveTab('movies')}
                >
                    Manage Movies
                </button>
                <button
                    className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'theaters' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => setActiveTab('theaters')}
                >
                    Manage Theaters
                </button>
                <button
                    className={`px-4 py-2 rounded whitespace-nowrap ${activeTab === 'showtimes' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
                    onClick={() => setActiveTab('showtimes')}
                >
                    Manage Showtimes
                </button>
            </div>

            {activeTab === 'movies' && (
                <div>
                    <h2 className="text-2xl font-bold mb-4">Add New Movie</h2>
                    <form onSubmit={handleAddMovie} className="bg-white p-6 rounded shadow-md mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Title" className="p-2 border rounded" value={newMovie.title} onChange={e => setNewMovie({ ...newMovie, title: e.target.value })} required />
                        <input type="text" placeholder="Genre" className="p-2 border rounded" value={newMovie.genre} onChange={e => setNewMovie({ ...newMovie, genre: e.target.value })} required />
                        <input type="number" placeholder="Duration (min)" className="p-2 border rounded" value={newMovie.duration} onChange={e => setNewMovie({ ...newMovie, duration: e.target.value })} required />
                        <input type="text" placeholder="Poster URL" className="p-2 border rounded" value={newMovie.poster} onChange={e => setNewMovie({ ...newMovie, poster: e.target.value })} required />
                        <input type="date" className="p-2 border rounded" value={newMovie.releaseDate} onChange={e => setNewMovie({ ...newMovie, releaseDate: e.target.value })} required />
                        <textarea placeholder="Description" className="p-2 border rounded md:col-span-2" value={newMovie.description} onChange={e => setNewMovie({ ...newMovie, description: e.target.value })} required />
                        <button type="submit" className="bg-green-500 text-white p-2 rounded md:col-span-2 hover:bg-green-600">Add Movie</button>
                    </form>

                    <h2 className="text-2xl font-bold mb-4">Existing Movies</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {movies.map(movie => (
                            <div key={movie._id} className="bg-white p-4 rounded shadow flex gap-4">
                                <img src={movie.poster} alt={movie.title} className="w-16 h-24 object-cover" />
                                <div>
                                    <h3 className="font-bold">{movie.title}</h3>
                                    <p className="text-sm text-gray-600">{movie.genre}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'theaters' && <TheaterManager />}
            {activeTab === 'showtimes' && <ShowtimeManager />}
        </div>
    );
};

export default AdminDashboard;
