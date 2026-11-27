const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// MongoDB Connection (Replace with your MongoDB Atlas URI or local URI)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/outreach_connect';

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// --- MongoDB Schemas & Models ---

// 1. Outreach Campaign / Event Schema
const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: { type: String, required: true },
  category: { type: String, enum: ['Education', 'Healthcare', 'Environment', 'Food Drive'], default: 'Environment' },
  location: { type: String, required: true },
  date: { type: String, required: true },
  description: { type: String, required: true },
  volunteersNeeded: { type: Number, default: 10 },
  volunteersRegistered: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

const Campaign = mongoose.model('Campaign', campaignSchema);

// 2. Volunteer Registration Schema
const volunteerSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  registeredAt: { type: Date, default: Date.now }
});

const Volunteer = mongoose.model('Volunteer', volunteerSchema);

// --- API Routes ---

// Get all campaigns
app.get('/api/campaigns', async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new campaign
app.post('/api/campaigns', async (req, res) => {
  try {
    const newCampaign = new Campaign(req.body);
    const savedCampaign = await newCampaign.save();
    res.status(201).json(savedCampaign);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Register a volunteer for a campaign
app.post('/api/volunteer', async (req, res) => {
  try {
    const { campaignId, name, email, phone } = req.body;
    
    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    if (campaign.volunteersRegistered >= campaign.volunteersNeeded) {
      return res.status(400).json({ error: 'Campaign is already full' });
    }

    const volunteer = new Volunteer({ campaignId, name, email, phone });
    await volunteer.save();

    campaign.volunteersRegistered += 1;
    await campaign.save();

    res.status(201).json({ message: 'Successfully registered!', campaign });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
