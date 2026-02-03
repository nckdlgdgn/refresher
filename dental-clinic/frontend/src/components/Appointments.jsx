
import React, { useEffect, useState } from 'react';
import './Appointments.css';
import { API_URL } from '../config';

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient: '', dentist: '', date: '', time: '', service: '', status: 'Pending' });
  const [editId, setEditId] = useState(null);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [patientSearch, setPatientSearch] = useState('');
  const [dentistSearch, setDentistSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const [showDentistDropdown, setShowDentistDropdown] = useState(false);
  const token = localStorage.getItem('token');

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [a, p, d] = await Promise.all([
        fetch(`${API_URL}/api/appointments`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/patients`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_URL}/api/dentists`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (!a.ok || !p.ok || !d.ok) throw new Error('Failed to fetch');
      setAppointments(await a.json());
      setPatients(await p.json());
      setDentists(await d.json());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleFormChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleAdd = () => {
    setForm({ patient: '', dentist: '', date: '', time: '', service: '', status: 'Pending' });
    setPatientSearch('');
    setDentistSearch('');
    setEditId(null);
    setShowForm(true);
  };

  const handleEdit = a => {
    const patient = patients.find(p => p.id === a.patient);
    const dentist = dentists.find(d => d.id === a.dentist);
    setForm({ patient: a.patient, dentist: a.dentist, date: a.date, time: a.time, service: a.service, status: a.status });
    setPatientSearch(patient ? patient.name : '');
    setDentistSearch(dentist ? dentist.name : '');
    setEditId(a.id);
    setShowForm(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this appointment?')) return;
    await fetch(`${API_URL}/api/appointments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    fetchAll();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/api/appointments/${editId}` : `${API_URL}/api/appointments`;
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    if (!res.ok) {
      const data = await res.json();
      setError(data.message || 'Error');
      return;
    }
    setShowForm(false);
    fetchAll();
  };

  return (
    <div className="treatments-container">
      <div className="treatments-header">
        <h2>Appointments</h2>
        <button className="add-treatment-btn gradient-btn" onClick={handleAdd}>+ Add Appointment</button>
      </div>
      {error && <div style={{color:'#c0392b',marginBottom:'1rem'}}>{error}</div>}
      {loading ? <div>Loading...</div> : (
        <div className="treatments-table-wrapper">
          <table className="treatments-table">
            <thead>
              <tr>
                <th>PATIENT</th>
                <th>DENTIST</th>
                <th>DATE</th>
                <th>TIME</th>
                <th>SERVICE</th>
                <th>STATUS</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a.id}>
                  <td>{patients.find(p=>p.id===a.patient)?.name || a.patient}</td>
                  <td>{dentists.find(d=>d.id===a.dentist)?.name || a.dentist}</td>
                  <td>{a.date}</td>
                  <td>{a.time}</td>
                  <td>{a.service}</td>
                  <td>{a.status}</td>
                  <td>
                    <button onClick={() => handleEdit(a)} style={{marginRight:8}}>Edit</button>
                    <button onClick={() => handleDelete(a.id)} style={{color:'#c0392b'}}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {showForm && (
        <div className="treatment-modal" onClick={() => setShowForm(false)}>
          <form className="treatment-form" onSubmit={handleSubmit} onClick={e => e.stopPropagation()}>
            <h3>{editId ? 'Edit' : 'Add'} Appointment</h3>
            
            <div className="form-group searchable-dropdown">
              <label>Patient</label>
              <input
                type="text"
                placeholder="Search patient by name..."
                value={patientSearch}
                onChange={e => {
                  setPatientSearch(e.target.value);
                  setShowPatientDropdown(true);
                  if (e.target.value === '') {
                    setForm({...form, patient: ''});
                  }
                }}
                onFocus={() => setShowPatientDropdown(true)}
                onBlur={() => setTimeout(() => setShowPatientDropdown(false), 200)}
              />
              {showPatientDropdown && patientSearch && (
                <div className="search-dropdown">
                  {patients
                    .filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()))
                    .length === 0 ? (
                      <div className="search-item no-result">No patients found</div>
                    ) : (
                      patients
                        .filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()))
                        .map(p => (
                          <div
                            key={p.id}
                            className="search-item"
                            onClick={() => {
                              setForm({...form, patient: p.id});
                              setPatientSearch(p.name);
                              setShowPatientDropdown(false);
                            }}
                          >
                            <span className="item-name">{p.name}</span>
                            {p.age && <span className="item-badge">Age: {p.age}</span>}
                            {p.contact && <span className="item-contact">{p.contact}</span>}
                          </div>
                        ))
                    )
                  }
                </div>
              )}
            </div>
            
            <div className="form-group searchable-dropdown">
              <label>Dentist</label>
              <input
                type="text"
                placeholder="Search dentist by name..."
                value={dentistSearch}
                onChange={e => {
                  setDentistSearch(e.target.value);
                  setShowDentistDropdown(true);
                  if (e.target.value === '') {
                    setForm({...form, dentist: ''});
                  }
                }}
                onFocus={() => setShowDentistDropdown(true)}
                onBlur={() => setTimeout(() => setShowDentistDropdown(false), 200)}
              />
              {showDentistDropdown && dentistSearch && (
                <div className="search-dropdown">
                  {dentists
                    .filter(d => d.name.toLowerCase().includes(dentistSearch.toLowerCase()))
                    .length === 0 ? (
                      <div className="search-item no-result">No dentists found</div>
                    ) : (
                      dentists
                        .filter(d => d.name.toLowerCase().includes(dentistSearch.toLowerCase()))
                        .map(d => (
                          <div
                            key={d.id}
                            className="search-item"
                            onClick={() => {
                              setForm({...form, dentist: d.id});
                              setDentistSearch(d.name);
                              setShowDentistDropdown(false);
                            }}
                          >
                            <span className="item-name">{d.name}</span>
                            {d.specialization && <span className="item-badge">{d.specialization}</span>}
                          </div>
                        ))
                    )
                  }
                </div>
              )}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Date</label>
                <input name="date" type="date" value={form.date} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input name="time" type="time" value={form.time} onChange={handleFormChange} required />
              </div>
            </div>
            
            <div className="form-group">
              <label>Service / Treatment</label>
              <input name="service" placeholder="e.g. Teeth Cleaning" value={form.service} onChange={handleFormChange} required />
            </div>
            
            <div className="form-group">
              <label>Status</label>
              <select name="status" value={form.status} onChange={handleFormChange}>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            
            <div className="form-actions">
              <button className="gradient-btn" type="submit">Save</button>
              <button type="button" className="cancel-btn" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}