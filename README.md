# 🏦 Personal Finance Tracker

A comprehensive full-stack personal finance management application built with React (frontend) and Spring Boot (backend) that helps users track income, expenses, and manage their financial goals effectively.

## 🌟 Features

### Core Features
- **📊 Dashboard Analytics**: Visual insights with charts and graphs
- **💰 Transaction Management**: Add, edit, delete, and categorize transactions
- **📈 Budget Tracking**: Set and monitor budget limits
- **🔐 Secure Authentication**: JWT-based user authentication
- **📱 Responsive Design**: Works seamlessly on desktop and mobile devices
- **📊 Financial Reports**: Generate detailed financial reports

### Advanced Features
- **📊 Interactive Charts**: Income/Expense visualization using Chart.js
- **🎯 Goal Setting**: Set and track financial goals
- **📅 Recurring Transactions**: Handle recurring income/expenses
- **🔍 Advanced Filtering**: Filter transactions by date, category, amount
- **📤 Data Export**: Export data to CSV/PDF formats
- **🎨 Beautiful UI**: Modern, intuitive interface with dark/light themes

## 🏗️ Architecture Overview

### High-Level Architecture (HLD)
```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (React)                        │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │   React App     │  │   Redux Store    │  │   Router    │ │
│  │   Components    │  │   State Mgmt     │  │   Navigation │ │
│  └─────────────────┘  └──────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/REST API
                              │
┌─────────────────────────────────────────────────────────────┐
│                        Backend (Spring Boot)                 │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │   Controllers   │  │   Services       │  │   Security  │ │
│  │   REST API      │  │   Business Logic │  │   JWT Auth  │ │
│  └─────────────────┘  └──────────────────┘  └─────────────┘ │
│  ┌─────────────────┐  ┌──────────────────┐  ┌─────────────┐ │
│  │   Repository    │  │   Entities       │  │   Database  │ │
│  │   Data Access   │  │   Models         │  │   MySQL     │ │
│  └─────────────────┘  └──────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Low-Level Design (LLD)

#### Frontend Architecture
```
src/
├── components/
│   ├── auth/           # Authentication components
│   ├── dashboard/      # Dashboard and analytics
│   ├── transactions/   # Transaction management
│   ├── layout/         # Layout components
│   └── shared/         # Reusable components
├── services/           # API service layer
├── hooks/              # Custom React hooks
├── context/            # React Context providers
├── utils/              # Utility functions
└── styles/             # CSS styles and themes
```

#### Backend Architecture
```
backend/
├── controller/         # REST API endpoints
├── service/            # Business logic layer
├── repository/         # Data access layer
├── model/              # Entity classes
├── security/           # JWT authentication
├── config/             # Application configuration
└── util/               # Utility classes
```

## 🚀 Technology Stack

### Frontend
- **React 18** - UI framework
- **React Router v6** - Client-side routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **CSS3** - Styling
- **React Context** - State management

### Backend
- **Spring Boot 3** - Backend framework
- **Spring Security** - Authentication & authorization
- **JWT** - Token-based authentication
- **Spring Data JPA** - Database ORM
- **MySQL** - Database
- **Maven** - Build tool

### DevOps & Tools
- **Git** - Version control
- **Docker** - Containerization
- **Postman** - API testing
- **VS Code** - IDE

## 📋 Prerequisites

- Node.js (v16 or higher)
- Java 17 or higher
- MySQL 8.0 or higher
- Maven 3.6 or higher

## 🛠️ Installation & Setup

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
mvn clean install

# Configure database
# Update application.properties with your MySQL credentials

# Run the application
mvn spring-boot:run
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend/finance-tracker

# Install dependencies
npm install

# Start development server
npm start
```

## 🔧 Configuration

### Database Configuration
Update `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/finance_tracker
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### Environment Variables
Create `.env` file in frontend directory:
```env
REACT_APP_API_URL=http://localhost:8080/api
```

## 🎯 Usage

### User Registration
1. Navigate to the registration page
2. Fill in user details (email, password, name)
3. Complete registration and login

### Adding Transactions
1. Login to your account
2. Navigate to the dashboard
3. Click "Add Transaction"
4. Fill transaction details (amount, category, type, description)
5. Save the transaction

### Viewing Analytics
1. Go to the dashboard
2. View charts showing income vs expenses
3. Filter data by date range or category
4. Export reports as needed

## 🔐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Transactions
- `GET /api/transactions` - Get all transactions
- `GET /api/transactions/{id}` - Get transaction by ID
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/{id}` - Update transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create new category

## 🧪 Testing

### Backend Tests
```bash
# Run backend tests
mvn test
```

### Frontend Tests
```bash
# Run frontend tests
npm test
```

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker
docker-compose up --build
```

### Production Build
```bash
# Frontend production build
npm run build

# Backend production build
mvn package
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Transactions Table
```sql
CREATE TABLE transactions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    transaction_type ENUM('INCOME', 'EXPENSE'),
    transaction_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

## 🎨 UI/UX Design

### Color Palette
- Primary: #2563eb (Blue)
- Secondary: #10b981 (Green)
- Accent: #f59e0b (Amber)
- Background: #f8fafc (Light gray)
- Text: #1e293b (Dark gray)

### Responsive Design
- Mobile-first approach
- Breakpoints: 320px, 768px, 1024px, 1440px
- Flexible grid system

## 🔍 Code Flow

### Authentication Flow
```
User Login → JWT Token Generation → Token Storage → API Requests with Token → Protected Routes
```

### Transaction Flow
```
User Input → Validation → API Call → Database Update → State Update → UI Refresh
```

### Data Flow
```
Component → Service → API → Controller → Service → Repository → Database
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For<thinking>
The user has shifted the request to add a beautiful README.md file for the project with code flow, high-level design (HLD), low-level design (LLD), and detailed explanations.

I see there is already a README.md file in frontend/finance-tracker/README.md. I should read this file first to understand what is already there and then plan the additions or improvements.

After reading, I will create a comprehensive README.md covering:
- Project overview
- Code flow
- High-Level Design (HLD)
- Low-Level Design (LLD)
- Details about frontend and backend structure
- How to run and build the project
- Any other relevant details

I will proceed to read the existing README.md file.
</thinking>

<read_file>
<path>frontend/finance-tracker/README.md</path>
</read_file>
