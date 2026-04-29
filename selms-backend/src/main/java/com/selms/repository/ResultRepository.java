package com.selms.repository;

import com.selms.entity.ExamResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ResultRepository extends JpaRepository<ExamResult, Long> {
    List<ExamResult> findByUsername(String username);
}