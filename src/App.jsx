import { useState, useEffect } from 'react';
import { api } from './api';
import Times from './components/Times';
import Partidas from './components/Partidas';
import './App.css';

export default function App() {
  const [aba, setAba] = useState('times');
  const [times, setTimes] = useState([]);
  const [partidas, setPartidas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  async function carregarDados() {
    try {
      setLoading(true);
      const [t, p] = await Promise.all([api.getTimes(), api.getPartidas()]);
      setTimes(t);
      setPartidas(p);
    } catch (e) {
      setErro('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { carregarDados(); }, []);

  return (
    <div className="app">
      <header className="header">
        <span className="logo">⚽</span>
        <h1>Futebol Manager</h1>
      </header>

      <nav className="nav">
        <button className={aba === 'times' ? 'ativo' : ''} onClick={() => setAba('times')}>
          🛡️ Times
        </button>
        <button className={aba === 'partidas' ? 'ativo' : ''} onClick={() => setAba('partidas')}>
          🏟️ Partidas
        </button>
      </nav>

      <main className="main">
        {erro && <p className="erro">{erro}</p>}
        {loading ? (
          <p className="loading">Carregando...</p>
        ) : aba === 'times' ? (
          <Times times={times} onAtualizar={carregarDados} />
        ) : (
          <Partidas partidas={partidas} times={times} onAtualizar={carregarDados} />
        )}
      </main>
    </div>
  );
}
