// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

// Cria a instância do Express
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Cria o servidor HTTP e instancia o Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*' // Modifique em produção para o domínio adequado
  }
});
// Disponibiliza a instância do Socket.IO para as rotas
app.set('io', io);

// Importa as rotas
const seedRoutes = require('./routes/seed');
const authRoutes = require('./routes/auth');
const meetingRoutes = require('./routes/meetings');
const userRoutes = require('./routes/users');

// Registra as rotas
app.use('/api/seed', seedRoutes);
app.use('/api', authRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/users', userRoutes);

// Conecta ao MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error(err));

// Lida com as conexões Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
});

// Inicia o servidor
const port = process.env.PORT || 5000;
server.listen(port, () =>
  console.log(`Servidor rodando na porta ${port}`)
);