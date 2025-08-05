/**
 * Extract video duration from buffer using basic MP4 parsing
 * @param {Buffer} videoBuffer - Video file buffer
 * @param {string} originalFilename - Original filename for format detection
 * @returns {Promise<number>} Duration in seconds
 */
const extractVideoDuration = async (videoBuffer, originalFilename = 'video.mp4') => {
    try {
        console.log('🎬 Extracting video duration using basic MP4 parsing...');
        
        if (!videoBuffer || !Buffer.isBuffer(videoBuffer)) {
            throw new Error('Invalid video buffer provided');
        }

        // Try to extract duration from MP4 metadata
        const duration = await extractMP4Duration(videoBuffer);
        
        if (duration > 0) {
            console.log(`✅ Video duration extracted: ${duration} seconds`);
            return duration;
        }

        console.warn('Could not extract valid duration from video, using fallback');
        return 0;

    } catch (error) {
        console.error('Error extracting video duration:', error);
        console.warn('Falling back to duration 0 due to extraction error');
        return 0; // Return 0 instead of throwing to prevent upload failure
    }
};

/**
 * Extract duration from MP4 file by parsing the mvhd atom
 * @param {Buffer} buffer - Video file buffer
 * @returns {Promise<number>} Duration in seconds
 */
const extractMP4Duration = async (buffer) => {
    try {
        console.log('🔍 Searching for mvhd atom in MP4 buffer...');
        
        // Look for the mvhd (movie header) atom which contains duration info
        // We need to search for the complete atom structure, not just the string
        let mvhdIndex = -1;
        let searchStart = 0;
        
        // Search for mvhd atom more carefully
        while (searchStart < buffer.length - 8) {
            const foundIndex = buffer.indexOf('mvhd', searchStart);
            if (foundIndex === -1) break;
            
            // Check if this is a valid mvhd atom by looking at the preceding bytes
            // The mvhd should be preceded by the atom size (4 bytes)
            if (foundIndex >= 4) {
                const atomStart = foundIndex - 4;
                const atomSize = buffer.readUInt32BE(atomStart);
                
                // Validate atom size is reasonable (should be at least 108 bytes for mvhd)
                if (atomSize >= 108 && atomSize <= buffer.length - atomStart) {
                    mvhdIndex = foundIndex;
                    console.log(`✅ Found valid mvhd atom at position ${mvhdIndex}, atom size: ${atomSize}`);
                    break;
                }
            }
            
            searchStart = foundIndex + 4;
        }
        
        if (mvhdIndex === -1) {
            throw new Error('mvhd atom not found - not a valid MP4 file or unsupported format');
        }

        // The mvhd atom structure (after the 'mvhd' identifier):
        // 1 byte: version (0 or 1)
        // 3 bytes: flags
        // For version 0:
        //   4 bytes: creation time
        //   4 bytes: modification time
        //   4 bytes: time scale
        //   4 bytes: duration
        // For version 1:
        //   8 bytes: creation time
        //   8 bytes: modification time
        //   4 bytes: time scale
        //   8 bytes: duration

        const mvhdDataStart = mvhdIndex + 4; // Start of mvhd data (after 'mvhd')
        
        if (mvhdDataStart + 20 > buffer.length) {
            throw new Error('Buffer too small to contain complete mvhd atom');
        }

        // Read version
        const version = buffer.readUInt8(mvhdDataStart);
        console.log(`📋 mvhd version: ${version}`);
        
        let timeScale, duration;
        
        if (version === 0) {
            // Version 0: 32-bit values
            if (mvhdDataStart + 20 > buffer.length) {
                throw new Error('Buffer too small for version 0 mvhd atom');
            }
            
            timeScale = buffer.readUInt32BE(mvhdDataStart + 12); // Skip version(1) + flags(3) + creation(4) + modification(4)
            duration = buffer.readUInt32BE(mvhdDataStart + 16);
            
            console.log(`📊 Version 0 - TimeScale: ${timeScale}, Duration: ${duration}`);
            
        } else if (version === 1) {
            // Version 1: 64-bit values for times, but we'll read duration as 64-bit
            if (mvhdDataStart + 28 > buffer.length) {
                throw new Error('Buffer too small for version 1 mvhd atom');
            }
            
            timeScale = buffer.readUInt32BE(mvhdDataStart + 20); // Skip version(1) + flags(3) + creation(8) + modification(8)
            
            // For 64-bit duration, read both high and low 32-bit parts
            const durationHigh = buffer.readUInt32BE(mvhdDataStart + 24);
            const durationLow = buffer.readUInt32BE(mvhdDataStart + 28);
            
            // Combine 64-bit duration (assuming high part is 0 for reasonable video lengths)
            if (durationHigh > 0) {
                console.warn('⚠️ Duration high bits are non-zero, video might be extremely long');
            }
            duration = durationLow;
            
            console.log(`📊 Version 1 - TimeScale: ${timeScale}, Duration: ${duration} (high: ${durationHigh}, low: ${durationLow})`);
            
        } else {
            throw new Error(`Unsupported mvhd version: ${version}`);
        }

        if (timeScale === 0) {
            throw new Error('Invalid time scale in mvhd atom (cannot be zero)');
        }

        if (duration === 0) {
            throw new Error('Invalid duration in mvhd atom (cannot be zero)');
        }

        const durationInSeconds = Math.round(duration / timeScale);
        
        // Sanity check - duration should be reasonable (between 1 second and 24 hours)
        if (durationInSeconds < 1 || durationInSeconds > 86400) {
            console.warn(`⚠️ Extracted duration seems unreasonable: ${durationInSeconds}s`);
            // Don't throw error, but log warning
        }
        
        console.log(`✅ MP4 duration extracted: ${durationInSeconds}s (${Math.floor(durationInSeconds/60)}m ${durationInSeconds%60}s)`);
        console.log(`   Raw values - Duration: ${duration}, TimeScale: ${timeScale}`);
        
        return durationInSeconds;

    } catch (error) {
        console.warn('❌ MP4 duration extraction failed:', error.message);
        return 0;
    }
};

/**
 * Fallback method to estimate duration from file size (very rough estimate)
 * This should only be used as a last resort when all other methods fail
 * @param {number} fileSize - File size in bytes
 * @param {string} mimetype - Video mimetype
 * @returns {number} Estimated duration in seconds
 */
const estimateDurationFromSize = (fileSize, mimetype = 'video/mp4') => {
    try {
        console.log('⚠️ Using size estimation as fallback - this is very inaccurate!');
        
        // More conservative bitrate estimates based on common video encoding
        // These are still rough estimates and should be avoided when possible
        const estimatedBitrates = {
            'video/mp4': 3000000, // 3 Mbps (more realistic for modern MP4)
            'video/webm': 2000000, // 2 Mbps (WebM is usually more efficient)
            'video/avi': 4000000, // 4 Mbps (AVI is usually less compressed)
            'video/mov': 3000000, // 3 Mbps (similar to MP4)
            'video/quicktime': 3000000, // 3 Mbps
            'default': 3000000 // 3 Mbps default (more conservative)
        };

        const bitrate = estimatedBitrates[mimetype] || estimatedBitrates.default;
        const estimatedDuration = Math.round((fileSize * 8) / bitrate); // Convert bytes to bits, divide by bitrate
        
        // Apply some bounds checking
        const minDuration = 1; // At least 1 second
        const maxDuration = 7200; // Max 2 hours (reasonable for most educational content)
        const boundedDuration = Math.max(minDuration, Math.min(maxDuration, estimatedDuration));
        
        console.log(`📊 Size-based estimation: ${boundedDuration}s (${Math.floor(boundedDuration/60)}m ${boundedDuration%60}s)`);
        console.log(`   File size: ${(fileSize / (1024 * 1024)).toFixed(2)}MB, Assumed bitrate: ${(bitrate / 1000000).toFixed(1)}Mbps`);
        
        if (boundedDuration !== estimatedDuration) {
            console.log(`   ⚠️ Duration was bounded from ${estimatedDuration}s to ${boundedDuration}s`);
        }
        
        return boundedDuration;
        
    } catch (error) {
        console.error('❌ Error estimating duration from size:', error);
        return 180; // Default to 3 minutes if all else fails (reasonable for educational content)
    }
};

/**
 * Extract video metadata with improved fallback chain
 * @param {Buffer} videoBuffer - Video file buffer
 * @param {Object} fileInfo - File information object
 * @returns {Promise<Object>} Metadata object with duration
 */
const extractVideoMetadata = async (videoBuffer, fileInfo = {}) => {
    try {
        const { originalname = 'video.mp4', size = 0, mimetype = 'video/mp4' } = fileInfo;
        
        console.log('🔍 Starting video metadata extraction...');
        console.log(`📁 File: ${originalname} (${(size / (1024 * 1024)).toFixed(2)}MB, ${mimetype})`);
        
        let duration = 0;
        let extractionMethod = 'none';
        let extractionError = null;
        
        // Method 1: Try MP4 parsing first (most accurate)
        if (mimetype === 'video/mp4' || originalname.toLowerCase().endsWith('.mp4')) {
            console.log('🎬 Attempting MP4 metadata parsing...');
            try {
                duration = await extractVideoDuration(videoBuffer, originalname);
                if (duration > 0) {
                    extractionMethod = 'mp4_parsing';
                    console.log('✅ MP4 parsing successful!');
                } else {
                    console.log('⚠️ MP4 parsing returned 0 duration');
                }
            } catch (parseError) {
                console.warn('❌ MP4 parsing failed:', parseError.message);
                extractionError = parseError.message;
            }
        } else {
            console.log('📄 Non-MP4 file, skipping MP4 parsing');
        }
        
        // Method 2: Try WebM parsing for WebM files
        if (duration === 0 && (mimetype === 'video/webm' || originalname.toLowerCase().endsWith('.webm'))) {
            console.log('🎬 Attempting WebM metadata parsing...');
            try {
                duration = await extractWebMDuration(videoBuffer);
                if (duration > 0) {
                    extractionMethod = 'webm_parsing';
                    console.log('✅ WebM parsing successful!');
                }
            } catch (webmError) {
                console.warn('❌ WebM parsing failed:', webmError.message);
                extractionError = webmError.message;
            }
        }
        
        // Method 3: Use size estimation as last resort
        if (duration === 0) {
            console.log('🔄 All parsing methods failed, using size estimation...');
            duration = estimateDurationFromSize(size, mimetype);
            extractionMethod = 'size_estimation';
        }
        
        // Final validation
        if (duration <= 0) {
            console.warn('⚠️ All extraction methods failed, using default duration');
            duration = 180; // Default to 3 minutes
            extractionMethod = 'default_fallback';
        }
        
        const metadata = {
            duration,
            extractionMethod,
            originalFilename: originalname,
            fileSize: size,
            mimetype,
            extractedAt: new Date().toISOString(),
            extractionError
        };
        
        console.log('📋 Final video metadata:', {
            duration: `${duration}s (${Math.floor(duration/60)}m ${duration%60}s)`,
            method: extractionMethod,
            filename: originalname,
            size: `${(size / (1024 * 1024)).toFixed(2)}MB`,
            success: extractionMethod !== 'default_fallback'
        });
        
        return metadata;
        
    } catch (error) {
        console.error('❌ Critical error in extractVideoMetadata:', error);
        
        // Return minimal metadata with fallback duration
        return {
            duration: 180, // Default to 3 minutes
            extractionMethod: 'error_fallback',
            originalFilename: fileInfo.originalname || 'unknown',
            fileSize: fileInfo.size || 0,
            mimetype: fileInfo.mimetype || 'video/mp4',
            extractedAt: new Date().toISOString(),
            error: error.message
        };
    }
};

/**
 * Extract duration from WebM files by looking for duration in the EBML structure
 * @param {Buffer} buffer - Video file buffer
 * @returns {Promise<number>} Duration in seconds
 */
const extractWebMDuration = async (buffer) => {
    try {
        console.log('🔍 Searching for WebM duration in EBML structure...');
        
        // Look for the Duration element in WebM/Matroska files
        // Duration element ID is 0x4489 in EBML
        const durationElementId = Buffer.from([0x44, 0x89]);
        
        let searchStart = 0;
        while (searchStart < buffer.length - 10) {
            const foundIndex = buffer.indexOf(durationElementId, searchStart);
            if (foundIndex === -1) break;
            
            try {
                // Try to read the duration value (usually a float64)
                const dataStart = foundIndex + 2;
                if (dataStart + 8 <= buffer.length) {
                    // Read as double (8 bytes)
                    const durationMs = buffer.readDoubleBE(dataStart);
                    if (durationMs > 0 && durationMs < 86400000) { // Reasonable range (0 to 24 hours in ms)
                        const durationSeconds = Math.round(durationMs / 1000);
                        console.log(`✅ WebM duration found: ${durationSeconds}s`);
                        return durationSeconds;
                    }
                }
            } catch (readError) {
                // Continue searching if this wasn't the right location
            }
            
            searchStart = foundIndex + 2;
        }
        
        throw new Error('WebM duration not found in EBML structure');
        
    } catch (error) {
        console.warn('❌ WebM duration extraction failed:', error.message);
        return 0;
    }
};

module.exports = {
    extractVideoDuration,
    estimateDurationFromSize,
    extractVideoMetadata
};
