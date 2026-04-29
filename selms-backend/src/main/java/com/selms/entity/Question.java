package com.selms.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "questions")
@Data @NoArgsConstructor @AllArgsConstructor
public class Question {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String text;
    private String option1;
    private String option2;
    private String option3;
    private String option4;
    private int correctAnswer; 
    private String topic;
}