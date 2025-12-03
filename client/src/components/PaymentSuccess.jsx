import React from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentSuccess = ({ booking }) => {
    const navigate = useNavigate();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
                {/* Success Animation */}
                <div className="p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                        <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Payment Successful!</h2>
                    <p className="text-gray-600 mb-6">Your booking has been confirmed</p>

                    {/* Booking Details */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Booking ID:</span>
                                <span className="font-semibold">{booking._id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Transaction ID:</span>
                                <span className="font-semibold">{booking.paymentDetails?.transactionId}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Movie:</span>
                                <span className="font-semibold">{booking.showtime?.movie?.title}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Seats:</span>
                                <span className="font-semibold">{booking.seats.join(', ')}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-green-600 pt-2 border-t">
                                <span>Amount Paid:</span>
                                <span>₹{booking.totalAmount}</span>
                            </div>
                        </div>
                    </div>

                    {/* Confirmation Message */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
                        <p className="text-sm text-blue-800">
                            📧 A confirmation email has been sent to your registered email address
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/my-bookings')}
                            className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold hover:bg-red-600 transition"
                        >
                            View My Bookings
                        </button>
                        <button
                            onClick={() => navigate('/')}
                            className="w-full border-2 border-gray-300 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;
