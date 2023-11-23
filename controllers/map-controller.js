const { listenerCount } = require('../models/map-model');
const Map = require('../models/map-model')
const User = require('../models/user-model');
const multer = require('multer');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const fs = require('fs');
const GridFS = require('mongoose').connection.db;
const unzipper = require('unzipper');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/') //change this for dest folder
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  });
  
  const upload = multer({ storage: storage });

createNewMap = async (req, res) => {
    const { body, file } = req;

    if (!body || !file) {
        return res.status(400).json({
            success: false,
            errorMessage: 'You must provide a MapFile and Map Information',
        })
    }
    const { name, userName, ownerEmail, mapFeatures, mapZoom, mapCenter, mapType } = body;
  console.log("createMap body: " + JSON.stringify(req.body));

  if (!name || !userName || !ownerEmail || !mapFeatures || !mapZoom || !mapCenter || !mapType) {
    return res.status(400).json({
      success: false,
      errorMessage: 'You must provide all map information',
    });
  }

  User.findOne({ _id: req.userId }, async (err, user) => {
    if (!user || user._id != req.userId) {
      return res.status(400).json({
        errorMessage: "Authentication error"
      });
    }

    const map = new Map({
      name,
      userName,
      ownerEmail,
      mapFeatures,
      mapZoom,
      mapCenter,
      mapType
    });

    const zippedBuffer = file.buffer;

    const extractedJSON = await unzipper.Open.buffer(zippedBuffer)
    .then((directory) => {
      const jsonFile = directory.files.find((file) => file.type === 'File' && file.path.endsWith('.json'));
      return jsonFile.buffer();
    })
    .catch((error) => {
      console.error('Error extracting JSON from ZIP:', error);
      return null;
    });

  if (!extractedJSON) {
    return res.status(500).json({
      success: false,
      errorMessage: 'Failed to extract JSON from ZIP',
    });
  }

    try {
      await map.save();

      // Upload only mapGeometry to GridFS
      const writestream = GridFS.createWriteStream({
        filename: 'extracted.json',
        metadata: { mapId: map._id, fileType: 'extractedJSON' },
      });

      fs.createReadStream(path).pipe(writestream);

      writestream.on('close', async function (file) {
        console.log('File ' + file.filename + ' uploaded successfully');
            map.mapGeometryFileId = file._id; // Set the mapGeometryFileId
            try {
                await map.save(); // Save the map with new mapGeometryFileId
                return res.status(201).json({
                map: map
                });
            } catch (error) {
                console.error('Error updating map with fileId:', error);
                return res.status(400).json({
                errorMessage: 'Failed to update map with fileId'
                });
            }
      });

      writestream.on('error', function (error) {
        console.log('Error uploading file:', error);
        return res.status(400).json({
          errorMessage: 'File upload failed'
        });
      });

    } catch (error) {
      console.error('Error creating map:', error);
      return res.status(400).json({
        errorMessage: 'Map Not Created!'
      });
    }
  });

};

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

module.exports = {
   createNewMap,
   updateMap,
}