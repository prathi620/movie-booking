import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Payment from '../components/Payment';
import PaymentSuccess from '../components/PaymentSuccess';

const Booking = () => {
    const { showtimeId } = useParams();
    const navigate = useNavigate();
    const [showtime, setShowtime] = useState(null);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPayment, setShowPayment] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [completedBooking, setCompletedBooking] = useState(null);

    // Seat pricing tiers
    const seatPricing = {
        'A': 150, // Front rows
        'B': 150,
        'C': 200, // Middle rows
        'D': 200,
        'E': 200,
        'F': 250, // Premium rows
        'G': 250,
        'H': 250
    };

    useEffect(() => {
        const fetchShowtime = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/theaters/showtime/${showtimeId}`);
                const data = await response.json();
                setShowtime(data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching showtime:', error);
                setLoading(false);
            }
        };

        fetchShowtime();
    }, [showtimeId]);

    const handleSeatClick = (seat) => {
        if (seat.status === 'available') {
            if (selectedSeats.includes(seat.seatNumber)) {
                setSelectedSeats(selectedSeats.filter(s => s !== seat.seatNumber));
            } else {
                setSelectedSeats([...selectedSeats, seat.seatNumber]);
            }
        }
    };

    const getSeatPrice = (seatNumber) => {
        const row = seatNumber.charAt(0);
        return seatPricing[row] || 200;
    };

    const calculateTotal = () => {
        return selectedSeats.reduce((total, seatNumber) => {
            return total + getSeatPrice(seatNumber);
        }, 0);
    };

    const handleBooking = () => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) {
            alert('Please login to book tickets');
            navigate('/login');
            return;
        }

        if (selectedSeats.length === 0) {
            alert('Please select at least one seat');
            return;
        }

        setShowPayment(true);
    };

    const handlePaymentSuccess = (booking) => {
        setCompletedBooking(booking);
        setShowPayment(false);
        setShowSuccess(true);
    };

    const handlePaymentCancel = () => {
        setShowPayment(false);
    };

    if (loading) return <div className="text-center mt-8">Loading...</div>;
    if (!showtime) return <div className="text-center mt-8">Showtime not found</div>;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h1 className="text-3xl font-bold mb-4">{showtime.movie.title}</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-gray-700">
                    <div>
                        <p className="font-semibold">Theater:</p>
                        <p>{showtime.theater.name}</p>
                        <p className="text-sm text-gray-600">{showtime.theater.location}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Screen:</p>
                        <p>{showtime.screen}</p>
                    </div>
                    <div>
                        <p className="font-semibold">Showtime:</p>
                        <p>{new Date(showtime.startTime).toLocaleString()}</p>
                    </div>
                </div>
            </div>

            {/* Seat Pricing Legend */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Seat Pricing</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
                        <div>
                            <p className="font-semibold">Premium (F-H)</p>
                            <p className="text-sm text-gray-600">₹250 per seat</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 border-2 border-blue-500 rounded"></div>
                        <div>
                            <p className="font-semibold">Standard (C-E)</p>
                            <p className="text-sm text-gray-600">₹200 per seat</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 border-2 border-green-500 rounded"></div>
                        <div>
                            <p className="font-semibold">Economy (A-B)</p>
                            <p className="text-sm text-gray-600">₹150 per seat</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Seat Selection */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Select Your Seats</h2>

                {/* Screen Indicator */}
                <div className="mb-8">
                    <div className="w-full h-2 bg-gradient-to-b from-gray-400 to-gray-200 rounded-t-full mb-2"></div>
                    <p className="text-center text-gray-600 text-sm">SCREEN</p>
                </div>

                {/* Seat Map */}
                <div className="overflow-x-auto">
                    <div className="inline-block min-w-full">
                        {['H', 'G', 'F', 'E', 'D', 'C', 'B', 'A'].map(row => (
                            <div key={row} className="flex items-center justify-center mb-3">
                                <span className="w-8 text-center font-bold text-gray-700 mr-4">{row}</span>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => {
                                        const seatNumber = `${row}${num}`;
                                        const seat = showtime.seats.find(s => s.seatNumber === seatNumber) ||
                                            { seatNumber, status: 'available' };
                                        const isSelected = selectedSeats.includes(seatNumber);
                                        const price = getSeatPrice(seatNumber);

                                        let seatClass = 'w-10 h-10 rounded border-2 cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-semibold';

                                        if (seat.status === 'booked') {
                                            seatClass += ' bg-red-200 border-red-500 cursor-not-allowed';
                                        } else if (seat.status === 'unavailable') {
                                            seatClass += ' bg-gray-300 border-gray-400 cursor-not-allowed';
                                        } else if (isSelected) {
                                            seatClass += ' bg-red-500 border-red-700 text-white scale-110 shadow-lg';
                                        } else {
                                            // Color based on pricing tier
                                            if (row === 'F' || row === 'G' || row === 'H') {
                                                seatClass += ' bg-yellow-100 border-yellow-500 hover:bg-yellow-200 hover:scale-105';
                                            } else if (row === 'C' || row === 'D' || row === 'E') {
                                                seatClass += ' bg-blue-100 border-blue-500 hover:bg-blue-200 hover:scale-105';
                                            } else {
                                                seatClass += ' bg-green-100 border-green-500 hover:bg-green-200 hover:scale-105';
                                            }
                                        }

                                        return (
                                            <div key={num} className="relative group">
                                                <button
                                                    onClick={() => handleSeatClick(seat)}
                                                    className={seatClass}
                                                    disabled={seat.status !== 'available'}
                                                    title={`${seatNumber} - ₹${price}`}
                                                >
                                                    {num}
                                                </button>
                                                {/* Tooltip */}
                                                {seat.status === 'available' && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                        {seatNumber} - ₹{price}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Legend */}
                <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 border-2 border-green-500 rounded"></div>
                        <span>Available (Economy)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-100 border-2 border-blue-500 rounded"></div>
                        <span>Available (Standard)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-500 rounded"></div>
                        <span>Available (Premium)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-500 border-2 border-red-700 rounded"></div>
                        <span>Selected</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-red-200 border-2 border-red-500 rounded"></div>
                        <span>Booked</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-300 border-2 border-gray-400 rounded"></div>
                        <span>Unavailable</span>
                    </div>
                </div>
            </div>

            {/* Booking Summary */}
            <div className="bg-white rounded-lg shadow-lg p-6 sticky bottom-0">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex-1">
                        <h3 className="font-bold text-lg mb-2">Booking Summary</h3>
                        {selectedSeats.length > 0 ? (
                            <div>
                                <p className="text-gray-700">
                                    <span className="font-semibold">Selected Seats:</span> {selectedSeats.sort().join(', ')}
                                </p>
                                <div className="mt-2 text-sm text-gray-600">
                                    {selectedSeats.map(seat => (
                                        <div key={seat} className="inline-block mr-4">
                                            {seat}: ₹{getSeatPrice(seat)}
                                        </div>
                                    ))}
                                </div>
                                <p className="text-2xl font-bold text-red-600 mt-2">
                                    Total: ₹{calculateTotal()}
                                </p>
                            </div>
                        ) : (
                            <p className="text-gray-500">No seats selected</p>
                        )}
                    </div>
                    <button
                        onClick={handleBooking}
                        disabled={selectedSeats.length === 0}
                        className={`px-8 py-3 rounded-lg font-semibold text-lg transition ${selectedSeats.length > 0
                                ? 'bg-red-500 text-white hover:bg-red-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Proceed to Payment
                    </button>
                </div>
            </div>

            {/* Payment Modal */}
            {showPayment && (
                <Payment
                    bookingDetails={{
                        selectedSeats,
                        totalAmount: calculateTotal(),
                        showtime
                    }}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handlePaymentCancel}
                />
            )}

            {/* Success Modal */}
            {showSuccess && completedBooking && (
                <PaymentSuccess booking={completedBooking} />
            )}
        </div>
    );
};

export default Booking;
