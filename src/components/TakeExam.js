import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

export default function TakeExam({ user }) {
    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [timeLeft, setTimeLeft] = useState(0);
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    
    const navigate = useNavigate();
    const location = useLocation();
    const durationMinutes = location.state?.duration || 5; 
    
    
    const answersRef = useRef(answers);
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        axios.get('http://localhost:8080/api/student/exam-questions')
            .then(res => {
                setQuestions(res.data);
                setTimeLeft(durationMinutes * 60); 
            })
            .catch(() => alert('Failed to load questions'));
    }, [durationMinutes]);

    useEffect(() => {
        if (timeLeft <= 0 || submitted) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleAutoSubmit(); // Auto-submit when timer reaches 0
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, submitted]); 

    const handleAnswer = (qId, optNum) => {
        if (!submitted) {
            setAnswers(prev => ({ ...prev, [qId]: optNum }));
        }
    };

    const submitExam = async (ansMap) => {
        if (submitted) return;
        setSubmitted(true);
        try {
            const qIds = questions.map(q => q.id);
            const res = await axios.post('http://localhost:8080/api/student/submit-exam', {
                username: user.username,
                answers: ansMap,
                questionIds: qIds 
            });
            setResult(res.data);
        } catch (err) {
            alert('Error submitting exam');
            console.error(err);
        }
    };

    const handleManualSubmit = () => {
        submitExam(answers);
    };

    const handleAutoSubmit = () => {
        alert("Time's up! Auto-submitting your exam...");
        submitExam(answersRef.current); // Uses the ref to get the latest answers safely
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (result) {
        const pct = (result.score / result.totalQuestions) * 100;
        return (
            <div style={{maxWidth:'600px', margin:'50px auto'}}>
                <div className="card result-card">
                    <h2>Exam Completed! 🎉</h2>
                    <div className="score-circle" style={{background: pct > 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)'}}>
                        {Math.round(pct)}%
                    </div>
                    <h2>Score: {result.score} / {result.totalQuestions}</h2>
                    <div className={`feedback-box ${pct > 70 ? 'feedback-excellent' : pct >= 40 ? 'feedback-good' : 'feedback-improvement'}`}>
                        <strong>Feedback:</strong> {result.feedback}
                    </div>
                    <button onClick={() => navigate('/student')} className="btn-primary" style={{marginTop:20}}>Back to Dashboard</button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
            <div className="top-bar">
                <h2>Exam In Progress 📝</h2>
                <button onClick={() => { if(window.confirm('Are you sure you want to exit? Your progress will be lost.')) navigate('/student'); }} style={{background:'none', border:'none', color:'var(--danger)', cursor:'pointer', fontWeight:'bold'}}>Exit Exam</button>
            </div>
            
            <div className="card" style={{textAlign:'center', marginBottom:'20px'}}>
                <div className={`exam-timer ${timeLeft < 30 ? 'danger' : ''}`}>
                    {formatTime(timeLeft)}
                </div>
                <p>Time Remaining</p>
            </div>

            {questions.map((q, idx) => (
                <div key={q.id} className="question-card" style={{animationDelay: `${idx * 0.1}s`}}>
                    <h3 style={{marginBottom:'15px'}}>{idx + 1}. {q.text}</h3>
                    <small style={{color:'var(--primary)', display:'block', marginBottom:'10px'}}>Topic: {q.topic}</small>
                    {[1, 2, 3, 4].map(num => (
                        <label key={num} className={`option-label ${answers[q.id] === num ? 'selected' : ''}`}>
                            <input 
                                type="radio" 
                                name={`q_${q.id}`} 
                                checked={answers[q.id] === num}
                                onChange={() => handleAnswer(q.id, num)}
                                style={{marginRight:'10px'}}
                                disabled={submitted}
                            /> 
                            {q[`option${num}`]}
                        </label>
                    ))}
                </div>
            ))}

            <button onClick={handleManualSubmit} className="btn-primary" disabled={submitted} style={{marginBottom:'50px'}}>
                Submit Exam
            </button>
        </div>
    );
}