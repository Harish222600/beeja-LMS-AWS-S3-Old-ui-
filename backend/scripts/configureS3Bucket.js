require('dotenv').config();
const { S3Client, PutBucketCorsCommand, PutBucketPolicyCommand, PutPublicAccessBlockCommand } = require('@aws-sdk/client-s3');

const s3Client = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

async function configureS3Bucket() {
    try {
        console.log(`🔧 Configuring S3 bucket: ${BUCKET_NAME}`);

        // 1. Configure CORS
        const corsConfiguration = {
            CORSRules: [
                {
                    AllowedOrigins: ['*'],
                    AllowedMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
                    AllowedHeaders: ['*'],
                    ExposeHeaders: ['ETag', 'x-amz-meta-custom-header'],
                    MaxAgeSeconds: 3000
                }
            ]
        };

        const corsCommand = new PutBucketCorsCommand({
            Bucket: BUCKET_NAME,
            CORSConfiguration: corsConfiguration
        });

        await s3Client.send(corsCommand);
        console.log('✅ CORS configuration applied successfully');

        // 2. Configure public access block (allow public read)
        const publicAccessBlockCommand = new PutPublicAccessBlockCommand({
            Bucket: BUCKET_NAME,
            PublicAccessBlockConfiguration: {
                BlockPublicAcls: false,
                IgnorePublicAcls: false,
                BlockPublicPolicy: false,
                RestrictPublicBuckets: false
            }
        });

        await s3Client.send(publicAccessBlockCommand);
        console.log('✅ Public access block configuration updated');

        // 3. Configure bucket policy for public read access
        const bucketPolicy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Sid: 'PublicReadGetObject',
                    Effect: 'Allow',
                    Principal: '*',
                    Action: 's3:GetObject',
                    Resource: `arn:aws:s3:::${BUCKET_NAME}/*`
                }
            ]
        };

        const policyCommand = new PutBucketPolicyCommand({
            Bucket: BUCKET_NAME,
            Policy: JSON.stringify(bucketPolicy)
        });

        await s3Client.send(policyCommand);
        console.log('✅ Bucket policy applied successfully');

        console.log('🎉 S3 bucket configuration completed successfully!');
        console.log('📝 Your bucket is now configured for:');
        console.log('   - Cross-origin requests (CORS)');
        console.log('   - Public read access for uploaded files');
        console.log('   - Proper headers for web applications');

    } catch (error) {
        console.error('❌ Error configuring S3 bucket:', error);
        
        if (error.name === 'AccessDenied') {
            console.log('💡 Make sure your AWS credentials have the following permissions:');
            console.log('   - s3:PutBucketCors');
            console.log('   - s3:PutBucketPolicy');
            console.log('   - s3:PutBucketPublicAccessBlock');
        }
        
        process.exit(1);
    }
}

// Run the configuration
configureS3Bucket();
