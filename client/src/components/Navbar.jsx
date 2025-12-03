import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-gray-900 text-white p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                <Link to="/" className="text-2xl font-bold text-red-500">MovieBook</Link>
                <div className="space-x-4">
                    <Link to="/" className="hover:text-red-400">Home</Link>
                    {user ? (
                        <>
                            <Link to="/my-bookings" className="hover:text-red-400">My Bookings</Link>
                            <Link to="/profile" className="hover:text-red-400">Profile</Link>
                            {user.role === 'admin' && (
                                <>
                                    <Link to="/admin" className="hover:text-red-400">Admin</Link>
                                    <Link to="/analytics" className="hover:text-red-400">Analytics</Link>
                                </>
                            )}
                            <button onClick={handleLogout} className="hover:text-red-400">Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="hover:text-red-400">Login</Link>
                            <Link to="/register" className="hover:text-red-400">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
