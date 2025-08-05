# S3 Auto-Configuration

This project now includes automatic S3 bucket configuration that runs every time you start the server. This ensures your S3 bucket is properly configured for the LMS application without manual intervention.

## What Gets Configured Automatically

When you start the server (`npm start`), the following S3 configurations are applied automatically:

### 1. CORS Configuration
- Allows cross-origin requests from any domain (`*`)
- Permits all HTTP methods (GET, PUT, POST, DELETE, HEAD)
- Allows all headers
- Sets appropriate cache control

### 2. Public Access Configuration
- Enables public read access for uploaded files
- Allows the bucket to serve files directly to web browsers
- Configures proper public access block settings

### 3. Bucket Policy
- Sets up a policy that allows public read access to all objects
- Ensures uploaded images, videos, and documents are accessible via direct URLs

## Environment Variables

### Required Variables
Make sure these are set in your `.env` file:
```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_S3_BUCKET_NAME=your_bucket_name_here
AWS_REGION=your_preferred_region (default: us-east-1)
```

### Optional Control Variable
```env
# Set to 'false' to disable automatic S3 configuration
AUTO_CONFIGURE_S3=true
```

## When Configuration Runs

The S3 configuration runs automatically:
- ✅ Every time you start the server
- ✅ When switching to a new AWS account
- ✅ When using a different S3 bucket
- ✅ When deploying to a new environment

## Error Handling

If S3 configuration fails (e.g., due to permissions or network issues):
- ⚠️ A warning is logged but the server continues to start
- 🔄 The server will still function, but images may not load properly
- 📝 Check your AWS credentials and permissions if issues persist

## Required AWS Permissions

Your AWS user/role needs these permissions:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutBucketCors",
                "s3:PutBucketPolicy",
                "s3:PutBucketPublicAccessBlock",
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

## Disabling Auto-Configuration

If you prefer to configure S3 manually, set this in your `.env`:
```env
AUTO_CONFIGURE_S3=false
```

Then run the manual configuration script when needed:
```bash
cd backend
node scripts/configureS3Bucket.js
```

## Troubleshooting

### Common Issues:

1. **Access Denied Error**
   - Check your AWS credentials
   - Verify your AWS user has the required permissions
   - Ensure the bucket name is correct

2. **Bucket Not Found**
   - Verify the bucket exists in your AWS account
   - Check the bucket name in your `.env` file
   - Ensure you're using the correct AWS region

3. **Images Still Not Loading**
   - Wait a few minutes for AWS changes to propagate
   - Clear your browser cache
   - Check browser console for specific error messages

## Benefits

- 🚀 **Zero Manual Setup**: No need to manually configure S3 through AWS console
- 🔄 **Environment Agnostic**: Works across development, staging, and production
- 🛡️ **Error Resilient**: Server starts even if S3 configuration fails
- ⚡ **Always Up-to-Date**: Ensures configuration is applied every time
- 🎯 **Account Flexible**: Automatically works with different AWS accounts

This automatic configuration eliminates the common issue where profile images upload successfully but don't display due to missing CORS or public access settings.
