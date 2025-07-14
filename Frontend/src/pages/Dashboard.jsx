import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import AppHeader from '../components/AppHeader';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

const Dashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const eventTags = ["technical", "cultural", "talk", "workshop", "sports", "fest"];

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            const params = new URLSearchParams();
            if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
            if (selectedTag) params.append('tag', selectedTag);
            const response = await apiClient.get(`/events?${params.toString()}`);
            setEvents(response.data);
            setLoading(false);
        };
        fetchEvents();
    }, [debouncedSearchTerm, selectedTag]);

    return (<div><AppHeader /><main className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">Upcoming Events</h2>
            <div className="flex items-center space-x-4">
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="p-2 border rounded" />
                <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)} className="p-2 border rounded bg-white">
                    <option value="">All Tags</option>
                    {eventTags.map(tag => <option key={tag} value={tag}>{tag.charAt(0).toUpperCase() + tag.slice(1)}</option>)}
                </select>
            </div>
        </div>
        {loading ? <p>Loading...</p> : (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.length > 0 ? events.map(event => (<Link to={`/event/${event.id}`} key={event.id} className="bg-white rounded-xl shadow-lg overflow-hidden transform hover:-translate-y-1 transition-transform">
                <img src={event.posterUrl || 'https://placehold.co/600x400/6366f1/ffffff?text=Event'} alt={`${event.title} Poster`} className="w-full h-48 object-cover"/>
                <div className="p-6">
                    <h3 className="text-xl font-bold truncate">{event.title}</h3><p className="text-gray-600">Venue: {event.venueName}</p>
                    <p className="text-gray-500 text-sm mt-2">{new Date(event.startTime.seconds * 1000).toLocaleString()}</p>
                    <div className="mt-4 flex flex-wrap gap-2">{event.tags?.map(tag => <span key={tag} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-semibold rounded-full">{tag}</span>)}</div>
                </div>
            </Link>)) : <p className="col-span-full text-center text-gray-500">No events match your criteria.</p>}
        </div>)}
    </main></div>);
};
export default Dashboard;

