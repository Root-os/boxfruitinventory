const { Op } = require('sequelize');
const { Purchase, Customer, Item, User } = require('../models');

exports.makePurchase = async (req, res) => {
  try {
    const {
      customerId,
      items,
      cost,
      description,
      customerName,
      userId,
      paid,
    } = req.body;

    let counter = 0;
    let totalPriceComputed = 0;
    let totalUnpaids = 0;
    

    // Validate and update inventory for each item
    for (const item of items) {
      const { itemId, quantity, price, unit } = item;
      

      const doesItemExist = await Item.findByPk(itemId);
      if (!doesItemExist) {
        return res.status(500).json({ error: "Item doesn't exist!" });
      }
    
      doesItemExist.quantity += quantity;
      doesItemExist.price = price;
      await doesItemExist.save();

      totalPriceComputed += price * quantity;
      counter += 1;
      
      totalUnpaids = totalPriceComputed - paid;

    }

    // Save the purchase with full item info including unit
    const newPurchase = await Purchase.create({
      customerId,
      customerName,
      items, 
      quantity: counter,
      cost,
      description,
      totalPrice: totalPriceComputed,
      userId,
      paid,
      unpaid: totalUnpaids,
    });

    res.status(201).json({
      message: 'Purchase created successfully!',
      purchase: newPurchase,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updatePurchase = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedData = req.body;

    const existingPurchase = await Purchase.findByPk(id);
    if (!existingPurchase) {
      return res.status(404).json({ error: "Purchase doesn't exist!" });
    }

    // Optional: Adjust inventory (rollback old quantities, apply new ones)
    // But be careful! This depends on your inventory strategy

    // Validate items before updating
    const items = updatedData.items;
    let totalPriceComputed = 0;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items are required and must be an array." });
    }

    for (const item of items) {
      const { itemId, quantity, price } = item;
      const foundItem = await Item.findByPk(itemId);
      if (!foundItem) {
        return res.status(400).json({ error: `Item with ID ${itemId} doesn't exist.` });
      }

      // Optional: You could update stock, or just recalculate price
      totalPriceComputed += price * quantity;
    }

    updatedData.totalPrice = totalPriceComputed;
    updatedData.quantity = items.length;

    // Update the purchase
    const [updatedCount] = await Purchase.update(updatedData, {
      where: { id }
    });

    if (updatedCount === 0) {
      return res.status(400).json({ error: "Purchase not updated — data may be unchanged." });
    }

    const updatedPurchase = await Purchase.findByPk(id, {
      include: [{ model: Customer, attributes: ['id', 'name', 'phone'] }]
    });

    // Enrich the items
    const enrichedItems = await Promise.all(
      updatedData.items.map(async (item) => {
        const itemDetails = await Item.findByPk(item.itemId, {
          attributes: ['id', 'name', 'unit']
        });
        return {
          ...item,
          name: itemDetails?.name || null,
          unit: item.unit || itemDetails?.unit || null
        };
      })
    );

    updatedPurchase.items = enrichedItems;

    res.status(200).json({
      message: "Purchase updated successfully!",
      purchase: updatedPurchase
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deletePurcahse = async (req, res) => {
  const id = req.params.id
  const deletePurchase = await Purchase.destroy({
    where: {
      id : id
    }
  })
  res.status(201).json({
    message: 'Purchase deleted successfully!',
    purchase: deletePurchase,
  });
}

exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
       include: [
        {
          model: Customer,
          attributes: ['id', 'name'], 
        },
        {
          model: User,
          attributes: ['id', 'fullName'], 
        }
      ],
    });
    const enrichedPurchases = await Promise.all(
      purchases.map(async (purchase) => {
        const parsedItems = JSON.parse(purchase.items || '[]');
        const enrichedItems = await Promise.all(
          parsedItems.map(async (item) => {
            const itemDetails = await Item.findByPk(item.itemId, {
              attributes: ['id', 'name', 'unit'],
            });
            return {
              ...item,
              name: itemDetails?.name || null,
              unit: itemDetails?.unit || null,
            };
          })
        );
        const plainPurchase = purchase.get({plain : true})
        return {
          ...plainPurchase,
          items: enrichedItems, 
        };
      })
    );
    res.json(enrichedPurchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.purchaseReport = async (req, res) => {
  const { startDate, endDate } = req.body;
  try {
    const purchases = await Purchase.findAll({
      where: {
        purchaseDate: {
          [Op.between]: [new Date(startDate), new Date(endDate)],
        },
      },
          include: [
        {
          model: Customer,
          attributes: ['id', 'name'], 
        },]
    });
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}