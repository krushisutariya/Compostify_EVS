const mongoose = require('mongoose');

const pointsSchema = new mongoose.Schema({
    availablePoints: {
        type: [
            {
                agency: {
                    type: String,
                    required: true
                },
                points: {
                    type: Number,
                    default: 0
                }
            }
        ],
        default: []
    },
    user: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const Points = mongoose.model('Points', pointsSchema);

module.exports = Points;