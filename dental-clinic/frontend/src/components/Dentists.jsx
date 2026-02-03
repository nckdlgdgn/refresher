import React, { useEffect, useState, useRef } from 'react';
import './Dentists.css';
import { API_URL } from '../config';

export default function Dentists() {
  const [dentists, setDentists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingDentist, setEditingDentist] = useState(null);
  const [form, setForm] = useState({
    name: '',
    specialization: '',
    contact: '',
    email: '',
    schedule: '',
    license: ''
  });
  const [uploadResult, setUploadResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);
  const token = localStorage.getItem('token');

  const fetchDentists = async () => {
    try {
      const res = await fetch(`${API_URL}/api/dentists`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDentists(data);
      }
    } catch (e) {
      console.error('Failed to fetch dentists', e);
    }
  };

  useEffect(() => {
    fetchDentists();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const method = editingDentist ? 'PUT' : 'POST';
    const url = editingDentist ? `${API_URL}/api/dentists/${editingDentist.id}` : `${API_URL}/api/dentists`;
    
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(form)
    });
    
    setShowForm(false);
    setEditingDentist(null);
    setForm({ name: '', specialization: '', contact: '', email: '', schedule: '', license: '' });
    fetchDentists();
  };

  const handleEdit = (dentist) => {
    setForm({
      name: dentist.name || '',
      specialization: dentist.specialization || '',
      contact: dentist.contact || '',
      email: dentist.email || '',
      schedule: dentist.schedule || '',
      license: dentist.license || ''
    });
    setEditingDentist(dentist);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this dentist?')) return;
    await fetch(`${API_URL}/api/dentists/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchDentists();
  };

  const handleAddNew = () => {
    setForm({ name: '', specialization: '', contact: '', email: '', schedule: '', license: '' });
    setEditingDentist(null);
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
          'dentist name': 'name',
          'full name': 'name',
          'dr': 'name',
          'doctor': 'name',
          'specialization': 'specialization',
          'specialty': 'specialization',
          'field': 'specialization',
          'expertise': 'specialization',
          'contact': 'contact',
          'phone': 'contact',
          'phone number': 'contact',
          'mobile': 'contact',
          'contact number': 'contact',
          'email': 'email',
          'email address': 'email',
          'schedule': 'schedule',
          'availability': 'schedule',
          'working hours': 'schedule',
          'hours': 'schedule',
          'license': 'license',
          'license number': 'license',
          'prc': 'license',
          'prc number': 'license',
          'license no': 'license'
        };

        const mappedHeaders = headers.map(h => headerMap[h] || h);
        
        // Parse data rows
        const newDentists = [];
        let skippedCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length === 0) continue;

          const dentist = {};
          mappedHeaders.forEach((header, index) => {
            if (values[index]) {
              dentist[header] = values[index].trim();
            }
          });

          // Validate required field (name)
          if (dentist.name && dentist.name.trim()) {
            newDentists.push(dentist);
          } else {
            skippedCount++;
          }
        }

        // Upload each dentist to API
        let successCount = 0;
        let failCount = 0;

        for (const dentist of newDentists) {
          try {
            const res = await fetch(`${API_URL}/api/dentists`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(dentist)
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
          message: `Successfully imported ${successCount} dentists!`,
          details: {
            total: newDentists.length,
            success: successCount,
            failed: failCount,
            skipped: skippedCount
          }
        });

        fetchDentists();
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

  const filteredDentists = dentists.filter(d =>
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.contact?.includes(searchTerm) ||
    d.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Specialization options
  const specializations = [
    'General Dentist',
    'Orthodontist',
    'Periodontist',
    'Endodontist',
    'Oral Surgeon',
    'Pediatric Dentist',
    'Prosthodontist',
    'Cosmetic Dentist',
    'Implant Specialist'
  ];

  return (
    <div className="dentists-page">
      <div className="dentists-header">
        <div className="header-left">
          <h2>🦷 Dentists</h2>
          <p>Manage dentist profiles and schedules</p>
        </div>
        <div className="header-right">
          <button className="btn-upload" onClick={() => setShowUploadModal(true)}>
            📤 Upload CSV
          </button>
          <button className="btn-add" onClick={handleAddNew}>
            ➕ Add Dentist
          </button>
        </div>
      </div>

      <div className="dentists-stats">
        <div className="stat-card">
          <div className="stat-icon total">🦷</div>
          <div className="stat-info">
            <h4>{dentists.length}</h4>
            <p>Total Dentists</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon specialist">⭐</div>
          <div className="stat-info">
            <h4>{dentists.filter(d => d.specialization && d.specialization !== 'General Dentist').length}</h4>
            <p>Specialists</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon general">👨‍⚕️</div>
          <div className="stat-info">
            <h4>{dentists.filter(d => !d.specialization || d.specialization === 'General Dentist').length}</h4>
            <p>General Dentists</p>
          </div>
        </div>
      </div>

      <div className="dentists-search">
        <input
          type="text"
          placeholder="🔍 Search dentists by name, specialization, contact, or email..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="dentists-table-container">
        <table className="dentists-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Specialization</th>
              <th>Contact</th>
              <th>Email</th>
              <th>Schedule</th>
              <th>License No.</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredDentists.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  {searchTerm ? 'No dentists found matching your search' : 'No dentists yet. Add one or upload a CSV file!'}
                </td>
              </tr>
            ) : (
              filteredDentists.map(dentist => (
                <tr key={dentist.id}>
                  <td className="dentist-name-cell">
                    <div className="dentist-avatar">{dentist.name?.charAt(0).toUpperCase()}</div>
                    <div className="dentist-name-info">
                      <span className="dentist-name">Dr. {dentist.name}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`specialization-badge ${dentist.specialization ? 'specialist' : 'general'}`}>
                      {dentist.specialization || 'General Dentist'}
                    </span>
                  </td>
                  <td>{dentist.contact || '-'}</td>
                  <td>{dentist.email || '-'}</td>
                  <td className="schedule-cell">{dentist.schedule || '-'}</td>
                  <td>{dentist.license || '-'}</td>
                  <td className="actions-cell">
                    <button className="btn-edit" onClick={() => handleEdit(dentist)}>✏️</button>
                    <button className="btn-delete" onClick={() => handleDelete(dentist.id)}>🗑️</button>
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
          <div className="modal-content dentist-form" onClick={e => e.stopPropagation()}>
            <h3>{editingDentist ? '✏️ Edit Dentist' : '➕ Add New Dentist'}</h3>
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
                  <label>Specialization</label>
                  <select value={form.specialization} onChange={e => setForm({...form, specialization: e.target.value})}>
                    <option value="">Select specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
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
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    placeholder="Enter email address"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Schedule / Availability</label>
                  <input
                    type="text"
                    value={form.schedule}
                    onChange={e => setForm({...form, schedule: e.target.value})}
                    placeholder="e.g. Mon-Fri 9AM-5PM"
                  />
                </div>
                <div className="form-group">
                  <label>License Number</label>
                  <input
                    type="text"
                    value={form.license}
                    onChange={e => setForm({...form, license: e.target.value})}
                    placeholder="PRC License No."
                  />
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-save">
                  {editingDentist ? 'Update Dentist' : 'Add Dentist'}
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
            <h3>📤 Import Dentists from CSV</h3>
            <p className="upload-description">
              Upload a CSV file containing dentist records. The system will automatically import them.
            </p>
            
            <div className="csv-format-info">
              <h4>📋 Supported CSV Format</h4>
              <p>Your CSV file should have headers in the first row. Supported columns:</p>
              <ul>
                <li><strong>Name</strong> (required) - Dentist's full name</li>
                <li><strong>Specialization</strong> - Area of expertise</li>
                <li><strong>Contact</strong> - Phone number</li>
                <li><strong>Email</strong> - Email address</li>
                <li><strong>Schedule</strong> - Working hours/availability</li>
                <li><strong>License</strong> - PRC License number</li>
              </ul>
              <div className="csv-example">
                <strong>Example:</strong>
                <code>Name,Specialization,Contact,Email,Schedule,License</code>
                <code>Juan Santos,Orthodontist,09171234567,juan@email.com,Mon-Fri 9AM-5PM,PRC-123456</code>
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