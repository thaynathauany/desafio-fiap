import React from 'react';
import './Menu.css';

function Menu() {
    return (
        <div className="menu-topo">
            <div className="menu-logo"><img src="/new-logo.png" alt="" /></div>
            <div className="menu-links">
                <a href="/alunos">Alunos</a>
                <a href="/turmas">Turmas</a>
                <a href="/matriculas">Matrículas</a>
                <a
                    href="#"
                    onClick={(e) => {
                        e.preventDefault();
                        localStorage.setItem('logado', 'false');
                        window.location.href = '/login';
                    }}
                >
                    Sair
                </a>
            </div>
        </div>
    );
}

export default Menu;