const { Sequelize } = require('sequelize');
const sequelize = require('../config/database');
const { Op } = require("sequelize");
const {
  ShopInventory,
  Item,
  Shop,
  InventoryTransfer,
} = require("../models");

exports.transferToShop = async (req, res) => {
  try {
    const { donatorShopId, recieverShopId, itemId, quantity } = req.body;

    // Check donor shop inventory
    const doesDonaterShopExistInInventory = await ShopInventory.findOne({
      where: {
        shopId: donatorShopId,
        itemId,
      },
    });

    if (!doesDonaterShopExistInInventory) {
      return res
        .status(404)
        .json({ message: "Donator Shop inventory not found" });
    }

    if (doesDonaterShopExistInInventory.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Not enough stock in donor shop" });
    }

    // Decrease donor inventory
    doesDonaterShopExistInInventory.quantity -= quantity;
    await doesDonaterShopExistInInventory.save();

    // Increase or create receiver inventory
    let doesRecevierShopExistInInventory = await ShopInventory.findOne({
      where: {
        shopId: recieverShopId,
        itemId,
      },
    });

    if (doesRecevierShopExistInInventory) {
      doesRecevierShopExistInInventory.quantity += quantity;
      await doesRecevierShopExistInInventory.save();
    } else {
      doesRecevierShopExistInInventory = await ShopInventory.create({
        shopId: recieverShopId,
        itemId,
        quantity,
      });
    }

    // Check if a transfer already exists for the same donator, receiver, and item
    const existingTransfer = await InventoryTransfer.findOne({
      where: {
        fromShopId: donatorShopId,
        toShopId: recieverShopId,
        itemId,
      },
    });

    if (existingTransfer) {
      existingTransfer.quantity += quantity;
      existingTransfer.transferredAt = new Date(); // optional: update timestamp
      await existingTransfer.save();
    } else {
      await InventoryTransfer.create({
        fromShopId: donatorShopId,
        toShopId: recieverShopId,
        itemId,
        quantity,
        transferredAt: new Date(),
      });
    }

    res.status(201).json({
      message: "Transferred successfully",
      data: doesRecevierShopExistInInventory,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllTransfers = async (req, res) => {
  try {
    const transfers = await InventoryTransfer.findAll({
      include: [
        { model: Shop, as: "FromShop", attributes: ["id", "name"] },
        { model: Shop, as: "ToShop", attributes: ["id", "name"] },
        { model: Item, attributes: ["id", "name"] },
      ],
    });

    res.status(200).json({ data: transfers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getStockByShop = async (req, res) => {
  try {
    const { shopId } = req.params;

    const stock = await ShopInventory.findAll({
      where: { shopId },
      attributes: [
        "itemId",
        [sequelize.fn("SUM", sequelize.col("quantity")), "total"],
      ],
      group: ["itemId"],
      include: [
        {
          model: Item,
          attributes: ["name", "id"],
        },
      ],
    });

    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const records = await ShopInventory.findAll({
      attributes: ["id", "quantity"],
      include: [
        {
          model: Shop,
          attributes: ["id", "name"],
        },
        {
          model: Item,
          attributes: ["id", "name"],
        },
      ],
    });

    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { shopId, itemId, quantity } = req.body;
    console.log('Request body:', { shopId, itemId, quantity });

    // Start a transaction to ensure atomicity
    const transaction = await sequelize.transaction();
    console.log('Transaction started');

    try {
      // Find the item in the Item table
      const item = await Item.findByPk(itemId, { transaction });
      console.log('Item fetched:', item ? item.toJSON() : null);
      if (!item) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Item not found' });
      }

      // Check if sufficient quantity exists in Item table
      if (item.quantity < quantity) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Insufficient item quantity' });
      }

      // Deduct quantity from Item table
      item.quantity -= quantity;
      await item.save({ transaction });
      console.log('Item quantity updated:', item.toJSON());

      // Check if item exists in ShopInventory
      const doesItemExist = await ShopInventory.findOne({
        where: {
          itemId,
          shopId,
        },
        transaction,
      });
      console.log('ShopInventory fetched:', doesItemExist ? doesItemExist.toJSON() : null);

      if (doesItemExist) {
        doesItemExist.quantity = parseInt(doesItemExist.quantity) + parseInt(quantity);
        await doesItemExist.save({ transaction });
        console.log('ShopInventory updated:', doesItemExist.toJSON());
        await transaction.commit();
        res.status(201).json({
          message: 'Purchase created! Item quantity updated successfully!',
          purchase: doesItemExist,
        });
      } else {
        const record = await ShopInventory.create(
          { shopId, itemId, quantity },
          { transaction }
        );
        console.log('ShopInventory created:', record.toJSON());
        await transaction.commit();
        res.status(201).json(record);
      }
    } catch (err) {
      console.error('Transaction error:', err);
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.updateShopInventory = async (req, res) => {
  try {
    const { shopId, itemId, quantity } = req.body; // new quantity
    console.log('Update request:', { shopId, itemId, quantity });

    const transaction = await sequelize.transaction();
    console.log('Transaction started');

    try {
      const item = await Item.findByPk(itemId, { transaction });
      if (!item) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Item not found' });
      }

      const inventory = await ShopInventory.findOne({
        where: { shopId, itemId },
        transaction,
      });

      if (!inventory) {
        await transaction.rollback();
        return res.status(404).json({ error: 'Shop inventory record not found' });
      }

      const oldQuantity = inventory.quantity;
      const quantityDifference = quantity - oldQuantity;

      // If increasing inventory, check if enough items available
      if (quantityDifference > 0 && item.quantity < quantityDifference) {
        await transaction.rollback();
        return res.status(400).json({ error: 'Insufficient item quantity to increase inventory' });
      }

      // Update item quantity accordingly
      item.quantity -= quantityDifference; // can be negative if reducing shop inventory
      await item.save({ transaction });

      // Update shop inventory
      inventory.quantity = quantity;
      await inventory.save({ transaction });

      await transaction.commit();
      res.status(200).json({
        message: 'Shop inventory updated successfully!',
        shopInventory: inventory,
      });

    } catch (err) {
      console.error('Transaction error:', err);
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getByShop = async (req, res) => {
  try {
    const { shopId } = req.params;
    const records = await ShopInventory.findAll({
      where: { shopId },
      include: ["Purchase", "Item"],
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
    if (!record) return res.status(404).json({ message: "Not found" });

    await record.destroy();
    res.json({ message: "Deleted" });
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
      where: dateFilter,
      include: [
        {
          model: Item,
          attributes: ["name", "unit"],
        },
      ],
    });

    const currentStock = {};
    const lowStockAlerts = [];

    for (const inv of inventories) {
      const {
        shopId,
        itemId,
        quantity,
        minStockQuantity,
        Item: itemDetails,
      } = inv;

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
      currentStock, // grouped by shopId
      lowStockAlerts, // flat list of items at or below minimum
    });
  } catch (error) {
    console.error("Stock Report Error:", error);
    return res.status(500).json({ error: "Failed to generate stock report" });
  }
};
