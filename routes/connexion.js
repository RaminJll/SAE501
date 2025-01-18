const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

dotenv.config();  // Charger les variables d'environnement depuis le fichier .env

// Fonction pour générer un token d'accès
function generateAccessToken(username) {
  return jwt.sign(username, process.env.TOKEN_SECRET, { expiresIn: "1h" });
}

// Route POST pour la connexion
router.post("/", async (req, res, next) => {
  try {
    const { emailInput, passwordInput } = req.body;

    // Vérifier si l'utilisateur existe dans la base de données
    const user = await prisma.users.findFirst({
      where: { email: emailInput },
    });

    if (!user) {
      return res.status(400).json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    // Comparaison du mot de passe haché avec celui de l'utilisateur
    bcrypt.compare(passwordInput, user.password, (err, result) => {
      if (result) {
        const token = generateAccessToken({ email: emailInput });
        res.json({ message: "Vous êtes connecté", token: token });
      } else {
        res.status(400).json({ error: "Le mot de passe ou l'identifiant est incorrect" });
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
