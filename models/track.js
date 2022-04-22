const mongoose = require('mongoose');
const Joi = require('joi');

const trackSchema = new mongoose.Schema({
    name: {type:String,required:true},
    artist: {type:String,required:true},
    album: {type:String,required:true},
    img: {type:String,required:true},
    duration: {type:String,required:true},
});

const validate = (track) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        artist: Joi.string().required(),
        album: Joi.string().required(),
        img: Joi.string().required(),
        duration: Joi.string().required(),
    });
    return schema.validate(track);
}

const Track = mongoose.model("track", trackSchema);

module.exports = {Track, validate};