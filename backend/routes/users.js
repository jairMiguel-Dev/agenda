// backend/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/users/sellers - Lista vendedores (apenas para gestores)
router.get('/sellers', verifyToken, async (req, res) => {
  if (req.user.role !== 'gestor') {
    return res.status(403).json({ error: "Apenas gestores podem visualizar vendedores" });
  }
  try {
    const sellers = await User.find({ role: 'vendedor' });
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users - Cria um novo vendedor (apenas para gestores)
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'gestor') {
    return res.status(403).json({ error: "Apenas gestores podem cadastrar vendedores" });
  }
  const { username, password } = req.body;
  try {
    const existing = await User.findOne({ username });
    if (existing) return res.status(400).json({ error: "Usuário já existe" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const newSeller = await User.create({ username, password: hashedPassword, role: 'vendedor' });
    res.json(newSeller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/users/:id - Exclui um vendedor (apenas para gestores)
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'gestor') {
    return res.status(403).json({ error: "Apenas gestores podem excluir vendedores" });
  }
  try {
    const seller = await User.findById(req.params.id);
    if (!seller || seller.role !== 'vendedor') {
      return res.status(404).json({ error: "Vendedor não encontrado" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Vendedor excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;