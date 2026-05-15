# Docker Setup Guide for Finance Tracker

This guide explains how to containerize and deploy the Finance Tracker application using Docker.

## Prerequisites

- Docker (version 20.10 or higher)
- Docker Compose (version 2.0 or higher)
- Git

Install Docker: https://docs.docker.com/get-docker/

## Quick Start with Docker Compose

The easiest way to run the entire application stack locally is using Docker Compose:

```bash
# Clone the repository
git clone <your-repo-url>
cd Personal-finance-tracker

# Build and start all services
docker-compose up --build

# Or run in detached mode
docker-compose up -d --build
```

This will start:
- **PostgreSQL Database**: `localhost:5432`
- **Backend API**: `localhost:8080`
- **Frontend**: `localhost:3000`

## Manual Docker Build

If you want to build individual containers:

### Backend Build
```bash
cd backend
docker build -t finance-tracker-backend:latest .
docker run -d \
  --name finance-backend \
  -p 8080:8080 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://postgres-host:5432/finance_tracker \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=root \
  finance-tracker-backend:latest
```

### Frontend Build
```bash
cd frontend/finance-tracker
docker build -t finance-tracker-frontend:latest .
docker run -d \
  --name finance-frontend \
  -p 3000:80 \
  finance-tracker-frontend:latest
```

## Docker File Structure

```
├── backend/
│   ├── Dockerfile           # Multi-stage Java build
│   └── .dockerignore       # Docker build exclusions
├── frontend/finance-tracker/
│   ├── Dockerfile          # Multi-stage Node/React build
│   ├── nginx.conf          # Nginx configuration
│   └── .dockerignore       # Docker build exclusions
├── docker-compose.yml      # Orchestration configuration
└── .env.example            # Environment variables template
```

## Useful Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Rebuild after code changes
docker-compose up -d --build

# Remove all containers and volumes
docker-compose down -v

# Access running container
docker-compose exec backend bash
docker-compose exec frontend sh

# View running containers
docker ps

# View all images
docker images

# Remove unused images and containers
docker system prune -a
```

## Free Cloud Hosting Options

### Option 1: Azure Container Instances (Free Tier)
- **Free Tier**: 1 vCPU, 1.5 GB memory per month
- **Link**: https://azure.microsoft.com/free

Steps:
```bash
# 1. Login to Azure CLI
az login

# 2. Create a resource group
az group create -n finance-tracker -l eastus

# 3. Push image to Azure Container Registry (ACR)
az acr create -g finance-tracker -n financetracker --sku Basic

# 4. Tag and push image
docker tag finance-tracker-backend:latest financetracker.azurecr.io/backend:latest
az acr build -r financetracker -t backend:latest ./backend

# 5. Deploy using Azure CLI or Azure Compose
az container create -g finance-tracker -n finance-app --image financetracker.azurecr.io/backend:latest --ports 8080
```

### Option 2: Google Cloud Run (Free Tier)
- **Free Tier**: 180,000 vCPU-seconds, 360,000 GB-seconds per month
- **Link**: https://cloud.google.com/run

Steps:
```bash
# 1. Authenticate
gcloud auth login

# 2. Set project
gcloud config set project YOUR_PROJECT_ID

# 3. Build and push to Google Artifact Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/finance-backend ./backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/finance-frontend ./frontend

# 4. Deploy to Cloud Run
gcloud run deploy finance-backend \
  --image gcr.io/YOUR_PROJECT_ID/finance-backend \
  --platform managed \
  --region us-central1

gcloud run deploy finance-frontend \
  --image gcr.io/YOUR_PROJECT_ID/finance-frontend \
  --platform managed \
  --region us-central1
```

### Option 3: Railway (Free Tier + $5 Credit)
- **Free Tier**: $5 monthly credit (usually covers small projects)
- **Link**: https://railway.app

Steps:
1. Create account at https://railway.app
2. Connect GitHub repository
3. Create new project from repository
4. Add services: PostgreSQL, Backend, Frontend
5. Configure environment variables
6. Deploy

### Option 4: Render (Free Tier)
- **Free Tier**: 750 hours per month (always-on services)
- **Link**: https://render.com

Steps:
1. Create account at https://render.com
2. Create new web service from GitHub
3. Deploy backend and frontend as separate services
4. Configure PostgreSQL as managed database
5. Set environment variables

### Option 5: AWS Free Tier
- **Free Tier**: 750 hours of t2.micro EC2, various container services
- **Link**: https://aws.amazon.com/free

## Environment Variables

Copy `.env.example` to `.env` and modify as needed:

```bash
cp .env.example .env
```

Then edit `.env` with your cloud provider credentials and settings.

## Production Considerations

1. **Database Backup**: Set up automated backups for PostgreSQL
2. **Environment Variables**: Use cloud provider secret management (not .env in production)
3. **Logging**: Configure centralized logging (ELK stack, CloudWatch, etc.)
4. **Monitoring**: Add monitoring and alerting
5. **SSL/TLS**: Enable HTTPS certificates
6. **Rate Limiting**: Implement API rate limiting
7. **Security**: 
   - Use strong passwords
   - Implement WAF (Web Application Firewall)
   - Regular security scans
   - Keep base images updated

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port
lsof -i :8080
kill -9 <PID>
# Or change port in docker-compose.yml
```

### Database Connection Issues
```bash
# Check database logs
docker-compose logs postgres

# Test database connection from backend container
docker-compose exec backend bash
nc -zv postgres 5432
```

### Build Failures
```bash
# Clear Docker cache and rebuild
docker-compose down -v
docker system prune -a
docker-compose up --build
```

## Next Steps

1. Build and test locally with docker-compose
2. Choose your cloud provider from options above
3. Push images to cloud container registry
4. Deploy and configure services
5. Set up domain name and SSL
6. Monitor and scale as needed

For more information, refer to:
- Docker Documentation: https://docs.docker.com
- Your Cloud Provider's Documentation
