const mongoose = require('mongoose')
const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

const MapSchema = new mongoose.Schema(
    {
        name: { type: String, required: true },
        description: {type: String, required: true},
        userName: {type:String,required: true},
        ownerEmail: { type: String, required: true },
        likes: {type:[String], required: false},
        dislikes: {type:[String], required: false},
        views: {type: Number, required: false},
        date: {type: Date, required: false},
        published: {type: Boolean, required: false},
        mapGeometry: {type: Object, required: true},
        mapFeatures: {type: Object, required: true},
        mapZoom: {type: Number, required: false},
        mapCenter: {type: [Number], required: false},
        previousCreators: { type: [String], required: false},
        mapType: {type: Number, required: true},
        comments: {type: [{ commentString: String, userName: String, likes: Number, dislikes: Number, date: String}], required: false},
            
    },
    { timestamps: true,  collection: 'MapList' },
)


module.exports = mongoose.model('Map', MapSchema)