package com.selms.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "results")
@Data @NoArgsConstructor @AllArgsConstructor
public class ExamResult {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String username;
    private LocalDate examDate;
    private double score;
    private int totalQuestions;
    private String feedback;
}