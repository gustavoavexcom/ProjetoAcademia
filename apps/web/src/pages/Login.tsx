import { useState, type FormEvent } from 'react';
import logo from '../assets/logo.png';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

// Credenciais fixas da recepção (validação simples de front-end).
const LOGIN_RECEPCAO = 'recepcao';
const SENHA_RECEPCAO = '1';

export default function Login({ onLogin }: LoginProps) {
  const [login, setLogin] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string>();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (login.trim().toLowerCase() === LOGIN_RECEPCAO && senha === SENHA_RECEPCAO) {
      setErro(undefined);
      onLogin();
    } else {
      setErro('Login ou senha inválidos.');
    }
  }

  return (
    <div className="login">
      <div className="login__motto" aria-hidden="true">
        <span>Persistência</span>
        <span>Foco</span>
      </div>
      <form className="login__card" onSubmit={handleSubmit}>
        <img src={logo} alt="Pró Ativa" className="login__logo" />
        <h1 className="login__title">Pró Ativa</h1>
        <p className="login__subtitle">Acesso da Recepção</p>

        <label className="login__field">
          <span>Login</span>
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            autoFocus
            autoComplete="username"
            placeholder="recepcao"
          />
        </label>

        <label className="login__field">
          <span>Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="current-password"
            placeholder="••••"
          />
        </label>

        {erro && <p className="login__error">{erro}</p>}

        <button type="submit" className="login__submit">
          Entrar
        </button>
      </form>
    </div>
  );
}
