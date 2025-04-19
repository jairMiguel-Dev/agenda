// backend/routes/seed.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Endpoint para criar um ADM (gestor) para testes
router.post('/admin', async (req, res) => {
  console.log("Rota /api/seed/admin acessada");
  try {
    const existingAdmin = await User.findOne({ role: 'gestor' });
    if (existingAdmin) {
      return res.status(400).json({ error: "Admin já existe" });
    }
    
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username e password são obrigatórios" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAdmin = await User.create({ username, password: hashedPassword, role: 'gestor' });
    res.json(newAdmin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;