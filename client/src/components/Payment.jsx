import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Payment = ({ bookingDetails, onSuccess, onCancel }) => {
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [processing, setProcessing] = useState(false);
    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardName: '',
        expiryDate: '',
        cvv: ''
    });
    const [upiId, setUpiId] = useState('');
    const [walletType, setWalletType] = useState('');
    const navigate = useNavigate();

    const { selectedSeats, totalAmount, showtime } = bookingDetails;

    const handleCardChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        if (name === 'cardNumber') {
            formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            if (formattedValue.length > 19) return;
        } else if (name === 'expiryDate') {
            formattedValue = value.replace(/\D/g, '');
            if (formattedValue.length >= 2) {
                formattedValue = formattedValue.slice(0, 2) + '/' + formattedValue.slice(2, 4);
            }
            if (formattedValue.length > 5) return;
        } else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 3);
        }

        setCardDetails({ ...cardDetails, [name]: formattedValue });
    };

    const validateCardDetails = () => {
        const { cardNumber, cardName, expiryDate, cvv } = cardDetails;

        if (!cardNumber || cardNumber.replace(/\s/g, '').length !== 16) {
            alert('Please enter a valid 16-digit card number');
            return false;
        }
        if (!cardName || cardName.trim().length < 3) {
            alert('Please enter the cardholder name');
            return false;
        }
        if (!expiryDate || expiryDate.length !== 5) {
            alert('Please enter a valid expiry date (MM/YY)');
            return false;
        }
        if (!cvv || cvv.length !== 3) {
            alert('Please enter a valid 3-digit CVV');
            return false;
        }
        return true;
    };

    const validateUPI = () => {
        if (!upiId || !upiId.includes('@')) {
            alert('Please enter a valid UPI ID');
            return false;
        }
        return true;
    };

    const validateWallet = () => {
        if (!walletType) {
            alert('Please select a wallet');
            return false;
        }
        return true;
    };

    const processPayment = async () => {
        // Validate based on payment method
        if (paymentMethod === 'card' && !validateCardDetails()) return;
        if (paymentMethod === 'upi' && !validateUPI()) return;
        if (paymentMethod === 'wallet' && !validateWallet()) return;

        setProcessing(true);

        // Simulate payment processing
        setTimeout(async () => {
            try {
                const user = JSON.parse(localStorage.getItem('user'));

                const response = await fetch('http://localhost:5000/api/bookings', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${user.token}`
                    },
                    body: JSON.stringify({
                        showtime: showtime._id,
                        seats: selectedSeats,
                        totalAmount: totalAmount,
                        paymentMethod: paymentMethod,
                        paymentDetails: {
                            method: paymentMethod,
                            timestamp: new Date().toISOString(),
                            transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
                        }
                    })
                });

                if (response.ok) {
                    const booking = await response.json();
                    setProcessing(false);
                    onSuccess(booking);
                } else {
                    setProcessing(false);
                    alert('Payment failed. Please try again.');
                }
            } catch (error) {
                console.error('Payment error:', error);
                setProcessing(false);
                alert('Payment failed. Please try again.');
            }
        }, 2000); // Simulate network delay
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-lg">
                    <h2 className="text-2xl font-bold">Secure Payment</h2>
                    <p className="text-red-100 mt-1">Complete your booking</p>
                </div>

                {/* Booking Summary */}
                <div className="p-6 bg-gray-50 border-b">
                    <h3 className="font-semibold text-lg mb-3">Booking Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Movie:</span>
                            <span className="font-semibold">{showtime.movie.title}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Theater:</span>
                            <span className="font-semibold">{showtime.theater.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Seats:</span>
                            <span className="font-semibold">{selectedSeats.join(', ')}</span>
                        </div>
                        <div className="flex justify-between text-lg font-bold text-red-600 pt-2 border-t">
                            <span>Total Amount:</span>
                            <span>₹{totalAmount}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Method Selection */}
                <div className="p-6">
                    <h3 className="font-semibold text-lg mb-4">Select Payment Method</h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                        <button
                            onClick={() => setPaymentMethod('card')}
                            className={`p-4 border-2 rounded-lg transition ${paymentMethod === 'card'
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 hover:border-red-300'
                                }`}
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-2">💳</div>
                                <div className="font-semibold">Card</div>
                                <div className="text-xs text-gray-600">Credit/Debit</div>
                            </div>
                        </button>

                        <button
                            onClick={() => setPaymentMethod('upi')}
                            className={`p-4 border-2 rounded-lg transition ${paymentMethod === 'upi'
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 hover:border-red-300'
                                }`}
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-2">📱</div>
                                <div className="font-semibold">UPI</div>
                                <div className="text-xs text-gray-600">Google Pay, PhonePe</div>
                            </div>
                        </button>

                        <button
                            onClick={() => setPaymentMethod('wallet')}
                            className={`p-4 border-2 rounded-lg transition ${paymentMethod === 'wallet'
                                    ? 'border-red-500 bg-red-50'
                                    : 'border-gray-300 hover:border-red-300'
                                }`}
                        >
                            <div className="text-center">
                                <div className="text-2xl mb-2">👛</div>
                                <div className="font-semibold">Wallet</div>
                                <div className="text-xs text-gray-600">PayPal, Paytm</div>
                            </div>
                        </button>
                    </div>

                    {/* Payment Forms */}
                    {paymentMethod === 'card' && (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    placeholder="1234 5678 9012 3456"
                                    value={cardDetails.cardNumber}
                                    onChange={handleCardChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                                <input
                                    type="text"
                                    name="cardName"
                                    placeholder="JOHN DOE"
                                    value={cardDetails.cardName}
                                    onChange={handleCardChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        placeholder="MM/YY"
                                        value={cardDetails.expiryDate}
                                        onChange={handleCardChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">CVV</label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        placeholder="123"
                                        value={cardDetails.cvv}
                                        onChange={handleCardChange}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {paymentMethod === 'upi' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">UPI ID</label>
                            <input
                                type="text"
                                placeholder="yourname@upi"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                            <p className="text-sm text-gray-600 mt-2">Enter your UPI ID (e.g., 9876543210@paytm)</p>
                        </div>
                    )}

                    {paymentMethod === 'wallet' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Select Wallet</label>
                            <select
                                value={walletType}
                                onChange={(e) => setWalletType(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                                <option value="">Choose a wallet</option>
                                <option value="paytm">Paytm</option>
                                <option value="paypal">PayPal</option>
                                <option value="googlepay">Google Pay</option>
                                <option value="phonepe">PhonePe</option>
                                <option value="amazonpay">Amazon Pay</option>
                            </select>
                        </div>
                    )}

                    {/* Security Badge */}
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-800">
                            <span className="text-xl">🔒</span>
                            <div>
                                <div className="font-semibold">Secure Payment</div>
                                <div className="text-sm">Your payment information is encrypted and secure</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-gray-50 rounded-b-lg flex gap-4">
                    <button
                        onClick={onCancel}
                        disabled={processing}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-100 transition disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={processPayment}
                        disabled={processing}
                        className="flex-1 px-6 py-3 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {processing ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Processing...
                            </>
                        ) : (
                            <>Pay ₹{totalAmount}</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Payment;
