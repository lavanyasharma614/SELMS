import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';
import TakeExam from './components/TakeExam';
import './App.css';

function App() {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={!user ? <Login setUser={setUser} /> : <Navigate to={`/${user.role.toLowerCase()}`} />} />
                <Route path="/admin" element={user?.role === 'ADMIN' ? <AdminDashboard user={user} logout={logout} /> : <Navigate to="/" />} />
                <Route path="/teacher" element={user?.role === 'TEACHER' ? <TeacherDashboard user={user} logout={logout} /> : <Navigate to="/" />} />
                <Route path="/student" element={user?.role === 'STUDENT' ? <StudentDashboard user={user} logout={logout} /> : <Navigate to="/" />} />
                <Route path="/take-exam" element={user?.role === 'STUDENT' ? <TakeExam user={user} logout={logout} /> : <Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
