const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;
let connection;

const connect = async () => {
  if (!mongoServer) {
    mongoServer = new MongoMemoryServer();

    // Start the server explicitly
    await mongoServer.start();

    const uri = mongoServer.getUri();

    connection = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  }
};

const close = async () => {
  if (connection) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    connection = null;
  }
  if (mongoServer) {
    await mongoServer.stop();
    mongoServer = null;
  }
};

const clear = async () => {
  if (connection) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
};

module.exports = { connect, close, clear };
