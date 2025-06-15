import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
    const [usuario, setUsuario] = useState("");
    const [senha, setSenha] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await fetch("http://localhost:8000/login.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: usuario,
                    password: senha,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                localStorage.setItem("admin", JSON.stringify(data));
                localStorage.setItem('logado', 'true')
                navigate("/alunos");
            } else {
                alert(data.error || "Credenciais inválidas.");
            }
        } catch (err) {
            alert("Erro ao conectar com o servidor.");
            console.error(err);
        }
    };

    return (
        <section id="aluno" className="a-login">
            <div className="a-login-background a-login-background-2"></div>

            <div className="a-login-wrapper">
                <form className="a-login-form" onSubmit={handleSubmit}>
                    <h1 className="a-login-title">
                        Secretaria da <span className="a-login-title-highlight">FIAP</span>
                    </h1>

                    <div className="a-login-columns">
                        <div className="a-login-column">
                            <label htmlFor="usuario" className="a-login-label">E-mail</label>
                            <input
                                id="usuario"
                                name="usuario"
                                type="email"
                                className="a-login-input"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                required
                            />
                        </div>

                        <div className="a-login-column">
                            <label htmlFor="senha" className="a-login-label">Senha</label>
                            <input
                                id="senha"
                                name="senha"
                                type="password"
                                className="a-login-input"
                                value={senha}
                                onChange={(e) => setSenha(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="a-login-footer">
                        <input type="submit" className="a-login-btn" value="Conectar" />
                        <a href="#" target="_blank" className="a-login-link">Esqueceu a senha?</a>
                    </div>
                </form>
            </div>

            <div className="a-login-caption">
                <span>Projeto de teste desenvolvido por Thayna Thauany dos Santos | <strong className="a-login-caption-highlight"></strong> 2025</span>
            </div>

            <div className="a-login-copyright">
                Todos os direitos reservados.
            </div>
        </section>
    );
}

export default LoginPage;