const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const router = express.Router();

dotenv.config(); // Charger les variables d'environnement depuis .env

// Fonction pour générer un token d'accès
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.TOKEN_SECRET,
    { expiresIn: "1h" }
  );
}

// Regex pour valider l'e-mail
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//Regex pour valider le mot de passe (au moins 8 caractères)
const passwordRegex = /^.{8,}$/;


//fonction pour déterminer les objectifs nutritionnels à atteindre
function calculateTargets({ weight, height, age, gender, goal }) {
  let bmr; // Basal Metabolic Rate (BMR)

  // Calcul de BMR (Harris-Benedict)
  if (gender === "homme") {
    bmr = 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age);
  } else {
    bmr = 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  }

  // Facteur d'activité pour un mode de vie sédentaire (1.2)
  const tdee = bmr * 1.2; // Total Daily Energy Expenditure

  // Ajustement des calories selon l'objectif
  let caloriesTarget;
  if (goal === "perdre-poids") {
    caloriesTarget = tdee - 500; // Déficit calorique pour la perte de poids
  } else if (goal === "gagner-poids") {
    caloriesTarget = tdee + 500; // Excédent calorique pour la prise de poids
  } else {
    throw new Error("Objectif invalide. Utilisez 'perdre-poids' ou 'gagner-poids'.");
  }

  // Calcul des macronutriments
  const proteinsTarget = weight * 1.8; // 1.8 g de protéines par kg de poids corporel
  const carbsTarget = (caloriesTarget - (proteinsTarget * 4)) / 4; // Le reste des calories en glucides

  // Minimum calorique pour éviter des valeurs dangereuses
  if (gender === "femme" && caloriesTarget < 1200) {
    caloriesTarget = 1200; // Minimum pour les femmes
  } else if (gender === "homme" && caloriesTarget < 1500) {
    caloriesTarget = 1500; // Minimum pour les hommes
  }

  // Calcul des lipides (environ 30% des calories totales)
  const fatsTarget = (caloriesTarget * 0.3) / 9; // 1g de lipide = 9 calories

  return {
    caloriesTarget,
    proteinsTarget,
    carbsTarget,
    fatsTarget,
  };
}



// Route POST pour l'inscription
router.post("/", async (req, res, next) => {

  try {
    const { emailInput, passwordInput, nameInput, weightInput, heightInput, ageInput, genderInput, goalInput } = req.body;

    // Validation des entrées
    if (!emailRegex.test(emailInput)) {
      return res.status(400).json({ error: "Adresse e-mail invalide" });
    }
    if (!passwordRegex.test(passwordInput)) {
      return res.status(400).json({
        error: "Le mot de passe doit contenir au moins 8 caractères",
      });
    }

    // Hachage du mot de passe
    const hashedPassword = await bcrypt.hash(passwordInput, 10);

    // Calcul des objectifs (à l'aide de la fonction précédente)
    const { caloriesTarget, proteinsTarget, carbsTarget } = calculateTargets({
      weight: weightInput,
      height: heightInput,
      age: ageInput,
      gender: genderInput,
      goal: goalInput,
    });

    // Création de l'utilisateur dans la BDD
    const newUser = await prisma.users.create({
      data: {
        email: emailInput,
        password: hashedPassword,
        name: nameInput,
        weight: weightInput,
        height: heightInput,
        age: ageInput,
        gender: genderInput,
        goal: goalInput,
        caloriesTarget,
        proteinsTarget,
        carbsTarget,
      },
    });

    // Générer un token pour le nouvel utilisateur
    const token = generateAccessToken(newUser);

    // Réponse avec les détails de l'utilisateur et le token
    res.json({
      message: "Inscription réussie",
      token: token,
      userId: newUser.id,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
