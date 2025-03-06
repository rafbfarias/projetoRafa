const Faturacao = require('../models/fact.model');

// Get all entries
exports.getAllLancamentos = async (req, res) => {
  try {
    const entries = await Faturacao.find().sort({ createdAt: -1 });
    console.log('Entries found:', entries);
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entries', error: error.message });
  }
};

// Get a specific entry
exports.getLancamento = async (req, res) => {
  try {
    const entry = await Faturacao.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching entry', error: error.message });
  }
};

// Create a new entry
exports.createLancamento = async (req, res) => {
  try {
    console.log('Data received:', req.body);
    const newEntry = new Faturacao(req.body);
    console.log('Model created:', newEntry);
    const savedEntry = await newEntry.save();
    console.log('Entry saved:', savedEntry);
    res.status(201).json(savedEntry);
  } catch (error) {
    console.error('Detailed error:', error);
    res.status(400).json({ message: 'Error creating entry', error: error.message });
  }
};

// Update an entry
exports.updateLancamento = async (req, res) => {
  try {
    const updatedEntry = await Faturacao.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedEntry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.status(200).json(updatedEntry);
  } catch (error) {
    res.status(400).json({ message: 'Error updating entry', error: error.message });
  }
};

// Delete an entry
exports.deleteLancamento = async (req, res) => {
  try {
    const entry = await Faturacao.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting entry', error: error.message });
  }
};