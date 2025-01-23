require('dotenv').config();
const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const OAuth = require('oauth-1.0a');
const router = express.Router();

// Configuration des clés
const FATSECRET_CONSUMER_KEY = process.env.FATSECRET_CONSUMER_KEY;
const FATSECRET_CONSUMER_SECRET = process.env.FATSECRET_CONSUMER_SECRET;

// Configuration OAuth pour FatSecret
const oauth = OAuth({
    consumer: {
        key: FATSECRET_CONSUMER_KEY,
        secret: FATSECRET_CONSUMER_SECRET
    },
    signature_method: 'HMAC-SHA1',
    hash_function(baseString, key) {
        return crypto
            .createHmac('sha1', key)
            .update(baseString)
            .digest('base64');
    }
});

// Fonction pour faire une requête FatSecret
async function getFatSecretData(query) {
    const baseUrl = 'https://platform.fatsecret.com/rest/server.api';
    
    // Paramètres de base pour FatSecret
    const params = {
        method: 'foods.search',
        format: 'json',
        search_expression: query,
        max_results: 1,
        oauth_consumer_key: FATSECRET_CONSUMER_KEY,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: Math.floor(Date.now() / 1000).toString(),
        oauth_nonce: crypto.randomBytes(16).toString('hex'),
        oauth_version: '1.0'
    };

    // Préparation de la requête pour OAuth
    const requestData = {
        url: baseUrl,
        method: 'GET',
        data: params
    };

    // Obtention de la signature OAuth
    const authorized = oauth.authorize(requestData);
    params.oauth_signature = authorized.oauth_signature;

    // Exécution de la requête
    const response = await axios.get(baseUrl, { params });
    return response.data;
}

router.get("/allFruits", async (req, res) => {
    try {
        // Liste des recherches FatSecret (fruits)
        const fatSecretQueries = [
            'apple',
            'orange',
            'kiwi',
            'strawberry',
            'grape',
            'cherry',
            'pineapple',
            'apricot',
            'raspberry'
        ];

        // Exécution des requêtes FatSecret
        const fatSecretResponses = await Promise.all(
            fatSecretQueries.map(query => getFatSecretData(query))
        );

        // Compilation des résultats et renvoi
        res.json(fatSecretResponses);

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: 'Erreur lors de la récupération des données',
            error: error.message 
        });
    }
});

module.exports = router;
