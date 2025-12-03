import React, { useState, useEffect } from 'react';

const Analytics = () => {
    const [overview, setOverview] = useState({});
    const [bookingTrends, setBookingTrends] = useState([]);
    const [popularMovies, setPopularMovies] = useState([]);
    const [theaterOccupancy, setTheaterOccupancy] = useState([]);
    const [monthlySales, setMonthlySales] = useState([]);
    const [userActivity, setUserActivity] = useState({});
    const [bookingPatterns, setBookingPatterns] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchAllAnalytics();
    }, []);

    const fetchAllAnalytics = async () => {
        setLoading(true);
        try {
            const headers = {
                'Authorization': `Bearer ${user.token}`
            };

            const [
                overviewRes,
                trendsRes,
                moviesRes,
                occupancyRes,
                salesRes,
                activityRes,
                patternsRes
            ] = await Promise.all([
                fetch('http://localhost:5000/api/analytics/overview', { headers }),
                fetch('http://localhost:5000/api/analytics/booking-trends', { headers }),
                fetch('http://localhost:5000/api/analytics/popular-movies', { headers }),
                fetch('http://localhost:5000/api/analytics/theater-occupancy', { headers }),
                fetch('http://localhost:5000/api/analytics/monthly-sales', { headers }),
                fetch('http://localhost:5000/api/analytics/user-activity', { headers }),
                fetch('http://localhost:5000/api/analytics/booking-patterns', { headers })
            ]);

            setOverview(await overviewRes.json());
            setBookingTrends(await trendsRes.json());
            setPopularMovies(await moviesRes.json());
            setTheaterOccupancy(await occupancyRes.json());
            setMonthlySales(await salesRes.json());
            setUserActivity(await activityRes.json());
            setBookingPatterns(await patternsRes.json());
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center mt-8">Loading analytics...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Reports & Analytics</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-sm font-medium opacity-90">Total Bookings</h3>
                    <p className="text-3xl font-bold mt-2">{overview.totalBookings || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-sm font-medium opacity-90">Total Revenue</h3>
                    <p className="text-3xl font-bold mt-2">${overview.totalRevenue?.toFixed(2) || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-sm font-medium opacity-90">Total Users</h3>
                    <p className="text-3xl font-bold mt-2">{overview.totalUsers || 0}</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-lg shadow-lg">
                    <h3 className="text-sm font-medium opacity-90">Total Movies</h3>
                    <p className="text-3xl font-bold mt-2">{overview.totalMovies || 0}</p>
                </div>
            </div>

            {/* Booking Trends */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-bold mb-4">Booking Trends (Last 7 Days)</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Date</th>
                                <th className="p-3 text-left">Bookings</th>
                                <th className="p-3 text-left">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookingTrends.map((trend, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="p-3">{new Date(trend._id).toLocaleDateString()}</td>
                                    <td className="p-3">{trend.count}</td>
                                    <td className="p-3">${trend.revenue.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Popular Movies */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-bold mb-4">Top 10 Popular Movies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {popularMovies.map((movie, idx) => (
                        <div key={idx} className="flex gap-4 border p-4 rounded">
                            <img src={movie.poster} alt={movie.title} className="w-16 h-24 object-cover rounded" />
                            <div className="flex-1">
                                <h3 className="font-bold">{movie.title}</h3>
                                <p className="text-sm text-gray-600">{movie.genre}</p>
                                <div className="mt-2 text-sm">
                                    <p>Bookings: <span className="font-semibold">{movie.bookingCount}</span></p>
                                    <p>Revenue: <span className="font-semibold">${movie.totalRevenue.toFixed(2)}</span></p>
                                    <p>Seats Sold: <span className="font-semibold">{movie.totalSeats}</span></p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Theater Occupancy */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-bold mb-4">Theater Occupancy Rates</h2>
                <div className="space-y-4">
                    {theaterOccupancy.map((theater, idx) => (
                        <div key={idx} className="border p-4 rounded">
                            <div className="flex justify-between items-center mb-2">
                                <h3 className="font-bold">{theater.theater}</h3>
                                <span className="text-lg font-semibold text-blue-600">
                                    {theater.occupancyRate.toFixed(1)}%
                                </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-4">
                                <div
                                    className="bg-blue-500 h-4 rounded-full transition-all"
                                    style={{ width: `${theater.occupancyRate}%` }}
                                ></div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                {theater.totalBooked} / {theater.totalCapacity} seats booked
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Monthly Sales */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-bold mb-4">Monthly Sales Performance</h2>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Month</th>
                                <th className="p-3 text-left">Bookings</th>
                                <th className="p-3 text-left">Revenue</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monthlySales.map((sale, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="p-3">
                                        {new Date(sale._id.year, sale._id.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                                    </td>
                                    <td className="p-3">{sale.totalBookings}</td>
                                    <td className="p-3">${sale.totalRevenue.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* User Activity */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-bold mb-4">User Activity (Last 30 Days)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="border p-4 rounded">
                        <h3 className="text-sm text-gray-600">New Users</h3>
                        <p className="text-3xl font-bold text-blue-600">{userActivity.newUsers}</p>
                    </div>
                    <div className="border p-4 rounded">
                        <h3 className="text-sm text-gray-600">Active Users</h3>
                        <p className="text-3xl font-bold text-green-600">{userActivity.activeUsers}</p>
                    </div>
                </div>

                <h3 className="font-bold mb-3">Top 10 Users by Spending</h3>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="p-3 text-left">Name</th>
                                <th className="p-3 text-left">Email</th>
                                <th className="p-3 text-left">Bookings</th>
                                <th className="p-3 text-left">Total Spent</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userActivity.topUsers?.map((user, idx) => (
                                <tr key={idx} className="border-b">
                                    <td className="p-3">{user.name}</td>
                                    <td className="p-3">{user.email}</td>
                                    <td className="p-3">{user.bookingCount}</td>
                                    <td className="p-3">${user.totalSpent.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Booking Patterns */}
            <div className="bg-white p-6 rounded-lg shadow mb-8">
                <h2 className="text-2xl font-bold mb-4">Peak Booking Patterns</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {bookingPatterns.slice(0, 9).map((pattern, idx) => (
                        <div key={idx} className="border p-4 rounded">
                            <h3 className="font-bold text-lg">{pattern.day}</h3>
                            <p className="text-sm text-gray-600">{pattern.timeSlot}</p>
                            <p className="text-2xl font-bold text-blue-600 mt-2">{pattern.bookings} bookings</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Refresh Button */}
            <div className="text-center">
                <button
                    onClick={fetchAllAnalytics}
                    className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition"
                >
                    Refresh Analytics
                </button>
            </div>
        </div>
    );
};

export default Analytics;
