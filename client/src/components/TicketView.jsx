import React from 'react';

const TicketView = ({ booking, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white print:absolute print:inset-0">
            <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full overflow-hidden print:shadow-none print:w-full print:max-w-none">
                {/* Ticket Header */}
                <div className="bg-red-600 text-white p-6 flex justify-between items-center print:bg-white print:text-black print:border-b-2 print:border-black">
                    <div>
                        <h2 className="text-3xl font-bold tracking-wider">MOVIE TICKET</h2>
                        <p className="text-red-100 print:text-gray-600">Booking ID: {booking._id.slice(-8).toUpperCase()}</p>
                    </div>
                    <div className="text-right">
                        <h3 className="text-xl font-bold">MovieBook</h3>
                        <p className="text-sm">www.moviebook.com</p>
                    </div>
                </div>

                {/* Ticket Body */}
                <div className="p-8 flex flex-col md:flex-row gap-8 print:flex-row">
                    {/* Movie Poster */}
                    <div className="w-full md:w-1/3 print:w-1/3">
                        <img
                            src={booking.showtime.movie.poster}
                            alt={booking.showtime.movie.title}
                            className="w-full rounded-lg shadow-md print:shadow-none"
                        />
                    </div>

                    {/* Details */}
                    <div className="w-full md:w-2/3 print:w-2/3 space-y-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 mb-2">{booking.showtime.movie.title}</h1>
                            <p className="text-gray-600">{booking.showtime.movie.genre} | {booking.showtime.movie.duration} min</p>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wide">Theater</p>
                                <p className="font-semibold text-lg">{booking.showtime.theater.name}</p>
                                <p className="text-sm text-gray-600">{booking.showtime.theater.location}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wide">Screen</p>
                                <p className="font-semibold text-lg">{booking.showtime.screen}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wide">Date</p>
                                <p className="font-semibold text-lg">
                                    {new Date(booking.showtime.startTime).toLocaleDateString(undefined, {
                                        weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 uppercase tracking-wide">Time</p>
                                <p className="font-semibold text-lg">
                                    {new Date(booking.showtime.startTime).toLocaleTimeString(undefined, {
                                        hour: '2-digit', minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        </div>

                        <div className="border-t border-dashed border-gray-300 pt-6">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <p className="text-sm text-gray-500 uppercase tracking-wide">Seats</p>
                                    <p className="font-bold text-xl text-red-600">{booking.seats.join(', ')}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500 uppercase tracking-wide">Total Amount</p>
                                    <p className="font-bold text-xl">₹{booking.totalAmount}</p>
                                </div>
                            </div>

                            {/* Barcode Placeholder */}
                            <div className="mt-6 flex justify-center">
                                <div className="h-12 w-full bg-gray-800 opacity-20 rounded"></div>
                            </div>
                            <p className="text-center text-xs text-gray-500 mt-2">Scan this barcode at the entrance</p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions (Hidden in Print) */}
                <div className="bg-gray-50 p-6 flex justify-end gap-4 print:hidden">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition"
                    >
                        Close
                    </button>
                    <button
                        onClick={handlePrint}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2-4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>
                        </svg>
                        Print Ticket
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TicketView;
