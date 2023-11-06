const { listenerCount } = require('../models/map-model');
const Map = require('../models/map-model')
const User = require('../models/user-model');

createNewName = (req, res) => {
    const name = req.params.name;
    console.log("Create new name: " + name);

    const newName = new Map({ name });

    newName.save()
        .then((savedName) => {
            return res.status(201).json({
                success: true,
                id: savedName._id,
                message: 'Name created!',
            });
        })
        .catch(error => {
            return res.status(400).json({
                error,
                message: 'Name not created!',
            });
        });
}

getNames = async (req, res) => {
    console.log("Get all names in db ");

    await Map.find({},'name', (err, maps) => {
        if (err) {
            return res.status(400).json({ success: false, error: err })
        }
        if (!maps.length) {
            return res
                .status(404)
                .json({ success: false, error: `Map not found` })
        }
        return res.status(200).json({ success: true, data: maps })
    }).catch(err => console.log(err))
}

module.exports = {
   createNewName,
    getNames
}