const mongoose = require('mongoose');

// Schéma pour l'utilisateur, avec la collection "usercooki"
const UserCookiSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
}, { collection: 'usercooki' });  // Définir explicitement la collection "usercooki"

module.exports = mongoose.model('UserCooki', UserCookiSchema);
