const { ShopInventory, Purchase, Item, Shop } = require('../models');
const { Op } = require('sequelize');
// Transfer purchased item to a shop (and deduct from purchase)
exports.transferToShop = async (req, res) => {
  try {
    const { shopId, purchaseId, itemId, quantity } = req.body;

    // Fetch purchase record
    const purchase = await Purchase.findByPk(purchaseId);

    if (!purchase || purchase.itemId !== itemId) {
      return res.status(400).json({ message: 'Invalid purchase or item ID' });
    }

    if (purchase.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough quantity in purchase to transfer' });
    }

    // Deduct quantity from purchase
    purchase.quantity -= quantity;
    await purchase.save();

    // Create shop inventory
    const record = await ShopInventory.create({
      shopId,
      purchaseId,
      itemId,
      quantity
    });

    res.status(201).json({ message: 'Transferred successfully', data: record });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get minimal stock list by shop
exports.getStockByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const stock = await ShopInventory.findAll({
      where: { shopId },
      attributes: ['itemId', [sequelize.fn('SUM', sequelize.col('quantity')), 'total']],
      group: ['itemId'],
      include: [
        {
          model: Item,
          attributes: ['name', 'id']
        }
      ]
    });

    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all distributed inventory with minimal info
exports.getAll = async (req, res) => {
  try {
    const records = await ShopInventory.findAll({
      attributes: ['id', 'quantity'],
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

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create shop inventory
exports.create = async (req, res) => {
  try {
    const { shopId, itemId, quantity } = req.body;

    const doesItemExist = await ShopInventory.findOne({
      where: {
        itemId,
        shopId
      }
    })
    if (doesItemExist) {
      doesItemExist.quantity += quantity;
      await doesItemExist.save();
      res.status(201).json({
        message: 'Purchase created! item quantity updated successfully!',
        purchase: doesItemExist,
      });
      
    } else {
      const record = await ShopInventory.create({ shopId, itemId, quantity });
      res.status(201).json(record);
    }
    
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



// Get inventory by shop ID
exports.getByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const records = await ShopInventory.findAll({
      where: { shopId },
      include: ['Purchase', 'Item']
    });
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete inventory assignment
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await ShopInventory.findByPk(id);
    if (!record) return res.status(404).json({ message: 'Not found' });

    await record.destroy();
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
