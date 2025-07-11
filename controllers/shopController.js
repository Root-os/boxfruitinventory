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
exports.profitLossReport = async (req, res) => {
  const { startDate, endDate, groupBy } = req.query;

  try {
    const where = {};
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const sales = await Sales.findAll({ where });

    const report = {};

    for (const sale of sales) {
      const parsedItems = JSON.parse(sale.items || '[]');

      for (const item of parsedItems) {
        const itemDetails = await Item.findByPk(item.itemId);

        if (!itemDetails) continue;

        const costPrice = itemDetails.price;
        const saleRevenue = item.price * item.quantity;
        const itemCost = costPrice * item.quantity;
        const profit = saleRevenue - itemCost;

        let groupKey = 'company';
        if (groupBy === 'shop') groupKey = sale.shopId;
        else if (groupBy === 'item') groupKey = item.itemId;

        if (!report[groupKey]) {
          report[groupKey] = {
            revenue: 0,
            cost: 0,
            profit: 0,
            items: [],
          };
        }

        report[groupKey].revenue += saleRevenue;
        report[groupKey].cost += itemCost;
        report[groupKey].profit += profit;

        const existingItem = report[groupKey].items.find(i => i.itemId === item.itemId);

        if (existingItem) {
          existingItem.quantity += item.quantity;
          existingItem.revenue += saleRevenue;
          existingItem.cost += itemCost;
          existingItem.profit += profit;
        } else {
          report[groupKey].items.push({
            itemId: item.itemId,
            itemName: itemDetails.name,
            quantity: item.quantity,
            revenue: saleRevenue,
            cost: itemCost,
            profit,
          });
        }
      }
    }

    res.status(200).json(report);
  } catch (error) {
    console.error('Profit & Loss Report Error:', error);
    res.status(500).json({ error: 'Failed to generate profit & loss report' });
  }
};



