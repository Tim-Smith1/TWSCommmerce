const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tags = await Tag.findAll({
      include: {
        model: Product
      }
    });
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve tags' });
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tags = await Tag.findByPk(req.params.id, {
      include: {
        model: Product
      }
    });
    if (!tags) {
      return res.status(404).json({ error: 'Tags not found' });
    }
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to retrieve tags' });
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const newTag = await Tag.create(req.body); 
    res.status(201).json(newTag);

  } catch (err) {
    console.error(err);

    res.status(500).json({ error: 'Failed to create tags' });
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  const tagId = req.params.id;

  try {
    const updatedTag = await Tag.update(
      { 
        tag_name: req.body.tag_name
      },
      {
        where: { id: tagId },
      }
    );
    
    res.json(updatedTag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update tags' });
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  const tagId = req.params.id;

  try {
    const tagIdRowDeleted = await Tag.destroy({
      where: { id: tagId }
    });
    if (tagIdRowDeleted === 0) {
      return res.status(404).json({ error: 'Tags not found' });
    }
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete tags' });
  }
});

module.exports = router;
