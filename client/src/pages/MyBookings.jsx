import React, { useState, useEffect } from 'react';
import TicketView from '../components/TicketView';

const MyBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showTicket, setShowTicket] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return;

        try {
            const response = await fetch('http://localhost:5000/api/bookings/mybookings', {
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });
            const data = await response.json();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelBooking = async (bookingId) => {
        if (!window.confirm('Are you sure you want to cancel this booking? This action cannot be undone.')) {
            return;
        }

        const user = JSON.parse(localStorage.getItem('user'));
        try {
            const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            const data = await response.json();

            if (response.ok) {
                alert('Booking cancelled successfully');
                fetchBookings(); // Refresh list
            } else {
                alert(data.message || 'Failed to cancel booking');
            }
        } catch (error) {
            console.error('Error cancelling booking:', error);
            alert('Error cancelling booking');
        }
    };

    const handleViewTicket = (booking) => {
        setSelectedBooking(booking);
        setShowTicket(true);
    };

    if (loading) return <div className="text-center mt-8 text-xl">Loading your bookings...</div>;

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-4">My Bookings</h1>

            {bookings.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-500 text-xl mb-4">You haven't made any bookings yet.</p>
                    <a href="/" className="text-red-600 hover:text-red-700 font-semibold">Browse Movies</a>
                </div>
            ) : (
                <div className="grid gap-6">
                    {bookings.map(booking => {
                        const showtimeDate = new Date(booking.showtime.startTime);
                        const isPast = showtimeDate < new Date();
                        const isCancelled = booking.status === 'cancelled';

                        return (
                            <div key={booking._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition duration-300 border border-gray-100">
                                <div className="flex flex-col md:flex-row">
                                    {/* Movie Poster */}
                                    <div className="md:w-48 h-64 md:h-auto relative">
                                        <img
                                            src={booking.showtime.movie.poster}
                                            alt={booking.showtime.movie.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute top-2 right-2 md:hidden">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isCancelled ? 'bg-red-100 text-red-800' :
                                                    isPast ? 'bg-gray-100 text-gray-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {isCancelled ? 'Cancelled' : isPast ? 'Completed' : 'Confirmed'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Booking Details */}
                                    <div className="p-6 flex-grow flex flex-col justify-between">
                                        <div>
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-gray-800 mb-1">{booking.showtime.movie.title}</h2>
                                                    <p className="text-gray-500 text-sm">Booking ID: {booking._id}</p>
                                                </div>
                                                <div className="hidden md:block">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${isCancelled ? 'bg-red-100 text-red-800' :
                                                            isPast ? 'bg-gray-100 text-gray-800' :
                                                                'bg-green-100 text-green-800'
                                                        }`}>
                                                        {isCancelled ? 'Cancelled' : isPast ? 'Completed' : 'Confirmed'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-semibold">Theater</p>
                                                    <p className="text-gray-800">{booking.showtime.theater.name}</p>
                                                    <p className="text-xs text-gray-500">{booking.showtime.theater.location}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-semibold">Date & Time</p>
                                                    <p className="text-gray-800">
                                                        {showtimeDate.toLocaleDateString()}
                                                    </p>
                                                    <p className="text-gray-800 font-medium">
                                                        {showtimeDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-semibold">Seats</p>
                                                    <p className="text-gray-800 font-medium">{booking.seats.join(', ')}</p>
                                                    <p className="text-xs text-gray-500">{booking.seats.length} Seats</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase font-semibold">Amount</p>
                                                    <p className="text-gray-800 font-bold">₹{booking.totalAmount}</p>
                                                    <p className="text-xs text-gray-500">{booking.paymentMethod}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                                            {!isCancelled && (
                                                <button
                                                    onClick={() => handleViewTicket(booking)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm font-medium"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                                                    </svg>
                                                    View Ticket
                                                </button>
                                            )}

                                            {!isCancelled && !isPast && (
                                                <button
                                                    onClick={() => handleCancelBooking(booking._id)}
                                                    className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded hover:bg-red-50 transition text-sm font-medium"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                                    </svg>
                                                    Cancel Booking
                                                </button>
                                            )}

                                            {isCancelled && (
                                                <span className="text-gray-500 text-sm italic flex items-center">
                                                    This booking has been cancelled.
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Ticket Modal */}
            {showTicket && selectedBooking && (
                <TicketView
                    booking={selectedBooking}
                    onClose={() => setShowTicket(false)}
                />
            )}
        </div>
    );
};

export default MyBookings;
