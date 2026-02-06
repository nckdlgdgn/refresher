import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { API_URL } from '../config';

export default function Dashboard({ username, role }) {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDentists: 0,
    todayAppointments: 0,
    pendingAppointments: 0,
    completedToday: 0,
    totalAppointments: 0
  });
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [patientsRes, dentistsRes, appointmentsRes] = await Promise.all([
        fetch(`${API_URL}/api/patients`, { headers }),
        fetch(`${API_URL}/api/dentists`, { headers }),
        fetch(`${API_URL}/api/appointments`, { headers }),
      ]);

      const [patients, dentists, appointments] = await Promise.all([
        patientsRes.json(),
        dentistsRes.json(),
        appointmentsRes.json(),
      ]);

      const today = new Date().toISOString().split('T')[0];
      const todayAppts = Array.isArray(appointments)
        ? appointments.filter(a => a.date === today)
        : [];
      const pendingAppts = Array.isArray(appointments)
        ? appointments.filter(a => a.status === 'Pending')
        : [];
      const completedToday = todayAppts.filter(a => a.status === 'Completed');

      setStats({
        totalPatients: Array.isArray(patients) ? patients.length : 0,
        totalDentists: Array.isArray(dentists) ? dentists.length : 0,
        todayAppointments: todayAppts.length,
        pendingAppointments: pendingAppts.length,
        completedToday: completedToday.length,
        totalAppointments: Array.isArray(appointments) ? appointments.length : 0
      });

      // Get today's schedule with patient/dentist names
      const scheduleWithNames = todayAppts.slice(0, 5).map(apt => {
        const patient = Array.isArray(patients)
          ? patients.find(p => p.id === apt.patient)
          : null;
        const dentist = Array.isArray(dentists)
          ? dentists.find(d => d.id === apt.dentist)
          : null;
        return {
          ...apt,
          patientName: patient?.name || 'Unknown Patient',
          dentistName: dentist?.name || 'Unknown Dentist'
        };
      });
      setTodaySchedule(scheduleWithNames);

      // Create recent activity from appointments
      const sortedAppts = Array.isArray(appointments)
        ? [...appointments].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5)
        : [];
      const activityItems = sortedAppts.map(apt => {
        const patient = Array.isArray(patients)
          ? patients.find(p => p.id === apt.patient)
          : null;
        return {
          id: apt.id,
          type: apt.status === 'Completed' ? 'completed' : apt.status === 'Cancelled' ? 'cancelled' : 'scheduled',
          message: `${patient?.name || 'A patient'} - ${apt.service}`,
          time: apt.date,
          status: apt.status
        };
      });
      setRecentActivity(activityItems);

    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getRoleEmoji = () => {
    if (role === 'admin') return '👑';
    if (role === 'dentist') return '🦷';
    return '👤';
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'Pending': 'badge-warning',
      'Confirmed': 'badge-info',
      'Completed': 'badge-success',
      'Cancelled': 'badge-danger'
    };
    return statusMap[status] || 'badge-info';
  };

  const getActivityIcon = (type) => {
    if (type === 'completed') return '✅';
    if (type === 'cancelled') return '❌';
    return '📅';
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <div className="dashboard-welcome fade-in">
        <div className="welcome-content">
          <div className="welcome-avatar">
            {username ? username.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="welcome-text">
            <h1>{getGreeting()}, {username}! {getRoleEmoji()}</h1>
            <p>Welcome to Classic Dental Clinic Management System</p>
          </div>
        </div>
        <div className="welcome-date">
          <span className="date-icon">📅</span>
          <span>{new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card stagger-item patients-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" fill="currentColor" />
              <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalPatients}</span>
            <span className="stat-label">Total Patients</span>
          </div>
          <div className="stat-trend positive">
            <span>Active Records</span>
          </div>
        </div>

        <div className="stat-card stagger-item appointments-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <rect x="3" y="6" width="18" height="15" rx="2" fill="currentColor" />
              <rect x="7" y="3" width="2" height="5" rx="1" fill="currentColor" opacity="0.6" />
              <rect x="15" y="3" width="2" height="5" rx="1" fill="currentColor" opacity="0.6" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.todayAppointments}</span>
            <span className="stat-label">Today's Appointments</span>
          </div>
          <div className="stat-trend">
            <span>{stats.completedToday} completed</span>
          </div>
        </div>

        <div className="stat-card stagger-item pending-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingAppointments}</span>
            <span className="stat-label">Pending Appointments</span>
          </div>
          <div className="stat-trend warning">
            <span>Awaiting confirmation</span>
          </div>
        </div>

        <div className="stat-card stagger-item dentists-card">
          <div className="stat-icon">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 2C9 2 7 5 7 9c0 3 1 5 2 7 .5 1 1 3 1.5 4 .3.7.8 1.5 1.5 1.5s1.2-.8 1.5-1.5c.5-1 1-3 1.5-4 1-2 2-4 2-7 0-4-2-7-5-7z" fill="currentColor" />
            </svg>
          </div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalDentists}</span>
            <span className="stat-label">Active Dentists</span>
          </div>
          <div className="stat-trend positive">
            <span>All available</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content-grid">
        {/* Today's Schedule */}
        <div className="dashboard-card schedule-card fade-in-up">
          <div className="card-header">
            <h3>📋 Today's Schedule</h3>
            <span className="card-badge">{todaySchedule.length} appointments</span>
          </div>
          <div className="schedule-list">
            {todaySchedule.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">🎉</span>
                <p>No appointments scheduled for today</p>
              </div>
            ) : (
              todaySchedule.map((apt, index) => (
                <div key={apt.id || index} className="schedule-item stagger-item">
                  <div className="schedule-time">
                    <span className="time-icon">🕐</span>
                    <span>{apt.time}</span>
                  </div>
                  <div className="schedule-info">
                    <span className="patient-name">{apt.patientName}</span>
                    <span className="service-name">{apt.service}</span>
                  </div>
                  <div className="schedule-dentist">
                    <span className="dentist-icon">👨‍⚕️</span>
                    <span>{apt.dentistName}</span>
                  </div>
                  <span className={`schedule-status badge ${getStatusBadge(apt.status)}`}>
                    {apt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card actions-card fade-in-up">
          <div className="card-header">
            <h3>⚡ Quick Actions</h3>
          </div>
          <div className="quick-actions-grid">
            <button className="quick-action-btn">
              <span className="action-icon">📅</span>
              <span>New Appointment</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">👤</span>
              <span>Add Patient</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">🦷</span>
              <span>Add Dentist</span>
            </button>
            <button className="quick-action-btn">
              <span className="action-icon">📊</span>
              <span>View Reports</span>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-card activity-card fade-in-up">
          <div className="card-header">
            <h3>🔔 Recent Activity</h3>
          </div>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📭</span>
                <p>No recent activity</p>
              </div>
            ) : (
              recentActivity.map((activity, index) => (
                <div key={activity.id || index} className="activity-item stagger-item">
                  <span className="activity-icon">{getActivityIcon(activity.type)}</span>
                  <div className="activity-content">
                    <span className="activity-message">{activity.message}</span>
                    <span className="activity-time">{activity.time}</span>
                  </div>
                  <span className={`activity-status badge ${getStatusBadge(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="dashboard-card overview-card fade-in-up">
          <div className="card-header">
            <h3>📈 Overview</h3>
          </div>
          <div className="overview-stats">
            <div className="overview-item">
              <div className="overview-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle-progress patients-progress"
                    strokeDasharray={`${Math.min((stats.totalPatients / 100) * 100, 100)}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="overview-value">{stats.totalPatients}</span>
              </div>
              <span className="overview-label">Patients</span>
            </div>
            <div className="overview-item">
              <div className="overview-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle-progress appointments-progress"
                    strokeDasharray={`${Math.min((stats.totalAppointments / 100) * 100, 100)}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="overview-value">{stats.totalAppointments}</span>
              </div>
              <span className="overview-label">All Appointments</span>
            </div>
            <div className="overview-item">
              <div className="overview-circle">
                <svg viewBox="0 0 36 36" className="circular-chart">
                  <path className="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path className="circle-progress dentists-progress"
                    strokeDasharray={`${Math.min((stats.totalDentists / 10) * 100, 100)}, 100`}
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <span className="overview-value">{stats.totalDentists}</span>
              </div>
              <span className="overview-label">Dentists</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
