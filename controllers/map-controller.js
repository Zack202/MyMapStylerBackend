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
        if (user._id == req.userId) {
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

module.exports = {
   createNewMap,
}