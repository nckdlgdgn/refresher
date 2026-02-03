// Entry point for Express backend
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory user store (replace with DB in production)
const users = [];
const treatments = [
  { id: 1, name: 'General Checkup', price: 50, duration: '≥ 1 hour', type: 'SINGLE VISIT', rating: null, reviews: 0 },
  { id: 2, name: 'Teeth Whitening', price: 300, duration: '≥ 1 hour', type: 'MULTIPLE VISIT', rating: null, reviews: 0 },
  { id: 3, name: 'Teeth Cleaning', price: 75, duration: '≥ 1 hour', type: 'SINGLE VISIT', rating: 3.8, reviews: 48 },
  { id: 4, name: 'Tooth Extraction', price: 300, duration: '≥ 1 hour', type: 'MULTIPLE VISIT', rating: 4.5, reviews: 110 },
  { id: 5, name: 'Tooth Fillings', price: 210, duration: '≈ 1.5 hour', type: 'SINGLE VISIT', rating: 3.2, reviews: 75 },
  { id: 6, name: 'Tooth Scaling', price: 140, duration: '≈ 1.5 hour', type: 'MULTIPLE VISIT', rating: 4.5, reviews: 166 },
  { id: 7, name: 'Tooth Braces (Metal)', price: 3000, duration: '≥ 1.5 hour', type: 'MULTIPLE VISIT', rating: 4.0, reviews: 220 },
  { id: 8, name: 'Veneers', price: 925, duration: '≥ 1.5 hour', type: 'SINGLE VISIT', rating: 4.0, reviews: 32 },
  { id: 9, name: 'Bonding', price: 190, duration: '≥ 1.5 hour', type: 'SINGLE VISIT', rating: 4.0, reviews: 40 },
];
const appointments = [];
const patients = [];
const dentists = [];
const schedules = [];

// Appointments CRUD
app.get('/api/appointments', auth, (req, res) => res.json(appointments));
app.post('/api/appointments', auth, (req, res) => {
  const { patient, dentist, date, time, service, status } = req.body;
  if (!patient || !dentist || !date || !time || !service) return res.status(400).json({ message: 'Missing fields' });
  // Prevent double-booking
  if (appointments.some(a => a.dentist === dentist && a.date === date && a.time === time))
    return res.status(409).json({ message: 'Dentist already booked' });
  const appt = { id: appointments.length ? Math.max(...appointments.map(a=>a.id))+1 : 1, patient, dentist, date, time, service, status: status || 'Pending' };
  appointments.push(appt);
  res.json(appt);
});
app.put('/api/appointments/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const a = appointments.find(a => a.id === id);
  if (!a) return res.status(404).json({ message: 'Not found' });
  Object.assign(a, req.body);
  res.json(a);
});
app.delete('/api/appointments/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = appointments.findIndex(a => a.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  appointments.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

// Patients CRUD
app.get('/api/patients', auth, (req, res) => res.json(patients));
app.post('/api/patients', auth, (req, res) => {
  const { name, contact } = req.body;
  if (!name || !contact) return res.status(400).json({ message: 'Missing fields' });
  const p = { id: patients.length ? Math.max(...patients.map(p=>p.id))+1 : 1, name, contact, history: [] };
  patients.push(p);
  res.json(p);
});
app.put('/api/patients/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const p = patients.find(p => p.id === id);
  if (!p) return res.status(404).json({ message: 'Not found' });
  Object.assign(p, req.body);
  res.json(p);
});
app.delete('/api/patients/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = patients.findIndex(p => p.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  patients.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

// Dentists CRUD
app.get('/api/dentists', auth, (req, res) => res.json(dentists));
app.post('/api/dentists', auth, (req, res) => {
  const { name, specialization, available } = req.body;
  if (!name || !specialization) return res.status(400).json({ message: 'Missing fields' });
  const d = { id: dentists.length ? Math.max(...dentists.map(d=>d.id))+1 : 1, name, specialization, available: available || [] };
  dentists.push(d);
  res.json(d);
});
app.put('/api/dentists/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const d = dentists.find(d => d.id === id);
  if (!d) return res.status(404).json({ message: 'Not found' });
  Object.assign(d, req.body);
  res.json(d);
});
app.delete('/api/dentists/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = dentists.findIndex(d => d.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  dentists.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

// Schedules CRUD (for calendar)
app.get('/api/schedules', auth, (req, res) => res.json(schedules));
app.post('/api/schedules', auth, (req, res) => {
  const { title, date, startTime, endTime, type, description, dentistId } = req.body;
  if (!title || !date) return res.status(400).json({ message: 'Missing fields' });
  const s = { 
    id: schedules.length ? Math.max(...schedules.map(s=>s.id))+1 : 1, 
    title, date, startTime, endTime, type: type || 'schedule', description, dentistId 
  };
  schedules.push(s);
  res.json(s);
});
app.put('/api/schedules/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const s = schedules.find(s => s.id === id);
  if (!s) return res.status(404).json({ message: 'Not found' });
  Object.assign(s, req.body);
  res.json(s);
});
app.delete('/api/schedules/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = schedules.findIndex(s => s.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  schedules.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

const JWT_SECRET = 'classicdental_secret_key';
// Treatments CRUD endpoints
app.get('/api/treatments', auth, (req, res) => {
  res.json(treatments);
});

app.post('/api/treatments', auth, (req, res) => {
  const { name, price, duration, type } = req.body;
  if (!name || !price || !duration || !type) return res.status(400).json({ message: 'Missing fields' });
  const newTreatment = {
    id: treatments.length ? Math.max(...treatments.map(t => t.id)) + 1 : 1,
    name, price, duration, type, rating: null, reviews: 0
  };
  treatments.push(newTreatment);
  res.json(newTreatment);
});

app.put('/api/treatments/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const t = treatments.find(tr => tr.id === id);
  if (!t) return res.status(404).json({ message: 'Not found' });
  const { name, price, duration, type } = req.body;
  if (name) t.name = name;
  if (price) t.price = price;
  if (duration) t.duration = duration;
  if (type) t.type = type;
  res.json(t);
});

app.delete('/api/treatments/:id', auth, (req, res) => {
  const id = parseInt(req.params.id);
  const idx = treatments.findIndex(tr => tr.id === id);
  if (idx === -1) return res.status(404).json({ message: 'Not found' });
  treatments.splice(idx, 1);
  res.json({ message: 'Deleted' });
});

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send('Classic Dental Scheduling System API');
});

// Register endpoint
app.post('/api/register', async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) return res.status(400).json({ message: 'Missing fields' });
  if (users.find(u => u.username === username)) return res.status(409).json({ message: 'User exists' });
  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed, role });
  res.json({ message: 'Registered successfully' });
});

// Login endpoint
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ username, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({ token, role: user.role });
});

// Middleware to protect routes
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Example protected route
app.get('/api/profile', auth, (req, res) => {
  res.json({ user: req.user });
});

const PORT = process.env.PORT || 5000;

// For local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

// Export for Vercel serverless
module.exports = app;
