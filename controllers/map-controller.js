const { listenerCount } = require('../models/map-model');
const Map = require('../models/map-model')
const User = require('../models/user-model');

createNewMap = async (req, res) => {
    const body = req.body;
    console.log("createMap body: " + JSON.stringify(body));

    if (Object.keys(body).length === 0) {
        return res.status(400).json({
            success: false,
            errorMessage: 'You must provide a Map',
        })
    }

    const map = new Map(body);
    console.log("map: " + map.toString());
    if (!map || typeof map.name === "undefined") {
        return res.status(400).json({ success: false, errorMessage: 'Poorly Formated Map', })
    }

    User.findOne({ _id: req.userId }, (err, user) => {
        if (user && user._id == req.userId) {
        console.log("user found: " + JSON.stringify(user));
        user.maps.push(map._id);
        user
            .save()
            .then(() => {
                map
                    .save()
                    .then(() => {
                        return res.status(201).json({
                            map: map
                        })
                    })
                    .catch(error => {
                        return res.status(400).json({
                            errorMessage: 'Map Not Created!'
                        })
                    })
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
    const body = req.body
    console.log("updateMap: " + JSON.stringify(body));
    console.log("req.body.name: " + req.body.name);
    console.log("req.params.id: " + req.params.id);

    if (Object.keys(body).length === 0) {
        return res.status(400).json({
            success: false,
            errorMessage: 'You must provide a Map Update',
        })
    }

    Map.findOne({ _id: req.params.id }, (err, map) => {
        console.log("map found: " + JSON.stringify(map));
        if (err) {
            return res.status(404).json({
                err,
                message: 'Map not found!',
            })
        }

        // DOES THIS LIST BELONG TO THIS USER?
        async function asyncFindUser(newMap) {
            try {
                const user = await User.findOne({ email: newMap.ownerEmail }).exec();
                if (user && user._id == req.userId) {
                    console.log("user._id: " + user._id);
                    console.log("req.userId: " + req.userId);
        
                    await newMap.save();
        
                    console.log("SUCCESS!!!");
                    return res.status(200).json({
                        success: true,
                        id: newMap._id,
                        message: 'Map updated!',
                    });
                } else {
                    console.log("User not found!");
                    return res.status(404).json({
                        message: 'User not found!',
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
        }
        
        asyncFindUser(map);
    })
}

getMaps = async (req, res) => {
    await Map.find({}, (err, maps) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!maps.length) {
            return res
                .status(404)
                .json({ success: false, error: `Maps not found` })
        }
        return res.status(200).json({ success: true, data: maps })
    }).catch(err => console.log(err))
}

module.exports = {
   createNewMap,
   updateMap,
   getMaps,
}