const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const dotenv = require('dotenv');
const path = require('path');
const multer = require('multer');
const cors = require('cors');
const router = express.Router(); // Ajoutez cette ligne pour créer le router
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');
const UserCooki = require('./models/usercooki'); // Importer le modèle usercooki

dotenv.config();

// Initialiser Express
const app = express();
app.use(cookieParser()); // Pour lire les cookies
app.use(express.json()); 
// Configurer CORS
app.use(cors());

// Configurer le middleware pour gérer les fichiers (upload)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Connexion à MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connecté à MongoDB'))
  .catch((err) => console.error('Erreur de connexion à MongoDB:', err));

// Schéma pour les utilisateurs (collection users)
const UserSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  telephone: { type: String, unique: true, required: true }, // Remplace `email` par `telephone`
  password: { type: String, required: true },
});

const User = mongoose.model('User', UserSchema, 'usercmnd');



// Schéma pour les voyages
const VoyageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  destination: { type: String, required: true },
  date: { type: Date, required: true },
  photo: { type: [String] },
});
const Voyage = mongoose.model('Voyage', VoyageSchema, 'voyages');

//schema shema userscmnd


const UsercmndSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  telephone: { type: String, unique: true, required: true }, // Téléphone comme identifiant unique
  password: { type: String, required: true },
});

// Spécifiez la collection `usercmnd`
const Usercmnd = mongoose.model('Usercmnd', UsercmndSchema, 'usercmnd');

module.exports = Usercmnd;




// Route pour inscription
app.post('/signup', async (req, res) => {
  try {
    const { username, telephone, password } = req.body;

    // Vérification des champs requis
    if (!username || !telephone || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Recherche d'un utilisateur avec le même numéro de téléphone
    const existingUser = await User.findOne({ telephone }).exec();
    if (existingUser) {
      return res.status(409).json({ error: 'Téléphone déjà utilisé.' });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Création d'un nouvel utilisateur
    const newUser = new User({
      username,
      telephone,
      password: hashedPassword,
    });

    // Sauvegarde dans la collection `usercmnd`
    await newUser.save();

    res.status(201).json({ message: 'Inscription réussie', redirectTo: '/voyage.html' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.post('/loginusers', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Vérification des champs requis
    if (!username || !password) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Recherche d'un utilisateur par `username`
    const user = await User.findOne({ username }).exec();
    if (!user) {
      return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
    }

    // Vérification du mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Nom d\'utilisateur ou mot de passe incorrect.' });
    }

    // Connexion réussie
    res.status(200).json({ message: 'Connexion réussie', redirectTo: '/order.html' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


// Route pour connexion (utilise la collection userdoc)
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Rechercher l'utilisateur dans la collection "userdoc"
    const user = await UserDoc.findOne({ username }).exec();
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable dans la collection userdoc.' });
    }

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }

    // Connexion réussie
    res.status(200).json({ message: 'Connexion réussie', redirectTo: '/voyage.html' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

const VoyagesAventure = require('./models/voyage_aventure.js');

app.get('/api/voyages_aventure', async (req, res) => {
  try {
    const voyages = await VoyagesAventure.find(); // Récupère tous les documents de la collection voyages_aventure
    res.json(voyages);
  } catch (err) {
    console.error("Erreur lors de la récupération des voyages d'aventure :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/commands', async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query; // Par défaut, page = 1 et limit = 5

    // Convertir les paramètres en nombres
    const skip = (page - 1) * limit;
    const limitNumber = parseInt(limit);

    // Récupérer les commandes avec pagination
    const commands = await Command.find()
      .skip(skip) // Sauter les commandes déjà affichées
      .limit(limitNumber) // Limiter le nombre de résultats
      .sort({ _id: -1 }); // Trier par date de création (les plus récentes en premier)

    const totalCommands = await Command.countDocuments(); // Nombre total de commandes

    // Retourner les commandes et les informations de pagination
    res.json({
      commands,
      totalPages: Math.ceil(totalCommands / limitNumber), // Calculer le nombre total de pages
      currentPage: parseInt(page),
    });
  } catch (err) {
    console.error('Erreur lors de la récupération des commandes :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/command/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;

    // Chercher la commande avec son orderNumber
    const command = await Command.findOne({ orderNumber });
    if (!command) {
      return res.status(404).json({ error: "Commande introuvable" });
    }

    res.json(command); // Retourner les données de la commande
  } catch (err) {
    console.error('Erreur lors de la récupération de la commande :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


const { ObjectId } = require('mongodb');

app.delete('/api/commands/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Vérification si l'ID est valide
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "ID invalide. L'ID doit être une chaîne hexadécimale de 24 caractères." });
    }

    // Supprimer la commande
    const deletedCommand = await Command.findByIdAndDelete(id);

    if (!deletedCommand) {
      return res.status(404).json({ error: "Commande non trouvée" });
    }

    res.status(200).json({ message: "Commande supprimée avec succès" });
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande :', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});




app.get('/api/telephone', async (req, res) => {
  try {
    const telephones = await Telephone.find();
    res.json(telephones);
  } catch (err) {
    console.error("Erreur lors de la récupération des téléphones :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/Cosmetique', async (req, res) => {
  try {
    const cosmetique = await Cosmetique.find();
    res.json(cosmetique);
  } catch (err) {
    console.error("Erreur lors de la récupération des téléphones :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/chocolat', async (req, res) => {
  try {
    const chocolats = await Chocolats.find();
    res.json(chocolats);
  } catch (err) {
    console.error("Erreur lors de la récupération des téléphones :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/accauto', async (req, res) => {
  try {
    const accauto = await Accauto.find();
    res.json(accauto);
  } catch (err) {
    console.error("Erreur lors de la récupération des téléphones :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/vetement', async (req, res) => {
  try {
    const vetement = await Vetement.find();
    res.json(vetement);
  } catch (err) {
    console.error("Erreur lors de la récupération des téléphones :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/api/jouetetbb', async (req, res) => {
  try {
    const jouetetbb = await Jouetetbb.find();
    res.json(jouetetbb);
  } catch (err) {
    console.error("Erreur lors de la récupération des téléphones :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});


app.get('/api/outils', async (req, res) => {
  try {
    const outils = await Outils.find();
    res.json(outils);
  } catch (err) {
    console.error("Erreur lors de la récupération des téléphones :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
app.get('/api/autre', async (req, res) => {
  try {
    const autre = await Autre.find();
    res.json(autre);
  } catch (err) {
    console.error("Erreur lors de la récupération des téléphones :", err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
// Route pour récupérer tous les voyages
app.get('/api/voyages', async (req, res) => {
  try {
    // Récupérer les voyages de toutes les collections
    const voyagesAventure = await VoyageAventure.find();
    const voyagesPharma = await VoyagePharma.find();
    const voyagesCulture = await VoyageCulture.find();
    const voyagesCosmetique = await Cosmetique.find();
    const voyagesTelephone = await Telephone.find();
    const voyagesChocolats = await Chocolats.find();
    const voyagesAccauto = await Accauto.find();
    const voyagesVetement = await Vetement.find();
    const voyagesJouetetbb = await Jouetetbb.find();
    const voyagesAutre = await Autre.find();
    const voyagesOutils = await Outils.find();

    // Fusionner tous les voyages
    const allVoyages = [
      ...voyagesAventure,
      ...voyagesPharma,
      ...voyagesCulture,
      ...voyagesCosmetique,
      ...voyagesTelephone,
      ...voyagesChocolats,
      ...voyagesAccauto,
      ...voyagesVetement,
      ...voyagesJouetetbb,
      ...voyagesAutre,
      ...voyagesOutils,
    ];

    // Trier par date de création (le plus récent en premier)
    allVoyages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(allVoyages);
  } catch (err) {
    console.error('Erreur lors de la récupération des voyages :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});













const { VoyageAventure, VoyagePharma, VoyageCulture, Cosmetique, Telephone, Chocolats, Accauto, Vetement, Jouetetbb, Autre, Outils } = require('./models/Voyage');


app.post('/voyages', upload.array('photo', 5), async (req, res) => {
  try {
    const { title, description, destination, date, categorie, price } = req.body;

    if (!categorie || !['Aventure', 'Pharma', 'Culture', 'Cosmetique', 'Telephone', 'Chocolats', 'Accauto', 'Vetement', 'Jouetetbb', 'Autre', 'Outils'].includes(categorie)) {
      return res.redirect(`/ajout-produit.html?message=Catégorie%20invalide&error=true`);
    }

    if (!req.files || req.files.length === 0) {
      return res.redirect(`/ajout-produit.html?message=Aucune%20photo%20téléchargée&error=true`);
    }

    if (!price || isNaN(price) || price <= 0) {
      return res.redirect(`/ajout-produit.html?message=Prix%20invalide&error=true`);
    }

    const photos = req.files.map((file) => `/uploads/${file.filename}`);

    let VoyageModel;
    switch (categorie) {
      case 'Aventure': VoyageModel = VoyageAventure; break;
      case 'Pharma': VoyageModel = VoyagePharma; break;
      case 'Culture': VoyageModel = VoyageCulture; break;
      case 'Cosmetique': VoyageModel = Cosmetique; break;
      case 'Telephone': VoyageModel = Telephone; break;
      case 'Chocolats': VoyageModel = Chocolats; break;
      case 'Accauto': VoyageModel = Accauto; break;
      case 'Vetement': VoyageModel = Vetement; break;
      case 'Jouetetbb': VoyageModel = Jouetetbb; break;
      case 'Autre': VoyageModel = Autre; break;
      case 'Outils': VoyageModel = Outils; break;
      default: return res.redirect(`./categorie/categorie.html`);
    }

    const newVoyage = new VoyageModel({
      title,
      description,
      destination,
      date,
      photo: photos,
      price, // Enregistrement du prix
    });

    await newVoyage.save();

    return res.redirect(`/reponsevoyage.html?message=Produit%20ajouté%20avec%20succès&numeroCommande=${newVoyage.P_NUMERO_COMMANDE}`);
  } catch (err) {
    console.error('Erreur serveur:', err);
    res.status(500).send('Erreur interne');
  }
});

app.get('/voyages-list.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/voyages_list.html'));
});

// Route pour supprimer un voyage par ID et catégorie
router.delete('/voyages/:id', async (req, res) => {
  const { id } = req.params; // ID du voyage
  const { categorie } = req.query; // Catégorie spécifiée dans la requête

  if (!categorie || !['Aventure', 'Pharma', 'Culture', 'Cosmetique', 'Telephone', 'Chocolats', 'Accauto', 'Vetement', 'Jouetetbb', 'Autre', 'Outils'].includes(categorie)) {
    return res.status(400).json({ message: "Catégorie invalide ou absente." });
  }

  let VoyageModel;
  switch (categorie) {
    case 'Aventure': VoyageModel = VoyageAventure; break;
    case 'Pharma': VoyageModel = VoyagePharma; break;
    case 'Culture': VoyageModel = VoyageCulture; break;
    case 'Cosmetique': VoyageModel = Cosmetique; break;
    case 'Telephone': VoyageModel = Telephone; break;
    case 'Chocolats': VoyageModel = Chocolats; break;
    case 'Accauto': VoyageModel = Accauto; break;
    case 'Vetement': VoyageModel = Vetement; break;
    case 'Jouetetbb': VoyageModel = Jouetetbb; break;
    case 'Autre': VoyageModel = Autre; break;
    case 'Outils': VoyageModel = Outils; break;
    default:
      return res.status(400).json({ message: "Catégorie invalide." });
  }

  try {
    const voyage = await VoyageModel.findByIdAndDelete(id); // Recherche et suppression dans la collection spécifique

    if (!voyage) {
      return res.status(404).json({ message: "Voyage non trouvé." });
    }

    res.status(200).json({ message: "Voyage supprimé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la suppression :", error);
    res.status(500).json({ message: "Erreur serveur lors de la suppression." });
  }
});


// Schéma pour les commandes
const CommandSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  description: { type: String, required: true },
  photos: { type: [String] },
  phoneNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v); // Valide si le numéro contient exactement 10 chiffres
      },
      message: props => `${props.value} n'est pas un numéro valide !`
    }
  },
  orderNumber: { type: String, unique: true }, // Nouveau champ pour le numéro de commande
});

const Command = mongoose.model('Command', CommandSchema, 'commandeclient');


const CounterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  value: { type: Number, default: 0 },
});

const Counter = mongoose.model('Counter', CounterSchema);
module.exports = Counter;

async function getNextOrderNumber() {
  const counter = await Counter.findOneAndUpdate(
    { name: 'orderNumber' },
    { $inc: { value: 1 } },
    { new: true, upsert: true } // Crée un document s'il n'existe pas
  );

  return `C${counter.value}`;
}

app.post('/orders', upload.array('photos', 5), async (req, res) => {
  try {
    const { productName, description, phoneNumber } = req.body;
    const photos = req.files.map((file) => `/uploads/${file.filename}`);

    // Générer un nouveau numéro de commande
    const orderNumber = await getNextOrderNumber();

    // Créer la commande avec le numéro
    const newCommand = new Command({ productName, description, photos, phoneNumber, orderNumber });
    await newCommand.save();

    res.status(201).json({ 
      message: 'Commande créée avec succès !', 
      orderNumber 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la commande.' });
  }
});



// Schéma pour les utilisateurs (collection userdoc)
const UserDocSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true, match: /^\d+$/ }, // Accepte uniquement les chiffres
  password: { type: String, required: true },
});

const UserDoc = mongoose.model('UserDoc', UserDocSchema, 'userdoc');

// Route pour inscription dans la collection userdoc
app.post('/signup-doc', async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    if (!username || !phone || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur, téléphone et mot de passe sont requis.' });
    }

    if (!/^\d+$/.test(phone)) {
      return res.status(400).json({ error: 'Le téléphone doit contenir uniquement des chiffres.' });
    }

    const existingUser = await UserDoc.findOne({ $or: [{ username }, { phone }] }).exec();
    if (existingUser) {
      return res.status(409).json({ error: 'Nom d\'utilisateur ou téléphone déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserDoc = new UserDoc({ username, phone, password: hashedPassword });
    await newUserDoc.save();

    res.status(201).json({ message: 'Inscription réussie.', redirectTo: '/commande_doc.html' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Route pour connexion (utilise la collection userdoc)
app.post('/login', async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    const user = await UserDoc.findOne({
      $or: [{ username }, { phone }],
    }).exec();

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe incorrect.' });
    }

    res.status(200).json({ message: 'Connexion réussie.', redirectTo: '/commande_doc.html' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});



// Servir les pages HTML
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/signup.html', (req, res) => res.sendFile(path.join(__dirname, 'public/signup.html')));
app.get('/login.html', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.get('/voyage.html', (req, res) => res.sendFile(path.join(__dirname, 'public/voyage.html')));


// Schéma de la commande documentaire
const commandeDocSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    description: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    photos: { type: [String], default: [] },
  },
  { collection: 'commande_doc' } // Nom explicite pour la collection
);

// Modèle Mongoose
const Commandd = mongoose.model('Commandd', commandeDocSchema);

// Fonction pour générer un numéro de commande unique
async function generateOrderNumber() {
  // Recherche de la dernière commande dans la base de données
  const lastOrder = await Commandd.findOne().sort({ _id: -1 });

  // Si aucune commande n'est trouvée, on retourne D1
  if (!lastOrder || !lastOrder.orderNumber) {
    return 'D1';
  }

  // Si lastOrder existe, extrait le numéro de commande
  const lastNumber = parseInt(lastOrder.orderNumber.substring(1));

  // Si le dernier numéro n'est pas un nombre valide, recommence avec D1
  if (isNaN(lastNumber)) {
    return 'D1';
  }

  // Incrémenter le numéro de commande et le retourner sous le format Dxxx
  return `D${lastNumber + 1}`;
}



// Route pour créer une commande documentaire
app.post('/orders-doc', upload.array('photos', 5), async (req, res) => {
  try {
    const { productName, quantity, description, phoneNumber } = req.body;

    if (!productName || !quantity || !description || !phoneNumber) {
      return res.status(400).json({ error: 'Tous les champs sont requis.' });
    }

    // Génération du numéro de commande
    const orderNumber = await generateOrderNumber();
    const photos = req.files.map((file) => `/uploads/${file.filename}`);

    const newCommandd = new Commandd({
      orderNumber,
      productName,
      quantity,
      description,
      phoneNumber,
      photos,
    });

    await newCommandd.save();
    res.status(201).json({ message: 'Commande documentaire créée avec succès !' });
  } catch (err) {
    console.error('Erreur lors de la création de la commande documentaire:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la création de la commande documentaire.' });
  }
});

// Route pour récupérer toutes les commandes
app.get('/orders-doc', async (req, res) => {
  try {
    const orders = await Commandd.find();
    res.json(orders);
  } catch (err) {
    console.error('Erreur lors de la récupération des commandes:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des commandes.' });
  }
});

// Route pour supprimer une commande par ID
app.delete('/orders-doc/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Commandd.findByIdAndDelete(id);
    res.status(200).json({ message: 'Commande supprimée avec succès !' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la commande:', err);
    res.status(500).json({ error: 'Erreur serveur lors de la suppression de la commande.' });
  }
});
//signup europe
const UserEuropeSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  phone: { type: String, unique: true, required: true }, // Remplacer email par phone
  password: { type: String, required: true },
});

const UserEurope = mongoose.model('UserEurope', UserEuropeSchema, 'usereurope'); // Assurer l'utilisation de la collection "usereurope"

app.post('/signup-europe', async (req, res) => {
  try {
    const { username, phone, password } = req.body;
    if (!username || !phone || !password) {
      return res.status(400).json({ error: 'Nom d\'utilisateur, téléphone et mot de passe sont requis.' });
    }

    const existingUser = await UserEurope.findOne({ $or: [{ username }, { phone }] }).exec();
    if (existingUser) {
      return res.status(409).json({ error: 'Nom d\'utilisateur ou téléphone déjà utilisé.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUserEurope = new UserEurope({ username, phone, password: hashedPassword });
    await newUserEurope.save();

    res.status(201).json({ message: 'Inscription réussie.', redirectTo: '/commande_doc.html' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});



app.post('/login-europe', async (req, res) => {
  try {
    const { username, phone, password } = req.body;

    const user = await UserEurope.findOne({
      $or: [{ username }, { phone }]
    }).exec();

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur introuvable.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Mot de passe incorrect.' });
    }

    res.status(200).json({ message: 'Connexion réussie.', redirectTo: '/commande_doc.html' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

//shema signachat




// Route d'inscription
// Route pour l'inscription (avec hachage du mot de passe)
app.post('/signup-chat', async (req, res) => {
  const { username, phone, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà dans la collection usercooki
    const existingUser = await UserCooki.findOne({ username });
    if (existingUser) return res.status(400).json({ error: 'Nom d\'utilisateur déjà pris' });

    // Hacher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer un nouvel utilisateur dans la collection usercooki
    const newUser = new UserCooki({ username, phone, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: 'Inscription réussie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Route pour la connexion (génération du token JWT et cookie)
app.post('/login-chat', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe dans la collection usercooki
    const user = await UserCooki.findOne({ username });
    if (!user) return res.status(400).json({ error: 'Utilisateur introuvable' });

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ error: 'Mot de passe incorrect' });

    // Générer un token JWT
    const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });

    // Créer un cookie avec le token
    res.cookie('auth_token', token, { httpOnly: true, maxAge: 3600000 }); // 1 heure

    res.status(200).json({ message: 'Connexion réussie' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Route pour la déconnexion (supprimer le cookie)
app.post('/logout', (req, res) => {
  // Supprimer le cookie 'userCookie' lorsque l'utilisateur se déconnecte
  res.clearCookie('userCookie'); // Assurez-vous de spécifier le chemin du cookie si nécessaire

  // Retourner une réponse de succès
  res.status(200).json({ message: "Déconnexion réussie." });
});


// Middleware pour vérifier l'authentification
const authenticate = (req, res, next) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ error: 'Non authentifié' });

  jwt.verify(token, 'secretKey', (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Token invalide' });
    req.userId = decoded.userId;
    next();
  });
};

// Exemple d'une route protégée
app.get('/protected-route', authenticate, (req, res) => {
  res.json({ message: 'Accès autorisé', userId: req.userId });
});


// Lancer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur http://localhost:${PORT}`));
