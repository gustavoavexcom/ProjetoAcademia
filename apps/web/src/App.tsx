import { useEffect, useState } from 'react';
import './App.css';
import logo from './assets/logo.png';

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
}

export default function App() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then(setHealth)
      .catch((e: Error) => setErro(e.message));
  }, []);

  return (
    <main className="container">
      <img src={logo} alt="Logo Academia" className="logo" />
      <h1>Sistema de Academia</h1>
      <p className="subtitle">Gestão de alunos, planos, treinos e acesso</p>

      <section className="status">
        <h2>Status da API</h2>
        {health && <p className="ok">● {health.service}: {health.status}</p>}
        {erro && <p className="erro">● API indisponível ({erro}) — inicie o backend.</p>}
        {!health && !erro && <p>Verificando…</p>}
      </section>
    </main>
  );
}
