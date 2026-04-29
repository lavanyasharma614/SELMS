import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function StudentDashboard({ user, logout }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [results, setResults] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [examConfig, setExamConfig] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const rRes = await axios.get(`http://localhost:8080/api/student/results/${user.username}`);
                setResults(rRes.data);
                const mRes = await axios.get('http://localhost:8080/api/student/materials');
                setMaterials(mRes.data);
                const cRes = await axios.get('http://localhost:8080/api/student/exam-config');
                setExamConfig(cRes.data);
            } catch(err) {
                console.error("Failed to fetch student data", err);
            }
        };
        fetchData();
    }, [user.username]);

    const startExam = () => {
        if (!examConfig || !examConfig.examActive) {
            alert("The exam is currently locked by the teacher. Please wait for them to enable it.");
            return;
        }
        navigate('/take-exam', { state: { duration: examConfig.durationMinutes } });
    };

    const getFeedbackClass = (score, total) => {
        const pct = (score/total)*100;
        if (pct > 70) return 'feedback-excellent';
        if (pct >= 40) return 'feedback-good';
        return 'feedback-improvement';
    }

    return (
        <div className="dashboard-layout">
            <div className="sidebar">
                <div className="sidebar-header">SELMS 🎓</div>
                <div className="sidebar-menu">
                    <div className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>🏠 Dashboard</div>
                    <div className={`menu-item ${activeTab === 'exam' ? 'active' : ''}`} onClick={() => setActiveTab('exam')}>📝 Take Exam</div>
                    <div className={`menu-item ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>📚 Study Material</div>
                    <div className={`menu-item ${activeTab === 'results' ? 'active' : ''}`} onClick={() => setActiveTab('results')}>📊 My Results</div>
                </div>
                <div style={{ padding: 20 }}><button className="btn-logout" onClick={logout} style={{width:'100%'}}>Logout</button></div>
            </div>

            <div className="main-content">
                <div className="top-bar">
                    <h1>Hello, {user.username}!</h1>
                </div>

                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                        <div className="card" style={{borderLeft: '5px solid #4f46e5', cursor:'pointer'}} onClick={() => setActiveTab('exam')}>
                            <h3>📝 Take Exam</h3>
                            <p style={{color:'#64748b', marginTop:10}}>Start your timed examination</p>
                        </div>
                        <div className="card" style={{borderLeft: '5px solid #10b981', cursor:'pointer'}} onClick={() => setActiveTab('results')}>
                            <h3>📊 My Results</h3>
                            <p style={{color:'#64748b', marginTop:10}}>View feedback and scores</p>
                        </div>
                    </div>
                )}

                {/* EXAM TAB */}
                {activeTab === 'exam' && (
                    <div className="card" style={{textAlign:'center'}}>
                        <h2 className="card-header">Ready to take the exam?</h2>
                        {examConfig ? (
                            <>
                                <p style={{fontSize:'18px', marginBottom:'20px'}}>Time Allowed: <strong>{examConfig.durationMinutes} Minutes</strong></p>
                                <button onClick={startExam} className="btn-primary" style={{width:'auto', padding:'15px 40px', fontSize:'18px'}}>
                                    Start Exam 🚀
                                </button>
                                {!examConfig.examActive && <p style={{color:'var(--danger)', marginTop:15, fontWeight:'bold'}}>⚠️ Exam is currently locked by the teacher.</p>}
                            </>
                        ) : <p>Loading exam settings...</p>}
                    </div>
                )}

                {/* MATERIALS TAB */}
                {activeTab === 'materials' && (
                    <div className="card">
                        <h2 className="card-header">📚 Study Materials</h2>
                        {materials.length === 0 ? <p>No materials available yet.</p> : 
                            materials.map(m => (
                                <div key={m.id} style={{padding:'15px', border:'1px solid #eee', borderRadius:'8px', marginBottom:'15px', background:'#f8fafc'}}>
                                    <h3 style={{color:'var(--primary)'}}>{m.title}</h3>
                                    <p style={{color:'#64748b', marginTop:'5px', whiteSpace:'pre-wrap'}}>{m.content}</p>
                                    <div style={{marginTop:'10px', display:'flex', gap:'10px'}}>
                                        {m.videoLink && (
                                            <a href={m.videoLink} target="_blank" rel="noopener noreferrer" style={{padding:'8px 15px', background:'#fee2e2', color:'#dc2626', borderRadius:'5px', textDecoration:'none', fontWeight:'bold'}}>
                                                🎥 Watch Video
                                            </a>
                                        )}
                                        {m.pdfFileName && (
                                            <a href={`http://localhost:8080/api/files/pdf/${m.pdfFileName}`} target="_blank" rel="noopener noreferrer" style={{padding:'8px 15px', background:'#dbeafe', color:'#2563eb', borderRadius:'5px', textDecoration:'none', fontWeight:'bold'}}>
                                                📄 View/Download PDF
                                            </a>
                                        )}
                                    </div>
                                    <small style={{display:'block', color:'#94a3b8', marginTop:'10px'}}>Added: {m.dateAdded}</small>
                                </div>
                            ))
                        }
                    </div>
                )}

                {/* RESULTS TAB */}
                {activeTab === 'results' && (
                    <div>
                        {results.length === 0 ? <div className="card"><p>No results yet. Take an exam first!</p></div> :
                            results.map(r => {
                                const pct = (r.score / r.totalQuestions) * 100;
                                const fbClass = getFeedbackClass(r.score, r.totalQuestions);
                                return (
                                    <div className="card result-card" key={r.id}>
                                        <div className="score-circle" style={{background: pct > 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)'}}>
                                            {Math.round(pct)}%
                                        </div>
                                        <h2>Score: {r.score} / {r.totalQuestions}</h2>
                                        <p style={{color:'var(--text-light)', margin:'10px 0'}}>Date: {r.examDate}</p>
                                        <div className={`feedback-box ${fbClass}`}>
                                            <strong>Feedback:</strong> {r.feedback}
                                        </div>
                                    </div>
                                );
                            })
                        }
                    </div>
                )}
            </div>
        </div>
    );
}