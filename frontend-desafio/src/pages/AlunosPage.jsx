import React, { useEffect, useState } from 'react';
import './BaseLayout.css';
import AlunoFormModal from '../pages/modal/AlunoFormModal';
import Menu from '../componentes/Menu';
import { useNavigate } from 'react-router-dom';
import { isLogado } from '../utils/auth';
import { formatarCPF } from '../utils/helpers';

function AlunosPage() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLogado()) {
            navigate('/login');
        }
    }, []);

    const [alunos, setAlunos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [busca, setBusca] = useState('');
    const [modalAberto, setModalAberto] = useState(false);
    const [alunoEditando, setAlunoEditando] = useState(null);
    const [mensagemErro, setMensagemErro] = useState('');
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const buscaTimeoutRef = React.useRef(null);
    const fetchAlunos = (nome = '', page = 1) => {
        setLoading(true);

        const query = new URLSearchParams();
        if (nome) query.append('nome', nome);
        query.append('page', page.toString());

        fetch(`http://localhost:8000/alunos.php?${query.toString()}`)
            .then(response => response.json())
            .then(data => {
                setAlunos(Array.isArray(data.data) ? data.data : []);
                setTotal(parseInt(data.pagination?.total ?? 0));
                setCurrentPage(parseInt(data.pagination?.page ?? 1));
                setLoading(false);
            })
            .catch(error => {
                console.error('Erro ao buscar alunos:', error);
                setLoading(false);
            });
    };

    const handleExcluir = (id) => {
        if (!window.confirm('Tem certeza que deseja excluir este aluno?')) return;

        fetch(`http://localhost:8000/alunos.php?id=${id}`, {
            method: 'DELETE'
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                fetchAlunos();
            })
            .catch(error => {
                console.error('Erro ao excluir aluno:', error);
            });
    };

    const abrirNovoAluno = () => {
        setAlunoEditando(null);
        setMensagemErro('');
        setModalAberto(true);
    };

    const abrirEdicao = (aluno) => {
        setAlunoEditando(aluno);
        setMensagemErro('');
        setModalAberto(true);
    };

    const formatarDataBrasileira = (data) => {
        if (!data) return '';
        const [ano, mes, dia] = data.split('-');
        return `${dia}/${mes}/${ano}`;
    };

    const salvarAluno = async (dados) => {
        const url = alunoEditando
            ? `http://localhost:8000/alunos.php?id=${alunoEditando.id}`
            : 'http://localhost:8000/alunos.php';

        const method = alunoEditando ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...dados,
                cpf: dados.cpf.replace(/\D/g, '')
            }),
        });

        const resData = await response.json();

        if (!response.ok) {
            setMensagemErro(resData.message || 'Erro ao salvar aluno.');
            return;
        }
        setMensagemErro('');
        setModalAberto(false);
        fetchAlunos();
    };

    useEffect(() => {
        fetchAlunos();
    }, []);

    const handleBuscar = () => {
        fetchAlunos(busca);
    };

    return (
        <>
            <Menu />
            <div className='main'>
                <div className="content-container">
                    <div className='section-header'>
                        <h1 className="page-title">Alunos Cadastrados</h1>

                        <div className="search-wrapper">
                            <input
                                type="text"
                                placeholder="Buscar por nome... "
                                value={busca}
                                onChange={e => {
                                    const valor = e.target.value;
                                    setBusca(valor);

                                    if (buscaTimeoutRef.current) {
                                        clearTimeout(buscaTimeoutRef.current);
                                    }

                                    buscaTimeoutRef.current = setTimeout(() => {
                                        fetchAlunos(valor);
                                    }, 400);
                                }}
                                className="search-input"
                            />
                            <button onClick={abrirNovoAluno} className="btn-primary">Novo Aluno</button>
                        </div>
                    </div>

                    {loading ? (
                        <p className="loading-message">Carregando...</p>
                    ) : alunos.length > 0 ? (
                        <>
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Nome</th>
                                        <th>Data de Nascimento</th>
                                        <th>CPF</th>
                                        <th>Email</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {alunos.map((aluno) => (
                                        <tr key={aluno.id}>
                                            <td>{aluno.id}</td>
                                            <td>{aluno.nome}</td>
                                            <td>{formatarDataBrasileira(aluno.data_nascimento)}</td>
                                            <td>{formatarCPF(aluno.cpf)}</td>
                                            <td>{aluno.email}</td>
                                            <td style={{ display: 'flex', gap: '8px' }}>
                                                <button onClick={() => abrirEdicao(aluno)} className="btn-edit">Editar</button>
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleExcluir(aluno.id)}
                                                >
                                                    Excluir
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="paginacao">
                                {Array.from({ length: Math.ceil(total / 10) }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => fetchAlunos(busca, i + 1)}
                                        disabled={currentPage === i + 1}
                                        className="pagina-btn"
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </>

                    ) : (
                        <p className="empty-message">Nenhum aluno encontrado.</p>
                    )}
                </div>
                <AlunoFormModal
                    isOpen={modalAberto}
                    onClose={() => setModalAberto(false)}
                    onSave={salvarAluno}
                    aluno={alunoEditando}
                    mensagemErro={mensagemErro}

                />
                <img
                    src='/new-logo.png'
                    alt="Logo FIAP"
                    className="fiap-logo"
                />
            </div>
        </>

    );
}

export default AlunosPage;