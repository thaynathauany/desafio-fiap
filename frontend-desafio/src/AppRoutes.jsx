import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from './App';
import LoginPage from "./pages/LoginPage";
import AlunosPage from "./pages/AlunosPage";
import TurmasPage from "./pages/TurmasPage";
import MatriculasPage from "./pages/MatriculasPage";

export default function AppRoutes() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/alunos" element={<AlunosPage />} />
                <Route path="/turmas" element={<TurmasPage />} />
                <Route path="/matriculas" element={<MatriculasPage />} />

            </Routes>
        </Router>
    );
}