const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId
const crypto = require("crypto");

const UserSchema = new Schema(
    {
        userName: { type: String, required: true },
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        passwordHash: { type: String, required: true },
        maps: [{type: ObjectId, ref: 'Maps'}],
        passwordResetToken: {type: String, required: false},
        passwordResetExpires: {type: Date, required: false},
    },
    { timestamps: true,  collection: 'UsersList' },
)

UserSchema.methods.createResetPasswordToken = function() {
    const resetToken = crypto.randomBytes(32).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(resetToken).digest("hex");
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    console.log("resetToken: " + resetToken);
    console.log("passwordResetToken: " + this.passwordResetToken);

    return resetToken;
}

module.exports = mongoose.model('User', UserSchema)