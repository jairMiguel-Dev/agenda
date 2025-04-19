// frontend/src/pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

function Dashboard({ user, onLogout }) {
  // Estados para reuniões
  const [meetings, setMeetings] = useState([]);
  // Campos para criação de reunião (para vendedores)
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [agenda, setAgenda] = useState("");
  const [location, setLocation] = useState("");
  const [priority, setPriority] = useState("média");
  // Estados para filtros
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  // Estados para gerenciamento de vendedores (gestores)
  const [sellers, setSellers] = useState([]);
  const [newSellerName, setNewSellerName] = useState("");
  const [newSellerPassword, setNewSellerPassword] = useState("");

  const token = localStorage.getItem("token");

  // Função para buscar todas as reuniões
  const fetchMeetings = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/meetings", {
        headers: { authorization: token },
      });
      setMeetings(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Função para buscar vendedores (se usuário for gestor)
  const fetchSellers = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/users/sellers", {
        headers: { authorization: token },
      });
      setSellers(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  // Dispara chamadas iniciais e configura Socket.IO
  useEffect(() => {
    fetchMeetings();
    if (user.role === "gestor") {
      fetchSellers();
    }

    const socket = io("http://localhost:5000");
    socket.on("new-meeting", () => fetchMeetings());
    socket.on("update-meeting", () => fetchMeetings());
    socket.on("delete-meeting", () => fetchMeetings());

    return () => socket.disconnect();
  }, []);

  // Criação de reunião (apenas para vendedores)
  const handleMeetingSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/meetings",
        { date, time, agenda, location, priority },
        { headers: { authorization: token } }
      );
      fetchMeetings();
      setDate("");
      setTime("");
      setAgenda("");
      setLocation("");
      setPriority("média");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Erro ao cadastrar reunião");
    }
  };

  // Cancelamento de reunião para vendedores
  const handleCancelMeeting = async (id) => {
    try {
      await axios.put(
        `http://localhost:5000/api/meetings/${id}/cancel`,
        {},
        { headers: { authorization: token } }
      );
      fetchMeetings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Erro ao cancelar reunião");
    }
  };

  // Atualização de reunião (para gestores: marcar como concluída, por exemplo)
  const handleUpdateMeeting = async (id, updateData) => {
    try {
      await axios.put(`http://localhost:5000/api/meetings/${id}`, updateData, {
        headers: { authorization: token },
      });
      fetchMeetings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Erro ao atualizar reunião");
    }
  };

  // Exclusão de reunião (para gestores)
  const handleDeleteMeeting = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/meetings/${id}`, {
        headers: { authorization: token },
      });
      fetchMeetings();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Erro ao excluir reunião");
    }
  };

  // Adicionar vendedor (gestor)
  const handleAddSeller = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5000/api/users",
        { username: newSellerName, password: newSellerPassword },
        { headers: { authorization: token } }
      );
      fetchSellers();
      setNewSellerName("");
      setNewSellerPassword("");
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Erro ao adicionar vendedor");
    }
  };

  // Excluir vendedor (gestor)
  const handleDeleteSeller = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/users/${id}`, {
        headers: { authorization: token },
      });
      fetchSellers();
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.error || "Erro ao excluir vendedor");
    }
  };

  // Filtra as reuniões com base nos filtros informados
  const filteredMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date).toISOString().split("T")[0];
    return (
      (search ? meeting.agenda.toLowerCase().includes(search.toLowerCase()) : true) &&
      (statusFilter ? meeting.status === statusFilter : true) &&
      (priorityFilter ? meeting.priority === priorityFilter : true) &&
      (dateFilter ? meetingDate === dateFilter : true)
    );
  });

  // Agenda do dia: filtra as reuniões com data igual a hoje
  const today = new Date().toISOString().split("T")[0];
  const todaysMeetings = meetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date).toISOString().split("T")[0];
    return meetingDate === today;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Cabeçalho com dados do usuário e botão de logout */}
      <header className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Agenda de Reuniões</h1>
          <p>
            {user.username} - {user.role}
          </p>
        </div>
        <button onClick={onLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </header>

      <main className="p-4 container mx-auto">
        {/* Seção: Tarefas do Dia */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Tarefas do Dia</h2>
          {todaysMeetings.length > 0 ? (
            <ul className="space-y-4">
              {todaysMeetings.map((meeting) => (
                <li key={meeting._id} className="bg-white p-4 rounded shadow-md flex flex-col">
                  <div className="flex justify-between">
                    <div>
                      <p>
                        <strong>Hora:</strong> {meeting.time}
                      </p>
                      <p>
                        <strong>Agenda:</strong> {meeting.agenda}
                      </p>
                      <p>
                        <strong>Status:</strong> {meeting.status}
                      </p>
                    </div>
                    <div>
                      {user.role === "vendedor" && meeting.status === "agendado" && (
                        <button
                          onClick={() => handleCancelMeeting(meeting._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Cancelar
                        </button>
                      )}
                      {user.role === "gestor" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateMeeting(meeting._id, { status: "concluído" })
                            }
                            className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                          >
                            Concluir
                          </button>
                          <button
                            onClick={() => handleDeleteMeeting(meeting._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p>
                    <strong>Local:</strong> {meeting.location}
                  </p>
                  <p>
                    <strong>Prioridade:</strong> {meeting.priority}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">Nenhuma tarefa agendada para hoje.</p>
          )}
        </section>

        {/* Seção: Criação de nova reunião (apenas para vendedores) */}
        {user.role === "vendedor" && (
          <section className="mb-8 bg-white p-4 rounded shadow-md">
            <h2 className="text-xl font-semibold mb-4">Cadastrar Nova Reunião</h2>
            <form onSubmit={handleMeetingSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1">Data:</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1">Hora:</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1">Agenda:</label>
                  <input
                    type="text"
                    value={agenda}
                    onChange={(e) => setAgenda(e.target.value)}
                    className="w-full border p-2 rounded"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-1">Local/Link:</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full border p-2 rounded"
                  />
                </div>
                <div>
                  <label className="block mb-1">Prioridade:</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full border p-2 rounded"
                  >
                    <option value="baixa">Baixa</option>
                    <option value="média">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
              </div>
              <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded mt-4">
                Enviar
              </button>
            </form>
          </section>
        )}

        {/* Seção: Filtros e listagem completa de reuniões */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Todas as Reuniões</h2>
          <div className="mb-4 flex flex-wrap gap-4">
            <input
              type="text"
              placeholder="Buscar reunião..."
              className="border p-2 rounded"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="border p-2 rounded"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Status</option>
              <option value="agendado">Agendado</option>
              <option value="concluído">Concluído</option>
              <option value="cancelado">Cancelado</option>
            </select>
            <select
              className="border p-2 rounded"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="">Prioridade</option>
              <option value="alta">Alta</option>
              <option value="média">Média</option>
              <option value="baixa">Baixa</option>
            </select>
            <input
              type="date"
              className="border p-2 rounded"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
          {filteredMeetings.length > 0 ? (
            <ul className="space-y-4">
              {filteredMeetings.map((meeting) => (
                <li key={meeting._id} className="bg-white p-4 rounded shadow-md flex flex-col">
                  <div className="flex justify-between">
                    <div>
                      <p>
                        <strong>Data:</strong>{" "}
                        {new Date(meeting.date).toLocaleDateString()}
                      </p>
                      <p>
                        <strong>Hora:</strong> {meeting.time}
                      </p>
                      <p>
                        <strong>Agenda:</strong> {meeting.agenda}
                      </p>
                      <p>
                        <strong>Status:</strong> {meeting.status}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      {user.role === "vendedor" && meeting.status === "agendado" && (
                        <button
                          onClick={() => handleCancelMeeting(meeting._id)}
                          className="bg-red-500 text-white px-3 py-1 rounded"
                        >
                          Cancelar
                        </button>
                      )}
                      {user.role === "gestor" && (
                        <>
                          <button
                            onClick={() =>
                              handleUpdateMeeting(meeting._id, { status: "concluído" })
                            }
                            className="bg-green-500 text-white px-3 py-1 rounded"
                          >
                            Concluir
                          </button>
                          <button
                            onClick={() => handleDeleteMeeting(meeting._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded"
                          >
                            Excluir
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p>
                    <strong>Local:</strong> {meeting.location}
                  </p>
                  <p>
                    <strong>Prioridade:</strong> {meeting.priority}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-700">Nenhuma reunião encontrada.</p>
          )}
        </section>

        {/* Seção: Gestão de Vendedores (exclusiva para gestores) */}
        {user.role === "gestor" && (
          <section className="mb-8 bg-white p-4 rounded shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Gestão de Vendedores</h2>
            <form onSubmit={handleAddSeller} className="mb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <input
                  type="text"
                  placeholder="Nome do Vendedor"
                  className="border p-2 rounded flex-1"
                  value={newSellerName}
                  onChange={(e) => setNewSellerName(e.target.value)}
                  required
                />
                <input
                  type="password"
                  placeholder="Senha"
                  className="border p-2 rounded flex-1"
                  value={newSellerPassword}
                  onChange={(e) => setNewSellerPassword(e.target.value)}
                  required
                />
                <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
                  Adicionar
                </button>
              </div>
            </form>
            <div>
              {sellers.length > 0 ? (
                <ul className="space-y-2">
                  {sellers.map((seller) => (
                    <li key={seller._id} className="flex justify-between items-center border-b pb-2">
                      <span>{seller.username}</span>
                      <button
                        onClick={() => handleDeleteSeller(seller._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Excluir
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-700">Nenhum vendedor cadastrado.</p>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default Dashboard;