import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import MapPicker from '../components/MapPicker';
import { classroomAPI } from '../services/classroom.api';

const AdminClassrooms = () => {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', building: '', room: '', latitude: '', longitude: '', accuracyMeters: 15 });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') loadList();
  }, [user]);

  const loadList = async () => {
    setLoading(true);
    try {
      const res = await classroomAPI.list();
      setList(res.data || res);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleMapChange = ({ latitude, longitude }) => {
    setForm({ ...form, latitude, longitude });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const payload = {
        name: form.name,
        building: form.building,
        room: form.room,
        latitude: parseFloat(form.latitude),
        longitude: parseFloat(form.longitude),
        accuracyMeters: parseInt(form.accuracyMeters, 10) || 15
      };

      if (editingId) {
        await classroomAPI.update(editingId, payload);
        setEditingId(null);
      } else {
        await classroomAPI.create(payload);
      }

      setForm({ name: '', building: '', room: '', latitude: '', longitude: '', accuracyMeters: 15 });
      await loadList();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name || '', building: c.building || '', room: c.room || '', latitude: c.latitude, longitude: c.longitude, accuracyMeters: c.accuracyMeters || 15 });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this classroom?')) return;
    try {
      await classroomAPI.remove(id);
      await loadList();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  if (user?.role !== 'admin') return <div className="p-6">Access denied.</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin — Classrooms</h1>

      <form onSubmit={handleSubmit} className="grid gap-3 grid-cols-1 md:grid-cols-3 mb-6">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name (e.g. CS101 - R203)" className="p-2 border rounded" required />
        <input name="building" value={form.building} onChange={handleChange} placeholder="Building" className="p-2 border rounded" />
        <input name="room" value={form.room} onChange={handleChange} placeholder="Room" className="p-2 border rounded" />

        <div className="md:col-span-3">
          <label className="block text-sm mb-2">Pick classroom on map (click map to set coordinates)</label>
          <MapPicker latitude={form.latitude} longitude={form.longitude} radius={parseInt(form.accuracyMeters, 10) || 15} onChange={handleMapChange} />
        </div>

        <input name="latitude" value={form.latitude} onChange={handleChange} placeholder="Latitude" className="p-2 border rounded" required />
        <input name="longitude" value={form.longitude} onChange={handleChange} placeholder="Longitude" className="p-2 border rounded" required />
        <input name="accuracyMeters" value={form.accuracyMeters} onChange={handleChange} placeholder="Radius (meters)" className="p-2 border rounded" />

        <div className="md:col-span-3 flex gap-2">
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">{editingId ? 'Update Classroom' : 'Add Classroom'}</button>
          {editingId && <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', building: '', room: '', latitude: '', longitude: '', accuracyMeters: 15 }); }} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>}
        </div>
      </form>

      {error && <div className="mb-4 text-red-600">{error}</div>}

      <div className="bg-white/5 p-4 rounded">
        <h2 className="font-semibold mb-2">Existing Classrooms</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ul className="space-y-3">
            {list.length === 0 && <li>No classrooms yet.</li>}
            {list.map((c) => (
              <li key={c._id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{c.name}</div>
                  <div className="text-sm text-gray-300">{c.building} {c.room ? `• ${c.room}` : ''}</div>
                  <div className="text-xs text-gray-400">{c.latitude.toFixed(6)}, {c.longitude.toFixed(6)} • radius {c.accuracyMeters}m</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(c)} className="px-3 py-1 bg-yellow-500 rounded text-sm">Edit</button>
                  <button onClick={() => handleDelete(c._id)} className="px-3 py-1 bg-red-600 rounded text-sm text-white">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminClassrooms;
