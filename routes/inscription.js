const express = require("express");
const bcrypt = require("bcrypt");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

// Regex pour valider l'e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Regex pour valider le mot de passe (au moins 8 caractères avec au moins une lettre majuscule, une lettre minuscule, un chiffre et un caractère spécial)
//const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?-]).{8,}$/;

//Regex pour valider le mot de passe (au moins 8 caractères)
const passwordRegex = /^.{8,}$/;


// Route POST pour l'inscription
router.post("/", async (req, res, next) => {
  try {
    const { emailInput, passwordInput } = req.body;

    // Vérification de l'e-mail
    if (!emailRegex.test(emailInput)) {
      return res.status(400).json({ error: "Adresse e-mail invalide" });
    }

    // Vérification du mot de passe
    if (!passwordRegex.test(passwordInput)) {
      return res.status(400).json({
        error:
          "Le mot de passe doit contenir au moins 8 caractères",
      });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(passwordInput, 10);

    // Création de l'utilisateur dans la base de données
    const newUser = await prisma.users.create({
      data: {
        email: emailInput,
        password: hashedPassword,
      },
    });

    res.json({ message: "Vous êtes inscrit" });
  } catch (error) {
    next(error);
  }
});

// Route POST pour la récupérations des données de l'utilisateur

router.post("/data", async (req, res, next) => {
  
});

module.exports = router;
