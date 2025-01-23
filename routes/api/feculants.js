const express = require('express');
const axios = require('axios');
const router = express.Router();


router.get("/allFeculant", async (req, res, next) => {
  try {

    var fields = "categories_tags,product_name,quantity,grade,selected_images,code,stores_tags,nutriscore_data,ingredients_analysis_tags,ingredients_original_tags";

    const urls = [
      { 
        url: "https://world.openfoodfacts.org/api/v2/search", 
        params: { categories_tags_fr: 'pain', fields: fields }
      },
      { 
        url: "https://world.openfoodfacts.org/api/v2/search", 
        params: { categories_tags_fr: 'baguette', fields: fields }
      },
      { 
        url: "https://world.openfoodfacts.org/api/v2/search", 
        params: { categories_tags_fr: 'riz', fields: fields }
      },
      { 
        url: "https://world.openfoodfacts.org/api/v2/search", 
        params: { categories_tags_fr: 'pates', fields: fields }
      },
      { 
        url: "https://world.openfoodfacts.org/api/v2/search", 
        params: { categories_tags_fr: 'breakfast-cereals', fields: fields }
      },
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
