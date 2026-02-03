import React, { useEffect, useState, useRef } from 'react';
import './Patients.css';
import { API_URL } from '../config';

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [form, setForm] = useState({
    name: '',
    age: '',
    gender: '',
    contact: '',
    email: '',
    address: '',
    medicalHistory: ''
  });
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem('token');

  const fetchPatients = async () => {
    try {
      const res = await fetch(`${API_URL}/api/patients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (e) {
      console.error('Failed to fetch patients', e);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingPatient ? 'PUT' : 'POST';
    const url = editingPatient ? `${API_URL}/api/patients/${editingPatient.id}` : `${API_URL}/api/patients`;
    
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    
    setShowForm(false);
    setEditingPatient(null);
    setForm({ name: '', age: '', gender: '', contact: '', email: '', address: '', medicalHistory: '' });
    fetchPatients();
  };

  const handleEdit = (patient) => {
    setForm({
      name: patient.name || '',
      age: patient.age || '',
      gender: patient.gender || '',
      contact: patient.contact || '',
      email: patient.email || '',
      address: patient.address || '',
      medicalHistory: patient.medicalHistory || ''
    });
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this patient?')) return;
    await fetch(`${API_URL}/api/patients/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchPatients();
  };

  const handleAddNew = () => {
    setForm({ name: '', age: '', gender: '', contact: '', email: '', address: '', medicalHistory: '' });
    setEditingPatient(null);
    setShowForm(true);
  };

  // CSV Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      alert('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvText = event.target.result;
        const lines = csvText.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setUploadResult({ success: false, message: 'CSV file is empty or has no data rows' });
          setIsUploading(false);
          return;
        }

        // Parse header
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
        
        // Map headers to our field names
        const headerMap = {
          'name': 'name',
          'patient name': 'name',
          'full name': 'name',
          'age': 'age',
          'gender': 'gender',
          'sex': 'gender',
          'contact': 'contact',
          'phone': 'contact',
          'phone number': 'contact',
          'mobile': 'contact',
          'contact number': 'contact',
          'email': 'email',
          'email address': 'email',
          'address': 'address',
          'home address': 'address',
          'medical history': 'medicalHistory',
          'medicalhistory': 'medicalHistory',
          'history': 'medicalHistory',
          'notes': 'medicalHistory'
        };

        const mappedHeaders = headers.map(h => headerMap[h] || h);
        
        // Parse data rows
        const newPatients = [];
        let skippedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length === 0) continue;

          const patient = {};
          mappedHeaders.forEach((header, index) => {
            if (values[index]) {
              patient[header] = values[index].trim();
            }
          });

          // Validate required field (name)
          if (patient.name && patient.name.trim()) {
            newPatients.push(patient);
          } else {
            skippedCount++;
          }
        }

        // Upload each patient to API
        let successCount = 0;
        let failCount = 0;

        for (const patient of newPatients) {
          try {
            const res = await fetch(`${API_URL}/api/patients`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(patient)
            });
            if (res.ok) {
              successCount++;
            } else {
              failCount++;
            }
          } catch (err) {
            failCount++;
          }
        }

        setUploadResult({
          success: true,
          message: `Successfully imported ${successCount} patients!`,
          details: {
            total: newPatients.length,
            success: successCount,
            failed: failCount,
            skipped: skippedCount
          }
        });

        fetchPatients();
      } catch (err) {
        console.error('CSV parsing error:', err);
        setUploadResult({ success: false, message: 'Failed to parse CSV file. Please check the format.' });
      }
      setIsUploading(false);
    };

    reader.readAsText(file);
    e.target.value = ''; // Reset file input
  };

  // Parse CSV line handling quoted values
  const parseCSVLine = (line) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.replace(/^["']|["']$/g, ''));
    return result;
  };

  const filteredPatients = patients.filter(p =>
    p.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.contact?.includes(searchTerm) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="patients-page">
      <div className="patients-header">
        <div className="header-left">
          <h2>👥 Patients</h2>
          <p>Manage patient profiles and records</p>
        </div>
        <div className="header-right">
          <button className="btn-upload" onClick={() => setShowUploadModal(true)}>
            📤 Upload CSV
          </button>
          <button className="btn-add" onClick={handleAddNew}>
            ➕ Add Patient
          </button>
        </div>
      </div>

      <div className="patients-stats">
        <div className="stat-card">
          <div className="stat-icon total">👥</div>
          <div className="stat-info">
            <h4>{patients.length}</h4>
            <p>Total Patients</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon male">👨</div>
          <div className="stat-info">
            <h4>{patients.filter(p => p.gender?.toLowerCase() === 'male').length}</h4>
            <p>Male</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon female">👩</div>
          <div className="stat-info">
            <h4>{patients.filter(p => p.gender?.toLowerCase() === 'female').length}</h4>
            <p>Female</p>
          </div>
        </div>
      </div>

      <div className="patients-search">
        <input
          type="text"
          placeholder="🔍 Search patients by name, contact, or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="patients-table-container">
        <table className="patients-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Age</th>
              <th>Gender</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredPatients.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {searchTerm ? 'No patients found matching your search' : 'No patients yet. Add one or upload a CSV file!'}
                </td>
              </tr>
            ) : (
              filteredPatients.map(patient => (
                <tr key={patient.id}>
                  <td className="patient-name-cell">
                    <div className="patient-avatar">{patient.name?.charAt(0).toUpperCase()}</div>
                    {patient.name}
                  </td>
                  <td>{patient.age || '-'}</td>
                  <td>
                    <span className={`gender-badge ${patient.gender?.toLowerCase()}`}>
                      {patient.gender || '-'}
                    </span>
                  </td>
                  <td>{patient.contact || '-'}</td>
                  <td>{patient.email || '-'}</td>
                  <td className="address-cell">{patient.address || '-'}</td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => handleEdit(patient)}>✏️</button>
                    <button className="btn-delete" onClick={() => handleDelete(patient.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content patient-form" onClick={e => e.stopPropagation()}>
            <h3>{editingPatient ? '✏️ Edit Patient' : '➕ Add New Patient'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={e => setForm({...form, name: e.target.value})}
                    required
                    placeholder="Enter full name"
                  />
                </div>
                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={form.age}
                    onChange={e => setForm({...form, age: e.target.value})}
                    placeholder="Enter age"
                    min="0"
                    max="150"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Gender</label>
                  <select value={form.gender} onChange={e => setForm({...form, gender: e.target.value})}>
                    <option value="">Select gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Contact Number *</label>
                  <input
                    type="tel"
                    value={form.contact}
                    onChange={e => setForm({...form, contact: e.target.value})}
                    required
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  placeholder="Enter email address"
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  placeholder="Enter home address"
                />
              </div>
              <div className="form-group">
                <label>Medical History / Notes</label>
                <textarea
                  value={form.medicalHistory}
                  onChange={e => setForm({...form, medicalHistory: e.target.value})}
                  placeholder="Enter any medical history, allergies, or notes..."
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingPatient ? 'Update Patient' : 'Add Patient'}
                </button>
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => { setShowUploadModal(false); setUploadResult(null); }}>
          <div className="modal-content upload-modal" onClick={e => e.stopPropagation()}>
            <h3>📤 Import Patients from CSV</h3>
            <p className="upload-description">
              Upload a CSV file containing patient records. The system will automatically import them.
            </p>
            
            <div className="csv-format-info">
              <h4>📋 Supported CSV Format</h4>
              <p>Your CSV file should have headers in the first row. Supported columns:</p>
              <ul>
                <li><strong>Name</strong> (required) - Patient's full name</li>
                <li><strong>Age</strong> - Patient's age</li>
                <li><strong>Gender</strong> - Male/Female/Other</li>
                <li><strong>Contact</strong> - Phone number</li>
                <li><strong>Email</strong> - Email address</li>
                <li><strong>Address</strong> - Home address</li>
                <li><strong>Medical History</strong> - Notes/history</li>
              </ul>
              <div className="csv-example">
                <strong>Example:</strong>
                <code>Name,Age,Gender,Contact,Email,Address</code>
                <code>Juan Dela Cruz,35,Male,09171234567,juan@email.com,Manila</code>
              </div>
            </div>

            <div className="upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
              <button 
                className="upload-button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>⏳ Uploading...</>
                ) : (
                  <>📁 Choose CSV File</>
                )}
              </button>
            </div>

            {uploadResult && (
              <div className={`upload-result ${uploadResult.success ? 'success' : 'error'}`}>
                <div className="result-message">{uploadResult.message}</div>
                {uploadResult.details && (
                  <div className="result-details">
                    <span>✅ Imported: {uploadResult.details.success}</span>
                    {uploadResult.details.failed > 0 && <span>❌ Failed: {uploadResult.details.failed}</span>}
                    {uploadResult.details.skipped > 0 && <span>⏭️ Skipped: {uploadResult.details.skipped}</span>}
                  </div>
                )}
              </div>
            )}

            <div className="modal-actions">
              <button className="btn-close" onClick={() => { setShowUploadModal(false); setUploadResult(null); }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}