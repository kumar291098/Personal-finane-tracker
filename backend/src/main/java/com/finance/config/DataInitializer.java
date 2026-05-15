package com.finance.config;

import com.finance.model.Category;
import com.finance.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public void run(String... args) throws Exception {
        // Check if categories already exist
        if (categoryRepository.count() == 0) {
            System.out.println("🏗️ Initializing default categories...");
            
            // Create default income categories
            Category incomeCategory = new Category("Income", "INCOME", "💰");
            categoryRepository.save(incomeCategory);
            
            // Create default expense categories
            Category expenseCategory = new Category("Expense", "EXPENSE", "💸");
            categoryRepository.save(expenseCategory);
            
            // Create additional common categories
            categoryRepository.save(new Category("Food", "EXPENSE", "🍔"));
            categoryRepository.save(new Category("Transportation", "EXPENSE", "🚗"));
            categoryRepository.save(new Category("Entertainment", "EXPENSE", "🎬"));
            categoryRepository.save(new Category("Utilities", "EXPENSE", "⚡"));
            categoryRepository.save(new Category("Donation", "EXPENSE", "🤝"));
            categoryRepository.save(new Category("Salary", "INCOME", "💼"));
            categoryRepository.save(new Category("Freelance", "INCOME", "💻"));
            
            System.out.println("✅ Default categories created successfully!");
        } else {
            if (!categoryRepository.existsByNameAndType("Donation", "EXPENSE")) {
                categoryRepository.save(new Category("Donation", "EXPENSE", "🤝"));
                System.out.println("🤝 Donation category added.");
            }
            System.out.println("📋 Categories already exist, skipping initialization.");
        }
    }
}
