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

exports.updateTransfer = async (req, res) => {
  try {
    const { transferId } = req.params; // ID of the transfer to update
    const { newQuantity } = req.body;

    if (newQuantity <= 0) {
      return res.status(400).json({ message: "Quantity must be positive" });
    }

    // Find the existing transfer record
   const transfer = await InventoryTransfer.findByPk(id);
    if (!transfer) {
      return res.status(404).json({ message: "Transfer record not found" });
    }

    const { fromShopId, toShopId, itemId, quantity: oldQuantity } = transfer;

    // Calculate the quantity difference
    const quantityDiff = newQuantity - oldQuantity;

    // Find donor inventory record
    const donorInventory = await ShopInventory.findOne({
      where: { shopId: fromShopId, itemId }
    });
    if (!donorInventory) {
      return res.status(404).json({ message: "Donor shop inventory not found" });
    }

    // Find receiver inventory record
    const receiverInventory = await ShopInventory.findOne({
      where: { shopId: toShopId, itemId }
    });
    if (!receiverInventory) {
      return res.status(404).json({ message: "Receiver shop inventory not found" });
    }

    // If quantityDiff is positive, we are increasing the transfer amount:
    // Check donor inventory has enough stock
    if (quantityDiff > 0 && donorInventory.quantity < quantityDiff) {
      return res.status(400).json({ message: "Not enough stock in donor shop for update" });
    }

    // Update donor inventory quantity
    donorInventory.quantity -= quantityDiff;
    await donorInventory.save();

    // Update receiver inventory quantity
    receiverInventory.quantity += quantityDiff;
    await receiverInventory.save();

    // Update the transfer record with new quantity and timestamp
    transfer.quantity = newQuantity;
    transfer.transferredAt = new Date();
    await transfer.save();

    res.status(200).json({
      message: "Transfer updated successfully",
      data: transfer,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deleteTransfer = async (req, res) => {
  try {
    const { id } = req.params;

    const transfer = await InventoryTransfer.findByPk(id);
    if (!transfer) {
      return res.status(404).json({ message: "Transfer not found" });
    }

    await transfer.destroy();

    res.json({ message: "Transfer record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

