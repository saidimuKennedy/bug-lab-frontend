// src/App.tsx
import Home from "./pages/Home";
import Scientists from "./pages/Scientists";
import Bugs from "./pages/Bugs";
import Navbar from "./components/Navbar";

import "./styles/App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";
import { AuthProvider } from "./context/AuthContext"; 
import ProtectedRoute from "./components/ProtectedRoute";

function App(): React.ReactElement {
  return (
    <Router>
      {/* Wrap the parts of your app that need auth context */}
      <AuthProvider>
        <div className="App">
          <Navbar />
          <main className="container">
            <Routes>
              <Route path="/" element={<Home />} />

              {/* /bugs and /scientists will be protected routes */}
              {/* For now, they are still open */}
              <Route
                path="/bugs"
                element={<ProtectedRoute element={<Bugs />} />}
              />
              <Route
                path="/scientists"
                element={<ProtectedRoute element={<Scientists />} />}
              />

              {/* You might add a /signup route here later */}
              {/* <Route path="/signup" element={<SignupPage />} /> */}

              {/* Add a catch-all route for 404 */}
              <Route path="*" element={<div>404 Not Found</div>} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
