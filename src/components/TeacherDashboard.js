import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function TeacherDashboard({ user, logout }) {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [questions, setQuestions] = useState([]);
    const [results, setResults] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [examConfig, setExamConfig] = useState({ durationMinutes: 5, examActive: true });

    // Form states
    const [qForm, setQForm] = useState({ text: '', option1: '', option2: '', option3: '', option4: '', correctAnswer: 1, topic: '' });
    const [matForm, setMatForm] = useState({ title: '', content: '', videoLink: '', pdfFile: null });

    useEffect(() => {
        refreshData();
    }, []);

    const refreshData = async () => {
        try {
            const qRes = await axios.get('http://localhost:8080/api/teacher/questions');
            setQuestions(qRes.data);
            const rRes = await axios.get('http://localhost:8080/api/teacher/results');
            setResults(rRes.data);
            const mRes = await axios.get('http://localhost:8080/api/teacher/materials');
            setMaterials(mRes.data);
            const cRes = await axios.get('http://localhost:8080/api/teacher/exam-config');
            if(cRes.data) setExamConfig(cRes.data);
        } catch (err) {
            console.error("Failed to fetch teacher data", err);
        }
    };

    const handleAddQuestion = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/teacher/questions', qForm);
            setQForm({ text: '', option1: '', option2: '', option3: '', option4: '', correctAnswer: 1, topic: '' });
            refreshData();
        } catch (err) { alert('Error adding question'); }
    };

    const handleDeleteQuestion = async (id) => {
        if(window.confirm('Delete this question?')) {
            await axios.delete(`http://localhost:8080/api/teacher/questions/${id}`);
            refreshData();
        }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('title', matForm.title);
        formData.append('content', matForm.content);
        formData.append('videoLink', matForm.videoLink);
        if (matForm.pdfFile) {
            formData.append('pdfFile', matForm.pdfFile);
        }

        try {
            await axios.post('http://localhost:8080/api/teacher/materials', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMatForm({ title: '', content: '', videoLink: '', pdfFile: null });
            
            document.getElementById('pdf-upload-input').value = '';
            refreshData();
        } catch (err) { alert('Error adding material'); }
    };

    const handleDeleteMaterial = async (id) => {
        if(window.confirm('Delete this material and its attached files?')) {
            try {
                await axios.delete(`http://localhost:8080/api/teacher/materials/${id}`);
                refreshData();
            } catch (err) { alert('Error deleting material'); }
        }
    };

    const handleSaveConfig = async () => {
        try {
            await axios.post('http://localhost:8080/api/teacher/exam-config', examConfig);
            alert('Exam Settings Saved!');
        } catch (err) { alert('Error saving config'); }
    };

    return (
        <div className="dashboard-layout">
            <div className="sidebar">
                <div className="sidebar-header">SELMS 👨‍🏫</div>
                <div className="sidebar-menu">
                    <div className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</div>
                    <div className={`menu-item ${activeTab === 'questions' ? 'active' : ''}`} onClick={() => setActiveTab('questions')}>❓ Questions</div>
                    <div className={`menu-item ${activeTab === 'timer' ? 'active' : ''}`} onClick={() => setActiveTab('timer')}>⏱️ Exam Timer</div>
                    <div className={`menu-item ${activeTab === 'materials' ? 'active' : ''}`} onClick={() => setActiveTab('materials')}>📚 Materials</div>
                    <div className={`menu-item ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>🎓 Student Records</div>
                </div>
                <div style={{ padding: 20 }}><button className="btn-logout" onClick={logout} style={{width:'100%'}}>Logout</button></div>
            </div>

            <div className="main-content">
                <div className="top-bar">
                    <h1>Hello, {user.username}!</h1>
                </div>

                {/* DASHBOARD TAB */}
                {activeTab === 'dashboard' && (
                    <div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                            <div className="card" style={{borderLeft: '5px solid #4f46e5'}}><h2>{questions.length}</h2><p>Total Questions</p></div>
                            <div className="card" style={{borderLeft: '5px solid #10b981'}}><h2>{results.length}</h2><p>Exams Taken</p></div>
                            <div className="card" style={{borderLeft: '5px solid #f59e0b'}}><h2>{examConfig.durationMinutes} min</h2><p>Timer Setting</p></div>
                        </div>
                    </div>
                )}

                {/* QUESTIONS TAB */}
                {activeTab === 'questions' && (
                    <div className="card">
                        <h2 className="card-header">Add New Question</h2>
                        <form onSubmit={handleAddQuestion}>
                            <div className="form-group"><label>Topic</label><input className="form-input" required value={qForm.topic} onChange={e=>setQForm({...qForm, topic:e.target.value})}/></div>
                            <div className="form-group"><label>Question Text</label><input className="form-input" required value={qForm.text} onChange={e=>setQForm({...qForm, text:e.target.value})}/></div>
                            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
                                <input className="form-input" placeholder="Option 1" required value={qForm.option1} onChange={e=>setQForm({...qForm, option1:e.target.value})}/>
                                <input className="form-input" placeholder="Option 2" required value={qForm.option2} onChange={e=>setQForm({...qForm, option2:e.target.value})}/>
                                <input className="form-input" placeholder="Option 3" required value={qForm.option3} onChange={e=>setQForm({...qForm, option3:e.target.value})}/>
                                <input className="form-input" placeholder="Option 4" required value={qForm.option4} onChange={e=>setQForm({...qForm, option4:e.target.value})}/>
                            </div>
                            <div className="form-group" style={{marginTop:'10px'}}><label>Correct Option (1-4)</label><input type="number" min="1" max="4" className="form-input" required value={qForm.correctAnswer} onChange={e=>setQForm({...qForm, correctAnswer:parseInt(e.target.value)})}/></div>
                            <button type="submit" className="btn-primary" style={{marginTop:'10px'}}>Add Question</button>
                        </form>

                        <h2 className="card-header" style={{marginTop: 30}}>Question Bank</h2>
                        <table className="styled-table">
                            <thead><tr><th>Topic</th><th>Question</th><th>Action</th></tr></thead>
                            <tbody>
                                {questions.map(q => (
                                    <tr key={q.id}><td>{q.topic}</td><td>{q.text}</td><td><button onClick={() => handleDeleteQuestion(q.id)} style={{color:'red', cursor:'pointer', background:'none', border:'none'}}>Delete</button></td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* TIMER TAB */}
                {activeTab === 'timer' && (
                    <div className="card">
                        <h2 className="card-header">Exam Configuration</h2>
                        <div className="form-group">
                            <label>Exam Duration (Minutes)</label>
                            <input type="number" className="form-input" value={examConfig.durationMinutes} onChange={e=>setExamConfig({...examConfig, durationMinutes: parseInt(e.target.value) || 0})}/>
                        </div>
                        <div className="form-group">
                            <label>
                                <input type="checkbox" checked={examConfig.examActive} onChange={e=>setExamConfig({...examConfig, examActive: e.target.checked})} style={{marginRight:'10px'}}/>
                                Exam Active for Students
                            </label>
                        </div>
                        <button onClick={handleSaveConfig} className="btn-primary">Save Settings</button>
                    </div>
                )}

                {/* MATERIALS TAB */}
                {activeTab === 'materials' && (
                    <div className="card">
                        <h2 className="card-header">Add Study Material</h2>
                        <form onSubmit={handleAddMaterial}>
                            <div className="form-group"><label>Title</label><input className="form-input" required value={matForm.title} onChange={e=>setMatForm({...matForm, title:e.target.value})}/></div>
                            <div className="form-group"><label>Description / Content</label><textarea className="form-input" rows="3" required value={matForm.content} onChange={e=>setMatForm({...matForm, content:e.target.value})}/></div>
                            <div className="form-group"><label>Video Link (YouTube, etc.)</label><input type="url" className="form-input" placeholder="https://youtube.com/..." value={matForm.videoLink} onChange={e=>setMatForm({...matForm, videoLink:e.target.value})}/></div>
                            
                            <div className="form-group">
                                <label>Attach PDF File</label>
                                <input 
                                    id="pdf-upload-input"
                                    type="file" 
                                    className="form-input" 
                                    accept="application/pdf" 
                                    onChange={e=>setMatForm({...matForm, pdfFile: e.target.files[0]})} 
                                />
                            </div>

                            <button type="submit" className="btn-primary">Add Material</button>
                        </form>

                        <h2 className="card-header" style={{marginTop:30}}>Available Materials</h2>
                        {materials.map(m => (
                            <div key={m.id} style={{padding:'15px', border:'1px solid #eee', borderRadius:'8px', marginBottom:'10px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                <div>
                                    <h4>{m.title}</h4>
                                    <p style={{color:'#64748b', margin:'5px 0'}}>{m.content}</p>
                                    {m.videoLink && <a href={m.videoLink} target="_blank" rel="noopener noreferrer" style={{color:'#ef4444', marginRight:'15px', fontWeight:'bold'}}>🎥 Watch Video</a>}
                                    {m.pdfFileName && <a href={`http://localhost:8080/api/files/pdf/${m.pdfFileName}`} target="_blank" rel="noopener noreferrer" style={{color:'#3b82f6', fontWeight:'bold'}}>📄 View PDF</a>}
                                </div>
                                <button onClick={() => handleDeleteMaterial(m.id)} style={{background:'var(--danger)', color:'white', border:'none', padding:'5px 10px', borderRadius:'5px', cursor:'pointer'}}>Delete</button>
                            </div>
                        ))}
                    </div>
                )}

                {/* RECORDS TAB */}
                {activeTab === 'records' && (
                    <div className="card">
                        <h2 className="card-header">All Student Records</h2>
                        <table className="styled-table">
                            <thead><tr><th>Student Name</th><th>Date</th><th>Score</th><th>Feedback</th></tr></thead>
                            <tbody>
                                {results.map(r => (
                                    <tr key={r.id}>
                                        <td><strong>{r.username}</strong></td>
                                        <td>{r.examDate}</td>
                                        <td>{r.score}/{r.totalQuestions}</td>
                                        <td style={{maxWidth:'300px', fontSize:'14px'}}>{r.feedback}</td>
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