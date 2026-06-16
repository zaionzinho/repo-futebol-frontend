import { useState } from 'react';
import { api } from '../api';

const VAZIO = {
  timeCasaId: '',
  timeVisitanteId: '',
  golsCasa: 0,
  golsVisitante: 0,
  data: '',
  estadio: '',
  status: 'agendada',
};

const STATUS_BADGE = {
  agendada: 'badge-agendada',
  'em andamento': 'badge-em-andamento',
  encerrada: 'badge-encerrada',
};

function formatarData(d) {
  return new Date(d).toLocaleDateString('pt-BR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function Partidas({ partidas, times, onAtualizar }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function abrir(p = null) {
    if (p) {
      setForm({
        timeCasaId: p.timeCasa?.id || p.timeCasaId || '',
        timeVisitanteId: p.timeVisitante?.id || p.timeVisitanteId || '',
        golsCasa: p.golsCasa,
        golsVisitante: p.golsVisitante,
        data: p.data ? p.data.slice(0, 16) : '',
        estadio: p.estadio,
        status: p.status,
      });
      setEditId(p.id);
    } else {
      setForm(VAZIO);
      setEditId(null);
    }
    setErro('');
    setModal(true);
  }

  function fechar() { setModal(false); setErro(''); }

  async function salvar() {
    if (!form.timeCasaId || !form.timeVisitanteId || !form.data) {
      setErro('Times e data são obrigatórios.'); return;
    }
    if (form.timeCasaId === form.timeVisitanteId) {
      setErro('Os times devem ser diferentes.'); return;
    }
    setSalvando(true);
    try {
      if (editId) await api.atualizarPartida(editId, form);
      else await api.criarPartida(form);
      fechar();
      onAtualizar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function deletar(id) {
    if (!confirm('Remover esta partida?')) return;
    try {
      await api.deletarPartida(id);
      onAtualizar();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div>
      <button className="btn-add" onClick={() => abrir()}>+ Nova Partida</button>
      {times.length < 2 && (
        <p style={{ color: '#fbbf24', fontSize: '0.85rem', marginBottom: '1rem' }}>
          ⚠️ Cadastre pelo menos 2 times para criar partidas.
        </p>
      )}

      {partidas.length === 0 && <p style={{ color: '#94a3b8' }}>Nenhuma partida cadastrada ainda.</p>}

      {partidas.map((p) => (
        <div key={p.id} className="card">
          <div className="card-header">
            <div style={{ flex: 1 }}>
              <div className="placar">
                <span>{p.timeCasa?.escudo} {p.timeCasa?.nome}</span>
                <span className="placar-num">{p.golsCasa} × {p.golsVisitante}</span>
                <span>{p.timeVisitante?.nome} {p.timeVisitante?.escudo}</span>
              </div>
              <div className="card-sub" style={{ marginTop: '0.4rem' }}>
                🗓️ {formatarData(p.data)}
                {p.estadio && p.estadio !== 'A definir' ? ` · 🏟️ ${p.estadio}` : ''}
              </div>
              <div style={{ marginTop: '0.4rem' }}>
                <span className={`badge ${STATUS_BADGE[p.status]}`}>{p.status}</span>
              </div>
            </div>
            <div className="btns">
              <button className="btn btn-edit" onClick={() => abrir(p)}>Editar</button>
              <button className="btn btn-del" onClick={() => deletar(p.id)}>Remover</button>
            </div>
          </div>
        </div>
      ))}

      {modal && (
        <div className="modal-overlay" onClick={fechar}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Editar Partida' : 'Nova Partida'}</h2>
            {erro && <p style={{ color: '#f87171', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{erro}</p>}
            <div className="campo">
              <label>Time da Casa *</label>
              <select value={form.timeCasaId} onChange={(e) => setForm({ ...form, timeCasaId: e.target.value })}>
                <option value="">Selecione...</option>
                {times.map((t) => <option key={t.id} value={t.id}>{t.escudo} {t.nome}</option>)}
              </select>
            </div>
            <div className="campo">
              <label>Time Visitante *</label>
              <select value={form.timeVisitanteId} onChange={(e) => setForm({ ...form, timeVisitanteId: e.target.value })}>
                <option value="">Selecione...</option>
                {times.map((t) => <option key={t.id} value={t.id}>{t.escudo} {t.nome}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <div className="campo" style={{ flex: 1 }}>
                <label>Gols Casa</label>
                <input type="number" min="0" value={form.golsCasa} onChange={(e) => setForm({ ...form, golsCasa: Number(e.target.value) })} />
              </div>
              <div className="campo" style={{ flex: 1 }}>
                <label>Gols Visitante</label>
                <input type="number" min="0" value={form.golsVisitante} onChange={(e) => setForm({ ...form, golsVisitante: Number(e.target.value) })} />
              </div>
            </div>
            <div className="campo">
              <label>Data e Hora *</label>
              <input type="datetime-local" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>
            <div className="campo">
              <label>Estádio</label>
              <input value={form.estadio} onChange={(e) => setForm({ ...form, estadio: e.target.value })} placeholder="Ex: Maracanã" />
            </div>
            <div className="campo">
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="agendada">Agendada</option>
                <option value="em andamento">Em andamento</option>
                <option value="encerrada">Encerrada</option>
              </select>
            </div>
            <div className="modal-btns">
              <button className="btn-cancelar" onClick={fechar}>Cancelar</button>
              <button className="btn-salvar" onClick={salvar} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
