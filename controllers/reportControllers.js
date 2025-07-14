const { Op } = require('sequelize');
const { Purchase, User, Customer,Shop,Sales,Item, ShopInventory,Damage } = require('../models');

exports.getCounts = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;

    let dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); 
      dateFilter = { createdAt: { [Op.between]: [start, end] } };
    }

    const [
      purchaseCount,
      userCount,
      customerCount,
      shopInventoriesCount,
      shopsCount,
      itemsCount,
      damagesCount,
      salesCount
    ] = await Promise.all([
      Purchase.count({ where: dateFilter }),
      User.count({ where: dateFilter }),
      Customer.count({ where: dateFilter }),
      ShopInventory.count({ where: dateFilter }),
      Shop.count({ where: dateFilter }),
      Item.count({ where: dateFilter }),
      Damage.count({ where: dateFilter }),
      Sales.count({ where: dateFilter }),
    ]);

    res.status(200).json({
      purchases: purchaseCount,
      users: userCount,
      customers: customerCount,
      shopInventories: shopInventoriesCount,
      shops: shopsCount,
      items: itemsCount,
      damages: damagesCount,
      salesCount: salesCount
    });
  } catch (error) {
    console.error('Error fetching counts:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};


exports.getComparisonReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    let dateFilter = {};
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      dateFilter = { createdAt: { [Op.between]: [start, end] } };
    }

    
    const shops = await Shop.findAll();

    const shopComparison = await Promise.all(
      shops.map(async (shop) => {
        const shopSales = await Sales.findAll({
          where: { shopId: shop.id, ...dateFilter }
        });

        const totalSales = shopSales.reduce((sum, s) => sum + s.price, 0);

        const purchases = await Purchase.findAll({
          where: {
            description: { [Op.like]: `%${shop.name}%` },
            ...dateFilter,
          },
        });

        const totalCost = purchases.reduce((sum, p) => sum + p.cost, 0);

        return {
          shopName: shop.name,
          totalSales,
          totalCost,
          profit: totalSales - totalCost,
        };
      })
    );

    
    const salesmen = await User.findAll();

    const salesmanComparison = await Promise.all(
      salesmen.map(async (user) => {
        const shops = await Shop.findAll({ where: { salesmanId: user.id } });
        const shopIds = shops.map((s) => s.id);

        if (shopIds.length === 0) return null;

        const sales = await Sales.findAll({
          where: {
            shopId: shopIds,
            ...dateFilter,
          },
        });

        const totalSales = sales.length;
        const totalRevenue = sales.reduce((sum, s) => sum + s.price, 0);

        return {
          name: user.name || `Salesman #${user.id}`,
          totalSales,
          totalRevenue,
          avgSale: totalSales > 0 ? totalRevenue / totalSales : 0,
        };
      })
    );

    const filteredSalesmen = salesmanComparison.filter(Boolean);

    
    const sales = await Sales.findAll({ where: { ...dateFilter } });

    const itemMap = {};

    sales.forEach((sale) => {
      const date = new Date(sale.createdAt);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      try {
        const items = Array.isArray(sale.items) ? sale.items : JSON.parse(sale.items || '[]');

        items.forEach((item) => {
          const key = `${item.itemId}_${month}_${year}`;

          if (!itemMap[key]) {
            itemMap[key] = {
              itemId: item.itemId,
              month,
              year,
              totalSold: 0,
              totalRevenue: 0,
            };
          }

          itemMap[key].totalSold += item.quantity;
          itemMap[key].totalRevenue += item.price * item.quantity;
        });
      } catch (err) {
        console.warn(`Invalid JSON in sale.items for sale ID ${sale.id}`);
      }
    });

    const itemIds = [...new Set(Object.values(itemMap).map((i) => i.itemId))];
    const itemInfo = await Item.findAll({ where: { id: itemIds } });

    const itemComparisonOverTime = Object.values(itemMap).map((entry) => {
      const item = itemInfo.find((i) => i.id === entry.itemId);
      return {
        itemName: item?.name || `Item #${entry.itemId}`,
        month: entry.month,
        year: entry.year,
        totalSold: entry.totalSold,
        totalRevenue: entry.totalRevenue,
      };
    });

    
    return res.status(200).json({
      shopComparison,
      salesmanComparison: filteredSalesmen,
      itemComparisonOverTime,
    });
  } catch (error) {
    console.error('Error in getComparisonReport:', error);
    return res.status(500).json({ message: error.message });
  }
};

