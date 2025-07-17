const { Op } = require("sequelize");
const {
  Sales,
  Customer,
  Item,
  Shop,
  User,
  ShopInventory,
} = require("../models");

exports.createSale = async (req, res) => {
  try {
    const { customerId, items, unpaid, shopId, userId, customerName } =
      req.body;

    let totalPrice = 0;
    let totalItems = 0;

    for (const item of items) {
      const { itemId, quantity: itemQty, price: itemPrice, unit } = item;

      if (!unit || typeof unit !== "string") {
        return res
          .status(400)
          .json({
            message: "Unit is required for each item and must be a string",
          });
      }

      const doesItemExist = await Item.findByPk(itemId);
      if (!doesItemExist)
        return res.status(404).json({ message: "Item not found" });

      const shopInventory = await ShopInventory.findOne({
        where: { itemId, shopId },
      });

      if (!shopInventory || shopInventory.quantity < itemQty) {
        return res
          .status(400)
          .json({ message: "Not enough stock in shop inventory" });
      }

      totalPrice += itemPrice;
      shopInventory.quantity -= itemQty;
      await shopInventory.save();
      totalItems += 1;
    }

    const sale = await Sales.create({
      customerId,
      items,
      quantity: totalItems,
      price: totalPrice,
      customerName,
      unpaid,
      shopId,
      userId,
    });

    const [customer, shop, user] = await Promise.all([
      Customer.findByPk(customerId, { attributes: ["id", "name"] }),
      Shop.findByPk(shopId, { attributes: ["id", "name"] }),
      User.findByPk(userId, { attributes: ["id", "fullName", "username"] }),
    ]);

    const enrichedItems = await Promise.all(
      sale.items.map(async (item) => {
        const itemDetails = await Item.findByPk(item.itemId, {
          attributes: ["id", "name", "unit"],
        });
        return {
          ...item,
          itemDetails,
        };
      })
    );

    res.status(201).json({
      message: "Sale recorded successfully",
      sale: {
        id: sale.id,
        customer,
        shop,
        user,
        quantity: sale.quantity,
        price: sale.price,
        unpaid: sale.unpaid,
        items: enrichedItems,
        createdAt: sale.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.getAllSales = async (req, res) => {
  try {
    const sales = await Sales.findAll({
      include: [
        { model: Customer, as: "customer", attributes: ["id", "name"] },
        { model: Shop, as: "shop", attributes: ["id", "name"] },
        { model: User, as: "user", attributes: ["id", "fullName"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    const enrichedSales = await Promise.all(
      sales.map(async (sale) => {
        const parsedItem = JSON.parse(sale.items || "[]");
        const enrichedItem = await Promise.all(
          parsedItem.map(async (item) => {
            const itemDetails = await Item.findByPk(item.itemId, {
              attributes: ["id", "name", "unit"],
            });
            return {
              ...item,
              name: itemDetails?.name || null,
              unit: itemDetails?.unit || null,
            };
          })
        );
        const plainSale = sale.get({ plain: true });
        return {
          ...plainSale,
          items: enrichedItem,
        };
      })
    );

    res.json(enrichedSales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSaleById = async (req, res) => {
  try {
    const sale = await Sales.findByPk(req.params.id, {
      include: [
        { model: Customer, as: "customer" },
        { model: Item, as: "item" },
        { model: Shop, as: "shop" },
        { model: User, as: "user" },
      ],
    });

    if (!sale) return res.status(404).json({ message: "Sale not found" });
    res.json(sale);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateSale = async (req, res) => {
  try {
    const sale = await Sales.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });
    if (req.body.items) {
  for (const item of req.body.items) {
    if (!item.unit || typeof item.unit !== 'string') {
      return res.status(400).json({ message: 'Unit is required for each item and must be a string' });
    }
  }
}
    await sale.update(req.body);
    res.json({ message: "Sale updated successfully", sale });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteSale = async (req, res) => {
  try {
    const sale = await Sales.findByPk(req.params.id);
    if (!sale) return res.status(404).json({ message: "Sale not found" });

    await sale.destroy();
    res.json({ message: "Sale deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.salesReport = async (req, res) => {
  const { itemId, startDate, endDate, groupBy } = req.body;

  try {
    const where = {};

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.createdAt = {
        [Op.between]: [start, end],
      };
    }

    const allSales = await Sales.findAll({ where });

    const summary = {};

    for (const sale of allSales) {
      let parsedItems;
      try {
        parsedItems = Array.isArray(sale.items)
          ? sale.items
          : JSON.parse(sale.items || "[]");
      } catch {
        parsedItems = [];
      }
      if (itemId && !parsedItems.some((i) => i.itemId === parseInt(itemId)))
        continue;

      const groupKey = (() => {
        switch (groupBy) {
          case "shop":
            return sale.shopId;
          case "user":
            return sale.userId;
          case "item":
            return parsedItems.map((i) => i.itemId).join(",");
          default:
            return "total";
        }
      })();

      if (!summary[groupKey]) {
        summary[groupKey] = {
          totalSales: 0,
          totalQuantity: 0,
          totalUnpaid: 0,
          itemsSold: [],
        };
      }

      parsedItems.forEach((item) => {
      summary[groupKey].totalSales += item.price || 0; 
      });
      summary[groupKey].totalQuantity += sale.quantity;
      summary[groupKey].totalUnpaid += sale.unpaid;
      summary[groupKey].itemsSold.push(...parsedItems);
    }

    const allItemIds = [
      ...new Set(
        Object.values(summary).flatMap((s) => s.itemsSold.map((i) => i.itemId))
      ),
    ];

    const itemsFromDb = await Item.findAll({
      where: { id: allItemIds },
      attributes: ["id", "name", "unit"],
    });

    const itemMap = {};
    itemsFromDb.forEach((item) => {
      itemMap[item.id] = { name: item.name, unit: item.unit };
    });

    for (const groupKey in summary) {
      summary[groupKey].itemsSold = summary[groupKey].itemsSold.map((item) => ({
        ...item,
        name: itemMap[item.itemId]?.name || null,
        unit: itemMap[item.itemId]?.unit || null,
      }));
    }

    return res.status(200).json(summary);
  } catch (error) {
    console.error("Sales Report Error:", error);
    return res.status(500).json({ error: "Failed to generate sales report" });
  }
};

exports.getSalesReportForSalesMan = async (req, res) => {
  const { id } = req.params;
  const { itemId, startDate, endDate, groupBy } = req.body;

  try {
    const where = {
      userId: id,
    };

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      where.createdAt = {
        [Op.between]: [start, end],
      };
    }

    const allSales = await Sales.findAll({ where });
    const summary = {};

    for (const sale of allSales) {
      let parsedItems;
      try {
        parsedItems = Array.isArray(sale.items)
          ? sale.items
          : JSON.parse(sale.items || "[]");
      } catch {
        parsedItems = [];
      }

      if (itemId && !parsedItems.some((i) => i.itemId === parseInt(itemId)))
        continue;

      const groupKey = (() => {
        switch (groupBy) {
          case "shop":
            return sale.shopId;
          case "user":
            return sale.userId;
          case "item":
            return parsedItems.map((i) => i.itemId).join(",");
          default:
            return "total";
        }
      })();

      if (!summary[groupKey]) {
        summary[groupKey] = {
          totalSales: 0,
          totalQuantity: 0,
          totalUnpaid: 0,
          itemsSold: [],
        };
      }

      summary[groupKey].totalSales += sale.price;
      summary[groupKey].totalQuantity += sale.quantity;
      summary[groupKey].totalUnpaid += sale.unpaid;

      summary[groupKey].itemsSold.push(...parsedItems);
    }

    const allItemIds = [
      ...new Set(
        Object.values(summary).flatMap((s) => s.itemsSold.map((i) => i.itemId))
      ),
    ];

    const itemsFromDb = await Item.findAll({
      where: { id: allItemIds },
      attributes: ["id", "name", "unit"],
    });

    const itemMap = {};
    itemsFromDb.forEach((item) => {
      itemMap[item.id] = { name: item.name, unit: item.unit };
    });

    for (const groupKey in summary) {
      summary[groupKey].itemsSold = summary[groupKey].itemsSold.map((item) => ({
        ...item,
        name: itemMap[item.itemId]?.name || null,
        unit: itemMap[item.itemId]?.unit || null,
      }));
    }

    return res.status(200).json(summary);
  } catch (error) {
    console.error("Sales Report Error:", error);
    return res.status(500).json({ error: "Failed to generate sales report" });
  }
};
