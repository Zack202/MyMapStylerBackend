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
    origin: ["http://localhost:3000"],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// SETUP OUR OWN ROUTERS AS MIDDLEWARE
const authRouter = require('./routes/auth-router');
app.use('/auth', authRouter);
const playlistsRouter = require('./routes/map-router');
app.use('/api', playlistsRouter);

// Connect to MongoDB Atlas using mongoose
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
});
app.get('/', (req,res) => {
  res.send('Welcome to Daily Code Buffer in Heroku Auto Deployment!!');
})
// PUT THE SERVER IN LISTENING MODE
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


module.exports = app;