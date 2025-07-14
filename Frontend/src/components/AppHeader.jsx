import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AppHeader = () => {
    const { appUser, logout } = useAuth();
    return (
        <header className="bg-white shadow-md"><nav className="container mx-auto px-6 py-4 flex justify-between items-center">
            <Link to="/" className="text-xl font-bold text-gray-800">BITS Event Manager</Link>
            <div className="flex items-center space-x-4">
                <span className="text-gray-600">{appUser?.displayName} <span className="text-sm font-mono bg-gray-200 text-gray-700 px-2 py-1 rounded">{appUser?.role}</span></span>
                {appUser?.role === 'student' && <Link to="/my-rsvps" className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">My RSVPs</Link>}
                {appUser?.role === 'club_admin' && <div className="flex items-center space-x-2">
                    <Link to="/availability" className="px-3 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 text-sm">Room Availability</Link>
                    <Link to="/create-event" className="px-3 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 text-sm">Create Event</Link>
                    <Link to="/admin/check-in" className="px-3 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 text-sm">Check-in Scanner</Link>
                </div>}
                {appUser?.role === 'staff' && <div className="flex items-center space-x-2">
                    <Link to="/availability" className="px-3 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600 text-sm">Room Availability</Link>
                    <Link to="/admin/role-requests" className="px-3 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 text-sm">Role Requests</Link>
                    <Link to="/admin/event-approvals" className="px-3 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 text-sm">Event Approvals</Link>
                    <Link to="/admin/check-in" className="px-3 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 text-sm">Check-in Scanner</Link>
                </div>}
                <button onClick={logout} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700">Logout</button>
            </div>
        </nav></header>
    );
};
export default AppHeader;

