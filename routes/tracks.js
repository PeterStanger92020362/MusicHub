const router = require("express").Router();
const { User } = require("../models/user");
const { Track, validate } = require("../models/track");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validObjectId = require("../middleware/validObjectId");

// create track
router.post("/", admin, async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send({message: error.details[0].message });

    const track = await Track(req.body).save();
    res.status(201).send({data: track, message: "track created successfully"});
});

// get all tracks
router.get("/", async (req,res)=>{
    const tracks = await Track.find();
    res.status(200).send({data:tracks});
});

// update track by id
router.put("/:id", [validObjectId, admin], async (req, res) => {
    const track = await Track.findByIdAndUpdate(req.params.id, req.body, {new: true});
    res.status(200).send({data: track, message: "track updated successfully"});
});

// delete track by id
router.delete("/:id", [validObjectId, admin], async (req, res) => {
    await Track.findByIdAndDelete(req.params.id);
    res.status(200).send({message: "track deleted successfully"});
});

// like track by id
router.put("/like/:id", [validObjectId, auth], async (req, res) => {
    const track = await Track.findById(req.params.id);
    if (!track) return res.status(400).send({message: "track not found"});

    const user = await User.findById(req.user._id);
    const index = user.likedTracks.indexOf(track._id);
    if (index === -1){
        user.likedTracks.push(track._id);
        resMessage = "track liked successfully";
    } else {
        user.likedTracks.splice(index, 1);
        resMessage = "track unliked successfully";
    }
    await user.save();
    res.status(200).send({message: resMessage});
});

// get all liked songs
router.get("/like", auth, async (req,res)=>{
    const user = await User.findById(req.user._id);
    const tracks = await Track.find({_id: user.likedTracks });
    res.status(200).send({data:tracks});
});

module.exports = router;