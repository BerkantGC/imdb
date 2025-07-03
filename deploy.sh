#!/bin/bash

# Google Cloud Deployment Script for IMDB Application
# Make sure you have gcloud CLI installed and are authenticated

set -e

# Configuration - Update these values
PROJECT_ID=imdb-464720
REGION="us-central1"
MONGODB_URI="${MONGODB_URI:-your-mongodb-connection-string}"
JWT_SECRET="${JWT_SECRET:-your-jwt-secret-key}"
REDIS_URL="${REDIS_URL:-redis://your-redis-instance:6379}"

echo "🚀 Starting deployment to Google Cloud Platform..."

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLI is not installed. Please install it first:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | head -n 1 > /dev/null; then
    echo "❌ Not authenticated with gcloud. Please run:"
    echo "gcloud auth login"
    exit 1
fi

# Set the project
echo "📋 Setting project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required Google Cloud APIs..."
gcloud services enable \
    cloudbuild.googleapis.com \
    run.googleapis.com \
    containerregistry.googleapis.com \
    secretmanager.googleapis.com \
    redis.googleapis.com

# Create secrets for sensitive data
echo "🔐 Creating secrets..."

# Create MongoDB URI secret
echo -n "$MONGODB_URI" | gcloud secrets create mongodb-uri --data-file=- || \
echo -n "$MONGODB_URI" | gcloud secrets versions add mongodb-uri --data-file=-

# Create JWT secret
echo -n "$JWT_SECRET" | gcloud secrets create jwt-secret --data-file=- || \
echo -n "$JWT_SECRET" | gcloud secrets versions add jwt-secret --data-file=-

# Create Redis URL secret
echo -n "$REDIS_URL" | gcloud secrets create redis-url --data-file=- || \
echo -n "$REDIS_URL" | gcloud secrets versions add redis-url --data-file=-

# Create a Redis instance (optional - you can use external Redis service)
echo "📡 Creating Redis instance..."
gcloud redis instances create imdb-redis \
    --size=1 \
    --region=$REGION \
    --redis-version=redis_7_0 \
    --tier=basic || echo "Redis instance already exists or creation failed"

# Get Redis IP and update the secret
REDIS_IP=$(gcloud redis instances describe imdb-redis --region=$REGION --format="value(host)" 2>/dev/null || echo "")
if [ ! -z "$REDIS_IP" ]; then
    REDIS_URL="redis://$REDIS_IP:6379"
    echo -n "$REDIS_URL" | gcloud secrets versions add redis-url --data-file=-
fi

# Build and deploy using Cloud Build
echo "🏗️ Building and deploying with Cloud Build..."
gcloud builds submit . --config=cloudbuild.yaml --substitutions=_PROJECT_ID=$PROJECT_ID

# Get the backend service URL
BACKEND_URL=$(gcloud run services describe imdb-backend --region=$REGION --format="value(status.url)")
echo "✅ Backend deployed at: $BACKEND_URL"

# Update frontend environment variable with backend URL
echo "🔄 Updating frontend with backend URL..."
gcloud run services update imdb-frontend \
    --region=$REGION \
    --set-env-vars="VITE_API_BASE_URL=$BACKEND_URL"

# Get the frontend service URL
FRONTEND_URL=$(gcloud run services describe imdb-frontend --region=$REGION --format="value(status.url)")
echo "✅ Frontend deployed at: $FRONTEND_URL"

echo ""
echo "🎉 Deployment completed successfully!"
echo ""
echo "📝 Deployment Summary:"
echo "   Backend URL:  $BACKEND_URL"
echo "   Frontend URL: $FRONTEND_URL"
echo "   Region:       $REGION"
echo "   Project:      $PROJECT_ID"
echo ""
echo "🔧 Next steps:"
echo "1. Update your domain DNS to point to the frontend URL"
echo "2. Configure custom domain in Cloud Run (optional)"
echo "3. Set up monitoring and alerting"
echo "4. Configure backup for your database"
echo ""
echo "📊 To monitor your services:"
echo "   gcloud run services list"
echo "   gcloud run services describe imdb-backend --region=$REGION"
echo "   gcloud run services describe imdb-frontend --region=$REGION"
