const mongoose = require('mongoose');

const pointsScehma = new mongoose.Schema({
    availablePoints: [
        {
            agency: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            points: {
                type: Number,
                default: 0
            }
        }
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
},{
    timestamps: true
});

const Points = mongoose.model('Points', pointsScehma);

module.exports = Points;