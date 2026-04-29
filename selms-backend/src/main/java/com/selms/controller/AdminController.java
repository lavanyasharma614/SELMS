package com.selms.controller;

import com.selms.entity.LoginLog;
import com.selms.entity.User;
import com.selms.repository.LoginLogRepository;
import com.selms.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000")
public class AdminController {

    @Autowired private UserRepository userRepo;
    @Autowired private LoginLogRepository logRepo;

    @GetMapping("/users")
    public List<User> getAllUsers() { return userRepo.findAll(); }

    @PostMapping("/users")
    public User addUser(@RequestBody User user) {
        if(userRepo.existsByUsername(user.getUsername())) throw new RuntimeException("Username exists");
        user.setId(null);
        return userRepo.save(user);
    }

    @DeleteMapping("/users/{id}")
    public void deleteUser(@PathVariable Long id) { userRepo.deleteById(id); }

    @PutMapping("/reset-password")
    public User resetPassword(@RequestBody Map<String, String> payload) {
        User user = userRepo.findByUsername(payload.get("username"))
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setPassword(payload.get("newPassword"));
        return userRepo.save(user);
    }

    @GetMapping("/logs")
    public List<LoginLog> getLoginLogs() { return logRepo.findAll(); }
}