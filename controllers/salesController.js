const { Sales, Customer, Item, Shop, User, ShopInventory } = require('../models');

// Create a new sale
exports.createSale = async (req, res) => {
  try {
    const { customerId, itemId, amount, price, unpaid, shopId, userId } = req.body;
    const quantity = parseInt(amount);

    const customer = await Customer.findByPk(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const item = await Item.findByPk(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    const shopInventory = await ShopInventory.findOne({
      where: { itemId, shopId }
    });

    if (!shopInventory || shopInventory.quantity < quantity) {
      return res.status(400).json({ message: 'Not enough stock in shop inventory' });
    }

    // Reduce stock from shop
    shopInventory.quantity -= quantity;
    await shopInventory.save();

    const sale = await Sales.create({
      customerId,
      itemId,
      amount,
      price,
      unpaid,
      shopId,
      userId,
    });

    const fullSale = await Sales.findByPk(sale.id, {
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name'] },
        { model: Item, as: 'item', attributes: ['id', 'name', 'unit'] },
        { model: Shop, as: 'shop', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'fullName', 'username'] },
      ],
    });

    res.status(201).json({
      message: 'Sale recorded successfully',
      sale: fullSale,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get all sales
exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sales.findAll({
      include: [
        { model: Customer, as: 'customer', attributes: ['id', 'name'] },
        { model: Item, as: 'item', attributes: ['id', 'name', 'unit'] },
        { model: Shop, as: 'shop', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get one sale by ID
exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sales.findByPk(req.params.id, {
      include: [
        { model: Customer, as: 'customer' },
        { model: Item, as: 'item' },
        { model: Shop, as: 'shop' },
        { model: User, as: 'user' },
      ],
    });

    if (!sale) return res.status(404).json({ message: 'Sale not found' });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update sale
exports.updateSale = async (req, res) => {
  try {
    const sale = await Sales.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });

    await sale.update(req.body);
    res.json({ message: 'Sale updated successfully', sale });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete sale
exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sales.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: 'Sale not found' });

    await sale.destroy();
    res.json({ message: 'Sale deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
