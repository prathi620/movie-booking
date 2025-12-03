import React, { useState, useEffect } from 'react';

const TheaterManager = () => {
    const [theaters, setTheaters] = useState([]);
    const [editingTheater, setEditingTheater] = useState(null);
    const [newTheater, setNewTheater] = useState({
        name: '', location: '', screens: []
    });
    const [showForm, setShowForm] = useState(false);

    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchTheaters();
    }, []);

    const fetchTheaters = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/theaters');
            const data = await res.json();
            setTheaters(data);
        } catch (error) {
            console.error('Error fetching theaters:', error);
        }
    };

    const handleSaveTheater = async (e) => {
        e.preventDefault();
        const theaterData = editingTheater || newTheater;

        // Ensure at least one screen if none provided
        if (!theaterData.screens || theaterData.screens.length === 0) {
            theaterData.screens = [{ name: 'Screen 1', seats: 50 }];
        }

        const url = editingTheater
            ? `http://localhost:5000/api/theaters/${editingTheater._id}`
            : 'http://localhost:5000/api/theaters';

        const method = editingTheater ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`,
                },
                body: JSON.stringify(theaterData),
            });

            if (res.ok) {
                alert(editingTheater ? 'Theater updated!' : 'Theater added!');
                fetchTheaters();
                setEditingTheater(null);
                setNewTheater({ name: '', location: '', screens: [] });
                setShowForm(false);
            } else {
                const data = await res.json();
                alert(data.message || 'Error saving theater');
            }
        } catch (error) {
            console.error(error);
            alert('Error saving theater');
        }
    };

    const handleDeleteTheater = async (id) => {
        if (!window.confirm('Are you sure? This will delete the theater and all its showtimes.')) return;

        try {
            const res = await fetch(`http://localhost:5000/api/theaters/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
            });

            if (res.ok) {
                alert('Theater deleted');
                fetchTheaters();
            } else {
                alert('Error deleting theater');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleScreenChange = (index, field, value) => {
        const currentTheater = editingTheater || newTheater;
        const updatedScreens = [...(currentTheater.screens || [])];

        if (!updatedScreens[index]) {
            updatedScreens[index] = { name: '', seats: 0 };
        }

        updatedScreens[index] = { ...updatedScreens[index], [field]: value };

        if (editingTheater) {
            setEditingTheater({ ...editingTheater, screens: updatedScreens });
        } else {
            setNewTheater({ ...newTheater, screens: updatedScreens });
        }
    };

    const addScreen = () => {
        const currentTheater = editingTheater || newTheater;
        const updatedScreens = [...(currentTheater.screens || []), { name: `Screen ${(currentTheater.screens?.length || 0) + 1}`, seats: 50 }];

        if (editingTheater) {
            setEditingTheater({ ...editingTheater, screens: updatedScreens });
        } else {
            setNewTheater({ ...newTheater, screens: updatedScreens });
        }
    };

    const removeScreen = (index) => {
        const currentTheater = editingTheater || newTheater;
        const updatedScreens = currentTheater.screens.filter((_, i) => i !== index);

        if (editingTheater) {
            setEditingTheater({ ...editingTheater, screens: updatedScreens });
        } else {
            setNewTheater({ ...newTheater, screens: updatedScreens });
        }
    };

    const startEdit = (theater) => {
        setEditingTheater(theater);
        setShowForm(true);
    };

    const cancelEdit = () => {
        setEditingTheater(null);
        setNewTheater({ name: '', location: '', screens: [] });
        setShowForm(false);
    };

    const currentTheater = editingTheater || newTheater;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Manage Theaters</h2>
                <button
                    onClick={() => { setEditingTheater(null); setShowForm(true); }}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                    Add New Theater
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded shadow-md mb-8">
                    <h3 className="text-xl font-bold mb-4">{editingTheater ? 'Edit Theater' : 'Add New Theater'}</h3>
                    <form onSubmit={handleSaveTheater}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={currentTheater.name}
                                    onChange={e => editingTheater ? setEditingTheater({ ...editingTheater, name: e.target.value }) : setNewTheater({ ...newTheater, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                <input
                                    type="text"
                                    className="w-full p-2 border rounded"
                                    value={currentTheater.location}
                                    onChange={e => editingTheater ? setEditingTheater({ ...editingTheater, location: e.target.value }) : setNewTheater({ ...newTheater, location: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Screens & Layout</label>
                                <button type="button" onClick={addScreen} className="text-sm text-blue-600 hover:text-blue-800">+ Add Screen</button>
                            </div>
                            {currentTheater.screens?.map((screen, index) => (
                                <div key={index} className="flex gap-4 mb-2 items-center bg-gray-50 p-2 rounded">
                                    <input
                                        type="text"
                                        placeholder="Screen Name"
                                        className="p-2 border rounded flex-1"
                                        value={screen.name}
                                        onChange={e => handleScreenChange(index, 'name', e.target.value)}
                                        required
                                    />
                                    <input
                                        type="number"
                                        placeholder="Seats"
                                        className="p-2 border rounded w-24"
                                        value={screen.seats}
                                        onChange={e => handleScreenChange(index, 'seats', parseInt(e.target.value))}
                                        required
                                    />
                                    <button type="button" onClick={() => removeScreen(index)} className="text-red-500 hover:text-red-700">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-2 justify-end">
                            <button type="button" onClick={cancelEdit} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">Cancel</button>
                            <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">{editingTheater ? 'Update Theater' : 'Save Theater'}</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {theaters.map(theater => (
                    <div key={theater._id} className="bg-white p-6 rounded shadow-md border border-gray-100">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">{theater.name}</h3>
                                <p className="text-gray-600">{theater.location}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => startEdit(theater)} className="text-blue-500 hover:text-blue-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                                </button>
                                <button onClick={() => handleDeleteTheater(theater._id)} className="text-red-500 hover:text-red-700">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                                </button>
                            </div>
                        </div>
                        <div className="border-t pt-4">
                            <p className="text-sm font-semibold text-gray-500 mb-2">Screens ({theater.screens.length})</p>
                            <div className="flex flex-wrap gap-2">
                                {theater.screens.map((screen, idx) => (
                                    <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                                        {screen.name}: {screen.seats} seats
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TheaterManager;
