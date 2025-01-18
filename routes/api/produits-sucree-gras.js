const express = require('express');
const axios = require('axios');
const router = express.Router();


router.get("/allProduitSucree", async (req, res, next) => {

  var fields = "categories_tags,product_name,quantity,grade,selected_images,code,stores_tags,nutriscore_data,ingredients_analysis_tags,ingredients_original_tags";

  try {
    const urls = [
      { 
        url: "https://world.openfoodfacts.org/api/v2/search", 
        params: { categories_tags_fr: 'gateaux', fields: fields }
      },
      { 
        url: "https://world.openfoodfacts.org/api/v2/search", 
        params: { categories_tags_fr: 'chips', fields: fields }
      }
    ];

    const responses = await Promise.all(
      urls.map(config => axios.get(config.url, { params: config.params }))
    );

    const filteredResults = responses.map(response => response.data.products.filter(product => product.selected_images.front.small.fr));

    res.json(filteredResults.flat());

  } catch (error) {
    next(error);
  }
});

module.exports = router;
