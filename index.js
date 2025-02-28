const express = require('express');
const { resolve } = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3010;

// Middleware
app.use(cors()); // Enable CORS
app.use(express.static('static'));
app.use(express.json());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Serve homepage
app.get('/', (req, res) => {
  res.sendFile(resolve(__dirname, 'pages/index.html'));
});

// Sample Schema (Modify as needed)
const sampleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  value: { type: String, required: true }
});

const SampleModel = mongoose.model('Sample', sampleSchema);

// ➤ GET all data
app.get('/api/data', async (req, res) => {
  try {
    const data = await SampleModel.find();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching data", error: error.message });
  }
});

// ➤ POST new data
app.post('/api/data', async (req, res) => {
  try {
    const { name, value } = req.body;
    if (!name || !value) {
      return res.status(400).json({ message: "Name and value are required" });
    }

    const newData = new SampleModel({ name, value });
    await newData.save();
    res.status(201).json({ message: "Data added successfully", item: newData });
  } catch (error) {
    res.status(500).json({ message: "Error adding data", error: error.message });
  }
});

// ➤ PUT (Update) data by ID
app.put('/api/data/:id', async (req, res) => {
  try {
    const { name, value } = req.body;
    const updatedData = await SampleModel.findByIdAndUpdate(
      req.params.id,
      { name, value },
      { new: true, runValidators: true }
    );

    if (!updatedData) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.status(200).json({ message: "Data updated successfully", item: updatedData });
  } catch (error) {
    res.status(500).json({ message: "Error updating data", error: error.message });
  }
});

// ➤ DELETE data by ID
app.delete('/api/data/:id', async (req, res) => {
  try {
    const deletedData = await SampleModel.findByIdAndDelete(req.params.id);

    if (!deletedData) {
      return res.status(404).json({ message: "Data not found" });
    }

    res.status(200).json({ message: "Data deleted successfully", item: deletedData });
  } catch (error) {
    res.status(500).json({ message: "Error deleting data", error: error.message });
  }
});

// ➤ Handle invalid API requests
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Start the server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
