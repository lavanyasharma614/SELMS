import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminDashboard({ user, logout }) {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [logs, setLogs] = useState([]);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'STUDENT' });

    useEffect(() => { refreshData(); }, []);

    const refreshData = async () => {
        const uRes = await axios.get('http://localhost:8080/api/admin/users');
        setUsers(uRes.data);
        const lRes = await axios.get('http://localhost:8080/api/admin/logs');
        setLogs(lRes.data);
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/admin/users', newUser);
            setNewUser({ username: '', password: '', role: 'STUDENT' });
            refreshData();
        } catch (err) { alert('Error adding user (username might exist)'); }
    };

    const handleDeleteUser = async (id) => {
        if(window.confirm('Are you sure you want to delete this user?')) {
            await axios.delete(`http://localhost:8080/api/admin/users/${id}`);
            refreshData();
        }
    };

    const resetPassword = async (username) => {
        const newPass = prompt(`Enter new password for ${username}:`);
        if (newPass) {
            await axios.put('http://localhost:8080/api/admin/reset-password', { username, newPassword: newPass });
            alert('Password updated!');
        }
    };

    return (
        <div className="dashboard-layout">
            <div className="sidebar">
                <div className="sidebar-header">SELMS 🛡️</div>
                <div className="sidebar-menu">
                    <div className={`menu-item ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 User Management</div>
                    <div className={`menu-item ${activeTab === 'logs' ? 'active' : ''}`} onClick={() => setActiveTab('logs')}>📜 Login History</div>
                </div>
                <div style={{ padding: 20 }}><button className="btn-logout" onClick={logout} style={{width:'100%'}}>Logout</button></div>
            </div>

            <div className="main-content">
                <div className="top-bar"><h1>Admin Dashboard</h1></div>

                {activeTab === 'users' && (
                    <div>
                        <div className="card">
                            <h2 className="card-header">Add New User</h2>
                            <form onSubmit={handleAddUser} style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <input className="form-input" style={{flex:1, marginBottom:0}} placeholder="Username" required value={newUser.username} onChange={e=>setNewUser({...newUser, username:e.target.value})} />
                                <input className="form-input" style={{flex:1, marginBottom:0}} placeholder="Password" required value={newUser.password} onChange={e=>setNewUser({...newUser, password:e.target.value})} />
                                <select className="form-input" style={{width:'150px', marginBottom:0}} value={newUser.role} onChange={e=>setNewUser({...newUser, role:e.target.value})}>
                                    <option value="STUDENT">Student</option>
                                    <option value="TEACHER">Teacher</option>
                                </select>
                                <button type="submit" className="btn-primary" style={{width:'auto', margin:0, padding:'12px 20px'}}>Add User</button>
                            </form>
                        </div>

                        <div className="card">
                            <h2 className="card-header">All System Users</h2>
                            <table className="styled-table">
                                <thead><tr><th>Username</th><th>Role</th><th>Actions</th></tr></thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td><strong>{u.username}</strong></td>
                                            <td><span style={{background: u.role==='ADMIN'?'#f8fafc':'#eef2ff', padding:'5px 10px', borderRadius:'20px', fontSize:'12px', color: u.role==='ADMIN'?'#64748b':'#4f46e5', fontWeight:'bold'}}>{u.role}</span></td>
                                            <td>
                                                {u.role !== 'ADMIN' && (
                                                    <>
                                                        <button onClick={() => resetPassword(u.username)} style={{background:'var(--warning)', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer', marginRight:'5px'}}>Reset Pass</button>
                                                        <button onClick={() => handleDeleteUser(u.id)} style={{background:'var(--danger)', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>Delete</button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'logs' && (
                    <div className="card">
                        <h2 className="card-header">Login History</h2>
                        <table className="styled-table">
                            <thead><tr><th>Username</th><th>Role</th><th>Login Time</th></tr></thead>
                            <tbody>
                                {logs.map(l => (
                                    <tr key={l.id}>
                                        <td>{l.username}</td>
                                        <td>{l.role}</td>
                                        <td>{l.loginTime.replace('T', ' ')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
