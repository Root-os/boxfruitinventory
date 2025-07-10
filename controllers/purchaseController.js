const { Purchase, Customer, Item } = require('../models');

exports.makePurchase = async (req, res) => {
  try {
    /**
     * *npm
     * item must be sent like this 
     * [
     *    {
     *      itemId : 1,
     *      quantity : 10
     *    },
     *     {
     *      itemId : 2,
     *      quantity : 20
     *     } 
     * ]
     */
    const { customerId, items, unit, cost, description, totalPrice } = req.body;
    let counter = 0;
    let totalPriceComputed = 0
    for (const item in items) {
      const { itemId, quantity, price } = items[item];
      const doesItemExist = await Item.findByPk(itemId);
  
      if (!doesItemExist) {
        return res.status(500).json({ error : "Item doesn't exist!"})
      }
      doesItemExist.quantity += quantity;
      doesItemExist.price = price
      await doesItemExist.save();
      totalPriceComputed += doesItemExist.price * quantity
      counter += 1
    }
     let newPurchase = await Purchase.create({
      customerId,
      items,
      quantity : counter,
      unit,
      cost,
      description,
      totalPrice : totalPriceComputed,
      purchaseDate: new Date(),
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
  const id = req.params.id
  
  const doesPurchaseExist = await Purchase.findOne({
    where: {
      id : id
    }
  })
  if (!doesPurchaseExist) {
    return res.status(500).json({ error : "Purchase doesn't exist!"})
  }
  const updatedPurchase = await Purchase.updateOne(req.body, {
    where: {
      id : id
    },
    include: [
      { model: Customer, attributes: ['id', 'name', 'phone'] },
      { model: Item, attributes: ['id', 'name', 'price', 'unit'] },
    ]
  })
  res.status(201).json({
    message: 'Purchase updated successfully!',
    purchase: updatedPurchase,
  });
}

exports.getAllPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.findAll({
      include: [
        { model: Customer, attributes: ['id', 'name'] },
      ],
      order: [['purchaseDate', 'DESC']],
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
