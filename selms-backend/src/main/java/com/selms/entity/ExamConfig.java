package com.selms.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "exam_config")
public class ExamConfig {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private int durationMinutes;
    private boolean examActive;

    
    public ExamConfig() {}

    
    public ExamConfig(Long id, int durationMinutes, boolean examActive) {
        this.id = id;
        this.durationMinutes = durationMinutes;
        this.examActive = examActive;
    }

    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public int getDurationMinutes() { return durationMinutes; }
    public void setDurationMinutes(int durationMinutes) { this.durationMinutes = durationMinutes; }

    public boolean isExamActive() { return examActive; }
    public void setExamActive(boolean examActive) { this.examActive = examActive; }
}