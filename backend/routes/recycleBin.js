const express = require('express');
const router = express.Router();

const {
    getRecycleBinItems,
    moveToRecycleBin,
    restoreFromRecycleBin,
    permanentlyDelete,
    getRecycleBinStats,
    cleanupExpiredItems
} = require('../controllers/recycleBin');

const { auth, isAdmin } = require('../middleware/auth');

// Get all recycle bin items
router.get('/', auth, isAdmin, getRecycleBinItems);

// Get recycle bin statistics
router.get('/stats', auth, isAdmin, getRecycleBinStats);

// Move item to recycle bin (soft delete)
router.post('/move', auth, isAdmin, moveToRecycleBin);

// Restore item from recycle bin
router.put('/restore/:recycleBinId', auth, isAdmin, restoreFromRecycleBin);

// Permanently delete item
router.delete('/permanent/:recycleBinId', auth, isAdmin, permanentlyDelete);

// Cleanup expired items (for cron job or manual cleanup)
router.post('/cleanup', auth, isAdmin, cleanupExpiredItems);

module.exports = router;
