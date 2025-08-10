package com.finance.controller;
import com.finance.util.JwtUtil;
import com.finance.dto.LoginRequest;
import com.finance.model.User;
import com.finance.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private JwtUtil jwtUtil;
    // 🔐 Login endpoint
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest request) {
         User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new RuntimeException("Invalid username"));

    // If you're not using password hashing (e.g., BCrypt), do a direct comparison
    if (!user.getPassword().equals(request.getPassword())) {
        throw new RuntimeException("Invalid password");
    }

    // Generate JWT token
    String token = jwtUtil.generateToken(user.getUsername(), user.getId());

    // Send token and user info to frontend
    Map<String, Object> response = new HashMap<>();
    response.put("token", token);
    response.put("userId", user.getId());
    response.put("username", user.getUsername());

    return ResponseEntity.ok(response);
    }

    // 📝 Register endpoint
    @PostMapping("/register")
    public Map<String, Object> register(@RequestBody Map<String, String> data) {
        String username = data.get("username");
        String password = data.get("password");

        Map<String, Object> response = new HashMap<>();

        if (username == null || password == null) {
            response.put("success", false);
            response.put("message", "Missing username or password");
            return response;
        }

        if (userRepository.findByUsername(username).isPresent()) {
            response.put("success", false);
            response.put("message", "Username already exists");
            return response;
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(password); // no encoding
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "User registered successfully");
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        return response;
    }
}
