const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const productAll = await Product.findAll({
      include: [
        {
          model: Category,
          attributes: ['category_name'],
        },
        {
          model: Tag,
          attributes: ['tag_name'],
        } 
      ]
    });
    res.status(200).json(productAll);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve all products' });
  }
}); 

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const productId = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          attributes: ['category_name'],
        },
        {
          model: Tag,
          attributes: ['tag_name'],
        } 
      ]
    });
    if (!productId) {
      return res.status(404).json({ error: 'product id not found' });
    }
    res.json(productId);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve product by id' });
  }
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', async (req, res) => {
  try {
    const updatedProduct = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    const productTags = await ProductTag.findAll({
      where: {
        product_id: req.params.id,
      },
    });

    const productTagIds = productTags.map(({ tag_id }) => tag_id);
    const newProductTags = req.body.tagIds
      .filter((tag_id) => !productTagIds.includes(tag_id))
      .map((tag_id) => {
        return {
          product_id: req.params.id,
          tag_id,
        };
      });

    const productTagsToRemove = productTags
      .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
      .map(({ id }) => id);

    await Promise.all([
      ProductTag.destroy({
        where: {
          id: productTagsToRemove,
        },
      }),
      ProductTag.bulkCreate(newProductTags),
    ]);

    const updatedProductTags = await ProductTag.findAll({
      where: {
        product_id: req.params.id,
      },
    });

    res.json(updatedProductTags);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update product' });
  }
});

router.delete('/:id', async (req, res) => {
  const productId = req.params.id;

  try {
    const numRowsDeleted = await Product.destroy({
      where: { id: productId }
    });
    if (numRowsDeleted === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

module.exports = router;


