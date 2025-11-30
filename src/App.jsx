import Header from './components/ui/header/Header.jsx'
import Footer from './components/ui/footer/footer.jsx'
import Sidebar from './components/ui/Sidebar.jsx'

import Home from './components/home/home.jsx'
import Projects from './components/projects/projects.jsx'
import Education from './components/education/education.jsx'
import Experience from './components/experience/experience.jsx'
import Play from './components/play/play.jsx'

import PW from './components/pw.jsx'

import {useState, useEffect, useRef} from 'react'
import { Routes, Route } from "react-router-dom";

import useAnonymousAnalytics from "./functions/Analytics.js";

const App = () => {
    useAnonymousAnalytics()

    const [os, setOs] = useState("other");
    const getOS = () => {
        const platform = window.navigator.platform.toLowerCase();
        if (platform.includes("mac")) return "mac";
        if (platform.includes("win")) return "windows";
        return "other";
    };


    useEffect(() => {
        setOs(getOS());
    }, []);

    return (
        <>
            <Header />
            <div className={"container"}>
                <Sidebar />
                <main>
                    <Routes>
                        <Route path="/" element={<Home system={os} />} />
                        <Route path="/pw" element={<PW />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/education" element={<Education />} />
                        <Route path="/experience" element={<Experience />} />
                        <Route path="/play/*" element={<Play />} />
                        <Route path="*" element={<Home />} />
                    </Routes>
                    <Footer />
                </main>
            </div>
        </>
    );
};

export default App;