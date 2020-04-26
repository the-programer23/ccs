const mongoose = require('mongoose')

const membershipSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Es necesario que tu reserva este vinculada a un usuario']
    },
    price: {
        type: Number,
        required: [true, 'La reserva debe tener un precio']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    paid: {
        type: Boolean,
        default: true
    }
});

// membershipSchema.pre(/^find/, function (next) {
//     this.populate('user').populate({
//         path: 'tour',
//         select: 'name'
//     });
//     next()
// });

const Membership = mongoose.model('membership', membershipSchema);

module.exports = Membership;