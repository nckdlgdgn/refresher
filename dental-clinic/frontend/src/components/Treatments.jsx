
import React, { useEffect, useState } from 'react';
import './Treatments.css';
import { API_URL } from '../config';

export default function Treatments() {
  const [treatments, setTreatments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', price: '', duration: '', type: 'SINGLE VISIT' });
  const [editId, setEditId] = useState(null);
  const token = localStorage.getItem('token');

  const fetchTreatments = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/api/treatments`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error('Failed to fetch');
      setTreatments(await res.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTreatments(); }, []);

  const handleFormChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = () => {
    setForm({ name: '', price: '', duration: '', type: 'SINGLE VISIT' });
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = t => {
    setForm({ name: t.name, price: t.price, duration: t.duration, type: t.type });
    setEditId(t.id);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this treatment?')) return;
    await fetch(`${API_URL}/api/treatments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchTreatments();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/api/treatments/${editId}` : `${API_URL}/api/treatments`;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    setShowForm(false);
    fetchTreatments();
  };

  return (
    <div className="treatments-container">
      <div className="treatments-header">
        <h2>🦷 Treatments</h2>
        <button className="add-treatment-btn" onClick={handleAdd}>+ Add Treatment</button>
      </div>
      {error && <div style={{ color: '#c0392b', marginBottom: '1rem' }}>{error}</div>}
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text">Loading treatments...</span>
        </div>
      ) : (
        <div className="treatments-table-wrapper">
          <table className="treatments-table">
            <thead>
              <tr>
                <th>TREATMENT NAME</th>
                <th>PRICE</th>
                <th>ESTIMATE DURATION</th>
                <th>TYPE OF VISIT</th>
                <th>RATING</th>
                <th>REVIEW</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {treatments.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                    No treatments found. Add your first treatment!
                  </td>
                </tr>
              ) : (
                treatments.map((t, index) => (
                  <tr key={t.id} className="stagger-item" style={{ animationDelay: `${index * 0.05}s` }}>
                    <td>{t.name}</td>
                    <td>₱{t.price}</td>
                    <td>{t.duration}</td>
                    <td>
                      <span className={`visit-type ${t.type === 'MULTIPLE VISIT' ? 'multi' : 'single'}`}>{t.type}</span>
                    </td>
                    <td>{t.rating ? t.rating : 'No Rating'}</td>
                    <td>{t.reviews || 0} Review(s)</td>
                    <td>
                      <button onClick={() => handleEdit(t)}>Edit</button>
                      <button onClick={() => handleDelete(t.id)}>Delete</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <div className="treatment-modal" onClick={() => setShowForm(false)}>
          <form className="treatment-form" onClick={e => e.stopPropagation()} onSubmit={handleSubmit}>
            <h3>{editId ? '✏️ Edit Treatment' : '➕ Add Treatment'}</h3>
            <div className="form-group">
              <label>Treatment Name</label>
              <input name="name" placeholder="e.g. Teeth Cleaning" value={form.name} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label>Price (₱)</label>
              <input name="price" placeholder="Enter price" type="number" value={form.price} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label>Duration</label>
              <input name="duration" placeholder="e.g. 30-60 minutes" value={form.duration} onChange={handleFormChange} required />
            </div>
            <div className="form-group">
              <label>Type of Visit</label>
              <select name="type" value={form.type} onChange={handleFormChange}>
                <option value="SINGLE VISIT">SINGLE VISIT</option>
                <option value="MULTIPLE VISIT">MULTIPLE VISIT</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit">{editId ? 'Update Treatment' : 'Add Treatment'}</button>
              <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

