const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const ChunkedVideo = require('../models/chunkedVideo');
const SubSection = require('../models/subSection');
const { s3Client, BUCKET_NAME } = require('../config/awsS3');
const { GetObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');

/**
 * Get video manifest for chunked video playback
 * GET /api/v1/video/manifest/:videoId
 */
router.get('/manifest/:videoId', auth, async (req, res) => {
    try {
        const { videoId } = req.params;
        
        // Get chunked video record
        const chunkedVideo = await ChunkedVideo.findOne({ videoId });
        if (!chunkedVideo) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        if (!chunkedVideo.isComplete) {
            return res.status(400).json({
                success: false,
                message: 'Video upload is not complete'
            });
        }

        // Sort chunks by index
        const sortedChunks = chunkedVideo.uploadedChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);

        // Generate chunk URLs for playback
        const chunkUrls = sortedChunks.map(chunk => {
            // For S3, we'll use signed URLs or direct streaming
            const s3Key = chunk.chunkPath;
            const publicUrl = `https://${process.env.AWS_S3_BUCKET_VIDEOS}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
            return {
                index: chunk.chunkIndex,
                url: publicUrl,
                size: chunk.chunkSize
            };
        });

        const manifest = {
            videoId,
            originalFilename: chunkedVideo.originalFilename,
            totalSize: chunkedVideo.totalSize,
            totalChunks: chunkedVideo.totalChunks,
            chunkSize: chunkedVideo.chunkSize,
            mimetype: chunkedVideo.mimetype,
            chunks: chunkUrls,
            duration: chunkedVideo.duration || 0,
            isChunked: true
        };

        res.status(200).json({
            success: true,
            data: manifest,
            message: 'Video manifest retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting video manifest:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: 'Failed to get video manifest'
        });
    }
});

/**
 * Stream chunked video for playback
 * GET /api/v1/video/stream/:videoId
 * Supports both header and query parameter authentication
 */
router.get('/stream/:videoId', async (req, res) => {
    // Check for token in header or query parameter
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.query.token) {
        token = req.query.token;
    }
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token required'
        });
    }
    
    // Verify token manually since we're not using the auth middleware
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }
    try {
        const { videoId } = req.params;
        const range = req.headers.range;
        
        // Get chunked video record
        const chunkedVideo = await ChunkedVideo.findOne({ videoId });
        if (!chunkedVideo) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        if (!chunkedVideo.isComplete) {
            return res.status(400).json({
                success: false,
                message: 'Video upload is not complete'
            });
        }

        const totalSize = chunkedVideo.totalSize;
        
        if (range) {
            // Parse range header
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

            // Limit range size to prevent memory issues and improve performance
            const maxRangeSize = 2 * 1024 * 1024; // 2MB max per request
            const actualEnd = Math.min(end, start + maxRangeSize - 1, totalSize - 1);
            const rangeSize = actualEnd - start + 1;

            // Determine which chunks we need
            const startChunk = Math.floor(start / chunkedVideo.chunkSize);
            const endChunk = Math.floor(actualEnd / chunkedVideo.chunkSize);

            console.log(`Range request: ${start}-${actualEnd} (${rangeSize} bytes), chunks: ${startChunk}-${endChunk}`);

            // Set response headers immediately for faster response
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${actualEnd}/${totalSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': rangeSize,
                'Content-Type': chunkedVideo.mimetype,
                'Cache-Control': 'public, max-age=3600'
            });

            // Stream chunks as we download them for faster response
            const sortedChunks = chunkedVideo.uploadedChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
            let bytesWritten = 0;
            
            for (let i = startChunk; i <= endChunk && bytesWritten < rangeSize; i++) {
                const chunk = sortedChunks[i];
                if (!chunk) continue;

                try {
                    // Download chunk from S3
                    const getObjectParams = {
                        Bucket: process.env.AWS_S3_BUCKET_VIDEOS,
                        Key: chunk.chunkPath
                    };

                    const command = new GetObjectCommand(getObjectParams);
                    const response = await s3Client.send(command);
                    
                    if (!response.Body) {
                        console.error(`Error downloading chunk ${i}: No body in response`);
                        continue;
                    }

                    // Convert stream to buffer
                    const chunks = [];
                    for await (const chunk of response.Body) {
                        chunks.push(chunk);
                    }
                    const chunkBuffer = Buffer.concat(chunks);

                    // Calculate the portion of this chunk we need
                    const chunkStartPos = i * chunkedVideo.chunkSize;
                    const chunkEndPos = chunkStartPos + chunkBuffer.length - 1;
                    
                    // Check if this chunk overlaps with our requested range
                    if (chunkEndPos >= start && chunkStartPos <= actualEnd) {
                        const sliceStart = Math.max(0, start - chunkStartPos);
                        const sliceEnd = Math.min(chunkBuffer.length, actualEnd - chunkStartPos + 1);
                        
                        if (sliceStart < sliceEnd && bytesWritten < rangeSize) {
                            const slicedChunk = chunkBuffer.slice(sliceStart, sliceEnd);
                            const bytesToWrite = Math.min(slicedChunk.length, rangeSize - bytesWritten);
                            
                            if (bytesToWrite > 0) {
                                const finalChunk = slicedChunk.slice(0, bytesToWrite);
                                res.write(finalChunk);
                                bytesWritten += finalChunk.length;
                            }
                        }
                    }
                } catch (downloadError) {
                    console.error(`Error processing chunk ${i}:`, downloadError);
                }
            }

            res.end();
        } else {
            // No range header, stream entire video
            res.writeHead(200, {
                'Content-Length': totalSize,
                'Content-Type': chunkedVideo.mimetype,
            });

            // Stream all chunks in order
            const sortedChunks = chunkedVideo.uploadedChunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
            
            for (const chunk of sortedChunks) {
                try {
                    // Download chunk from S3
                    const getObjectParams = {
                        Bucket: process.env.AWS_S3_BUCKET_VIDEOS,
                        Key: chunk.chunkPath
                    };

                    const command = new GetObjectCommand(getObjectParams);
                    const response = await s3Client.send(command);
                    
                    if (!response.Body) {
                        console.error(`Error downloading chunk ${chunk.chunkIndex}: No body in response`);
                        continue;
                    }

                    // Convert stream to buffer
                    const chunks = [];
                    for await (const chunkPart of response.Body) {
                        chunks.push(chunkPart);
                    }
                    const chunkBuffer = Buffer.concat(chunks);
                    res.write(chunkBuffer);
                } catch (downloadError) {
                    console.error(`Error processing chunk ${chunk.chunkIndex}:`, downloadError);
                }
            }

            res.end();
        }
    } catch (error) {
        console.error('Error streaming video:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: error.message,
                error: 'Failed to stream video'
            });
        }
    }
});

/**
 * Get video info for chunked videos
 * GET /api/v1/video/info/:videoId
 * Supports both header and query parameter authentication
 */
router.get('/info/:videoId', async (req, res) => {
    // Check for token in header or query parameter
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.query.token) {
        token = req.query.token;
    }
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token required'
        });
    }
    
    // Verify token manually
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }
    try {
        const { videoId } = req.params;
        
        const chunkedVideo = await ChunkedVideo.findOne({ videoId });
        if (!chunkedVideo) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        const videoInfo = {
            videoId: chunkedVideo.videoId,
            originalFilename: chunkedVideo.originalFilename,
            totalSize: chunkedVideo.totalSize,
            totalChunks: chunkedVideo.totalChunks,
            isComplete: chunkedVideo.isComplete,
            uploadProgress: chunkedVideo.uploadProgress,
            duration: chunkedVideo.duration || 0,
            mimetype: chunkedVideo.mimetype,
            createdAt: chunkedVideo.createdAt,
            completedAt: chunkedVideo.completedAt,
            isChunked: true
        };

        res.status(200).json({
            success: true,
            data: videoInfo,
            message: 'Video info retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting video info:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: 'Failed to get video info'
        });
    }
});

/**
 * Stream direct S3 videos (non-chunked)
 * GET /api/v1/video/direct/:subSectionId
 * Supports both header and query parameter authentication
 */
router.get('/direct/:subSectionId', async (req, res) => {
    // Check for token in header or query parameter
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.query.token) {
        token = req.query.token;
    }
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token required'
        });
    }
    
    // Verify token manually since we're not using the auth middleware
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }

    try {
        const { subSectionId } = req.params;
        const range = req.headers.range;
        
        console.log('🎥 Direct video streaming request:', {
            subSectionId,
            range,
            method: req.method,
            userAgent: req.headers['user-agent']
        });
        
        // Get subsection with video URL
        const subSection = await SubSection.findById(subSectionId);
        console.log('🎥 SubSection found:', {
            id: subSection?._id,
            title: subSection?.title,
            videoUrl: subSection?.videoUrl,
            hasVideo: !!subSection?.videoUrl
        });
        
        if (!subSection || !subSection.videoUrl) {
            console.error('❌ Video not found for subSectionId:', subSectionId);
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        // Extract S3 key from URL
        let s3Key;
        const videoUrl = subSection.videoUrl;
        
        console.log('🎥 Processing video URL:', videoUrl);
        
        if (videoUrl.includes('amazonaws.com')) {
            // Extract key from S3 URL
            const urlParts = videoUrl.split('/');
            s3Key = urlParts.slice(3).join('/'); // Remove https://bucket.s3.region.amazonaws.com/
            console.log('🎥 Extracted S3 key from amazonaws URL:', s3Key);
        } else if (process.env.AWS_CLOUDFRONT_DOMAIN && videoUrl.includes(process.env.AWS_CLOUDFRONT_DOMAIN)) {
            // Extract key from CloudFront URL
            s3Key = videoUrl.split(`https://${process.env.AWS_CLOUDFRONT_DOMAIN}/`)[1];
            console.log('🎥 Extracted S3 key from CloudFront URL:', s3Key);
        } else {
            console.error('❌ Invalid video URL format:', videoUrl);
            return res.status(400).json({
                success: false,
                message: 'Invalid video URL format',
                videoUrl: videoUrl
            });
        }

        console.log('🎥 Final S3 streaming parameters:', {
            bucket: BUCKET_NAME,
            key: s3Key,
            hasRange: !!range
        });

        // Get object metadata first
        const headCommand = new HeadObjectCommand({
            Bucket: BUCKET_NAME,
            Key: s3Key
        });

        const headResponse = await s3Client.send(headCommand);
        const contentLength = headResponse.ContentLength;
        const contentType = headResponse.ContentType || 'video/mp4';

        if (range) {
            // Parse range header
            const parts = range.replace(/bytes=/, "").split("-");
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : contentLength - 1;

            // Limit range size to prevent memory issues
            const maxRangeSize = 2 * 1024 * 1024; // 2MB max per request
            const actualEnd = Math.min(end, start + maxRangeSize - 1, contentLength - 1);
            const rangeSize = actualEnd - start + 1;

            console.log(`Range request: ${start}-${actualEnd} (${rangeSize} bytes) of ${contentLength} total`);

            // Get object with range
            const getCommand = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: s3Key,
                Range: `bytes=${start}-${actualEnd}`
            });

            const response = await s3Client.send(getCommand);

            // Set response headers
            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${actualEnd}/${contentLength}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': rangeSize,
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=3600'
            });

            // Stream the response
            if (response.Body) {
                for await (const chunk of response.Body) {
                    res.write(chunk);
                }
            }
            res.end();

        } else {
            // No range header, stream entire video
            const getCommand = new GetObjectCommand({
                Bucket: BUCKET_NAME,
                Key: s3Key
            });

            const response = await s3Client.send(getCommand);

            res.writeHead(200, {
                'Content-Length': contentLength,
                'Content-Type': contentType,
                'Accept-Ranges': 'bytes',
                'Cache-Control': 'public, max-age=3600'
            });

            // Stream the response
            if (response.Body) {
                for await (const chunk of response.Body) {
                    res.write(chunk);
                }
            }
            res.end();
        }

    } catch (error) {
        console.error('Error streaming direct video:', error);
        if (!res.headersSent) {
            res.status(500).json({
                success: false,
                message: error.message,
                error: 'Failed to stream video'
            });
        }
    }
});

/**
 * Get video info for direct S3 videos
 * GET /api/v1/video/direct-info/:subSectionId
 */
router.get('/direct-info/:subSectionId', async (req, res) => {
    // Check for token in header or query parameter
    let token = req.headers.authorization?.replace('Bearer ', '');
    if (!token && req.query.token) {
        token = req.query.token;
    }
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Authentication token required'
        });
    }
    
    // Verify token manually
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid authentication token'
        });
    }

    try {
        const { subSectionId } = req.params;
        
        const subSection = await SubSection.findById(subSectionId);
        if (!subSection || !subSection.videoUrl) {
            return res.status(404).json({
                success: false,
                message: 'Video not found'
            });
        }

        const videoInfo = {
            subSectionId: subSection._id,
            title: subSection.title,
            description: subSection.description,
            videoUrl: subSection.videoUrl,
            duration: subSection.timeDuration || 0,
            isChunked: false,
            streamUrl: `/api/v1/video/direct/${subSectionId}`
        };

        res.status(200).json({
            success: true,
            data: videoInfo,
            message: 'Video info retrieved successfully'
        });
    } catch (error) {
        console.error('Error getting direct video info:', error);
        res.status(500).json({
            success: false,
            message: error.message,
            error: 'Failed to get video info'
        });
    }
});

module.exports = router;
