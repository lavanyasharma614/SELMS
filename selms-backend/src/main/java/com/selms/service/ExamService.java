package com.selms.service;

import com.selms.entity.ExamResult;
import com.selms.entity.Question;
import com.selms.repository.QuestionRepository;
import com.selms.repository.ResultRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;

@Service
public class ExamService {

    @Autowired private QuestionRepository questionRepo;
    @Autowired private ResultRepository resultRepo;

    public List<Question> getShuffledQuestions() {
        List<Question> questions = questionRepo.findAll();
        Collections.shuffle(questions);
        return questions;
    }

    // Updated to accept questionIds and handle String keys from React JSON
    public ExamResult evaluateExam(String username, Map<String, Integer> userAnswers, List<Long> questionIds) {
        int score = 0;
        int totalQuestions = questionIds.size();
        Set<String> weakTopics = new HashSet<>();

        for (Long qId : questionIds) {
            Question q = questionRepo.findById(qId).orElse(null);
            if (q != null) {
                // JSON converts Map keys to Strings, so we use String.valueOf to match
                Integer userAns = userAnswers.get(String.valueOf(qId));
                
                if (userAns != null && userAns == q.getCorrectAnswer()) {
                    score++;
                } else {
                    weakTopics.add(q.getTopic());
                }
            }
        }

        double percentage = (totalQuestions > 0) ? (score * 100.0) / totalQuestions : 0;
        String feedback = generateFeedback(percentage, weakTopics);

        ExamResult result = new ExamResult(null, username, LocalDate.now(), score, totalQuestions, feedback);
        return resultRepo.save(result);
    }

    private String generateFeedback(double percentage, Set<String> weakTopics) {
        String topicsStr = weakTopics.isEmpty() ? "" : " Topics to revise: " + String.join(", ", weakTopics);
        
        if (percentage < 40) {
            return "You need improvement." + topicsStr;
        } else if (percentage <= 70) {
            return "Good effort, revise." + topicsStr;
        } else {
            return "Excellent work!";
        }
    }
}