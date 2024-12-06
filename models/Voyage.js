const mongoose = require('mongoose');

// Schéma pour gérer les séquences
const Counter1Schema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  seq: { type: Number, default: 1 },
});

const Counter = mongoose.model('Counter1', Counter1Schema);

// Schéma de base pour tous les voyages
const VoyageSchemaBase = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    destination: { type: String, required: true },
    date: { type: Date, required: true },
    photo: { type: [String], required: true },
    price: { type: Number, required: true }, // Champ prix
    P_NUMERO_COMMANDE: { type: String, unique: true },
  },
  { timestamps: true }
);


// Hook pour générer un numéro de commande unique
VoyageSchemaBase.pre('save', async function (next) {
  if (!this.P_NUMERO_COMMANDE) {
    try {
      // Cherche ou initialise le compteur
      const counter = await Counter.findOneAndUpdate(
        { key: 'P_NUMERO_COMMANDE' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true } // Crée le document s'il n'existe pas
      );

      // Génère le numéro de commande avec le compteur
      this.P_NUMERO_COMMANDE = `P_${counter.seq}`;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Modèles distincts pour chaque catégorie
const VoyageAventure = mongoose.model('VoyageAventure', VoyageSchemaBase, 'voyagesaventures');
const VoyagePharma = mongoose.model('VoyagePharma', VoyageSchemaBase, 'voyagespharma');
const VoyageCulture = mongoose.model('VoyageCulture', VoyageSchemaBase, 'voyagesculture');
const Cosmetique = mongoose.model('Cosmetique', VoyageSchemaBase, 'cosmetique');
const Telephone = mongoose.model('Telephone', VoyageSchemaBase, 'telephone');
const Chocolats = mongoose.model('Chocolats', VoyageSchemaBase, 'chocolat');
const Accauto = mongoose.model('Accauto', VoyageSchemaBase, 'accauto');
const Vetement = mongoose.model('Vetement', VoyageSchemaBase, 'vetement');
const Jouetetbb = mongoose.model('Jouetetbb', VoyageSchemaBase, 'jouetetbb');
const Autre = mongoose.model('Autre', VoyageSchemaBase, 'autre');
const Outils = mongoose.model('Outils', VoyageSchemaBase, 'outils');

module.exports = {
  VoyageAventure,
  VoyagePharma,
  VoyageCulture,
  Cosmetique,
  Telephone,
  Chocolats,
  Accauto,
  Vetement,
  Jouetetbb,
  Autre,
  Outils,
};
