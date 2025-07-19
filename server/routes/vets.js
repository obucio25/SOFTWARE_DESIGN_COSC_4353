const express = require('express');
const router = express.Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const restrictTo = require('../middleware/role');


// Generic CRUD endpoints for vets
router.get('/', auth, restrictTo('manager'), async (req, res) => {
  try {
    const [vets] = await pool.query('SELECT * FROM users WHERE role = ?', ['veterinarian']);
    res.json(vets);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.get('/:id', auth, restrictTo('manager'), async (req, res) => {
  try {
    const [vets] = await pool.query('SELECT * FROM users WHERE id_user = ? AND role = ?', [req.params.id, 'veterinarian']);
    if (vets.length === 0) return res.status(404).json({ message: 'Vet not found' });
    res.json(vets[0]);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/', auth, restrictTo('manager'), async (req, res) => {
  const { name, email, password, adrees_idadrees_id, adrees_state_state_id } = req.body;
  if (!name || !email || !password) return res.status(400).json({ message: 'Missing required fields' });
  try {
    // Hash password (in real app, use bcrypt)
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, adrees_idadrees_id, adrees_state_state_id) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, password, 'veterinarian', adrees_idadrees_id, adrees_state_state_id]
    );
    res.status(201).json({ message: 'Vet created', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.put('/:id', auth, restrictTo('manager'), async (req, res) => {
  const { name, email, adrees_idadrees_id, adrees_state_state_id } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE users SET name=?, email=?, adrees_idadrees_id=?, adrees_state_state_id=? WHERE id_user=? AND role=?',
      [name, email, adrees_idadrees_id, adrees_state_state_id, req.params.id, 'veterinarian']
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Vet not found' });
    res.json({ message: 'Vet updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.delete('/:id', auth, restrictTo('manager'), async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id_user=? AND role=?', [req.params.id, 'veterinarian']);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Vet not found' });
    res.json({ message: 'Vet deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Add a medical record
router.post('/medical-record', auth, restrictTo('veterinarian'), async (req, res) => {
  const { record_type, record_date, created_at, note, animal_id } = req.body;

  if (!record_type || !record_date || !created_at || !note || !animal_id) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    // Get the next records_id (manual ID since no AUTO_INCREMENT)
    const [rows] = await pool.query('SELECT MAX(records_id) as maxId FROM medical_records');
    const nextId = (rows[0].maxId || 0) + 1;

    await pool.query(
      `INSERT INTO medical_records 
        (records_id, record_type, record_date, created_at, note, ANIMALS_id_animal) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [nextId, record_type, record_date, created_at, note, animal_id]
    );

    res.status(201).json({ message: 'Medical record added successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Get medical history for an animal
router.get('/medical-history/:animal_id', auth, restrictTo('veterinarian'), async (req, res) => {
  const animal_id = req.params.animal_id;

  try {
    const [records] = await pool.query(
      'SELECT * FROM medical_records WHERE ANIMALS_id_animal = ? ORDER BY record_date DESC',
      [animal_id]
    );

    res.status(200).json(records);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});


// Mark animal as ready for adoption
router.put('/ready-status/:animal_id', auth, restrictTo('veterinarian'), async (req, res) => {
  const animal_id = req.params.animal_id;

  try {
    const [update] = await pool.query(
      `UPDATE animals 
       SET status = 'available' 
       WHERE id_animal = ?`,
      [animal_id]
    );

    if (update.affectedRows === 0) {
      return res.status(404).json({ message: 'Animal not found' });
    }

    res.status(200).json({ message: 'Animal marked as available for adoption' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
