import React, { useEffect, useState } from 'react';
import './Reports.css';
import { API_URL } from '../config';

export default function Reports() {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    completed: 0,
    pending: 0,
    cancelled: 0,
    confirmed: 0,
    serviceBreakdown: [],
    monthlyData: []
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const fetchReportsData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [appointmentsRes, patientsRes, dentistsRes] = await Promise.all([
        fetch(`${API_URL}/api/appointments`, { headers }),
        fetch(`${API_URL}/api/patients`, { headers }),
        fetch(`${API_URL}/api/dentists`, { headers }),
      ]);

      let appointments = await appointmentsRes.json();
      const patients = await patientsRes.json();
      const dentists = await dentistsRes.json();

      if (!Array.isArray(appointments)) appointments = [];

      // Filter by date range
      const now = new Date();
      if (dateRange === 'today') {
        const today = now.toISOString().split('T')[0];
        appointments = appointments.filter(a => a.date === today);
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        appointments = appointments.filter(a => new Date(a.date) >= weekAgo);
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        appointments = appointments.filter(a => new Date(a.date) >= monthAgo);
      }

      // Calculate status counts
      const completed = appointments.filter(a => a.status === 'Completed').length;
      const pending = appointments.filter(a => a.status === 'Pending').length;
      const cancelled = appointments.filter(a => a.status === 'Cancelled').length;
      const confirmed = appointments.filter(a => a.status === 'Confirmed').length;

      // Calculate service breakdown
      const serviceCounts = {};
      appointments.forEach(a => {
        if (a.service) {
          serviceCounts[a.service] = (serviceCounts[a.service] || 0) + 1;
        }
      });
      const serviceBreakdown = Object.entries(serviceCounts)
        .map(([name, count]) => ({ name, count, percentage: Math.round((count / appointments.length) * 100) || 0 }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 8);

      // Calculate monthly data for the last 6 months
      const monthlyData = [];
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthStr = date.toLocaleDateString('en-US', { month: 'short' });
        const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const count = appointments.filter(a => a.date && a.date.startsWith(yearMonth)).length;
        monthlyData.push({ month: monthStr, count });
      }

      setStats({
        totalAppointments: appointments.length,
        completed,
        pending,
        cancelled,
        confirmed,
        serviceBreakdown,
        monthlyData,
        totalPatients: Array.isArray(patients) ? patients.length : 0,
        totalDentists: Array.isArray(dentists) ? dentists.length : 0
      });

    } catch (err) {
      console.error('Failed to fetch reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getServiceColor = (index) => {
    const colors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6', '#6366f1'];
    return colors[index % colors.length];
  };

  const maxMonthlyCount = Math.max(...stats.monthlyData.map(d => d.count), 1);

  if (loading) {
    return (
      <div className="reports-page">
        <div className="loading-container">
          <div className="spinner"></div>
          <span className="loading-text">Loading reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="reports-page">
      {/* Header */}
      <div className="reports-header fade-in">
        <div className="header-content">
          <h1>📊 Reports & Analytics</h1>
          <p>Overview of clinic performance and statistics</p>
        </div>
        <div className="date-filter">
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="all">All Time</option>
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="summary-grid">
        <div className="summary-card total-card stagger-item">
          <div className="summary-icon">📅</div>
          <div className="summary-info">
            <span className="summary-value">{stats.totalAppointments}</span>
            <span className="summary-label">Total Appointments</span>
          </div>
        </div>
        <div className="summary-card completed-card stagger-item">
          <div className="summary-icon">✅</div>
          <div className="summary-info">
            <span className="summary-value">{stats.completed}</span>
            <span className="summary-label">Completed</span>
          </div>
        </div>
        <div className="summary-card pending-card stagger-item">
          <div className="summary-icon">⏳</div>
          <div className="summary-info">
            <span className="summary-value">{stats.pending}</span>
            <span className="summary-label">Pending</span>
          </div>
        </div>
        <div className="summary-card cancelled-card stagger-item">
          <div className="summary-icon">❌</div>
          <div className="summary-info">
            <span className="summary-value">{stats.cancelled}</span>
            <span className="summary-label">Cancelled</span>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Status Breakdown */}
        <div className="chart-card fade-in-up">
          <div className="chart-header">
            <h3>📈 Appointment Status</h3>
          </div>
          <div className="status-chart">
            <div className="donut-chart">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border-color)" strokeWidth="12" />
                {stats.totalAppointments > 0 && (
                  <>
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="#22c55e" strokeWidth="12"
                      strokeDasharray={`${(stats.completed / stats.totalAppointments) * 251.2} 251.2`}
                      strokeDashoffset="0"
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="#3b82f6" strokeWidth="12"
                      strokeDasharray={`${(stats.confirmed / stats.totalAppointments) * 251.2} 251.2`}
                      strokeDashoffset={`-${(stats.completed / stats.totalAppointments) * 251.2}`}
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="#f59e0b" strokeWidth="12"
                      strokeDasharray={`${(stats.pending / stats.totalAppointments) * 251.2} 251.2`}
                      strokeDashoffset={`-${((stats.completed + stats.confirmed) / stats.totalAppointments) * 251.2}`}
                      transform="rotate(-90 50 50)"
                    />
                    <circle
                      cx="50" cy="50" r="40" fill="none"
                      stroke="#ef4444" strokeWidth="12"
                      strokeDasharray={`${(stats.cancelled / stats.totalAppointments) * 251.2} 251.2`}
                      strokeDashoffset={`-${((stats.completed + stats.confirmed + stats.pending) / stats.totalAppointments) * 251.2}`}
                      transform="rotate(-90 50 50)"
                    />
                  </>
                )}
                <text x="50" y="50" textAnchor="middle" dy=".3em" className="donut-text">
                  {stats.totalAppointments}
                </text>
              </svg>
            </div>
            <div className="status-legend">
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#22c55e' }}></span>
                <span>Completed ({stats.completed})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
                <span>Confirmed ({stats.confirmed})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#f59e0b' }}></span>
                <span>Pending ({stats.pending})</span>
              </div>
              <div className="legend-item">
                <span className="legend-dot" style={{ background: '#ef4444' }}></span>
                <span>Cancelled ({stats.cancelled})</span>
              </div>
            </div>
          </div>
        </div>

        {/* Monthly Trend */}
        <div className="chart-card fade-in-up">
          <div className="chart-header">
            <h3>📆 Monthly Trend</h3>
          </div>
          <div className="bar-chart">
            {stats.monthlyData.map((data, index) => (
              <div key={index} className="bar-item">
                <div className="bar-wrapper">
                  <div
                    className="bar"
                    style={{ height: `${(data.count / maxMonthlyCount) * 100}%` }}
                  >
                    <span className="bar-value">{data.count}</span>
                  </div>
                </div>
                <span className="bar-label">{data.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Service Breakdown */}
        <div className="chart-card services-card fade-in-up">
          <div className="chart-header">
            <h3>🦷 Popular Services</h3>
          </div>
          <div className="services-list">
            {stats.serviceBreakdown.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">📋</span>
                <p>No service data available</p>
              </div>
            ) : (
              stats.serviceBreakdown.map((service, index) => (
                <div key={index} className="service-item stagger-item">
                  <div className="service-info">
                    <span className="service-name">{service.name}</span>
                    <span className="service-count">{service.count} appointments</span>
                  </div>
                  <div className="service-bar-wrapper">
                    <div
                      className="service-bar"
                      style={{
                        width: `${service.percentage}%`,
                        background: getServiceColor(index)
                      }}
                    ></div>
                    <span className="service-percentage">{service.percentage}%</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="chart-card quick-stats-card fade-in-up">
          <div className="chart-header">
            <h3>📋 Quick Stats</h3>
          </div>
          <div className="quick-stats-list">
            <div className="quick-stat-item">
              <div className="quick-stat-icon patients-icon">👥</div>
              <div className="quick-stat-info">
                <span className="quick-stat-value">{stats.totalPatients}</span>
                <span className="quick-stat-label">Total Patients</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-icon dentists-icon">🦷</div>
              <div className="quick-stat-info">
                <span className="quick-stat-value">{stats.totalDentists}</span>
                <span className="quick-stat-label">Active Dentists</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-icon rate-icon">📊</div>
              <div className="quick-stat-info">
                <span className="quick-stat-value">
                  {stats.totalAppointments > 0
                    ? Math.round((stats.completed / stats.totalAppointments) * 100)
                    : 0}%
                </span>
                <span className="quick-stat-label">Completion Rate</span>
              </div>
            </div>
            <div className="quick-stat-item">
              <div className="quick-stat-icon services-icon">💊</div>
              <div className="quick-stat-info">
                <span className="quick-stat-value">{stats.serviceBreakdown.length}</span>
                <span className="quick-stat-label">Services Offered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}