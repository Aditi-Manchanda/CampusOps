import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import AppHeader from '../components/AppHeader';
import QRCode from 'qrcode.react';

const MyRsvps = () => {
    const [rsvps, setRsvps] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const fetchRsvps = async () => {
            const response = await apiClient.get('/users/my-rsvps');
            setRsvps(response.data);
            setLoading(false);
        };
        fetchRsvps();
    }, []);
    return (<div><AppHeader /><main className="container mx-auto p-6"><h2 className="text-3xl font-bold mb-6">My Registrations</h2>{loading ? <p>Loading...</p> : (<div className="space-y-6">
        {rsvps.length > 0 ? rsvps.map(({ event, qrCodeHash, status }) => (event && <div key={event.id} className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between">
            <div><h3 className="text-xl font-bold">{event.title}</h3><p className="text-gray-600">Venue: {event.venueName}</p><p className={`mt-2 text-sm font-bold ${status === 'checked_in' ? 'text-green-600' : 'text-blue-600'}`}>Status: {status.charAt(0).toUpperCase() + status.slice(1)}</p></div>
            <div className="text-center"><QRCode value={qrCodeHash} size={128} /><p className="text-xs mt-2 text-gray-500">Check-in Code</p></div>
        </div>)) : <p>You have not registered for any events yet.</p>}
    </div>)}</main></div>);
};
export default MyRsvps;

