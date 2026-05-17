package com.finance.controller;

import com.finance.model.User;
import com.finance.repository.UserRepository;
import com.finance.service.AccessPolicyService;
import com.finance.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AccessPolicyService accessPolicyService;

    @GetMapping
    public ResponseEntity<?> getProfile(HttpServletRequest request) {
        Optional<User> userResult = currentUser(request);
        if (userResult.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required.");
        }

        return ResponseEntity.ok(toProfileResponse(userResult.get(), null));
    }

    @PatchMapping
    public ResponseEntity<?> updateProfile(HttpServletRequest request, @RequestBody Map<String, String> data) {
        Optional<User> userResult = currentUser(request);
        if (userResult.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Login required.");
        }

        User user = userResult.get();
        String username = normalize(data.get("username"));
        String email = normalize(data.get("email"));

        ResponseEntity<?> conflict = validateSensitiveUniqueness(user, username, email);
        if (conflict != null) {
            return conflict;
        }

        conflict = validateNonSensitiveUniqueness(user, data);
        if (conflict != null) {
            return conflict;
        }

        user.setUsername(username);
        user.setEmail(email);
        applyNonSensitiveFields(user, data);
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getUsername(), user.getId(), user.getAccessLevel().name());
        return ResponseEntity.ok(toProfileResponse(user, "Profile updated successfully.", token));
    }

    private Optional<User> currentUser(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return userId == null ? Optional.empty() : userRepository.findById(userId);
    }

    private ResponseEntity<?> validateSensitiveUniqueness(User user, String username, String email) {
        if (username == null) {
            return ResponseEntity.badRequest().body("Username is required.");
        }

        Optional<User> usernameOwner = userRepository.findByUsername(username);
        if (usernameOwner.isPresent() && !usernameOwner.get().getId().equals(user.getId())) {
            return ResponseEntity.badRequest().body("Username already exists.");
        }

        if (email != null) {
            Optional<User> emailOwner = userRepository.findByEmail(email);
            if (emailOwner.isPresent() && !emailOwner.get().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body("Email already exists.");
            }
        }

        return null;
    }

    private ResponseEntity<?> validateNonSensitiveUniqueness(User user, Map<String, String> data) {
        String phone = normalize(data.get("phone"));
        if (phone != null) {
            Optional<User> phoneOwner = userRepository.findByPhone(phone);
            if (phoneOwner.isPresent() && !phoneOwner.get().getId().equals(user.getId())) {
                return ResponseEntity.badRequest().body("Phone number already exists.");
            }
        }
        return null;
    }

    private void applyNonSensitiveFields(User user, Map<String, String> data) {
        user.setPhone(normalize(data.get("phone")));
        user.setFirstName(normalize(data.get("firstName")));
        user.setLastName(normalize(data.get("lastName")));
        user.setGender(normalize(data.get("gender")));
        user.setCurrency(normalize(data.get("currency")) == null ? "INR" : normalize(data.get("currency")));
        String dateOfBirth = normalize(data.get("dateOfBirth"));
        user.setDateOfBirth(dateOfBirth == null ? null : LocalDate.parse(dateOfBirth));
    }

    private String normalize(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    private Map<String, Object> toProfileResponse(User user, String message) {
        return toProfileResponse(user, message, null);
    }

    private Map<String, Object> toProfileResponse(User user, String message, String token) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", message == null ? "" : message);
        response.put("id", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail() == null ? "" : user.getEmail());
        response.put("phone", user.getPhone() == null ? "" : user.getPhone());
        response.put("firstName", user.getFirstName() == null ? "" : user.getFirstName());
        response.put("lastName", user.getLastName() == null ? "" : user.getLastName());
        response.put("gender", user.getGender() == null ? "" : user.getGender());
        response.put("dateOfBirth", user.getDateOfBirth() == null ? "" : user.getDateOfBirth().toString());
        response.put("currency", user.getCurrency());
        response.put("accessLevel", user.getAccessLevel().name());
        response.put("subscriberUntil", user.getSubscriberUntil() == null ? "" : user.getSubscriberUntil().toString());
        response.put("allowedPages", accessPolicyService.getAllowedPages(user.getAccessLevel()));
        if (token != null) {
            response.put("token", token);
        }
        return response;
    }
}
