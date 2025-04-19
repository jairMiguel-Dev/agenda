const mongoose = require('mongoose');

const MeetingSchema = new mongoose.Schema({
  seller: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ['agendado', 'concluído', 'cancelado', 'remarcado'],
    default: 'agendado'
  },
  agenda: { type: String },
  location: { type: String },
  priority: { type: String, enum: ['baixa', 'média', 'alta'], default: 'média' },
  deadline: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Meeting', MeetingSchema);