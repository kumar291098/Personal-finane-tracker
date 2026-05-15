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
        String email = normalize(data.get("email"));
        String phone = normalize(data.get("phone"));

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

        if (email != null && userRepository.findByEmail(email).isPresent()) {
            response.put("success", false);
            response.put("message", "Email already exists");
            return response;
        }

        if (phone != null && userRepository.findByPhone(phone).isPresent()) {
            response.put("success", false);
            response.put("message", "Phone number already exists");
            return response;
        }

        User user = new User();
        user.setUsername(username);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPassword(password); // no encoding
        userRepository.save(user);

        response.put("success", true);
        response.put("message", "User registered successfully");
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        return response;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> data) {
        String identifier = normalize(data.get("identifier"));
        String newPassword = data.get("newPassword");

        if (identifier == null || newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest().body("Enter your email, phone, or username and a password with at least 6 characters.");
        }

        Optional<User> userResult = userRepository.findByEmail(identifier)
            .or(() -> userRepository.findByPhone(identifier))
            .or(() -> userRepository.findByUsername(identifier));

        if (userResult.isEmpty()) {
            return ResponseEntity.badRequest().body("No account found for that email, phone, or username.");
        }

        User user = userResult.get();
        user.setPassword(newPassword.trim());
        userRepository.save(user);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Password reset successfully. You can login now.");
        return ResponseEntity.ok(response);
    }

    private String normalize(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
