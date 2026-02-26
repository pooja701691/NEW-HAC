import React, { useEffect, useRef, useState } from 'react';
import { attendanceAPI } from '../services/attendance.api';

const StudentScanner = ({ onMarked }) => {
  const videoRef = useRef(null);
  const [supported, setSupported] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (window.BarcodeDetector) {
      setSupported(true);
    } else {
      setSupported(false);
    }
  }, []);

  const getLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition((p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }), reject, { enableHighAccuracy: true });
  });

  const startScan = async () => {
    setStatus(null);
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) videoRef.current.srcObject = stream;

      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });

      const loop = async () => {
        if (!scanning) return;
        try {
          const detections = await detector.detect(videoRef.current);
          if (detections && detections.length) {
            const code = detections[0].rawValue;
            // Stop scanning
            setScanning(false);
            // Stop camera
            stream.getTracks().forEach(t => t.stop());

            // Get location and post attendance
            setStatus('Getting location...');
            const loc = await getLocation();
            setStatus('Marking attendance...');
            const res = await attendanceAPI.markAttendance({ qrToken: code, latitude: loc.latitude, longitude: loc.longitude });
            if (res.success) {
              setStatus('Attendance marked ✅');
              onMarked && onMarked(res);
            } else {
              setStatus(res.message || 'Failed to mark');
            }
            return;
          }
        } catch (err) {
          // ignore detection errors
        }
        requestAnimationFrame(loop);
      };

      requestAnimationFrame(loop);
    } catch (err) {
      setScanning(false);
      setStatus('Camera error: ' + (err.message || err));
    }
  };

  const stopScan = () => {
    setScanning(false);
    const stream = videoRef.current?.srcObject;
    if (stream) stream.getTracks().forEach(t => t.stop());
    videoRef.current && (videoRef.current.srcObject = null);
  };

  return (
    <div className="p-4 bg-white/5 rounded">
      {!supported && (
        <div>
          <p>Camera QR scanning not supported in this browser. Use manual QR entry.</p>
        </div>
      )}

      {supported && (
        <div>
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-64 object-cover rounded" />
          <div className="flex gap-2 mt-2">
            {!scanning ? (
              <button onClick={startScan} className="px-3 py-2 bg-green-600 rounded text-white">Start Scan</button>
            ) : (
              <button onClick={stopScan} className="px-3 py-2 bg-red-600 rounded text-white">Stop</button>
            )}
            <div className="text-sm text-gray-200">{status}</div>
          </div>
        </div>
      )}

      <div className="mt-3">
        <label className="block text-sm mb-1">Manual QR token</label>
        <ManualEntry onMarked={onMarked} setStatus={setStatus} />
      </div>
    </div>
  );
};

const ManualEntry = ({ onMarked, setStatus }) => {
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);

  const getLocation = () => new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation not supported'));
    navigator.geolocation.getCurrentPosition((p) => resolve({ latitude: p.coords.latitude, longitude: p.coords.longitude }), reject, { enableHighAccuracy: true });
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Getting location...');
    try {
      const loc = await getLocation();
      setStatus('Marking attendance...');
      const res = await attendanceAPI.markAttendance({ qrToken: value.trim(), latitude: loc.latitude, longitude: loc.longitude });
      if (res.success) {
        setStatus('Attendance marked ✅');
        onMarked && onMarked(res);
      } else {
        setStatus(res.message || 'Failed to mark');
      }
    } catch (err) {
      setStatus(err.message || 'Error getting location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Paste QR token" className="p-2 rounded bg-white/5 flex-1" />
      <button type="submit" disabled={loading} className="px-3 py-2 bg-blue-600 rounded text-white">Mark</button>
    </form>
  );
};

export default StudentScanner;
