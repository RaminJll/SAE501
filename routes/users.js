var express = require('express');
const middleware = require('./middleWare');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
var router = express.Router();

/* GET users listing. */
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

module.exports = router;
