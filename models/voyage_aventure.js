const mongoose = require('mongoose');

const voyageAventureSchema = new mongoose.Schema({
  title: String,
  description: String,
  destination: String,
  date: Date,
  photo: [String] // Tableau d'URLs pour les photos
});

module.exports = mongoose.model('VoyagesAventure', voyageAventureSchema);
