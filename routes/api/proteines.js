require('dotenv').config();
const express = require('express');
const axios = require('axios');
const router = express.Router();

// Récupérer le token statique depuis le fichier .env
const TOKEN = process.env.FATSECRET_TOKEN;

router.get("/AllProteine", async (req, res, next) => {

    var fields = "categories_tags,product_name,quantity,grade,selected_images,code,stores_tags,nutriscore_data,ingredients_analysis_tags,ingredients_original_tags";

    try {
        const queries = ['chicken-breast', 'chicken', 'Ground Meat', 'Beef', 'Roast Beef', 'Beef Shortribs', 'Veal', 'Lamb Chop', 'Pork Chops',];

        const responses = await Promise.all(
            queries.map(query =>
                axios.get('https://platform.fatsecret.com/rest/foods/search/v1', {
                    headers: {
                        Authorization: `Bearer ${TOKEN}`
                    },
                    params: {
                        search_expression: query,
                        format: 'json',
                        max_results: 1
                    }
                })
            )
        );

        const fatSecretResults = fatSecretResponses.map(response => response.data);


        const urls = [
            {
                url: "https://world.openfoodfacts.org/api/v2/search",
                params: {
                    categories_tags_fr: 'oeuf',
                    fields: fields
                }
            },
            {
                url: "https://world.openfoodfacts.org/api/v2/search",
                params: {
                    categories_tags_fr: 'bacon',
                    fields: fields
                }
            },
            {
                url: "https://world.openfoodfacts.org/api/v2/search",
                params: {
                    categories_tags_fr: 'saucisson',
                    fields: fields
                }
            },
            {
                url: "https://world.openfoodfacts.org/api/v2/search",
                params: {
                    categories_tags_fr: 'charcuterie',
                    fields: fields
                }
            },
            {
                url: "https://world.openfoodfacts.org/api/v2/search",
                params: {
                    categories_tags_fr: 'steak',
                    fields: fields
                }
            },
        ];

        const openFoodFactsResponses = await Promise.all(
            urls.map(config => axios.get(config.url, { params: config.params }))
        );

        const openFoodFactsResults = openFoodFactsResponses.map(response => response.data);

        const filteredResults = openFoodFactsResults.map(response => response.data.products.filter(product => product.selected_images.front.small.fr));


        const results = {
            fatSecret: fatSecretResults,
            openFoodFacts: filteredResults
        };

        res.json(results);

    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
        next(error);
    }
});

module.exports = router;
