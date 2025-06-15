import React, { useEffect, useState } from 'react';
import './BaseLayout.css'; // reutilizando o mesmo CSS
import Menu from '../componentes/Menu';
import { useNavigate } from 'react-router-dom';
import { isLogado } from '../utils/auth';

function MatriculasPage() {
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLogado()) {
            navigate('/login');
        }
    }, []);

    const [matriculas, setMatriculas] = useState([]);
    const [alunos, setAlunos] = useState([]);
    const [turmas, setTurmas] = useState([]);
    const [alunoId, setAlunoId] = useState('');
    const [turmaId, setTurmaId] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [secao, setSecao] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [busca, setBusca] = useState('');

    const fetchMatriculas = (page = 1) => {
        fetch(`http://localhost:8000/matriculas.php?page=${page}&per_page=10`)
            .then(res => res.json())
            .then(data => {
                setMatriculas(Array.isArray(data.data) ? data.data : []);
                setCurrentPage(data.current_page || 1);
                setTotalPages(data.last_page || 1);
            });
    };

    const fetchAlunosETurmas = () => {
        fetch('http://localhost:8000/alunos.php?all=true')
            .then(res => res.json())
            .then(data => setAlunos(Array.isArray(data.data) ? data.data : []));

        fetch('http://localhost:8000/turmas.php?all=true')
            .then(res => res.json())
            .then(data => setTurmas(Array.isArray(data.data) ? data.data : []));
    };

    const realizarMatricula = () => {
        if (!alunoId || !turmaId) {
            setMensagem('Selecione aluno e turma');
            return;
        }

        fetch('http://localhost:8000/matriculas.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ aluno_id: alunoId, turma_id: turmaId })
        })
            .then(res => res.json())
            .then(data => {
                setMensagem(data.mensagem);
                setAlunoId('');
                setTurmaId('');
                fetchMatriculas();
            });
    };

    const handleExcluir = (id) => {
        if (!window.confirm('Tem certeza que deseja excluir esta matrícula?')) return;

        fetch(`http://localhost:8000/matriculas.php?id=${id}`, {
            method: 'DELETE',
        })
            .then(res => res.json())
            .then(data => {
                setMensagem(data.message || 'Matrícula excluída com sucesso');
                fetchMatriculas();
            });
    };

    const matriculasFiltradas = matriculas.filter(m =>
        m.aluno_nome.toLowerCase().includes(busca.toLowerCase())
    );

    useEffect(() => {
        fetchAlunosETurmas();
        fetchMatriculas();
    }, []);

    useEffect(() => {
        setMensagem('');
    }, [secao]);

    useEffect(() => {
        if (mensagem) {
            const timeout = setTimeout(() => setMensagem(''), 4000);
            return () => clearTimeout(timeout);
        }
    }, [mensagem]);

    return (
        <>
            <Menu />
            <div className='main'>
                <div className="content-container">
                    <h1 className="page-title">Matrículas</h1>

                    <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                        <button onClick={() => setSecao('formulario')} className="btn-primary">Realizar Matrícula</button>
                        <button onClick={() => setSecao('tabela')} className="btn-primary">Alunos Matriculados</button>
                    </div>

                    {secao === 'formulario' && (
                        <div className="form-card">
                            <h2 className="form-titulo">Realizar Matrícula</h2>

                            <div className="form-campo">
                                <label htmlFor="aluno">Aluno:</label>
                                <select id="aluno" value={alunoId} onChange={e => setAlunoId(e.target.value)}>
                                    <option value="">Selecione</option>
                                    {alunos.map(aluno => (
                                        <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-campo">
                                <label htmlFor="turma">Turma:</label>
                                <select id="turma" value={turmaId} onChange={e => setTurmaId(e.target.value)}>
                                    <option value="">Selecione</option>
                                    {turmas.map(turma => (
                                        <option key={turma.id} value={turma.id}>{turma.nome}</option>
                                    ))}
                                </select>
                            </div>

                            <button onClick={realizarMatricula} className="btn-primary form-botao">
                                Confirmar Matrícula
                            </button>

                            <p className={mensagem.includes("sucesso") ? "feedback-sucesso" : "feedback-erro"}>
                                {mensagem}
                            </p>
                        </div>
                    )}

                    {secao === 'tabela' && (
                        <>

                            <div className="form-campo" style={{ marginBottom: '20px' }}>
                                <input
                                    type="text"
                                    placeholder="Buscar por nome do aluno..."
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    className="search-input"
                                    style={{ width: '100%', padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
                                />
                            </div>
                            {/* <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Aluno</th>
                                        <th>Turma</th>
                                        <th>Data da Matrícula</th>
                                        <th>Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {matriculas
                                        .filter(m => m.aluno_nome.toLowerCase().includes(busca.toLowerCase()))
                                        .map(m => (
                                            <tr key={m.id}>
                                                <td>{m.id}</td>
                                                <td>{m.aluno_nome}</td>
                                                <td>{m.turma_nome}</td>
                                                <td>{m.data_matricula}</td>
                                                <td>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleExcluir(m.id)}
                                                    >
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                </tbody>
                            </table> */}



                            {matriculasFiltradas.length > 0 ? (
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Aluno</th>
                                            <th>Turma</th>
                                            <th>Data da Matrícula</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {matriculasFiltradas.map(m => (
                                            <tr key={m.id}>
                                                <td>{m.id}</td>
                                                <td>{m.aluno_nome}</td>
                                                <td>{m.turma_nome}</td>
                                                <td>{m.data_matricula}</td>
                                                <td>
                                                    <button
                                                        className="btn-delete"
                                                        onClick={() => handleExcluir(m.id)}
                                                    >
                                                        Excluir
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <p style={{ marginTop: '20px', textAlign: 'center', color: '#555' }}>
                                    Nenhum aluno matriculado encontrado.
                                </p>
                            )}

                            <div className="paginacao">
                                {Array.from({ length: totalPages }, (_, i) => (
                                    <button
                                        key={i + 1}
                                        onClick={() => fetchMatriculas(i + 1)}
                                        disabled={currentPage === i + 1}
                                        className="pagina-btn"
                                    >
                                        {i + 1}
                                    </button>
                                ))}
                            </div>
                        </>
                    )}

                    <img src="/new-logo.png" alt="Logo FIAP" className="fiap-logo" />

                </div>
            </div>
        </>

    );
}

export default MatriculasPage;