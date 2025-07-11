const { Op } = require('sequelize');
const { ShopInventory, Purchase, Item, Shop } = require('../models');

exports.transferToShop = async (req, res) => {
  try {
    const { donatorShopId, recieverShopId, itemId, quantity } = req.body;
    
    const doesDonaterShopExistInInventory = await ShopInventory.findOne({
      where: {
        shopId : donatorShopId,
        itemId
      }
    });

    if (!doesDonaterShopExistInInventory) {
      return res.status(404).json({ message: 'Donator Shop inventory does not found' });
    }

    if(doesDonaterShopExistInInventory.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock in shop inventory' });
    }

    doesDonaterShopExistInInventory.quantity -= quantity;
    await doesDonaterShopExistInInventory.save();

    const doesRecevierShopExistInInventory = await ShopInventory.findOne({
      where: {
        shopId : recieverShopId,
        itemId
      }
    });

    if(!doesRecevierShopExistInInventory) {
      return res.status(404).json({ message: 'Receiver Shop inventory does not found' });
    }

    doesRecevierShopExistInInventory.quantity += quantity;
    await doesRecevierShopExistInInventory.save();    

    res.status(201).json({ message: 'Transferred successfully', data : doesRecevierShopExistInInventory });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


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



exports.stockReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    let dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter.createdAt = { [Op.between]: [start, end] };
    }

    const inventories = await ShopInventory.findAll({
      where : dateFilter,
      include: [
        {
          model: Item,
          attributes: ['name', 'unit'],
        },
      ],
    });

    const currentStock = {};
    const lowStockAlerts = [];

    for (const inv of inventories) {
      const { shopId, itemId, quantity, minStockQuantity, Item: itemDetails } = inv;

      const itemName = itemDetails?.name || `Item #${itemId}`;
      const unit = itemDetails?.unit || null;

      // Add to current stock grouped by shopId
      if (!currentStock[shopId]) currentStock[shopId] = [];

      currentStock[shopId].push({
        itemId,
        itemName,
        unit,
        quantity,
      });

      // Add to low stock if quantity <= minStockQuantity
      if (minStockQuantity != null && quantity <= minStockQuantity) {
        lowStockAlerts.push({
          shopId,
          itemId,
          itemName,
          quantity,
          minStockQuantity,
        });
      }
    }

    return res.status(200).json({
      currentStock,      // grouped by shopId
      lowStockAlerts,    // flat list of items at or below minimum
    });
  } catch (error) {
    console.error('Stock Report Error:', error);
    return res.status(500).json({ error: 'Failed to generate stock report' });
  }
};
