import React, { useEffect, useState } from 'react';
import './BaseLayout.css';
import TurmaFormModal from '../pages/modal/TurmaFormModal';
import Menu from '../componentes/Menu';
import { useNavigate } from 'react-router-dom';
import { isLogado } from '../utils/auth';

function TurmasPage() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLogado()) {
            navigate('/login');
        }
    }, []);

    const [turmas, setTurmas] = useState([]);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [busca, setBusca] = useState('');
    const [modalAberto, setModalAberto] = useState(false);
    const [turmaEditando, setTurmaEditando] = useState(null);
    const [erroFormulario, setErroFormulario] = useState('');
    const buscaTurmaTimeoutRef = React.useRef(null);


    const fetchTurmas = (nome = '', page = 1) => {
        setLoading(true);
        const query = new URLSearchParams();
        if (nome) query.append('nome', nome);
        query.append('page', page.toString());

        fetch(`http://localhost:8000/turmas.php?${query.toString()}`)
            .then(res => res.json())
            .then(data => {
                setTurmas(Array.isArray(data.data) ? data.data : []);
                setTotal(data.total || 0);
                setCurrentPage(data.current_page || 1);
                setLoading(false);
            })
            .catch(err => {
                console.error('Erro ao buscar turmas:', err);
                setLoading(false);
            });
    };

    const handleExcluir = (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta turma?')) return;

        fetch(`http://localhost:8000/turmas.php?id=${id}`, {
            method: 'DELETE'
        })
            .then(res => res.json())
            .then(() => fetchTurmas())
            .catch(err => console.error('Erro ao excluir turma:', err));
    };

    const abrirNovaTurma = () => {
        setTurmaEditando(null);
        setModalAberto(true);
    };

    const abrirEdicao = (turma) => {
        setTurmaEditando(turma);
        setModalAberto(true);
    };

    const salvarTurma = async (dados) => {
        if (!dados.nome || dados.nome.trim().length < 3) {
            alert('O nome da turma deve ter pelo menos 3 caracteres.');
            return;
        }

        const url = turmaEditando
            ? `http://localhost:8000/turmas.php?id=${turmaEditando.id}`
            : 'http://localhost:8000/turmas.php';
        const method = turmaEditando ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        await res.json();
        setModalAberto(false);
        fetchTurmas();
    };

    useEffect(() => {
        fetchTurmas();
    }, []);

    useEffect(() => {
        fetch('http://localhost:8000/turmas.php?all=true')
            .then(res => res.json())
            .then(data => {
                setTurmas(Array.isArray(data.data) ? data.data : []);
            });
    }, []);

    return (
        <>
            <Menu />
            <div className="main">
                <div className="content-container">
                    <div className="section-header">
                        <h1 className="page-title">Turmas Cadastradas</h1>
                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="Buscar por nome... "
                                value={busca}
                                onChange={e => {
                                    const valor = e.target.value;
                                    setBusca(valor);

                                    if (buscaTurmaTimeoutRef.current) {
                                        clearTimeout(buscaTurmaTimeoutRef.current);
                                    }

                                    buscaTurmaTimeoutRef.current = setTimeout(() => {
                                        fetchTurmas(valor);
                                    }, 400);
                                }}
                                className="search-input"
                            />
                            <button onClick={abrirNovaTurma} className="btn-primary">Nova Turma</button>
                        </div>
                    </div>

                    {loading ? (
                        <p className="loading-message">Carregando...</p>
                    ) : turmas.length > 0 ? (
                        <>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nome</th>
                                        <th>Descrição</th>
                                        <th>Alunos</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {turmas.map((turma) => (
                                        <tr key={turma.id}>
                                            <td>{turma.id}</td>
                                            <td>{turma.nome}</td>
                                            <td>{turma.descricao}</td>
                                            <td>{turma.total_alunos}</td>
                                            <td style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => abrirEdicao(turma)} className="btn-edit">Editar</button>
                                                <button onClick={() => handleExcluir(turma.id)} className="btn-delete">Excluir</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="paginacao">
                                {Array.from({ length: Math.ceil(total / 10) }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => fetchTurmas(busca, i + 1)}
                                        disabled={currentPage === i + 1}
                                        className="pagina-btn"
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </>
                    ) : (
                        <p className="empty-message">Nenhuma turma encontrada.</p>
                    )}
                </div>

                <TurmaFormModal
                    isOpen={modalAberto}
                    onClose={() => setModalAberto(false)}
                    onSave={salvarTurma}
                    turma={turmaEditando}
                />

                <img src="/new-logo.png" alt="Logo FIAP" className="fiap-logo" />
            </div>
        </>

    );
}

export default TurmasPage;