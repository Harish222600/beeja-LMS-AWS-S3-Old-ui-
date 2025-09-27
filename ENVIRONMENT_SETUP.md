# Environment Configuration Guide

This project requires environment variables to be configured for both frontend and backend applications.

## Quick Setup

### Backend Setup
1. Navigate to the ackend directory
2. Copy .env.example to .env:
   `ash
   cp .env.example .env
   `
3. Edit .env and fill in your actual values
4. Make sure to set a strong JWT_SECRET and configure your database URL

### Frontend Setup
1. Navigate to the rontend directory
2. Copy .env.example to .env.local:
   `ash
   cp .env.example .env.local
   `
3. Edit .env.local and fill in your actual values
4. Make sure the API URL points to your backend server

## Required Services

### Database
- **MongoDB**: Local installation or MongoDB Atlas cloud service
- **Connection String**: Configure in MONGODB_URL

### File Storage
- **AWS S3**: For storing videos, images, and documents
- **Supabase** (Optional): Alternative storage solution

### Payment Gateway
- **Razorpay**: For processing course payments
- **API Keys**: Get from Razorpay dashboard

### Email Service
- **SMTP Provider**: Gmail, Outlook, or custom SMTP server
- **Credentials**: Email and app password

## Security Notes

- Never commit .env or .env.local files to version control
- Use strong, unique secrets for JWT_SECRET
- Rotate API keys and credentials regularly
- Enable HTTPS in production
- Configure proper CORS origins

## Development vs Production

### Development
- Use local database URLs
- Set NODE_ENV=development
- Use localhost URLs for API endpoints

### Production
- Use production database URLs
- Set NODE_ENV=production
- Use HTTPS URLs
- Configure proper domain names
- Set up monitoring and logging

## Troubleshooting

### Common Issues
1. **Database Connection Failed**: Check MONGODB_URL format
2. **CORS Errors**: Verify FRONTEND_URL matches your frontend domain
3. **File Upload Issues**: Check AWS S3 credentials and bucket permissions
4. **Email Not Sending**: Verify SMTP credentials and app passwords
5. **Payment Issues**: Check Razorpay API keys

### Getting Help
- Check the console logs for detailed error messages
- Verify all environment variables are set correctly
- Ensure all required services are running and accessible
