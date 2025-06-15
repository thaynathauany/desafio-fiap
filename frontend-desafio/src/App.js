import React from 'react';
import './index.css';

function App() {
  const redirecionarParaLogin = () => {
    window.location.href = '/login';
  };

  return (
    <div className="main">
      <div className="content-container">
        <h1 className="page-title">Bem-vindo à Secretaria Virtual da FIAP</h1>
        <p style={{ textAlign: 'center', color: '#ccc', marginTop: '20px' }}>
          Acesse o sistema para consultar e gerenciar suas informações acadêmicas.
        </p>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            onClick={redirecionarParaLogin}
            className="btn-effect"
          >
            Ir para Login
          </button>
        </div>
      </div>

      <img
        src="/new-logo.png"
        alt="Logo FIAP"
        className="fiap-logo"
      />
    </div>
  );
}

export default App;