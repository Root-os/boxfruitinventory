const { Damage, ShopInventory, Item, Shop } = require("../models");
const { Op } = require("sequelize");

exports.createDamage = async (req, res) => {
  try {
    const { itemId, shopId, quantity, reason, unit } = req.body;

    // Find the shop inventory with the associated Item
    const findShopInventoryForShop = await ShopInventory.findOne({
      where: { shopId, itemId },
      include: [
        {
          model: Item,
          attributes: ["name"],
        },
      ],
    });

    // Check if the inventory exists
    if (!findShopInventoryForShop) {
      return res
        .status(404)
        .json({ message: "Item not found in shop inventory" });
    }

    // Update the quantity in the shop inventory
    findShopInventoryForShop.quantity -= quantity;
    await findShopInventoryForShop.save();

    // Create the damage record
    const damage = await Damage.create({
      itemId,
      shopId,
      quantity,
      reason,
      unit,
    });

    // Return success response
    res.status(201).json({
      message: `Damage created successfully for ${findShopInventoryForShop.Item.name}`,
      damage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDamages = async (req, res) => {
  try {
    const { itemId, shopId, startDate, endDate } = req.query;

    let whereClause = {};

    // Filter by item
    if (itemId) {
      whereClause.itemId = itemId;
    }

    // Filter by shop
    if (shopId) {
      whereClause.shopId = shopId;
    }

    // Filter by date or date range
    if (startDate && endDate) {
      whereClause.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      whereClause.createdAt = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      whereClause.createdAt = {
        [Op.lte]: new Date(endDate),
      };
    }

    const damages = await Damage.findAll({
      where: whereClause,
      include: [
        { model: Item, as: "item", attributes: ["name"] },
        { model: Shop, as: "shop", attributes: ["id", "name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json(damages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDamgeByShopId = async (req, res) => {
  try {
    const { shopId } = req.params;
    const findAllDamagesPerShop = await Damage.findAll({ where: { shopId } });
    res.status(200).json(findAllDamagesPerShop);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDamage = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, reason, unit } = req.body;

    // Find the damage record
    const damage = await Damage.findByPk(id);
    if (!damage) {
      return res.status(404).json({ message: "Damage record not found" });
    }

    // Find the shop inventory
    const shopInventory = await ShopInventory.findOne({
      where: { shopId: damage.shopId, itemId: damage.itemId },
    });
    if (!shopInventory) {
      return res.status(404).json({ message: "Shop inventory not found" });
    }

    // Adjust inventory only if quantity is being updated
    if (quantity !== undefined) {
      // Restore previous damage first
      shopInventory.quantity += damage.quantity;

      // Check if enough stock for new damage
      if (shopInventory.quantity < quantity) {
        return res
          .status(400)
          .json({ message: "Not enough stock for this update" });
      }

      shopInventory.quantity -= quantity;
      await shopInventory.save();
      damage.quantity = quantity;
    }

    if (reason !== undefined) damage.reason = reason;
    if (unit !== undefined) damage.unit = unit;

    await damage.save();
    res.status(200).json({
      message: "Damage record updated successfully",
      damage,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDamage = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the damage record
    const damage = await Damage.findByPk(id);
    if (!damage) {
      return res.status(404).json({ message: "Damage record not found" });
    }

    // Restore inventory quantity
    const shopInventory = await ShopInventory.findOne({
      where: { shopId: damage.shopId, itemId: damage.itemId },
    });
    if (shopInventory) {
      shopInventory.quantity += damage.quantity;
      await shopInventory.save();
    }

    // Delete the damage record
    await damage.destroy();

    res.status(200).json({ message: "Damage record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
