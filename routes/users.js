var express = require('express');
const middleware = require('./middleWare');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
var router = express.Router();


router.get('/userGoal', middleware, async (req, res, next) => {
  try {
    // Trouver l'utilisateur avec l'ID dans le token
    const user = await prisma.users.findUnique({
      where: { id: req.user.userId },
    });

    // Si l'utilisateur n'est pas trouvé, renvoyer une erreur
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Envoyer la réponse avec les objectifs de l'utilisateur
    res.json({
      objectif: {
        caloriesTarget: user.caloriesTarget,
        proteinsTarget: user.proteinsTarget,
        carbsTarget: user.carbsTarget,
      },
    });
  } catch (error) {
    next(error);
  }
});


//fonction pour déterminer les objectifs nutritionnels à atteindre
function calculateTargets({ weight, height, birthDate, gender, goal }) {
  // Calculer l'âge à partir de la date de naissance
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  let bmr; // Basal Metabolic Rate (BMR)

  // Calcul de BMR (Harris-Benedict)
  if (gender === "homme") {
    bmr = Math.floor(88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age));
  } else {
    bmr = Math.floor(447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age));
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
  const fatsTarget = (caloriesTarget * 0.3) / 9;

  return {
    caloriesTarget,
    proteinsTarget,
    carbsTarget,
    fatsTarget,
  };
}


router.post('/updateGoal', middleware, async (req, res, next) => {
  try {
    const { weightInput, heightInput, goalInput } = req.body;

    const userId = req.user.userId;

    // Créer un objet de mise à jour conditionnelle
    const updateData = {};

    // Ajouter un champ à updateData seulement s'il n'est pas vide
    if (weightInput !== undefined && weightInput !== '') {
      updateData.weight = weightInput;
    }
    if (heightInput !== undefined && heightInput !== '') {
      updateData.height = heightInput;
    }
    if (goalInput !== undefined && goalInput !== '') {
      updateData.goal = goalInput;
    }

    // Vérification si aucun champ n'est renseigné
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: "Aucun champ à mettre à jour" });
    }

    // Effectuer la mise à jour seulement si des champs ont été renseignés
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: updateData,
    });

  } catch (error) {
    next(error);
  }

  try {
    const userId = req.user.userId;
    console.log(userId);
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    const { caloriesTarget, proteinsTarget, carbsTarget } = calculateTargets({
      weight: user.weight,
      height: user.height,
      birthDate: user.age,
      gender: user.gender,
      goal: user.goal,
    });
    
    // Mettre à jour les objectifs nutritionnels dans la base de données
    const updatedGoals = await prisma.users.update({
      where: { id: userId },
      data: {
        caloriesTarget : caloriesTarget,
        proteinsTarget : proteinsTarget,
        carbsTarget : carbsTarget,
      },
    });

    if (updatedGoals) {
      return res.status(200).json({
        message: "Objectifs mis à jour avec succès",
      });
    }

  } catch (error) {
    next(error);
  }
});


module.exports = router;
