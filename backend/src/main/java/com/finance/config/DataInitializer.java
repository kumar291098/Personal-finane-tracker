package com.finance.config;

import com.finance.model.Category;
import com.finance.repository.CategoryRepository;
import com.finance.service.AccessPolicyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private AccessPolicyService accessPolicyService;

    @Override
    public void run(String... args) throws Exception {
        accessPolicyService.ensureDefaults();

        // Check if default categories already exist
        if (!categoryRepository.existsByNameAndTypeAndUserIsNull("Income", "INCOME")) {
            System.out.println("Initializing default categories...");

            // Create default income categories
            categoryRepository.save(new Category("Income", "INCOME", "💰"));

            // Create default expense categories
            categoryRepository.save(new Category("Expense", "EXPENSE", "💸"));

            // Create additional common categories
            categoryRepository.save(new Category("Food", "EXPENSE", "🍔"));
            categoryRepository.save(new Category("Transportation", "EXPENSE", "🚗"));
            categoryRepository.save(new Category("Entertainment", "EXPENSE", "🎬"));
            categoryRepository.save(new Category("Utilities", "EXPENSE", "⚡"));
            categoryRepository.save(new Category("Donation", "EXPENSE", "🤝"));
            categoryRepository.save(new Category("Grocery", "EXPENSE", "🛒"));
            categoryRepository.save(new Category("Sports", "EXPENSE", "🏏"));
            categoryRepository.save(new Category("Salary", "INCOME", "💼"));
            categoryRepository.save(new Category("Freelance", "INCOME", "💻"));

            System.out.println("Default categories created successfully!");
        } else {
            ensureCategory("Donation", "EXPENSE", "🤝");
            ensureCategory("Grocery", "EXPENSE", "🛒");
            ensureCategory("Sports", "EXPENSE", "🏏");
            System.out.println("Categories already exist, skipping initialization.");
        }
    }

    private void ensureCategory(String name, String type, String icon) {
        if (!categoryRepository.existsByNameAndTypeAndUserIsNull(name, type)) {
            categoryRepository.save(new Category(name, type, icon));
            System.out.println(name + " category added.");
        }
    }
}
