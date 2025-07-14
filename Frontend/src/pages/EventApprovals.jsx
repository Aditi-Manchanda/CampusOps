import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import AppHeader from '../components/AppHeader';

const EventApprovals = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        const response = await apiClient.get('/admin/pending-events');
        setRequests(response.data);
        setLoading(false);
    }, []);
    useEffect(() => { fetchRequests(); }, [fetchRequests]);
    const handleDecision = async (eventId, decision) => {
        let rejectionReason = '';
        if (decision === 'reject') {
            rejectionReason = prompt("Reason for rejection:");
            if (!rejectionReason) return alert("Rejection requires a reason.");
        }
        await apiClient.post('/admin/decide-event', { eventId, decision, rejectionReason });
        fetchRequests();
    };
    return (<div><AppHeader /><main className="container mx-auto p-6"><h2 className="text-3xl font-bold mb-6">Event Approval Requests</h2><div className="bg-white p-6 rounded-xl shadow-lg">
        {loading ? <p>Loading...</p> : requests.length === 0 ? <p>No pending requests.</p> : (<div className="space-y-4">{requests.map(req => (<div key={req.id} className="p-4 border rounded-lg flex justify-between items-center">
            <div><h3 className="font-bold text-lg">{req.title}</h3><p className="text-sm text-gray-600">Venue: {req.venueName} | Time: {new Date(req.startTime.seconds * 1000).toLocaleString()}</p></div>
            <div className="space-x-2"><button onClick={() => handleDecision(req.id, 'approve')} className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">Approve</button><button onClick={() => handleDecision(req.id, 'reject')} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600">Reject</button></div>
        </div>))}</div>)}
    </div></main></div>);
};
export default EventApprovals;

