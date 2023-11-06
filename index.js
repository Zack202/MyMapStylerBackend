const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose'); // Import mongoose

// CREATE OUR SERVER
dotenv.config();
const PORT = process.env.PORT || 4000;
const app = express();

// SETUP THE MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'https://my-map-styler-frontend-60bea3c51be3.herokuapp.com', 
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const authRouter = require('./routes/auth-router');
app.use('/auth', authRouter);
const mapsRouter = require('./routes/map-router');
app.use('/api', mapsRouter);

// Connect to MongoDB Atlas using mongoose

if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    dbName: 'Test_User',
  }, (error) => {
    if (error) {
      console.error('MongoDB connection error:', error);
    } else {
      console.log('Connected to MongoDB Atlas');
    }
  });

const db = mongoose.connection;

db.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

db.once('open', () => {
  console.log('Connected to MongoDB Atlas');

  app.get('/', (req,res) => {	
    res.send('Welcome to My Map Styler API!');	
  })
// PUT THE SERVER IN LISTENING MODE
app.listen(PORT, () => {console.log(`Server running on port ${PORT}`);
});
});
}


module.exports = app;