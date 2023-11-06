const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const MapSchema = new Schema(
    {
        name: { type: String, required: true },
    },
    { timestamps: true,  collection: 'NameTest' },
)

module.exports = mongoose.model('Map', MapSchema)