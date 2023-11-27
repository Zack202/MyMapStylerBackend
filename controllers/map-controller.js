const { listenerCount } = require('../models/map-model');
const Map = require('../models/map-model')
const User = require('../models/user-model');
const jsonDiff = require('json-diff');

createNewMap = async (req, res) => {
    const body = req.body;
    console.log("createMap body: " + JSON.stringify(body));
    
    if (Object.keys(body).length === 0) {
        return res.status(400).json({
            success: false,
            errorMessage: 'You must provide a Map',
        })
    }
    const { name, userName, ownerEmail, mapGeometry, mapType } = req.body;
    if (!name || !userName || !ownerEmail || !mapGeometry || !mapType) {
        return res.status(400).json({
            success: false,
            error: 'Missing required fields: name, userName, ownerEmail, mapGeometry, mapType'
        });
    }

    const map = new Map(body);
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
        });
        } else {
           console.log("incorrect user!");
                    return res.status(400).json({ 
                        errorMessage: "authentication error" 
                    }); 
        }
    })
}

updateMap = async (req, res) => {
    const diff = req.body;
    console.log("updateMap diff: " + JSON.stringify(diff));

    try {
        const map = await Map.findOne({ _id: req.params.id });
        console.log("map found: " + JSON.stringify(map));

        if (!map) {
            return res.status(404).json({
                message: 'Map not found!',
                success: false,
            });
        }

        const user = await User.findOne({ email: map.ownerEmail }).exec();
        if (user && user._id.toString() === req.userId) {
            console.log("User verified. Proceeding to update the map.");

            //Apply diff
            const patchedMap = jsonDiff.patch(map.toObject(), diff);

            //Update the map
            Object.assign(map, patchedMap);
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
    const { mapId } = req.params;
    const diff = req.body.diff;

    try {
        const map = await Map.findOne({ _id: mapId });
        console.log("Map found: " + JSON.stringify(map));

        if (!map) {
            return res.status(404).json({
                message: 'Map not found!',
                success: false,
            });
        }

        const user = await User.findOne({ email: map.ownerEmail }).exec();
        if (user && user._id.toString() === req.userId) {
            console.log("User verified. Proceeding to update mapFeatures.");

            //Apply diff
            const patchedMapFeatures = jsonDiff.patch(map.mapFeatures, diff);

            //Update mapFeatures
            map.mapFeatures = patchedMapFeatures;
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
        console.log("Found map: " + JSON.stringify(mapcan));

        //check if belongs to user
        async function asyncFindUser(mapcan){
            await User.findOne({email: mapcan.ownerEmail}, (err, user) => {
                console.log("user._id: " + req.userId);
                if (user._id == req.userId){
                    console.log("correct user!");
                    return res.status(200).json({success: true, map: mapcan})
                }
                else {
                    console.log("incorrect user!");
                    return res.status(400).json({ success: false, description: "authentication error" });
                }
            });

        }
        asyncFindUser(mapcan);
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
                            name: list.name
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

        if (!publishedMaps || publishedMaps.length === 0) {
            console.log("No published maps found.");
            return res.status(404).json({ success: false, error: 'Published maps not found' });
        }

        console.log("Sending the Map pairs.");
        // Transform published maps to ID, NAME PAIRS
        const pairs = publishedMaps.map(map => ({
            _id: map._id,
            name: map.name
        }));

        console.log(pairs);
        return res.status(200).json({ success: true, idNamePairs: pairs });
    } catch (error) {
        console.log("Error:", error);
        return res.status(500).json({ success: false, error: 'Internal server error' });
    }
};

removeMap = async (req, res) => {
    try {
        console.log("removeMap");
        
        // Check if the map exists
        const map = await Map.findOne({ _id: req.params.id });
        if (!map) {
            return res.status(404).json({
                success: false,
                errorMessage: 'Map not found.',
            });
        }

        // Check if the user owns the map
        if (map.ownerEmail !== req.userId) {
            return res.status(401).json({
                success: false,
                errorMessage: 'You do not have permission to delete this map.',
            });
        }

        // Find the user by email
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
   removeMap,
   updateMapFeatures
}