// backend/routes/meetings.js
const express = require('express');
const router = express.Router();
const Meeting = require('../models/Meeting');
const verifyToken = require('../middleware/authMiddleware');

// GET /api/meetings?status=agendado&page=1&limit=10
router.get('/', verifyToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = status ? { status } : {};
    const meetings = await Meeting.find(filter)
      .sort({ date: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/meetings - Criação por vendedor (com campos adicionais)
router.post('/', verifyToken, async (req, res) => {
  if (req.user.role !== 'vendedor') {
    return res.status(403).json({ error: "Apenas vendedores podem cadastrar reuniões" });
  }
  const { date, time, agenda, location, priority } = req.body;
  const seller = req.user.username;
  try {
    const meeting = await Meeting.create({ seller, date, time, agenda, location, priority });
    
    // Emite evento para atualização em tempo real
    const io = req.app.get('io');
    if (io) io.emit('new-meeting', meeting);

    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/meetings/:id/cancel - Cancelamento por vendedor (se agendado)
router.put('/:id/cancel', verifyToken, async (req, res) => {
  if (req.user.role !== 'vendedor') {
    return res.status(403).json({ error: "Apenas vendedores podem cancelar reuniões" });
  }
  try {
    const meeting = await Meeting.findById(req.params.id);
    if (!meeting) return res.status(404).json({ error: "Reunião não encontrada" });
    if (meeting.status !== 'agendado') {
      return res.status(400).json({ error: "Somente reuniões agendadas podem ser canceladas" });
    }
    meeting.status = 'cancelado';
    await meeting.save();
    
    const io = req.app.get('io');
    if (io) io.emit('update-meeting', meeting);
    
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/meetings/:id - Atualização por gestor (remarcação/alteração)
router.put('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'gestor') {
    return res.status(403).json({ error: "Apenas gestores podem atualizar as reuniões" });
  }
  const { date, time, agenda, location, priority, status, deadline } = req.body;
  try {
    const meeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      { date, time, agenda, location, priority, status, deadline },
      { new: true }
    );
    if (!meeting) return res.status(404).json({ error: "Reunião não encontrada" });
    
    const io = req.app.get('io');
    if (io) io.emit('update-meeting', meeting);
    
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/meetings/:id - Exclusão por gestor
router.delete('/:id', verifyToken, async (req, res) => {
  if (req.user.role !== 'gestor') {
    return res.status(403).json({ error: "Apenas gestores podem excluir reuniões" });
  }
  try {
    const meeting = await Meeting.findByIdAndDelete(req.params.id);
    if (!meeting) return res.status(404).json({ error: "Reunião não encontrada" });
    
    const io = req.app.get('io');
    if (io) io.emit('delete-meeting', meeting);
    
    res.json({ message: "Reunião concluída e excluída" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;