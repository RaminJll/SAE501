const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

dotenv.config();  // Charger les variables d'environnement depuis le fichier .env

// Fonction pour générer un token d'accès
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.TOKEN_SECRET,
    { expiresIn: "1h" }
  );
}

// Route POST pour la connexion
router.post("/", async (req, res, next) => {
  try {
    console.log("🟢 Incoming request:", req.body);

    const { emailInput, passwordInput } = req.body;

    // Vérifier si l'utilisateur existe dans la base de données
    const user = await prisma.users.findFirst({
      where: { email: emailInput },
    });

    if (!user) {
      return res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    console.log("🔍 Password entered:", passwordInput);
    console.log("🔍 Hashed password from DB:", user.password);

    const validPassword = await bcrypt.compare(passwordInput, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Nom d'utilisateur ou mot de passe incorrect" });
    }

    const token = generateAccessToken(user);

    res.json({
      message: "Connexion réussie",
      token: token,
      userId: user.id
    });

  } catch (error) {
    console.error("❌ Error in /connexion", error);
    res.status(500).json({ error: "Problème serveur" });
    // next(error);
  }
});

module.exports = router;
