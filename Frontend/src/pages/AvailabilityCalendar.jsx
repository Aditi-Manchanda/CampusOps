import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import apiClient from '../services/api';
import AppHeader from '../components/AppHeader';

const AvailabilityCalendar = () => {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchRooms = async () => {
            const response = await apiClient.get('/rooms');
            setRooms(response.data);
            if (response.data.length > 0) setSelectedRoom(response.data[0].id);
        };
        fetchRooms();
    }, []);

    useEffect(() => {
        if (!selectedRoom || !selectedDate) return;
        const fetchBookings = async () => {
            setLoading(true);
            const dateString = selectedDate.toISOString().split('T')[0];
            const response = await apiClient.get(`/rooms/bookings?roomId=${selectedRoom}&date=${dateString}`);
            setBookings(response.data);
            setLoading(false);
        };
        fetchBookings();
    }, [selectedRoom, selectedDate]);

    const renderTimeSlots = () => Array.from({ length: 15 }, (_, i) => i + 8).map(hour => <div key={hour} className="relative h-12 border-t border-gray-200"><span className="absolute -left-12 top-[-0.75rem] text-xs text-gray-500">{`${hour}:00`}</span></div>);
    const getBookingStyle = (booking) => {
        const start = new Date(booking.startTime.seconds * 1000);
        const end = new Date(booking.endTime.seconds * 1000);
        const startHour = start.getHours() + start.getMinutes() / 60;
        const endHour = end.getHours() + end.getMinutes() / 60;
        return { top: `${(startHour - 8) * 3}rem`, height: `${(endHour - startHour) * 3}rem` };
    };

    return (<div><AppHeader /><main className="container mx-auto p-6"><h2 className="text-3xl font-bold mb-6">Room Availability</h2><div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="flex items-center space-x-4 mb-6">
            <div><label className="block text-sm font-medium">Select Room</label><select value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} className="mt-1 block w-full p-2 border rounded">{rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium">Select Date</label><DatePicker selected={selectedDate} onChange={date => setSelectedDate(date)} className="mt-1 block w-full p-2 border rounded" /></div>
        </div>
        <div className="relative pl-12 pt-4">{renderTimeSlots()}{loading ? <p>Loading...</p> : bookings.map(booking => <div key={booking.id} style={getBookingStyle(booking)} className={`absolute left-12 right-0 p-2 rounded-lg text-white ${booking.status === 'confirmed' ? 'bg-red-500' : 'bg-yellow-500'}`}><p className="font-bold text-sm">{booking.status === 'confirmed' ? 'Booked' : 'Pending'}</p></div>)}</div>
    </div></main></div>);
};
export default AvailabilityCalendar;
