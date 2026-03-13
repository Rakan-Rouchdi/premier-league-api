# Deploying the Premier League API to Render

This guide will walk you through deploying your Premier League API application to Render.com.

## Prerequisites

1. A [Render](https://render.com) account (free tier is available)
2. Your project code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Prepare Your Application

Your application is already set up correctly for deployment with:
- FastAPI serving static files from the `frontend/` directory
- Relative API URLs in the frontend code
- CORS middleware enabled
- Requirements listed in `requirements.txt`

### 2. Create a `render.yaml` File (Optional)

For easier deployment, you can create a `render.yaml` file in your project root:

```yaml
services:
  - type: web
    name: premier-league-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.9.0
```

### 3. Create a New Web Service on Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/)
2. Click **New** and select **Web Service**
3. Connect your Git repository
4. Configure your web service:
   - **Name**: `premier-league-api` (or your preferred name)
   - **Environment**: `Python`
   - **Region**: Choose the region closest to your users
   - **Branch**: `main` (or your default branch)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free (or select a paid plan if needed)

5. Click **Advanced** and add the following environment variable:
   - **Key**: `PYTHON_VERSION`
   - **Value**: `3.9.0` (or your preferred Python version)

6. Click **Create Web Service**

### 4. Monitor the Deployment

Render will automatically build and deploy your application. You can monitor the progress in the Render dashboard.

### 5. Access Your Application

Once deployed, your application will be available at:
- `https://premier-league-api.onrender.com` (replace with your actual Render URL)

The frontend will be accessible at the root URL, and the API endpoints will be available at their respective paths:
- Frontend: `https://premier-league-api.onrender.com/`
- API: `https://premier-league-api.onrender.com/players/`, etc.
- API Documentation: `https://premier-league-api.onrender.com/docs`

### 6. Database Considerations

This deployment guide assumes you're using the SQLite database included in your project. For a production environment, you might want to consider:

1. **Using a managed database service** like Render's PostgreSQL service
2. **Updating your database connection** in `app/database.py` to use the PostgreSQL URL
3. **Adding database migration scripts** to initialize your database schema

### 7. Troubleshooting

If you encounter any issues:

1. Check the **Logs** tab in your Render dashboard
2. Verify that all dependencies are correctly listed in `requirements.txt`
3. Ensure your start command is correct
4. Check that your application is properly configured to run in a production environment

## Additional Resources

- [Render Python Deployment Docs](https://render.com/docs/deploy-python)
- [FastAPI Deployment Guide](https://fastapi.tiangolo.com/deployment/)
- [Render Environment Variables](https://render.com/docs/environment-variables)
