import Header from './Header.jsx'
import Sidebar from './Sidebar.jsx'

import Home from './home/home.jsx'
import Projects from './projects/projects.jsx'
import Education from './education/education.jsx'
import Experience from './experience/experience.jsx'
import Play from './play/play.jsx'


import { Routes, Route } from "react-router-dom";

const MainPage = () => {
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
                </Routes>
            </main>
        </>
    );
};

export default MainPage;