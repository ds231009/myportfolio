import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'

import Home from './components/home/home.jsx'
import Projects from './components/projects/projects.jsx'
import Education from './components/education/education.jsx'
import Experience from './components/experience/experience.jsx'
import Play from './components/play/play.jsx'


import { Routes, Route } from "react-router-dom";

const App = () => {
    return (
        <>
            <Header />
            <Sidebar />
            <main className="dynamic-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/education" element={<Education />} />
                    <Route path="/experience" element={<Experience />} />
                    <Route path="/play/*" element={<Play />} />
                    <Route path="*" element={<Home />} />
                </Routes>
            </main>
            <footer className="footer">v0.3</footer>
        </>
    );
};

export default App;