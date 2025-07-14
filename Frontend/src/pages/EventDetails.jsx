import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import QRCode from 'qrcode.react';
import apiClient from '../services/api';
import { useAuth } from '../context/AuthContext';
import AppHeader from '../components/AppHeader';

const EventDetails = () => {
    const { eventId } = useParams();
    const { appUser } = useAuth();
    const [event, setEvent] = useState(null);
    const [myRsvp, setMyRsvp] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchEventAndRsvp = useCallback(async () => {
        setLoading(true);
        const eventRes = await apiClient.get(`/events/${eventId}`);
        setEvent(eventRes.data);
        if (appUser.role === 'student') {
            const rsvpRes = await apiClient.get('/users/my-rsvps');
            setMyRsvp(rsvpRes.data.find(r => r.eventId === eventId));
        }
        setLoading(false);
    }, [eventId, appUser.role]);

    useEffect(() => { fetchEventAndRsvp(); }, [fetchEventAndRsvp]);

    const handleRsvp = async () => {
        await apiClient.post(`/events/${eventId}/rsvp`);
        fetchEventAndRsvp();
    };

    if (loading) return <div>Loading...</div>;
    if (!event) return <div>Event not found.</div>;

    return (<div><AppHeader /><main className="container mx-auto p-6"><div className="bg-white p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
        <img src={event.posterUrl || 'https://placehold.co/1200x600/6366f1/ffffff?text=Event'} alt={`${event.title} Poster`} className="w-full h-64 object-cover rounded-lg mb-6"/>
        <h1 className="text-4xl font-bold mb-2">{event.title}</h1><p className="text-lg text-gray-600 mb-4">Venue: {event.venueName}</p><p className="mb-6">{event.description}</p>
        {appUser.role === 'student' && <div className="mt-6 p-6 bg-gray-50 rounded-lg text-center">
            {myRsvp ? (<div><h3 className="text-2xl font-bold mb-4">Your QR Code</h3><div className="inline-block p-4 bg-white border rounded-lg"><QRCode value={myRsvp.qrCodeHash} size={256} /></div><p className="mt-4 text-gray-600">Show this at the event.</p></div>)
            : (<div><h3 className="text-2xl font-bold mb-4">Register for this Event</h3><button onClick={handleRsvp} className="px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700">RSVP Now</button></div>)}
        </div>}
    </div></main></div>);
};
export default EventDetails;

