var express = require('express');
const middleware = require('./middleWare');
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
var router = express.Router();

router.post('/progression', middleware, async (req, res, next) => {
    try {
        const {weightInput} = req.body;

        const userId = req.user.userId;
        console.log(userId);

        const newProgress = await prisma.progress.create({
            data: {
                weight: weightInput,
                userId: userId
            }
        })

        if (newProgress) {
            return res.status(200).json({
                message: "Progression ajoutée avec succès",
            });
        }

    } catch (error) {
        next(error);
    }
});

router.post('/perfQuotidienne', middleware, async (req, res, next) => {
    try {
        const {caloriesGoal, proteinsGoal, carbsGoal} = req.query;
        const userId = req.user.userId;

        const newDailyGoals = await prisma.dailyGoals.create({
            data: {
                caloriesGoal : caloriesGoal,
                proteinsGoal : proteinsGoal,
                carbsGoal : carbsGoal,
                userId : userId
            }
        });

        if (newDailyGoals) {
            return res.status(200).json({
                message: "Objectifs ajoutés avec succès",
            });
        }
    } catch (error) {
        next(error);
        
    }
});

module.exports = router;