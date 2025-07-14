import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import apiClient from '../services/api';
import AppHeader from '../components/AppHeader';

const CheckInScanner = () => {
    const [scanResult, setScanResult] = useState(null);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        const scanner = new Html5QrcodeScanner('reader', { qrbox: { width: 250, height: 250 }, fps: 5 }, false);
        let isScanning = true;
        const onScanSuccess = (decodedText) => {
            if (!isScanning) return;
            isScanning = false;
            scanner.clear();
            setScanResult(decodedText);
            handleCheckIn(decodedText);
        };
        scanner.render(onScanSuccess, () => {});
        return () => { scanner.clear().catch(() => {}); };
    }, []);

    const handleCheckIn = async (qrCodeHash) => {
        setMessage('Processing...'); setIsError(false);
        try {
            const response = await apiClient.post('/admin/check-in', { qrCodeHash });
            setMessage(response.data.message);
        } catch (err) {
            setMessage(err.response?.data?.message || 'An error occurred.');
            setIsError(true);
        }
    };

    return (<div><AppHeader /><main className="container mx-auto p-6 flex flex-col items-center"><div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-lg text-center">
        <h2 className="text-3xl font-bold mb-6">Check-in Scanner</h2>
        {scanResult ? (<div><div className={`p-4 rounded-lg text-white ${isError ? 'bg-red-500' : 'bg-green-500'}`}><p className="font-bold text-lg">{message}</p></div><button onClick={() => window.location.reload()} className="mt-6 w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700">Scan Next</button></div>)
        : (<div><div id="reader" className="w-full"></div><p className="mt-4 text-gray-500">Point camera at a QR code.</p></div>)}
    </div></main></div>);
};
export default CheckInScanner;

