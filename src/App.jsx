import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { BrowserRouter as Router } from "react-router-dom";
import MainPage from "./components/mainPage.jsx";
import { Routes, Route } from "react-router-dom";

import Header from './components/Header.jsx'
import Sidebar from './components/Sidebar.jsx'
import Projects from './components/projects/projects.jsx'
import Education from './components/education/education.jsx'


function App() {

  return (
    <Router>
        <MainPage />
    </Router>

  )
}

export default App
