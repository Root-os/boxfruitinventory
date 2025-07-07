const { Purchase, Customer, Item } = require('../models');

exports.makePurchase = async (req, res) => {
  try {
    const { customerId, itemId, quantity,unit, cost, description } = req.body;

    const item = await Item.findByPk(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const customer = await Customer.findByPk(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    if (item.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock available' });
    }

    const totalPrice = item.price * quantity;
    item.quantity -= quantity;
    await item.save();

    const purchase = await Purchase.create({
      customerId,
      itemId,
      quantity,
      totalPrice,
      unit,
      cost,
      description,
    });

    const populatedPurchase = await Purchase.findByPk(purchase.id, {
      include: [
        { model: Customer, attributes: ['id', 'name', 'phone'] },
        { model: Item, attributes: ['id', 'name', 'price', 'unit'] },
      ],
    });

    res.status(201).json({
      message: 'Purchase successful',
      purchase: populatedPurchase,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      include: [
        { model: Customer, attributes: ['id', 'name'] },
        { model: Item, attributes: ['id', 'name', 'unit'] },
      ],
      order: [['purchaseDate', 'DESC']],
    });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
