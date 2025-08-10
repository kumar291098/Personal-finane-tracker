-- Insert default categories if they don't exist (table already exists)
INSERT INTO categories (id, name, type, icon, created_at, updated_at) VALUES 
(1, 'Income', 'INCOME', '💰', NOW(), NOW()),
(2, 'Expense', 'EXPENSE', '💸', NOW(), NOW()),
(3, 'Food', 'EXPENSE', '🍔', NOW(), NOW()),
(4, 'Transportation', 'EXPENSE', '🚗', NOW(), NOW()),
(5, 'Entertainment', 'EXPENSE', '🎬', NOW(), NOW()),
(6, 'Utilities', 'EXPENSE', '⚡', NOW(), NOW()),
(7, 'Salary', 'INCOME', '💼', NOW(), NOW()),
(8, 'Freelance', 'INCOME', '💻', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset sequence to ensure proper auto-increment
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));