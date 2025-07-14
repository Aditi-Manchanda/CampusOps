import React, { useState, useEffect, useCallback } from 'react';
import apiClient from '../services/api';
import AppHeader from '../components/AppHeader';

const AdminDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const fetchRequests = useCallback(async () => {
        setLoading(true);
        const response = await apiClient.get('/admin/role-requests');
        setRequests(response.data);
        setLoading(false);
    }, []);
    useEffect(() => { fetchRequests(); }, [fetchRequests]);
    const handleDecision = async (userId, decision) => {
        await apiClient.post('/admin/decide-role', { userId, decision });
        fetchRequests();
    };
    return (<div><AppHeader /><main className="container mx-auto p-6"><h2 className="text-3xl font-bold mb-6">Role Approval Requests</h2><div className="bg-white p-6 rounded-xl shadow-lg">
        {loading ? <p>Loading...</p> : requests.length === 0 ? <p>No pending requests.</p> : (<div className="overflow-x-auto"><table className="min-w-full bg-white">
            <thead className="bg-gray-200"><tr><th className="py-2 px-4 border-b">User</th><th className="py-2 px-4 border-b">Requested Role</th><th className="py-2 px-4 border-b">Club</th><th className="py-2 px-4 border-b">Actions</th></tr></thead>
            <tbody>{requests.map(req => (<tr key={req.id} className="text-center">
                <td className="py-2 px-4 border-b">{req.email}</td><td className="py-2 px-4 border-b">{req.requestedRole}</td><td className="py-2 px-4 border-b">{req.associatedClub || 'N/A'}</td>
                <td className="py-2 px-4 border-b"><button onClick={() => handleDecision(req.id, 'approve')} className="bg-green-500 text-white px-3 py-1 rounded mr-2 hover:bg-green-600">Approve</button><button onClick={() => handleDecision(req.id, 'reject')} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Reject</button></td>
            </tr>))}</tbody>
        </table></div>)}
    </div></main></div>);
};
export default AdminDashboard;

