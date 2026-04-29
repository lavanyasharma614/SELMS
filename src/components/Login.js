import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login({ setUser }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8080/api/auth/login', { username, password });
            localStorage.setItem('user', JSON.stringify(res.data));
            setUser(res.data);
        } catch (err) {
            alert('Invalid Credentials');
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/auth/signup', { username, password, role });
            alert('Signup successful! You can now log in.');
            setIsLogin(true);
            setPassword('');
        } catch (err) {
            alert('Error: Username might already exist');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '450px' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <h1 style={{ fontSize: '32px', color: 'var(--primary)' }}>🎓 SELMS</h1>
                    <p style={{ color: 'var(--text-light)', marginTop: '5px' }}>Smart Examination & Learning Management System</p>
                </div>

                {/* Toggle Buttons */}
                <div style={{ display: 'flex', marginBottom: '30px', background: '#f1f5f9', borderRadius: '8px', padding: '5px' }}>
                    <button 
                        onClick={() => setIsLogin(true)}
                        style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: isLogin ? 'var(--primary)' : 'transparent', color: isLogin ? 'white' : 'var(--text-dark)', fontWeight: 'bold', transition: 'all 0.3s' }}
                    >Login</button>
                    <button 
                        onClick={() => setIsLogin(false)}
                        style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '6px', cursor: 'pointer', background: !isLogin ? 'var(--primary)' : 'transparent', color: !isLogin ? 'white' : 'var(--text-dark)', fontWeight: 'bold', transition: 'all 0.3s' }}
                    >Sign Up</button>
                </div>

                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {isLogin ? "Welcome Back! 👋" : "Create Account 🚀"}
                </h2>

                <form onSubmit={isLogin ? handleLogin : handleSignup}>
                    {!isLogin && (
                        <div className="form-group">
                            <label>I am a...</label>
                            <select className="form-input" value={role} onChange={e => setRole(e.target.value)} style={{ cursor: 'pointer' }}>
                                <option value="STUDENT">Student 🎓</option>
                                <option value="TEACHER">Teacher 👨‍🏫</option>
                            </select>
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label>Username</label>
                        <input type="text" className="form-input" placeholder="Enter your username" value={username} onChange={e => setUsername(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input type="password" className="form-input" placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                    </div>

                    <button type="submit" className="btn-primary">
                        {isLogin ? "Login →" : "Sign Up →"}
                    </button>
                </form>

                <p style={{ textAlign: 'center', marginTop: '20px', color: 'var(--text-light)', fontSize: '14px' }}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <span 
                        onClick={() => setIsLogin(!isLogin)} 
                        style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                        {isLogin ? "Sign up here" : "Login here"}
                    </span>
                </p>
            </div>
        </div>
    );
}