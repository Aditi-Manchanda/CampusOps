import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import AppHeader from '../components/AppHeader';

const CreateEvent = () => {
    const [rooms, setRooms] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', venueId: '', startTime: '', endTime: '', tags: '' });
    const [posterFile, setPosterFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRooms = async () => {
            const response = await apiClient.get('/rooms');
            setRooms(response.data);
        };
        fetchRooms();
    }, []);

    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleFileChange = (e) => setPosterFile(e.target.files[0]);

    const handleSubmit = async (e) => {
        e.preventDefault(); setLoading(true); setError(''); setSuccess('');
        const eventData = new FormData();
        Object.keys(formData).forEach(key => eventData.append(key, formData[key]));
        if (posterFile) eventData.append('poster', posterFile);
        try {
            const response = await apiClient.post('/events', eventData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setSuccess(response.data.message);
            setTimeout(() => navigate('/'), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'An error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (<div><AppHeader /><main className="container mx-auto p-6"><div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg"><h2 className="text-3xl font-bold mb-6">Create New Event</h2><form onSubmit={handleSubmit} className="space-y-6">
        <div><label htmlFor="title" className="block text-sm font-medium">Event Title</label><input type="text" name="title" value={formData.title} onChange={handleChange} className="mt-1 block w-full p-3 border rounded" required /></div>
        <div><label htmlFor="description" className="block text-sm font-medium">Description</label><textarea name="description" rows="4" value={formData.description} onChange={handleChange} className="mt-1 block w-full p-3 border rounded"></textarea></div>
        <div><label htmlFor="tags" className="block text-sm font-medium">Tags (comma-separated)</label><input type="text" name="tags" value={formData.tags} onChange={handleChange} className="mt-1 block w-full p-3 border rounded" placeholder="e.g. technical,talk,workshop" /></div>
        <div className="grid md:grid-cols-2 gap-6">
            <div><label htmlFor="venueId" className="block text-sm font-medium">Venue</label><select name="venueId" value={formData.venueId} onChange={handleChange} className="mt-1 block w-full p-3 border rounded bg-white" required><option value="" disabled>Select a room</option>{rooms.map(room => <option key={room.id} value={room.id}>{room.name} (Capacity: {room.capacity})</option>)}</select></div>
            <div><label htmlFor="poster" className="block text-sm font-medium">Event Poster</label><input type="file" name="poster" onChange={handleFileChange} className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-indigo-50 hover:file:bg-indigo-100"/></div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
             <div><label htmlFor="startTime" className="block text-sm font-medium">Start Time</label><input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} className="mt-1 block w-full p-3 border rounded" required /></div>
             <div><label htmlFor="endTime" className="block text-sm font-medium">End Time</label><input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} className="mt-1 block w-full p-3 border rounded" required /></div>
        </div>
        {error && <div className="p-4 rounded bg-red-50 text-red-700">{error}</div>}
        {success && <div className="p-4 rounded bg-green-50 text-green-700">{success}</div>}
        <div><button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 rounded shadow-sm text-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400">{loading ? 'Creating...' : 'Create Event'}</button></div>
    </form></div></main></div>);
};
export default CreateEvent;

