const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const normalizeUrl = (url) => url?.trim().replace(/\/+$/, '');


dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: "https://frontend-service-5gzj.onrender.com",
  credentials: true
}));

app.options("*", cors());
app.use(express.json());

// MongoDB Connection
if (!process.env.MONGO_URI) {
  console.error('Error: MONGO_URI is not defined in the .env file');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// User Schema (for login/register)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  interactions: [
    {
      newsUrl: { type: String, required: true }, // URL of the news article
      upvotes: { type: Number, default: 0 },    // Number of upvotes by this user
      downvotes: { type: Number, default: 0 },  // Number of downvotes by this user
      comments: [{ type: String }],             // Array of comments by this user
    },
  ],
});

const User = mongoose.model('User', userSchema);

// Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    res.status(200).json({ message: 'Login successful', user: { username: user.username } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Register Route
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Upvote/Downvote Route
app.post('/api/interact/vote', async (req, res) => {
  const { username, newsUrl, type } = req.body; // type: "upvote" or "downvote"

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the interaction for this news article
    const cleanUrl = normalizeUrl(newsUrl);
    let interaction = user.interactions.find((i) => normalizeUrl(i.newsUrl) === cleanUrl);


    if (!interaction) {
      // If no interaction exists, create a new one
      interaction = { newsUrl, upvotes: 0, downvotes: 0, comments: [] };
      user.interactions.push(interaction);
    }

    // Update the vote count
    if (type === 'upvote') {
      interaction.upvotes += 1;
    } else if (type === 'downvote') {
      interaction.downvotes += 1;
    }

    await user.save();
    res.status(200).json({ message: 'Vote recorded', upvotes: interaction.upvotes, downvotes: interaction.downvotes });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Comment Route
app.post('/api/interact/comment', async (req, res) => {
  const { username, newsUrl, comment } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Find the interaction for this news article
    const cleanUrl = normalizeUrl(newsUrl);
    let interaction = user.interactions.find((i) => normalizeUrl(i.newsUrl) === cleanUrl);


    if (!interaction) {
      // If no interaction exists, create a new one
      interaction = { newsUrl, upvotes: 0, downvotes: 0, comments: [] };
      user.interactions.push(interaction);
    }

    // Add the comment
    interaction.comments.push(comment);
    await user.save();
    res.status(200).json({ message: 'Comment added', comments: interaction.comments });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

const axios = require("axios");

app.get("/api/breaking-news", async (req, res) => {
  try {
    const response = await axios.get(
      "https://newsapi.org/v2/top-headlines?category=general&apiKey=71e5a2b091fb447d8fd1fea38a3a5bea"
    );
    res.status(200).json(response.data);
  } catch (err) {
    console.error("NewsAPI proxy error:", err.message);
    res.status(500).json({ message: "Failed to fetch breaking news" });
  }
});

// Get User Interactions Route (to fetch votes and comments for display)
app.get('/api/interact/:username', async (req, res) => {
  const { username } = req.params;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ interactions: user.interactions });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});