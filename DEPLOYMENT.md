# Deployment Guide

This app uses:

- Backend: Spring Boot Docker service on Render
- Frontend: React app on Vercel
- Database: PostgreSQL on Neon

## 1. Push Code To GitHub

Render and Vercel deploy from GitHub.

```bash
git add .
git commit -m "Prepare app for production deployment"
git push
```

## 2. Create PostgreSQL On Neon

1. Go to https://neon.tech and create a project.
2. Create or use the default database.
3. Copy the pooled connection string if available.
4. Convert the Neon URL to JDBC format for Spring Boot.

Example Neon URL:

```text
postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require
```

Spring JDBC URL:

```text
jdbc:postgresql://HOST/DBNAME?sslmode=require
```

Save these values:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://HOST/DBNAME?sslmode=require
SPRING_DATASOURCE_USERNAME=USER
SPRING_DATASOURCE_PASSWORD=PASSWORD
```

## 3. Deploy Backend On Render

1. Go to https://render.com.
2. New > Web Service.
3. Connect your GitHub repository.
4. Use these settings:

```text
Root Directory: backend
Runtime: Docker
Dockerfile Path: ./Dockerfile
Plan: Free or Starter
```

5. Add environment variables:

```text
SPRING_DATASOURCE_URL=jdbc:postgresql://HOST/DBNAME?sslmode=require
SPRING_DATASOURCE_USERNAME=USER
SPRING_DATASOURCE_PASSWORD=PASSWORD
SPRING_JPA_HIBERNATE_DDL_AUTO=update
SERVER_PORT=8080
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

6. Deploy.
7. Copy your Render backend URL.

Example:

```text
https://finance-tracker-backend.onrender.com
```

## 4. Deploy Frontend On Vercel

1. Go to https://vercel.com.
2. Add New > Project.
3. Import the same GitHub repository.
4. Use these settings:

```text
Framework Preset: Create React App
Root Directory: frontend/finance-tracker
Build Command: npm run build
Output Directory: build
Install Command: npm install
```

5. Add environment variable:

```text
REACT_APP_API_BASE_URL=https://YOUR-RENDER-BACKEND.onrender.com/api
```

6. Deploy.
7. Copy your Vercel frontend URL.

Example:

```text
https://finance-tracker.vercel.app
```

## 5. Update Render CORS

After Vercel gives you the frontend URL, go back to Render > Backend Service > Environment.

Change:

```text
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

To:

```text
CORS_ALLOWED_ORIGINS=https://YOUR-VERCEL-APP.vercel.app
```

Then redeploy the Render backend.

## 6. Test

Open the Vercel URL and test:

1. Register a user.
2. Login.
3. Add a transaction.
4. Refresh the page and confirm data still loads.

## Common Fixes

If frontend says network error:

- Check `REACT_APP_API_BASE_URL` in Vercel.
- It must end with `/api`.
- Redeploy Vercel after changing environment variables.

If browser console says CORS error:

- Check `CORS_ALLOWED_ORIGINS` in Render.
- It must exactly match your Vercel URL.
- Redeploy Render after changing it.

If backend cannot connect to database:

- Check Neon username, password, host, and database name.
- Make sure `SPRING_DATASOURCE_URL` starts with `jdbc:postgresql://`.
- Keep `?sslmode=require` at the end.
