import React, { useState, useEffect } from 'react';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [activeTab, setActiveTab] = useState('personal');
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);

    // Form states
    const [profileData, setProfileData] = useState({
        name: '',
        phone: '',
        dateOfBirth: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        }
    });

    const [preferences, setPreferences] = useState({
        favoriteGenres: [],
        emailNotifications: true,
        smsNotifications: false,
        language: 'en'
    });

    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [bookings, setBookings] = useState([]);

    const userToken = JSON.parse(localStorage.getItem('user'))?.token;

    useEffect(() => {
        fetchProfile();
        fetchBookings();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/profile', {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });
            const data = await res.json();
            setUser(data);
            setProfileData({
                name: data.name || '',
                phone: data.phone || '',
                dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '',
                address: data.address || {}
            });
            setPreferences(data.preferences || {});
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
        }
    };

    const fetchBookings = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/profile/bookings', {
                headers: {
                    'Authorization': `Bearer ${userToken}`
                }
            });
            const data = await res.json();
            setBookings(data);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(profileData)
            });

            if (res.ok) {
                alert('Profile updated successfully');
                setEditing(false);
                fetchProfile();
            }
        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    const handleUpdatePreferences = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:5000/api/profile/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(preferences)
            });

            if (res.ok) {
                alert('Preferences updated successfully');
            }
        } catch (error) {
            console.error('Error updating preferences:', error);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/profile/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({
                    currentPassword: passwordData.currentPassword,
                    newPassword: passwordData.newPassword
                })
            });

            const data = await res.json();
            if (res.ok) {
                alert('Password changed successfully');
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                alert(data.message || 'Error changing password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
        }
    };

    const toggleGenre = (genre) => {
        const current = preferences.favoriteGenres || [];
        if (current.includes(genre)) {
            setPreferences({
                ...preferences,
                favoriteGenres: current.filter(g => g !== genre)
            });
        } else {
            setPreferences({
                ...preferences,
                favoriteGenres: [...current, genre]
            });
        }
    };

    if (loading) return <div className="text-center mt-8">Loading profile...</div>;

    const genres = ['Action', 'Drama', 'Comedy', 'Horror', 'Sci-Fi', 'Romance', 'Thriller', 'Crime'];

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <h1 className="text-3xl font-bold mb-6">My Profile</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 border-b overflow-x-auto">
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'personal' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('personal')}
                >
                    Personal Info
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'preferences' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('preferences')}
                >
                    Preferences
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'bookings' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('bookings')}
                >
                    Booking History
                </button>
                <button
                    className={`px-4 py-2 font-medium ${activeTab === 'security' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-600'}`}
                    onClick={() => setActiveTab('security')}
                >
                    Security
                </button>
            </div>

            {/* Personal Info Tab */}
            {activeTab === 'personal' && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">Personal Information</h2>
                        <button
                            onClick={() => setEditing(!editing)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                            {editing ? 'Cancel' : 'Edit'}
                        </button>
                    </div>

                    <form onSubmit={handleUpdateProfile}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    disabled={!editing}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Email</label>
                                <input
                                    type="email"
                                    className="w-full p-2 border rounded bg-gray-100"
                                    value={user?.email}
                                    disabled
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Phone</label>
                                <input
                                    type="tel"
                                    className="w-full p-2 border rounded"
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    disabled={!editing}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    className="w-full p-2 border rounded"
                                    value={profileData.dateOfBirth}
                                    onChange={(e) => setProfileData({ ...profileData, dateOfBirth: e.target.value })}
                                    disabled={!editing}
                                />
                            </div>
                        </div>

                        <h3 className="text-lg font-bold mt-6 mb-3">Address</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium mb-1">Street</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={profileData.address?.street || ''}
                                    onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, street: e.target.value } })}
                                    disabled={!editing}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">City</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={profileData.address?.city || ''}
                                    onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, city: e.target.value } })}
                                    disabled={!editing}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">State</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={profileData.address?.state || ''}
                                    onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, state: e.target.value } })}
                                    disabled={!editing}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Zip Code</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={profileData.address?.zipCode || ''}
                                    onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, zipCode: e.target.value } })}
                                    disabled={!editing}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Country</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={profileData.address?.country || ''}
                                    onChange={(e) => setProfileData({ ...profileData, address: { ...profileData.address, country: e.target.value } })}
                                    disabled={!editing}
                                />
                            </div>
                        </div>

                        {editing && (
                            <button type="submit" className="mt-6 bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600">
                                Save Changes
                            </button>
                        )}
                    </form>
                </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">Preferences</h2>
                    <form onSubmit={handleUpdatePreferences}>
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Favorite Genres</label>
                            <div className="flex flex-wrap gap-2">
                                {genres.map(genre => (
                                    <button
                                        key={genre}
                                        type="button"
                                        onClick={() => toggleGenre(genre)}
                                        className={`px-4 py-2 rounded ${preferences.favoriteGenres?.includes(genre)
                                                ? 'bg-blue-500 text-white'
                                                : 'bg-gray-200 text-gray-700'
                                            }`}
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={preferences.emailNotifications}
                                    onChange={(e) => setPreferences({ ...preferences, emailNotifications: e.target.checked })}
                                />
                                <span>Email Notifications</span>
                            </label>
                        </div>

                        <div className="mb-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="mr-2"
                                    checked={preferences.smsNotifications}
                                    onChange={(e) => setPreferences({ ...preferences, smsNotifications: e.target.checked })}
                                />
                                <span>SMS Notifications</span>
                            </label>
                        </div>

                        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                            Save Preferences
                        </button>
                    </form>
                </div>
            )}

            {/* Booking History Tab */}
            {activeTab === 'bookings' && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">Booking History</h2>
                    {bookings.length === 0 ? (
                        <p className="text-gray-500">No bookings found.</p>
                    ) : (
                        <div className="space-y-4">
                            {bookings.map(booking => (
                                <div key={booking._id} className="border p-4 rounded flex gap-4">
                                    <img src={booking.showtime?.movie?.poster} alt={booking.showtime?.movie?.title} className="w-20 h-28 object-cover rounded" />
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg">{booking.showtime?.movie?.title}</h3>
                                        <p className="text-sm text-gray-600">{booking.showtime?.theater?.name}</p>
                                        <p className="text-sm">{new Date(booking.showtime?.startTime).toLocaleString()}</p>
                                        <p className="text-sm">Seats: {booking.seats?.join(', ')}</p>
                                        <p className="text-sm font-medium">Total: ${booking.totalAmount}</p>
                                        <span className={`text-xs px-2 py-1 rounded ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-2xl font-bold mb-4">Change Password</h2>
                    <form onSubmit={handleChangePassword} className="max-w-md">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Current Password</label>
                            <input
                                type="password"
                                className="w-full p-2 border rounded"
                                value={passwordData.currentPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">New Password</label>
                            <input
                                type="password"
                                className="w-full p-2 border rounded"
                                value={passwordData.newPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Confirm New Password</label>
                            <input
                                type="password"
                                className="w-full p-2 border rounded"
                                value={passwordData.confirmPassword}
                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600">
                            Change Password
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default Profile;
