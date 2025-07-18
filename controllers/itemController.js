const { Op, fn, col, where } = require("sequelize");
const { Item } = require('../models');

exports.getAllItems = async (req, res) => {
  try {
    const items = await Item.findAll();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getItemById = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { name, description, price, quantity, unit, category } = req.body;
    const newItem = await Item.create({ name, description, price, quantity, unit, category });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { name, description, price, quantity, unit, category } = req.body;
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    await item.update({ name, description, price, quantity, unit, category });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const item = await Item.findByPk(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    await item.destroy();
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getItemByName = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Missing 'name' query param" });
    }

    const items = await Item.findAll({
      where: where(
        fn("LOWER", col("name")),
        {
          [Op.like]: `%${name.toLowerCase()}%`
        }
      )
    });

    if (!items || items.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    return res.json(items);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};