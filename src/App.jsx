import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import HeroSection from "./components/HeroSection";

import "./App.css";
import ShowCase from "./components/ShowCase";
import Cuadro from "./components/Cuadro";
import "./index.css";
function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<ShowCase />} />

          <Route path="/showcase" element={<ShowCase />} />
          <Route path="/cuadro" element={<Cuadro />} />
          <Route path="/hero-section" element={<HeroSection />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
