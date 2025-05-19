import Home from "./pages/Home";
import Scientists from "./pages/Scientists";
import Bugs from "./pages/Bugs";
import Navbar from "./components/Navbar";

import NotFoundPage from "./pages/NotFoundPage";

import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App(): React.ReactElement {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route
                path="/bugs"
                element={<ProtectedRoute element={<Bugs />} />}
              />
              <Route
                path="/scientists"
                element={<ProtectedRoute element={<Scientists />} />}
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
