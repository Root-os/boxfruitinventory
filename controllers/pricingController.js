const {Pricing} = require( "../models");
const {Shop, Item} = require('../models');

// Create
exports.create = async (req, res) => {
  try {
    const { shopId, itemId, unit, price } = req.body;

    // Check if this combination already exists
    const existing = await Pricing.findOne({
      where: {
        shopId,
        itemId,
        unit
      }
    });

    if (existing) {
      return res.status(409).json({
        error: 'Pricing for this item, shop, and unit already exists.'
      });
    }

    // If not exists, create it
    const pricing = await Pricing.create({ shopId, itemId, unit, price });
    res.status(201).json(pricing);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


// Read all
exports.findAll = async (req, res) => {
  try {
    const pricings = await Pricing.findAll({
      include: [
        {
          model: Shop,
          attributes: ['id', 'name']
        },
        {
          model: Item,
          attributes: ['id', 'name']
        }
      ]
    });
    res.status(200).json(pricings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Read one
exports.findOne = async (req, res) => {
  try {
    const pricing = await Pricing.findByPk(req.params.id);
    if (!pricing) return res.status(404).json({ error: "Not found" });
    res.status(200).json(pricing);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
exports.update = async (req, res) => {
  try {
    const pricing = await Pricing.findByPk(req.params.id);
    if (!pricing) return res.status(404).json({ error: "Not found" });

    const { shopId, itemId, unit, price } = req.body;
    await pricing.update({ shopId, itemId, unit, price });

    const updatedPricing = await Pricing.findByPk(pricing.id, {
      include: [
        {
          model: Shop,
          attributes: ['id', 'name']
        },
        {
          model: Item,
          attributes: ['id', 'name']
        }
      ]
    });

    res.status(200).json(updatedPricing);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete
exports.delete = async (req, res) => {
  try {
    const pricing = await Pricing.findByPk(req.params.id);
    if (!pricing) return res.status(404).json({ error: "Not found" });

    await pricing.destroy();
    res.status(200).json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
