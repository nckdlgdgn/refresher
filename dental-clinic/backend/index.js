// Entry point for Express backend with Supabase
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

const app = express();

app.use(cors());
app.use(express.json());

// Supabase Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://foqgxloqeehpasvormmb.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvcWd4bG9xZWVocGFzdm9ybW1iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwOTY3NTgsImV4cCI6MjA4NTY3Mjc1OH0.goU03ShXFU_l4TbRDDLfJEbr5-uBbiqzcd10-gS4GpY';
const JWT_SECRET = process.env.JWT_SECRET || 'classicdental_secret_key';

// Resend Email Configuration
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_JV88WTT8_M4aR6kk7WSgpZiLHQLRqapp1';
const resend = new Resend(RESEND_API_KEY);

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test email endpoint
app.get('/api/test-email', async (req, res) => {
  try {
    if (!RESEND_API_KEY) {
      return res.status(500).json({ success: false, error: 'RESEND_API_KEY not configured' });
    }
    const { data, error } = await resend.emails.send({
      from: 'Classic Dental <onboarding@resend.dev>',
      to: 'nickodalugdugan27@gmail.com',
      subject: 'Test Email from Classic Dental',
      text: 'If you receive this, email is working!'
    });
    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }
    res.json({ success: true, messageId: data.id });
  } catch (err) {
    console.error('Email test error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// ===================== AUTH MIDDLEWARE =====================
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

// Admin only middleware
function adminOnly(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

// ===================== ROOT =====================
app.get('/', (req, res) => {
  res.json({ 
    message: 'Classic Dental Scheduling System API',
    database: 'Supabase',
    status: 'Running'
  });
});

// ===================== AUTH ENDPOINTS =====================
// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, password, role, email } = req.body;
    if (!username || !password || !role || !email) {
      return res.status(400).json({ message: 'All fields are required including email' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Check if email exists
    const { data: existingEmail } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingEmail) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password and create user
    const hashed = await bcrypt.hash(password, 10);
    const { data, error } = await supabase
      .from('users')
      .insert([{ username, password: hashed, role, email }])
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Registered successfully', userId: data.id });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Allow login with username OR email
    let user;
    const { data: userByUsername } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (userByUsername) {
      user = userByUsername;
    } else {
      // Try to find by email
      const { data: userByEmail } = await supabase
        .from('users')
        .select('*')
        .eq('email', username)
        .single();
      user = userByEmail;
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({ token, role: user.role, username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Get all users (Admin only)
app.get('/api/users', auth, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, email, role, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ count: data.length, users: data });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users', error: err.message });
  }
});

// Get current user profile
app.get('/api/profile', auth, async (req, res) => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email, role, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;
    res.json({ user });
  } catch (err) {
    res.json({ user: req.user });
  }
});

// Update current user profile
app.put('/api/profile', auth, async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Get current user
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (fetchError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const updates = {};

    // Update email if provided
    if (email && email !== user.email) {
      // Check if email already exists
      const { data: existingEmail } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', userId)
        .single();

      if (existingEmail) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      updates.email = email;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }
      
      const validPassword = await bcrypt.compare(currentPassword, user.password);
      if (!validPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      updates.password = await bcrypt.hash(newPassword, 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No changes to save' });
    }

    // Apply updates
    const { error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (updateError) throw updateError;

    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ message: 'Failed to update profile', error: err.message });
  }
});

// Admin reset password (Admin only)
app.post('/api/users/:id/reset-password', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const { error } = await supabase
      .from('users')
      .update({ password: hashed })
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to reset password', error: err.message });
  }
});

// Delete user (Admin only)
app.delete('/api/users/:id', auth, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete user', error: err.message });
  }
});

// Forgot password - request reset
app.post('/api/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('email', email)
      .single();

    if (error || !user) {
      // Don't reveal if email exists or not for security
      return res.json({ message: 'If this email exists, a reset code has been sent' });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store reset code in database
    await supabase
      .from('users')
      .update({ 
        reset_code: resetCode, 
        reset_expiry: resetExpiry.toISOString() 
      })
      .eq('id', user.id);

    // Send email using Resend
    const { error: emailError } = await resend.emails.send({
      from: 'Classic Dental <onboarding@resend.dev>',
      to: email,
      subject: '🦷 Classic Dental - Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2e8b77;">🦷 Classic Dental</h2>
          <h3>Password Reset Request</h3>
          <p>Hello <strong>${user.username}</strong>,</p>
          <p>Your password reset code is:</p>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2e8b77; border-radius: 10px; margin: 20px 0;">
            ${resetCode}
          </div>
          <p>This code will expire in <strong>15 minutes</strong>.</p>
          <p>If you didn't request this, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #888; font-size: 12px;">Classic Dental Scheduling System</p>
        </div>
      `
    });

    if (emailError) {
      console.error('Email error:', emailError);
      return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }

    res.json({ message: 'Reset code sent to your email' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
  }
});

// Verify reset code and change password
app.post('/api/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    // Find user and verify code
    const { data: user, error } = await supabase
      .from('users')
      .select('id, reset_code, reset_expiry')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Invalid email' });
    }

    if (!user.reset_code || user.reset_code !== code) {
      return res.status(400).json({ message: 'Invalid reset code' });
    }

    if (new Date(user.reset_expiry) < new Date()) {
      return res.status(400).json({ message: 'Reset code has expired' });
    }

    // Update password and clear reset code
    const hashed = await bcrypt.hash(newPassword, 10);
    await supabase
      .from('users')
      .update({ 
        password: hashed, 
        reset_code: null, 
        reset_expiry: null 
      })
      .eq('id', user.id);

    res.json({ message: 'Password changed successfully! You can now login.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
});

// ===================== PATIENTS CRUD =====================
app.get('/api/patients', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch patients', error: err.message });
  }
});

app.post('/api/patients', auth, async (req, res) => {
  try {
    const { name, contact, age, gender, email, address, medicalHistory } = req.body;
    if (!name || !contact) {
      return res.status(400).json({ message: 'Name and contact are required' });
    }
    const { data, error } = await supabase
      .from('patients')
      .insert([{ name, contact, age, gender, email, address, medical_history: medicalHistory }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create patient', error: err.message });
  }
});

app.put('/api/patients/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, contact, age, gender, email, address, medicalHistory } = req.body;
    const { data, error } = await supabase
      .from('patients')
      .update({ name, contact, age, gender, email, address, medical_history: medicalHistory })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update patient', error: err.message });
  }
});

app.delete('/api/patients/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('patients').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete patient', error: err.message });
  }
});

// ===================== DENTISTS CRUD =====================
app.get('/api/dentists', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('dentists')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch dentists', error: err.message });
  }
});

app.post('/api/dentists', auth, async (req, res) => {
  try {
    const { name, specialization, available } = req.body;
    if (!name || !specialization) {
      return res.status(400).json({ message: 'Name and specialization are required' });
    }
    const { data, error } = await supabase
      .from('dentists')
      .insert([{ name, specialization, available: available || [] }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create dentist', error: err.message });
  }
});

app.put('/api/dentists/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, specialization, available } = req.body;
    const { data, error } = await supabase
      .from('dentists')
      .update({ name, specialization, available })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update dentist', error: err.message });
  }
});

app.delete('/api/dentists/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('dentists').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete dentist', error: err.message });
  }
});

// ===================== TREATMENTS CRUD =====================
app.get('/api/treatments', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('treatments')
      .select('*')
      .order('id', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch treatments', error: err.message });
  }
});

app.post('/api/treatments', auth, async (req, res) => {
  try {
    const { name, price, duration, type } = req.body;
    if (!name || !price || !duration || !type) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const { data, error } = await supabase
      .from('treatments')
      .insert([{ name, price, duration, type, rating: null, reviews: 0 }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create treatment', error: err.message });
  }
});

app.post('/api/treatments', auth, async (req, res) => {
  try {
    const { name, price, duration, type } = req.body;
    if (!name || !price || !duration || !type) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const { data, error } = await supabase
      .from('treatments')
      .insert([{ name, price, duration, type, rating: null, reviews: 0 }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create treatment', error: err.message });
  }
});

app.put('/api/treatments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, duration, type } = req.body;
    const { data, error } = await supabase
      .from('treatments')
      .update({ name, price, duration, type })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update treatment', error: err.message });
  }
});

app.delete('/api/treatments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('treatments').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete treatment', error: err.message });
  }
});

// ===================== APPOINTMENTS CRUD =====================
app.get('/api/appointments', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

app.post('/api/appointments', auth, async (req, res) => {
  try {
    const { patient, dentist, date, time, service, status } = req.body;
    if (!patient || !dentist || !date || !time || !service) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Check for double booking
    const { data: existing } = await supabase
      .from('appointments')
      .select('id')
      .eq('dentist', dentist)
      .eq('date', date)
      .eq('time', time)
      .single();

    if (existing) {
      return res.status(409).json({ message: 'Dentist already booked at this time' });
    }

    const { data, error } = await supabase
      .from('appointments')
      .insert([{ patient, dentist, date, time, service, status: status || 'Pending' }])
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create appointment', error: err.message });
  }
});

app.put('/api/appointments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { patient, dentist, date, time, service, status } = req.body;
    const { data, error } = await supabase
      .from('appointments')
      .update({ patient, dentist, date, time, service, status })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update appointment', error: err.message });
  }
});

app.delete('/api/appointments/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('appointments').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete appointment', error: err.message });
  }
});

// ===================== SCHEDULES CRUD =====================
app.get('/api/schedules', auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('schedules')
      .select('*')
      .order('date', { ascending: true });
    if (error) throw error;
    // Map snake_case to camelCase for frontend compatibility
    const mapped = data.map(s => ({
      id: s.id,
      title: s.title,
      date: s.date,
      startTime: s.start_time,
      endTime: s.end_time,
      type: s.type,
      description: s.description,
      dentistId: s.dentist_id,
      patientId: s.patient_id,
      procedure: s.procedure
    }));
    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch schedules', error: err.message });
  }
});

app.post('/api/schedules', auth, async (req, res) => {
  try {
    const { title, date, startTime, endTime, type, description, dentistId, patientId, procedure } = req.body;
    if (!title || !date) {
      return res.status(400).json({ message: 'Title and date are required' });
    }
    const { data, error } = await supabase
      .from('schedules')
      .insert([{ 
        title, date, start_time: startTime, end_time: endTime, 
        type: type || 'schedule', description, dentist_id: dentistId,
        patient_id: patientId, procedure
      }])
      .select()
      .single();
    if (error) throw error;
    res.json({
      id: data.id,
      title: data.title,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      type: data.type,
      description: data.description,
      dentistId: data.dentist_id,
      patientId: data.patient_id,
      procedure: data.procedure
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create schedule', error: err.message });
  }
});

app.put('/api/schedules/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, date, startTime, endTime, type, description, dentistId, patientId, procedure } = req.body;
    const { data, error } = await supabase
      .from('schedules')
      .update({ 
        title, date, start_time: startTime, end_time: endTime, 
        type, description, dentist_id: dentistId,
        patient_id: patientId, procedure
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    res.json({
      id: data.id,
      title: data.title,
      date: data.date,
      startTime: data.start_time,
      endTime: data.end_time,
      type: data.type,
      description: data.description,
      dentistId: data.dentist_id,
      patientId: data.patient_id,
      procedure: data.procedure
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update schedule', error: err.message });
  }
});

app.delete('/api/schedules/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from('schedules').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete schedule', error: err.message });
  }
});

// ===================== SERVER =====================
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Backend running on port ${PORT}`);
  });
}

module.exports = app;
