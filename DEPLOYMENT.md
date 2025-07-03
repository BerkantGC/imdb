# IMDB App - Google Cloud Deployment Guide

This guide will help you deploy the IMDB application to Google Cloud Platform using Cloud Run, Cloud Build, and other Google Cloud services.

## Prerequisites

1. **Google Cloud Account**: Make sure you have a Google Cloud account with billing enabled
2. **gcloud CLI**: Install the Google Cloud CLI from [https://cloud.google.com/sdk/docs/install](https://cloud.google.com/sdk/docs/install)
3. **Docker**: Ensure Docker is installed on your local machine
4. **MongoDB Atlas** (recommended): Set up a MongoDB Atlas cluster for your database

## Pre-deployment Setup

### 1. Create a Google Cloud Project

```bash
# Create a new project (replace with your desired project ID)
gcloud projects create your-project-id --name="IMDB App"

# Set the project as default
gcloud config set project your-project-id
```

### 2. Set up MongoDB Database

#### Option A: MongoDB Atlas (Recommended)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Whitelist Google Cloud IP ranges or use 0.0.0.0/0 for all IPs

#### Option B: Google Cloud MongoDB
1. Use Google Cloud Marketplace to deploy MongoDB
2. Or use Cloud SQL with PostgreSQL as an alternative

### 3. Configure Environment Variables

Edit the `deploy.sh` file and update these variables:

```bash
PROJECT_ID="your-actual-project-id"
REGION="us-central1"  # or your preferred region
MONGODB_URI="mongodb+srv://username:password@cluster.mongodb.net/imdb_app"
JWT_SECRET="your-super-secret-jwt-key-at-least-32-characters"
```

## Deployment Steps

### 1. Authenticate with Google Cloud

```bash
# Login to Google Cloud
gcloud auth login

# Set application default credentials
gcloud auth application-default login
```

### 2. Run the Deployment Script

```bash
# Make the script executable (already done)
chmod +x deploy.sh

# Run the deployment
./deploy.sh
```

### 3. Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# Set your project
gcloud config set project your-project-id

# Enable APIs
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# Build and deploy
gcloud builds submit . --config=cloudbuild.yaml
```

## Post-deployment Configuration

### 1. Environment Variables

After deployment, update Cloud Run services with environment variables:

```bash
# Update backend environment variables
gcloud run services update imdb-backend \
    --region=us-central1 \
    --set-env-vars="MONGODB_URI=your-connection-string,JWT_SECRET=your-secret"

# Update frontend with backend URL
BACKEND_URL=$(gcloud run services describe imdb-backend --region=us-central1 --format="value(status.url)")
gcloud run services update imdb-frontend \
    --region=us-central1 \
    --set-env-vars="VITE_API_BASE_URL=$BACKEND_URL"
```

### 2. Custom Domain (Optional)

```bash
# Map a custom domain to your frontend
gcloud run domain-mappings create \
    --service=imdb-frontend \
    --domain=yourdomain.com \
    --region=us-central1
```

### 3. SSL Certificate

Google Cloud Run automatically provides SSL certificates for custom domains.

## Monitoring and Maintenance

### 1. View Logs

```bash
# Backend logs
gcloud run services logs read imdb-backend --region=us-central1

# Frontend logs
gcloud run services logs read imdb-frontend --region=us-central1
```

### 2. Service Status

```bash
# List all services
gcloud run services list

# Get service details
gcloud run services describe imdb-backend --region=us-central1
```

### 3. Scaling

```bash
# Update scaling settings
gcloud run services update imdb-backend \
    --region=us-central1 \
    --min-instances=1 \
    --max-instances=10
```

## Troubleshooting

### Common Issues

1. **Build Failures**: Check Cloud Build logs in the Google Cloud Console
2. **Database Connection**: Ensure MongoDB URI is correct and accessible from Google Cloud
3. **CORS Issues**: Make sure frontend URL is added to backend CORS settings
4. **Environment Variables**: Verify all required environment variables are set

### Useful Commands

```bash
# Check service status
gcloud run services list

# View service logs
gcloud run services logs read SERVICE_NAME --region=REGION

# Update service
gcloud run services update SERVICE_NAME --region=REGION --set-env-vars="KEY=VALUE"

# Delete service
gcloud run services delete SERVICE_NAME --region=REGION
```

## Cost Optimization

1. **Use minimum instances**: Set min-instances to 0 for development
2. **Right-size resources**: Adjust CPU and memory based on actual usage
3. **Use Cloud Build caching**: Enable build caching for faster builds
4. **Monitor usage**: Use Google Cloud Monitoring to track resource usage

## Security Best Practices

1. **Use Secret Manager**: Store sensitive data in Google Secret Manager
2. **Limit service access**: Use IAM to control access to services
3. **Enable audit logging**: Monitor all API calls and changes
4. **Regular updates**: Keep container images and dependencies updated

## Estimated Costs

For a small to medium application:
- **Cloud Run**: ~$10-50/month (based on usage)
- **Cloud Build**: ~$5-20/month
- **Container Registry**: ~$1-5/month
- **Redis**: ~$30-100/month
- **MongoDB Atlas**: ~$10-100/month (depending on cluster size)

Total estimated cost: **$56-275/month** for moderate usage.

## Support

If you encounter issues:
1. Check the [Google Cloud Run documentation](https://cloud.google.com/run/docs)
2. Review application logs in Cloud Console
3. Verify environment variables and secrets
4. Test locally with Docker before deploying
