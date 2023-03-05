const router = require('express').Router();
const { Category, Product } = require('../../models');

// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const categories = await Category.findAll({
      include: {
        model: Product
      }
    });
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve categories' });
  }
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const category = await Category.findByPk(req.params.id, {
      include: {
        model: Product
      }
    });
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(category);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve category' });
  }
});

router.post('/', async (req, res) => {
  // create a new category
  try {
    const newCategory = await Category.create(req.body); 
    res.status(201).json(newCategory);

  } catch (err) {
    console.error(err);

    res.status(500).json({ error: 'Failed to create category' });
  }
});


router.put('/:id', async (req, res) => {
  //update a category by its `id` value
  const categoryId = req.params.id;

  try {
    const updatedCategory = await Category.update(
      { 
        category_name: req.body.category_name
      },
      {
        where: { id: categoryId },
      }
    );
    
    res.json(updatedCategory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update category' });
  }
});

router.delete('/:id', async (req, res) => {
  // delete a category by its `id` value
  const categoryId = req.params.id;

  try {
    const catIdRowDeleted = await Category.destroy({
      where: { id: categoryId }
    });
    if (catIdRowDeleted === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

module.exports = router;
