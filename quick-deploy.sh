#!/bin/bash

# Quick deployment script for Google Cloud
# This is a simplified version of deploy.sh for quick deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values - UPDATE THESE BEFORE RUNNING
PROJECT_ID="${PROJECT_ID:-your-project-id}"
REGION="${REGION:-us-central1}"

echo -e "${BLUE}🚀 Quick Deploy to Google Cloud${NC}"
echo "Project: $PROJECT_ID"
echo "Region: $REGION"
echo ""

# Validate required variables
if [ "$PROJECT_ID" = "your-project-id" ]; then
    echo -e "${RED}❌ Please set PROJECT_ID environment variable or update the script${NC}"
    echo "Example: export PROJECT_ID=my-actual-project-id"
    exit 1
fi

# Check gcloud CLI
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI not found. Please install it first.${NC}"
    exit 1
fi

# Set project
echo -e "${YELLOW}📋 Setting project...${NC}"
gcloud config set project $PROJECT_ID

# Enable APIs
echo -e "${YELLOW}🔧 Enabling APIs...${NC}"
gcloud services enable cloudbuild.googleapis.com run.googleapis.com containerregistry.googleapis.com

# Submit build
echo -e "${YELLOW}🏗️ Starting build and deployment...${NC}"
gcloud builds submit . --config=cloudbuild.yaml --substitutions=_PROJECT_ID=$PROJECT_ID

# Get service URLs
echo -e "${YELLOW}📝 Getting service URLs...${NC}"
BACKEND_URL=$(gcloud run services describe imdb-backend --region=$REGION --format="value(status.url)" 2>/dev/null || echo "")
FRONTEND_URL=$(gcloud run services describe imdb-frontend --region=$REGION --format="value(status.url)" 2>/dev/null || echo "")

# Update frontend with backend URL if both services exist
if [ ! -z "$BACKEND_URL" ] && [ ! -z "$FRONTEND_URL" ]; then
    echo -e "${YELLOW}🔄 Updating frontend configuration...${NC}"
    gcloud run services update imdb-frontend \
        --region=$REGION \
        --set-env-vars="VITE_API_BASE_URL=$BACKEND_URL/api" \
        --quiet
fi

echo ""
echo -e "${GREEN}✅ Deployment completed!${NC}"
echo ""
echo "📋 Service URLs:"
if [ ! -z "$BACKEND_URL" ]; then
    echo -e "   Backend:  ${BLUE}$BACKEND_URL${NC}"
fi
if [ ! -z "$FRONTEND_URL" ]; then
    echo -e "   Frontend: ${BLUE}$FRONTEND_URL${NC}"
fi
echo ""
echo -e "${YELLOW}⚠️  Important Next Steps:${NC}"
echo "1. Set up your MongoDB connection string in Secret Manager"
echo "2. Configure JWT secret in Secret Manager"
echo "3. Update the backend service with environment variables:"
echo ""
echo -e "${BLUE}gcloud run services update imdb-backend --region=$REGION \\"
echo "  --set-env-vars=\"MONGODB_URI=your-connection-string,JWT_SECRET=your-secret\"${NC}"
echo ""
echo "For detailed setup instructions, see DEPLOYMENT.md"
