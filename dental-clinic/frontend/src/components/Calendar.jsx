import React, { useEffect, useState } from 'react';
import './Calendar.css';

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [patients, setPatients] = useState([]);
  const [dentists, setDentists] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showDayDetail, setShowDayDetail] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'schedule',
    procedure: '',
    patientId: '',
    description: '',
    dentistId: ''
  });
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [patientSearch, setPatientSearch] = useState('');
  const [showPatientDropdown, setShowPatientDropdown] = useState(false);
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');

  const fetchData = async () => {
    try {
      const [apptRes, patRes, dentRes, treatRes] = await Promise.all([
        fetch('/api/appointments', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/patients', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/dentists', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/treatments', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (apptRes.ok) setAppointments(await apptRes.json());
      if (patRes.ok) setPatients(await patRes.json());
      if (dentRes.ok) setDentists(await dentRes.json());
      if (treatRes.ok) setTreatments(await treatRes.json());
      
      // Fetch schedules
      const schedRes = await fetch('/api/schedules', { headers: { Authorization: `Bearer ${token}` } });
      if (schedRes.ok) setSchedules(await schedRes.json());
    } catch (e) {
      console.error('Failed to fetch data', e);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days = [];
    
    // Previous month days
    const prevMonth = new Date(year, month, 0);
    const prevMonthDays = prevMonth.getDate();
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false
      });
    }
    
    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }
    
    // Next month days
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }
    
    return days;
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getEventsForDate = (date) => {
    const dateStr = formatDate(date);
    const events = [];
    
    // Add appointments
    appointments.forEach(appt => {
      if (appt.date === dateStr) {
        const patient = patients.find(p => p.id === appt.patient);
        const dentist = dentists.find(d => d.id === appt.dentist);
        events.push({
          id: `appt-${appt.id}`,
          type: 'appointment',
          title: `${appt.time} - ${patient?.name || 'Patient'}`,
          subtitle: `${appt.service} with Dr. ${dentist?.name || 'Dentist'}`,
          time: appt.time,
          data: appt
        });
      }
    });
    
    // Add schedules
    schedules.forEach(sched => {
      if (sched.date === dateStr) {
        events.push({
          id: `sched-${sched.id}`,
          type: sched.type,
          title: sched.title,
          subtitle: sched.description,
          time: sched.startTime,
          endTime: sched.endTime,
          data: sched
        });
      }
    });
    
    return events.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  };

  const isToday = (date) => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day) => {
    setSelectedDate(day.date);
    setShowDayDetail(true);
  };

  const handleAddSchedule = (date = null) => {
    setScheduleForm({
      title: '',
      date: date ? formatDate(date) : formatDate(new Date()),
      startTime: '09:00',
      endTime: '17:00',
      type: 'schedule',
      procedure: '',
      patientId: '',
      description: '',
      dentistId: ''
    });
    setPatientSearch('');
    setEditingSchedule(null);
    setShowScheduleForm(true);
    setShowDayDetail(false);
  };

  const handleEditSchedule = (schedule) => {
    const patient = patients.find(p => p.id === schedule.patientId || p.id === parseInt(schedule.patientId));
    setScheduleForm({
      title: schedule.title,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      type: schedule.type,
      procedure: schedule.procedure || '',
      patientId: schedule.patientId || '',
      description: schedule.description || '',
      dentistId: schedule.dentistId || ''
    });
    setPatientSearch(patient ? patient.name : '');
    setEditingSchedule(schedule);
    setShowScheduleForm(true);
    setShowDayDetail(false);
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Delete this schedule?')) return;
    await fetch(`/api/schedules/${scheduleId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchData();
  };

  const handleSubmitSchedule = async (e) => {
    e.preventDefault();
    const method = editingSchedule ? 'PUT' : 'POST';
    const url = editingSchedule ? `/api/schedules/${editingSchedule.id}` : '/api/schedules';
    
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(scheduleForm)
    });
    
    setShowScheduleForm(false);
    fetchData();
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const days = getDaysInMonth(currentDate);

  // Stats
  const todayEvents = getEventsForDate(new Date());
  const monthAppointments = appointments.filter(a => {
    const d = new Date(a.date);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>📅 Clinic Calendar</h2>
        {(userRole === 'admin' || userRole === 'staff') && (
          <button className="gradient-btn" onClick={() => handleAddSchedule()}>
            + Add Schedule
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="calendar-stats">
        <div className="stat-card">
          <div className="stat-icon appointments">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className="stat-info">
            <h4>{monthAppointments.length}</h4>
            <p>Appointments this month</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon schedules">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          </div>
          <div className="stat-info">
            <h4>{schedules.length}</h4>
            <p>Scheduled events</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon today">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <div className="stat-info">
            <h4>{todayEvents.length}</h4>
            <p>Events today</p>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="calendar-nav">
        <button onClick={handlePrevMonth}>← Prev</button>
        <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        <button onClick={handleNextMonth}>Next →</button>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {weekdays.map(day => <div key={day}>{day}</div>)}
        </div>
        <div className="calendar-days">
          {days.map((day, idx) => {
            const events = getEventsForDate(day.date);
            return (
              <div
                key={idx}
                className={`calendar-day ${!day.isCurrentMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''}`}
                onClick={() => handleDayClick(day)}
              >
                <div className="day-number">{day.date.getDate()}</div>
                <div className="day-events">
                  {events.slice(0, 3).map(event => (
                    <div key={event.id} className={`day-event ${event.type}`}>
                      {event.title}
                    </div>
                  ))}
                  {events.length > 3 && (
                    <div className="day-event" style={{background:'#f0f4f7', color:'#666'}}>
                      +{events.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color appointment"></div>
          <span>Appointments</span>
        </div>
        <div className="legend-item">
          <div className="legend-color schedule"></div>
          <span>Schedules</span>
        </div>
        <div className="legend-item">
          <div className="legend-color holiday"></div>
          <span>Holidays</span>
        </div>
        <div className="legend-item">
          <div className="legend-color blocked"></div>
          <span>Blocked</span>
        </div>
      </div>

      {/* Day Detail Modal */}
      {showDayDetail && selectedDate && (
        <div className="day-detail-modal" onClick={() => setShowDayDetail(false)}>
          <div className="day-detail-content" onClick={e => e.stopPropagation()}>
            <h3>
              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </h3>
            
            {getEventsForDate(selectedDate).length === 0 ? (
              <div className="no-events">
                <p>No events scheduled for this day</p>
              </div>
            ) : (
              <div className="day-events-list">
                {getEventsForDate(selectedDate).map(event => (
                  <div key={event.id} className={`day-event-item ${event.type}`}>
                    <div className="event-info">
                      <h4>{event.title}</h4>
                      <p>{event.subtitle}</p>
                      {event.time && (
                        <p><strong>Time:</strong> {event.time}{event.endTime ? ` - ${event.endTime}` : ''}</p>
                      )}
                    </div>
                    {event.type !== 'appointment' && (userRole === 'admin' || userRole === 'staff') && (
                      <div className="event-actions">
                        <button className="edit-btn" onClick={() => handleEditSchedule(event.data)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDeleteSchedule(event.data.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            <div className="form-actions">
              {(userRole === 'admin' || userRole === 'staff') && (
                <button className="gradient-btn" onClick={() => handleAddSchedule(selectedDate)}>
                  + Add Schedule for this Day
                </button>
              )}
              <button className="cancel-btn" onClick={() => setShowDayDetail(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Form Modal */}
      {showScheduleForm && (
        <div className="schedule-modal" onClick={() => setShowScheduleForm(false)}>
          <form className="schedule-form" onClick={e => e.stopPropagation()} onSubmit={handleSubmitSchedule}>
            <h3>{editingSchedule ? 'Edit Schedule' : 'Add Schedule'}</h3>
            
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                placeholder="e.g. Staff Meeting, Holiday, etc."
                value={scheduleForm.title}
                onChange={e => setScheduleForm({...scheduleForm, title: e.target.value})}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Type</label>
              <select
                value={scheduleForm.type}
                onChange={e => setScheduleForm({...scheduleForm, type: e.target.value})}
              >
                <option value="schedule">Schedule</option>
                <option value="procedure">Procedure/Treatment</option>
                <option value="holiday">Holiday</option>
                <option value="blocked">Blocked Time</option>
              </select>
            </div>
            
            {scheduleForm.type === 'procedure' && (
              <div className="form-group">
                <label>Procedure / Treatment</label>
                <select
                  value={scheduleForm.procedure}
                  onChange={e => setScheduleForm({...scheduleForm, procedure: e.target.value})}
                  required
                >
                  <option value="">Select a procedure...</option>
                  {treatments.map(t => (
                    <option key={t.id} value={t.name}>{t.name} - ₱{t.price}</option>
                  ))}
                </select>
              </div>
            )}
            
            {scheduleForm.type === 'procedure' && (
              <div className="form-group patient-search-container">
                <label>Patient</label>
                <input
                  type="text"
                  placeholder="Search patient by name..."
                  value={patientSearch}
                  onChange={e => {
                    setPatientSearch(e.target.value);
                    setShowPatientDropdown(true);
                    if (e.target.value === '') {
                      setScheduleForm({...scheduleForm, patientId: ''});
                    }
                  }}
                  onFocus={() => setShowPatientDropdown(true)}
                />
                {showPatientDropdown && patientSearch && (
                  <div className="patient-search-dropdown">
                    {patients
                      .filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()))
                      .length === 0 ? (
                        <div className="patient-search-item no-result">No patients found</div>
                      ) : (
                        patients
                          .filter(p => p.name.toLowerCase().includes(patientSearch.toLowerCase()))
                          .map(p => (
                            <div
                              key={p.id}
                              className="patient-search-item"
                              onClick={() => {
                                setScheduleForm({...scheduleForm, patientId: p.id});
                                setPatientSearch(p.name);
                                setShowPatientDropdown(false);
                              }}
                            >
                              <span className="patient-name">{p.name}</span>
                              {p.age && <span className="patient-age">Age: {p.age}</span>}
                              <span className="patient-contact">{p.contact}</span>
                            </div>
                          ))
                      )
                    }
                  </div>
                )}
              </div>
            )}
            
            {scheduleForm.type === 'procedure' && scheduleForm.patientId && (
              <div className="patient-info-card">
                {(() => {
                  const patient = patients.find(p => p.id === parseInt(scheduleForm.patientId) || p.id === scheduleForm.patientId);
                  if (!patient) return null;
                  return (
                    <>
                      <div className="patient-info-header">👤 Patient Information</div>
                      <div className="patient-info-row"><strong>Name:</strong> {patient.name}</div>
                      {patient.age && <div className="patient-info-row"><strong>Age:</strong> {patient.age} years old</div>}
                      <div className="patient-info-row"><strong>Contact:</strong> {patient.contact}</div>
                      {patient.email && <div className="patient-info-row"><strong>Email:</strong> {patient.email}</div>}
                    </>
                  );
                })()}
              </div>
            )}
            
            <div className="form-group">
              <label>Date</label>
              <input
                type="date"
                value={scheduleForm.date}
                onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})}
                required
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={e => setScheduleForm({...scheduleForm, startTime: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={scheduleForm.endTime}
                  onChange={e => setScheduleForm({...scheduleForm, endTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Assign to Dentist (Optional)</label>
              <select
                value={scheduleForm.dentistId}
                onChange={e => setScheduleForm({...scheduleForm, dentistId: e.target.value})}
              >
                <option value="">All / Clinic-wide</option>
                {dentists.map(d => <option key={d.id} value={d.id}>Dr. {d.name}</option>)}
              </select>
            </div>
            
            <div className="form-group">
              <label>Description</label>
              <textarea
                placeholder="Add notes or description..."
                value={scheduleForm.description}
                onChange={e => setScheduleForm({...scheduleForm, description: e.target.value})}
              />
            </div>
            
            <div className="form-actions">
              <button type="submit" className="gradient-btn">
                {editingSchedule ? 'Update' : 'Save'}
              </button>
              <button type="button" className="cancel-btn" onClick={() => setShowScheduleForm(false)}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}