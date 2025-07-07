const { Shop, User } = require('../models');

// Get all shops
exports.getAllShops = async (req, res) => {
  try {
    const shops = await Shop.findAll({ include: { model: User, as: 'salesman' } });
    res.json(shops);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get shop by ID
exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id, { include: { model: User, as: 'salesman' } });
    if (!shop) return res.status(404).json({ message: 'Shop not found' });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create shop
exports.createShop = async (req, res) => {
  try {
    const { name, salesmanId } = req.body;
    const newShop = await Shop.create({ name, salesmanId });
    res.status(201).json(newShop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update shop
exports.updateShop = async (req, res) => {
  try {
    const { name, salesmanId } = req.body;
    const shop = await Shop.findByPk(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    await shop.update({ name, salesmanId });
    res.json(shop);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete shop
exports.deleteShop = async (req, res) => {
  try {
    const shop = await Shop.findByPk(req.params.id);
    if (!shop) return res.status(404).json({ message: 'Shop not found' });

    await shop.destroy();
    res.json({ message: 'Shop deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
