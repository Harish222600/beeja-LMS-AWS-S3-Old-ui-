const mongoose = require('mongoose');

const featuredCoursesSchema = new mongoose.Schema({
    popularPicks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    topEnrollments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course'
    }],
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

// Only allow one document in this collection
featuredCoursesSchema.pre('save', async function(next) {
    const FeaturedCourses = this.constructor;
    if (this.isNew) {
        const count = await FeaturedCourses.countDocuments();
        if (count > 0) {
            throw new Error('Only one featured courses document can exist');
        }
    }
    next();
});

module.exports = mongoose.model('FeaturedCourses', featuredCoursesSchema);
