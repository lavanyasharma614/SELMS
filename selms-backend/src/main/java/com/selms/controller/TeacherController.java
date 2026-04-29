package com.selms.controller;

import com.selms.entity.*;
import com.selms.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/teacher")
@CrossOrigin(origins = "http://localhost:3000")
public class TeacherController {

    @Autowired private QuestionRepository questionRepo;
    @Autowired private ResultRepository resultRepo;
    @Autowired private MaterialRepository materialRepo;
    @Autowired private ExamConfigRepository examConfigRepo;

    private final String uploadDir = "uploads/";

    // --- Materials with File Upload ---
    @PostMapping(value = "/materials", consumes = {"multipart/form-data"})
    public Material addMaterial(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("videoLink") String videoLink,
            @RequestParam(value = "pdfFile", required = false) MultipartFile pdfFile) {

        String pdfFileName = null;
        if (pdfFile != null && !pdfFile.isEmpty()) {
            try {
                // Create uploads directory if it doesn't exist
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                // Generate a unique filename to avoid conflicts
                pdfFileName = System.currentTimeMillis() + "_" + pdfFile.getOriginalFilename();
                Path filePath = Paths.get(uploadDir + pdfFileName);
                Files.copy(pdfFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                e.printStackTrace();
                throw new RuntimeException("Failed to save PDF file");
            }
        }

        Material mat = new Material();
        mat.setTitle(title);
        mat.setContent(content);
        mat.setVideoLink(videoLink);
        mat.setPdfFileName(pdfFileName);
        mat.setDateAdded(LocalDate.now());
        
        return materialRepo.save(mat);
    }

    @GetMapping("/materials")
    public List<Material> getMaterials() { return materialRepo.findAll(); }

    @DeleteMapping("/materials/{id}")
    public void deleteMaterial(@PathVariable Long id) {
        Material mat = materialRepo.findById(id).orElseThrow();
        
       
        if (mat.getPdfFileName() != null) {
            try {
                Path filePath = Paths.get(uploadDir + mat.getPdfFileName());
                Files.deleteIfExists(filePath);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        
        materialRepo.deleteById(id);
    }

   
    @PostMapping("/questions")
    public Question addQuestion(@RequestBody Question q) { q.setId(null); return questionRepo.save(q); }
    @GetMapping("/questions")
    public List<Question> getQuestions() { return questionRepo.findAll(); }
    @PutMapping("/questions/{id}")
    public Question updateQuestion(@PathVariable Long id, @RequestBody Question qData) {
        Question q = questionRepo.findById(id).orElseThrow();
        q.setText(qData.getText()); q.setTopic(qData.getTopic()); q.setOption1(qData.getOption1());
        q.setOption2(qData.getOption2()); q.setOption3(qData.getOption3()); q.setOption4(qData.getOption4());
        q.setCorrectAnswer(qData.getCorrectAnswer());
        return questionRepo.save(q);
    }
    @DeleteMapping("/questions/{id}")
    public void deleteQuestion(@PathVariable Long id) { questionRepo.deleteById(id); }

    // --- Exam Timer Management ---
    @PostMapping("/exam-config")
    public ExamConfig setExamConfig(@RequestBody ExamConfig config) { config.setId(1L); return examConfigRepo.save(config); }
    @GetMapping("/exam-config")
    public ExamConfig getExamConfig() { return examConfigRepo.findById(1L).orElse(new ExamConfig(1L, 5, true)); }

    // --- Student Records ---
    @GetMapping("/results")
    public List<ExamResult> getAllResults() { return resultRepo.findAll(); }
}