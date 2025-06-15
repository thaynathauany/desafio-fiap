import React, { useState, useEffect } from 'react';
import './ModalLayout.css';

function AlunoFormModal({ isOpen, onClose, onSave, aluno, mensagemErro }) {
    const [formData, setFormData] = useState({
        nome: '',
        data_nascimento: '',
        cpf: '',
        email: '',
        senha: '',
    });

    useEffect(() => {
        if (aluno) {
            setFormData({
                nome: aluno.nome,
                data_nascimento: aluno.data_nascimento,
                cpf: aluno.cpf,
                email: aluno.email,
                senha: '',
            });
        } else {
            setFormData({ nome: '', data_nascimento: '', cpf: '', email: '', senha: '' });
        }
    }, [aluno]);

    const handleChange = e => {
        const { name, value } = e.target;

        let newValue = value;

        if (name === 'cpf') {
            const digits = value.replace(/\D/g, '').slice(0, 11);

            newValue = digits
                .replace(/^(\d{3})(\d)/, '$1.$2')
                .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
                .replace(/\.(\d{3})(\d)/, '.$1-$2');
        }

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{aluno ? 'Editar Aluno' : 'Novo Aluno'}</h2>
                <form onSubmit={handleSubmit}>
                    {mensagemErro && (
                        <div style={{ color: 'red', marginBottom: '10px', textAlign: 'center' }}>
                            {mensagemErro}
                        </div>
                    )}
                    <input name="nome" placeholder="Nome" value={formData.nome} onChange={handleChange} required />
                    <input name="data_nascimento" type="date" value={formData.data_nascimento} onChange={handleChange} required />
                    <input name="cpf" placeholder="CPF" value={formData.cpf} onChange={handleChange} required />
                    <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                    {!aluno && (
                        <input name="senha" type="password" placeholder="Senha" value={formData.senha} onChange={handleChange} required />
                    )}
                    <div className="modal-buttons">
                        <button type="submit" className="btn-salvar">Salvar</button>
                        <button type="button" onClick={onClose} className="btn-cancelar">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AlunoFormModal;