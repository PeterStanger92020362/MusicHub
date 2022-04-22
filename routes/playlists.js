const router = require("express").Router();
const { Playlist, validate } = require("../models/playlist");
const { Track } = require("../models/track");
const { User } = require("../models/user");
const auth = require("../middleware/auth");
const validObjectId = require("../middleware/validObjectId");
const Joi = require("joi");

// create playlist
router.post("/", auth, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const user = await User.findById(req.user._id);
    const playlist = await Playlist({...req.body, user: user._id}).save();
    user.playlists.push(playlist._id);
    await user.save();

    res.status(201).send({ data: playlist });
});


// edit playlist by id
router.put("/edit/:id", [validObjectId, auth], async (req, res) => {
    const schema = Joi.object({
        name: Joi.string().required(),
        desc: Joi.string().allow(""),
        img: Joi.string().allow("")
    });
    const { error } = schema.validate(req.body);
    if (error) return res.status(400).send({ message: error.details[0].message });

    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).send({ message: "playlist not found" });

    const user = await User.findById(req.user._id);
    if (!user._id.equals(playlist.user))
        return res.status(403).send({message: "User doesn't have access to edit"});
    
    playlist.name = req.body.name;
    playlist.desc = req.body.desc;
    playlist.img = req.body.img;
    await playlist.save();

    res.status(200).send({message: "playlist updated successfully"});
});

// add track to playlist
router.put("/add-song",auth, async (req,res)=>{
    const schema = Joi.object({
        playlistId: Joi.string().required(),
        trackId: Joi.string().required()
    });
    const {error} = schema.validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});

    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.body.playlistId);
    if (!user._id.equals(playlist.user))
        return res.status(403).send({message: "User doesn't have access to add"});
    
    if (playlist.tracks.indexOf(req.body.trackId) === -1){
        playlist.tracks.push(req.body.trackId);
    };
    await playlist.save();
    res.status(200).send({message: "Track added to playlist successfully"});
});

// delete track from playlist
router.put("/remove-song", auth, async (req,res)=>{
    const schema = Joi.object({
        playlistId: Joi.string().required(),
        trackId: Joi.string().required()
    });
    const {error} = schema.validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message});

    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.body.playlistId);
    if (!user._id.equals(playlist.user))
        return res.status(403).send({message: "User doesn't have access to remove"});

    const index = playlist.tracks.indexOf(req.body.trackId);
    playlist.tracks.splice(index, 1);
    await playlist.save();
    res.status(200).send({message: "Track removed from playlist successfully"});

});

// user favourite playlists
router.get("/favourite", auth, async (req, res) => {
    const user = await User.findById(req.user._id);
    const playlists = await Playlist.find({_id: user.playlist});
    res.status(200).send({data: playlists});
});

// get random playlists
router.get("/random", auth, async (req, res) => {
    const playlists = await Playlist.aggregate([{ $sample: { size: 10 } }]);
    res.status(200).send({data: playlists});
});

// get playlist by id and tracks
router.get("/:id", [validObjectId, auth], async (req, res) => {
    const playlist = await Playlist.findById(req.params.id);
    if (!playlist) return res.status(404).send({ message: "playlist not found" });

    const tracks = await Track.find({_id: playlist.tracks });
    res.status(200).send({ data: { playlist, tracks } });
});

// get all playlists
router.get("/", auth, async (req, res) => {
    const playlists = await Playlist.find();
    res.status(200).send({ data: playlists });
});

// delete playlist by id
router.delete("/:id", [validObjectId, auth], async (req, res) => {
    const user = await User.findById(req.user._id);
    const playlist = await Playlist.findById(req.params.id);
    if (!user._id.equals(playlist.user))
        return res.status(403).send({message: "User doesn't have access to delete"});
    
    const index = user.playlist.indexOf(req.params.id);
    user.playlists.splice(index, 1);
    await user.save();
    await playlist.remove();
    res.status(200).send({message: "playlist removed successfully"});
});

module.exports = router;
