package com.selms.controller;

import com.selms.entity.LoginLog;
import com.selms.entity.User;
import com.selms.repository.LoginLogRepository;
import com.selms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired private UserRepository userRepo;
    @Autowired private LoginLogRepository logRepo;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> creds) {
        String username = creds.get("username");
        String password = creds.get("password");
        
        User user = userRepo.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        if (!user.getPassword().equals(password)) {
            return ResponseEntity.status(401).body("Invalid Credentials");
        }

       
        logRepo.save(new LoginLog(user.getUsername(), user.getRole(), LocalDateTime.now()));

        return ResponseEntity.ok(user);
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        if (user.getRole().equalsIgnoreCase("ADMIN")) {
            return ResponseEntity.status(403).body("Admin signup is not allowed!");
        }
        if (userRepo.existsByUsername(user.getUsername())) {
            return ResponseEntity.badRequest().body("Username already exists");
        }
        user.setId(null);
        return ResponseEntity.ok(userRepo.save(user));
    }
}