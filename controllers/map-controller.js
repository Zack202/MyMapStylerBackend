const { listenerCount } = require('../models/map-model');
const Map = require('../models/map-model')
const User = require('../models/user-model');
const jsonDiff = require('json-diff');

createNewMap = async (req, res) => {
    const body = req.body;
    // console.log("createMap body: " + JSON.stringify(body));
    
    if (Object.keys(body).length === 0) {
        return res.status(400).json({
            success: false,
            errorMessage: 'You must provide a Map',
        })
    }
    const { name, userName, ownerEmail, mapGeometry, mapType, description, comments } = req.body;

    if (!name || !userName || !ownerEmail || !mapGeometry || !mapType || !description) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: name, userName, ownerEmail, mapGeometry, mapType, description'
        });
    }
    if (body.mapFeatures == null) {
        //Populate the mapFeatures with default values
        const regions = mapGeometry.features.map(feature => feature.properties.name);
        const sanitizedRegions = regions.reduce((acc, region) => {
            const sanitizedRegion = region.replace(/\./g, '');
            acc[sanitizedRegion] = [];
            return acc;
          }, {});
        body.mapFeatures = {
            "ADV": sanitizedRegions,
            "DP": [],
            "edits": {
                "mapColor": "maroon",
            "borderSwitch": false,
            "borderWidth": 1,
            "borderColor": "#000000",
            "regionSwitch": false,
            "regionNameColor": "#000000",
            "backgroundColor": "#ffffff",
            "center": [0, 0],
            "zoom": 1
            }
        }
    }
    const map = new Map(body);
    map.comments.pop()
    console.log("map: " + map.toString());
    if (!map || typeof map.name === "undefined") {
        return res.status(400).json({ success: false, errorMessage: 'Poorly Formated Map', })
    }

    User.findOne({ _id: req.userId }, async (err, user) => {
        if (user && user._id == req.userId) {
        console.log("user found: " + JSON.stringify(user));
        user.maps.push(map._id);
        await map.save();
        await user.save();
        console.log("SUCCESS!!!");
        return res.status(201).json({
            success: true,
            id: map._id,
            message: 'Map created!',
            map: map
        });
        } else {
           console.log("incorrect user!");
                    return res.status(400).json({ 
                        errorMessage: "authentication error" 
                    }); 
        }
    })
}

function createPatch(diff) {
    const fieldToUpdate = Object.keys(diff)[0];
    const nameChanges = diff[fieldToUpdate];

    const previousValue = nameChanges[0]; 
    const updatedValue = nameChanges[nameChanges.length - 1]; 

    const patch = {
        $set: {
            [fieldToUpdate]: updatedValue
        }
    };

    return patch;
}

updateMap = async (req, res) => {
    const diff = req.body.diff;
    console.log("updateMap diff: " + JSON.stringify(diff));

    try {
        const map = await Map.findOne({ _id: req.params.id });
        console.log("map found: ");

        if (!map) {
            return res.status(404).json({
                message: 'Map not found!',
                success: false,
            });
        }

        const user = await User.findOne({ email: map.ownerEmail }).exec();
        if (user) {
            console.log("User verified. Proceeding to update the map.");
            if(diff.name){
                // Create the update object based on the diff
                const nameChanges = diff.name;
    
                // Update the 'name' field in the map object
                map.name = nameChanges[nameChanges.length - 1]; // Assuming the last value in the array is the updated value
            }
            if(diff.published){ 
                map.published = true;
                console.log("we are hereeeeeee");
            }

            if(diff.liked){
                // check if user has liked the list and is trying to unlike it
                if(map.likes.includes(user.userName)){
                    let index = map.likes.indexOf(user.userName);
                    map.likes.splice(index, 1);
                } else {
                    //check if user is liking the list that he has disliked
                    if(map.dislikes.includes(user.userName)){
                        let index = map.dislikes.indexOf(user.userName);
                        map.dislikes.splice(index, 1);
                    }
                    map.likes.push(user.userName);
                }
            }

            if(diff.disliked){
                // check if user has disliked the list and is trying to undislike it
                if(map.dislikes.includes(user.userName)){
                    let index = map.dislikes.indexOf(user.userName);
                    map.dislikes.splice(index, 1);
                } else {
                    //check if user is disliking the list that he has liked
                    if(map.likes.includes(user.userName)){
                        let index = map.likes.indexOf(user.userName);
                        map.likes.splice(index, 1);
                    }
                    map.dislikes.push(user.userName);
                }
            }

            if(diff.newComment){
                map.comments.push(diff.newComment);
            }
            
            await map.save();

            console.log("SUCCESS!!! Map updated.");
            return res.status(200).json({
                success: true,
                id: map._id,
                message: 'Map updated!',
            });
        } else {
            console.log("User not found or unauthorized.");
            return res.status(404).json({
                message: 'User not found or unauthorized!',
                success: false,
            });
        }
    } catch (error) {
        console.log("FAILURE: " + JSON.stringify(error));
        return res.status(500).json({
            error,
            message: 'Internal server error!',
        });
    }
};

updateMapFeatures = async (req, res) => {
    let features = req.body.features;
    console.log("updateMapFeatures features: " + features);


    try {
        const map = await Map.findOne({_id: req.params.id });
        console.log("Map found");
        console.log("features: "+ features);

        if (!map) {
            return res.status(404).json({
                message: 'Map not found!',
                success: false,
            });
        }

        const user = await User.findOne({ email: map.ownerEmail }).exec();
        if (user && user._id.toString() === req.userId) {
            console.log("User verified. Proceeding to update mapFeatures.");

            map.mapFeatures = features;

            await map.save();

            console.log("SUCCESS!!! Map features updated.");
            return res.status(200).json({
                success: true,
                id: map._id,
                message: 'Map features updated!',
            });
        } else {
            console.log("User not found or unauthorized.");
            return res.status(404).json({
                message: 'User not found or unauthorized!',
                success: false,
            });
        }
    } catch (error) {
        console.log("FAILURE: " + JSON.stringify(error));
        return res.status(500).json({
            error,
            message: 'Internal server error!',
        });
    }
};

getMapById = async (req, res) => {
    console.log("find map with id: " + JSON.stringify(req.params.id));
    await Map.findById({_id: req.params.id}, (err, mapcan) => {
        if (err) {
            return res.status(400).json({success: false, error: err});
        }
        console.log("Found map: " + JSON.stringify(mapcan.name));
        return res.status(200).json({success: true, map: mapcan});
    }).catch(err => console.log(err))
}

getMapPairs = async (req, res) => {
    console.log("getMapPairs");
    await User.findOne({ _id: req.userId }, (err, user) => {
        console.log("find user with id " + req.userId);
        async function asyncFindList(email) {
            console.log("find all maps owned by " + email);
            await Map.find({ ownerEmail: email }, (err, maps) => {
                console.log("found Map: " + JSON.stringify(maps));
                if (err) {
                    return res.status(400).json({ success: false, error: err })
                }
                if (!maps) {
                    console.log("!maps.length");
                    return res
                        .status(404)
                        .json({ success: false, error: 'Maps not found' })
                }
                else {
                    console.log("Send the Map pairs");
                    // PUT ALL THE LISTS INTO ID, NAME PAIRS
                    let pairs = [];
                    for (let key in maps) {
                        let list = maps[key];
                        let pair = {
                            _id: list._id,
                            name: list.name,
                            description: list.description,
                            published: list.published,
                            likes: list.likes,
                            dislikes: list.dislikes,
                            view: list.views,
                            userName: list.userName,
                            ownerEmail: list.ownerEmail,
                            createdAt: list.createdAt,
                            comments: list.comments
                        };
                        pairs.push(pair);
                    }
                    console.log(pairs)
                    return res.status(200).json({ success: true, idNamePairs: pairs })
                }
            }).catch(err => console.log(err))
        }
        asyncFindList(user.email);
    }).catch(err => console.log(err))
}

getMapPairsPublished = async (req, res) => {
    try {
        console.log("getMapPairsPublished - Fetching published maps");
        const publishedMaps = await Map.find({ published: true });

        console.log("Sending the Map pairs.");

        console.log(publishedMaps);
        return res.status(200).json({ success: true, idNamePairs: publishedMaps });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

deleteMap = async (req, res) => {
    try {
        console.log("deleteMap");
        console.log("req.params.id: " + req.params.id);
        // Check if the map exists
        const map = await Map.findOne({ _id: req.params.id });
        if (!map) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Map not found.',
            });
        }

        // // Check if the user owns the map
        // if (map.ownerEmail !== req.userId) {
        //     return res.status(401).json({
        //         success: false,
        //         errorMessage: 'You do not have permission to delete this map.',
        //     });
        // }

        // Find the user by email
        console.log("Finding user by email: " + map.ownerEmail);
        const existingUser = await User.findOne({ email: map.ownerEmail });
        if (!existingUser) {
            return res.status(404).json({
                success: false,
                errorMessage: 'User not found.',
            });
        }

        // Remove the map from the user's maps
        existingUser.maps = existingUser.maps.filter(mapId => mapId != req.params.id);
        await existingUser.save();

        // Delete the map
        const deletedMap = await Map.findOneAndDelete({ _id: req.params.id });
        
        if (!deletedMap) {
            return res.status(404).json({ success: false, errorMessage: 'Map not found' });
        }

        return res.status(200).json({ success: true, data: deletedMap });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, errorMessage: 'Internal server error' });
    }
};

module.exports = {
   createNewMap,
   updateMap,
   getMapPairs,
   getMapById,
   getMapPairsPublished,
   deleteMap,
   updateMapFeatures
}