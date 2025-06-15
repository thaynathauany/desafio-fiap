import React, { useEffect, useState } from 'react';
import './ModalLayout.css';

function TurmaFormModal({ isOpen, onClose, onSave, turma }) {
    const [formData, setFormData] = useState({ nome: '', descricao: '' });

    useEffect(() => {
        if (turma) {
            setFormData({ nome: turma.nome, descricao: turma.descricao });
        } else {
            setFormData({ nome: '', descricao: '' });
        }
    }, [turma]);

    const handleChange = e => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = e => {
        e.preventDefault();
        onSave(formData);
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal">
                <h2>{turma ? 'Editar Turma' : 'Nova Turma'}</h2>
                <form onSubmit={handleSubmit}>
                    <input name="nome" placeholder="Nome" value={formData.nome} onChange={handleChange} required />
                    <textarea name="descricao" placeholder="Descrição" value={formData.descricao} onChange={handleChange} required />
                    <div className="modal-buttons">
                        <button type="submit" className="btn-salvar">Salvar</button>
                        <button type="button" className="btn-cancelar" onClick={onClose}>Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default TurmaFormModal;