import React, { useEffect } from "react";
import "../node_modules/bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./components/login";
import SignUp from "./components/register";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Profile from "./components/profile";
import { useState } from "react";
import { auth } from "./components/firebase";
import DynamicTopicsForm from "./components/DynamicAddTopics";
import Dashboard from "./components/Dashboard";
import DashboardPage from "./components/DashboardPage";
import AdminSubmissionManager from "./components/AdminSubmissionManager";

function App() {
  const [user, setUser] = useState();
  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      setUser(user);
    });
  });
  return (
    <Router>
      <div className="App">
        <div className="auth-wrapper">
          <div className="auth-inner">
            <Routes>
              <Route
                path="/"
                element={user ? <Navigate to="/profile" /> : <Login />}
              />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<SignUp />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/edit-research/:Id" element={<DynamicTopicsForm />} />
              <Route path="/add-research" element={<DynamicTopicsForm />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/admin-submission-manager" element={<AdminSubmissionManager />} />
              
                          
            </Routes>
            <ToastContainer />
            
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
