package com.finance.controller;

import com.finance.model.Category;
import com.finance.model.User;
import com.finance.repository.CategoryRepository;
import com.finance.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<?> getCategories(HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        if (userId == null) {
            return ResponseEntity.status(401).body("{\"error\":\"Authentication required\"}");
        }

        List<Category> categories = categoryRepository.findVisibleForUser(userId);
        return ResponseEntity.ok(categories);
    }

    @PostMapping
    public ResponseEntity<?> createCategory(@RequestBody CategoryRequest categoryRequest, HttpServletRequest request) {
        User user = getAuthenticatedUser(request);
        if (user == null) {
            return ResponseEntity.status(401).body("{\"error\":\"Authentication required\"}");
        }

        Category category = new Category();
        applyRequest(category, categoryRequest);
        category.setUser(user);
        category.setHidden(false);
        category.setCreatedAt(LocalDateTime.now());
        category.setUpdatedAt(LocalDateTime.now());

        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCategory(
            @PathVariable Long id,
            @RequestBody CategoryRequest categoryRequest,
            HttpServletRequest request) {
        User user = getAuthenticatedUser(request);
        if (user == null) {
            return ResponseEntity.status(401).body("{\"error\":\"Authentication required\"}");
        }

        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }

        Category categoryToSave;
        if (category.getUser() == null) {
            categoryToSave = categoryRepository.findByUserIdAndSourceCategoryId(user.getId(), category.getId())
                    .orElseGet(() -> {
                        Category userCategory = new Category();
                        userCategory.setUser(user);
                        userCategory.setSourceCategoryId(category.getId());
                        userCategory.setCreatedAt(LocalDateTime.now());
                        return userCategory;
                    });
            categoryToSave.setHidden(false);
        } else if (category.getUser().getId().equals(user.getId())) {
            categoryToSave = category;
        } else {
            return ResponseEntity.status(403).body("{\"error\":\"Cannot update another user's category\"}");
        }

        applyRequest(categoryToSave, categoryRequest);
        categoryToSave.setUpdatedAt(LocalDateTime.now());
        return ResponseEntity.ok(categoryRepository.save(categoryToSave));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCategory(@PathVariable Long id, HttpServletRequest request) {
        User user = getAuthenticatedUser(request);
        if (user == null) {
            return ResponseEntity.status(401).body("{\"error\":\"Authentication required\"}");
        }

        Category category = categoryRepository.findById(id).orElse(null);
        if (category == null) {
            return ResponseEntity.notFound().build();
        }

        if (category.getUser() == null) {
            Category hiddenPreference = categoryRepository.findByUserIdAndSourceCategoryId(user.getId(), category.getId())
                    .orElseGet(() -> {
                        Category userCategory = new Category();
                        userCategory.setUser(user);
                        userCategory.setSourceCategoryId(category.getId());
                        userCategory.setName(category.getName());
                        userCategory.setType(category.getType());
                        userCategory.setIcon(category.getIcon());
                        userCategory.setCreatedAt(LocalDateTime.now());
                        return userCategory;
                    });
            hiddenPreference.setHidden(true);
            hiddenPreference.setUpdatedAt(LocalDateTime.now());
            categoryRepository.save(hiddenPreference);
            return ResponseEntity.ok("Category hidden for your account");
        }

        if (!category.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body("{\"error\":\"Cannot delete another user's category\"}");
        }

        categoryRepository.delete(category);
        return ResponseEntity.ok("Category deleted successfully");
    }

    private void applyRequest(Category category, CategoryRequest request) {
        category.setName(request.getName() == null ? "" : request.getName().trim());
        category.setType(normalizeType(request.getType()));
        category.setIcon(request.getIcon() == null || request.getIcon().isBlank() ? "?" : request.getIcon());
    }

    private String normalizeType(String type) {
        String normalized = type == null ? "EXPENSE" : type.trim().toUpperCase(Locale.ROOT);
        return "INCOME".equals(normalized) ? "INCOME" : "EXPENSE";
    }

    private Long getAuthenticatedUserId(HttpServletRequest request) {
        return (Long) request.getAttribute("userId");
    }

    private User getAuthenticatedUser(HttpServletRequest request) {
        Long userId = getAuthenticatedUserId(request);
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId).orElse(null);
    }

    public static class CategoryRequest {
        private String name;
        private String type;
        private String icon;

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getType() {
            return type;
        }

        public void setType(String type) {
            this.type = type;
        }

        public String getIcon() {
            return icon;
        }

        public void setIcon(String icon) {
            this.icon = icon;
        }
    }
}
