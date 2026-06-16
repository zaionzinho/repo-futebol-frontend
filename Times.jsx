import { useState } from 'react';
import { api } from '../api';

const VAZIO = { nome: '', cidade: '', escudo: '⚽', fundacao: '' };

export default function Times({ times, onAtualizar }) {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(VAZIO);
  const [editId, setEditId] = useState(null);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);

  function abrir(time = null) {
    if (time) {
      setForm({ nome: time.nome, cidade: time.cidade, escudo: time.escudo, fundacao: time.fundacao || '' });
      setEditId(time._id);
    } else {
      setForm(VAZIO);
      setEditId(null);
    }
    setErro('');
    setModal(true);
  }

  function fechar() { setModal(false); setErro(''); }

  async function salvar() {
    if (!form.nome || !form.cidade) { setErro('Nome e cidade são obrigatórios.'); return; }
    setSalvando(true);
    try {
      if (editId) await api.atualizarTime(editId, form);
      else await api.criarTime(form);
      fechar();
      onAtualizar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  async function deletar(id, nome) {
    if (!confirm(`Remover o time "${nome}"?`)) return;
    try {
      await api.deletarTime(id);
      onAtualizar();
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div>
      <button className="btn-add" onClick={() => abrir()}>+ Novo Time</button>

      {times.length === 0 && <p style={{ color: '#94a3b8' }}>Nenhum time cadastrado ainda.</p>}

      {times.map((t) => (
        <div key={t._id} className="card">
          <div className="card-header">
            <div>
              <div className="card-titulo">{t.escudo} {t.nome}</div>
              <div className="card-sub">📍 {t.cidade}{t.fundacao ? ` · Fundado em ${t.fundacao}` : ''}</div>
              <div className="stats">
                <div>✅ <span>{t.vitorias}</span> V</div>
                <div>🤝 <span>{t.empates}</span> E</div>
                <div>❌ <span>{t.derrotas}</span> D</div>
              </div>
            </div>
            <div className="btns">
              <button className="btn btn-edit" onClick={() => abrir(t)}>Editar</button>
              <button className="btn btn-del" onClick={() => deletar(t._id, t.nome)}>Remover</button>
            </div>
          </div>
        </div>
      ))}

      {modal && (
        <div className="modal-overlay" onClick={fechar}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Editar Time' : 'Novo Time'}</h2>
            {erro && <p style={{ color: '#f87171', marginBottom: '0.75rem', fontSize: '0.85rem' }}>{erro}</p>}
            <div className="campo">
              <label>Nome do Time *</label>
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Flamengo" />
            </div>
            <div className="campo">
              <label>Cidade *</label>
              <input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} placeholder="Ex: Rio de Janeiro" />
            </div>
            <div className="campo">
              <label>Escudo (emoji)</label>
              <input value={form.escudo} onChange={(e) => setForm({ ...form, escudo: e.target.value })} placeholder="⚽" maxLength={4} />
            </div>
            <div className="campo">
              <label>Ano de Fundação</label>
              <input type="number" value={form.fundacao} onChange={(e) => setForm({ ...form, fundacao: e.target.value })} placeholder="Ex: 1895" />
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
