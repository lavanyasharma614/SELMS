package com.selms.controller;

import com.selms.entity.*;
import com.selms.repository.*;
import com.selms.service.ExamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/student")
@CrossOrigin(origins = "http://localhost:3000")
public class StudentController {

    @Autowired private ExamService examService;
    @Autowired private ResultRepository resultRepo;
    @Autowired private MaterialRepository materialRepo;
    @Autowired private ExamConfigRepository examConfigRepo;

    @GetMapping("/exam-questions")
    public List<Question> startExam() {
        return examService.getShuffledQuestions();
    }

    @GetMapping("/exam-config")
    public ExamConfig getExamConfig() {
        return examConfigRepo.findById(1L).orElse(new ExamConfig(1L, 5, true));
    }

    @PostMapping("/submit-exam")
    public ExamResult submitExam(@RequestBody Map<String, Object> payload) {
        String username = (String) payload.get("username");
        
        @SuppressWarnings("unchecked")
        Map<String, Integer> userAnswers = (Map<String, Integer>) payload.get("answers");
        
        
        List<Long> questionIds = new ArrayList<>();
        Object idsObj = payload.get("questionIds");
        if (idsObj instanceof List) {
            questionIds = ((List<Number>) idsObj)
                    .stream()
                    .map(Number::longValue)
                    .collect(Collectors.toList());
        }

        return examService.evaluateExam(username, userAnswers, questionIds);
    }

    @GetMapping("/results/{username}")
    public List<ExamResult> getMyResults(@PathVariable String username) {
        return resultRepo.findByUsername(username);
    }

    @GetMapping("/materials")
    public List<Material> getStudyMaterials() {
        return materialRepo.findAll();
    }
}