const { Op } = require('sequelize');
const { Shop, User,Item ,Sales } = require('../models');;

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

exports.getShopsByOwnerId = async (req, res) => {
  try {
    // ** when auth middleware is setupped we will fetch the it by the user id 
    const id = req.params.id
    const shops = await Shop.findAll({ where: { salesmanId: id }, include : { model: User, as: 'salesman' } });
    res.status(200).json(shops);
  } catch (error) {
    
  }
};

exports.shopSalesReport = async (req, res) => {
  const { startDate, endDate } = req.body;

  try {
    const where = {};
   if (startDate && endDate) {
 const start = new Date(startDate);
start.setHours(0, 0, 0, 0);

const end = new Date(endDate);
end.setHours(23, 59, 59, 999);

where.createdAt = {
  [Op.between]: [start, end]
};
}
    // Fetch all sales with related data
    const sales = await Sales.findAll({
      where,
      include: [
        { model: Shop, as: 'shop' },
        // { model: Item, as: 'item'}
  
      ]
    });

    const totals = {
      totalSales: 0,
      totalPaid: 0,
      totalUnpaid: 0,
    };

    const shopsReport = {};

    for (const sale of sales) {
      const shopId = sale.shopId;
      const shopName = sale.shop?.name || 'Unknown Shop';
      const saleTotal = sale.price;
      const unpaid = sale.unpaid || 0;
      const paid = saleTotal - unpaid;

      // Add to global totals
      totals.totalSales += saleTotal;
      totals.totalPaid += paid;
      totals.totalUnpaid += unpaid;

      // Init shop record
      if (!shopsReport[shopId]) {
        shopsReport[shopId] = {
          shopId,
          shopName,
          totalSales: 0,
          totalPaid: 0,
          totalUnpaid: 0,
          items: []
        };
      }

      // Add to shop totals
      shopsReport[shopId].totalSales += saleTotal;
      shopsReport[shopId].totalPaid += paid;
      shopsReport[shopId].totalUnpaid += unpaid;

      // Process each item in the sale
      const parsedItems = Array.isArray(sale.items)
        ? sale.items
        : JSON.parse(sale.items || '[]');

      for (const item of parsedItems) {
        const existing = shopsReport[shopId].items.find(i => i.itemId === item.itemId);
        const itemDetails = await Item.findByPk(item.itemId);

        if (existing) {
          existing.quantity += item.quantity;
          existing.totalPrice += item.price * item.quantity;
        } else {
          shopsReport[shopId].items.push({
            itemId: item.itemId,
            itemName: itemDetails.name,
            name: item.name,
            unit: item.unit,
            quantity: item.quantity,
            totalPrice: item.price,
            unitPrice:  item.price / item.quantity,
          });
        }
      }
    }

    res.status(200).json({
      totals,
      shops: shopsReport
    });

  } catch (error) {
    console.error('Shop Sales Report Error:', error);
    res.status(500).json({ error: 'Failed to generate shop sales report' });
  }
};
