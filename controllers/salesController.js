const { Sales, Customer, Item, Shop, User, ShopInventory } = require('../models');

exports.createSale = async (req, res) => {
  try {
    const { customerId, items, unpaid, shopId, userId, customerName } = req.body;

    let totalPrice = 0;
    let totalItems = 0;

    
    for (const item of items) {
      const { itemId, quantity: itemQty, price: itemPrice } = item;

      const doesItemExist = await Item.findByPk(itemId);
      if (!doesItemExist) return res.status(404).json({ message: 'Item not found' });

      const shopInventory = await ShopInventory.findOne({ where: { itemId, shopId } });


      if (!shopInventory || shopInventory.quantity < itemQty) {
        return res.status(400).json({ message: 'Not enough stock in shop inventory' });
      }

      totalPrice += itemPrice * itemQty;
      shopInventory.quantity -= itemQty;
      await shopInventory.save();
      totalItems += 1
    }

    
    const sale = await Sales.create({
      customerId,
      items,
      quantity : totalItems,
      price: totalPrice,
      customerName,
      unpaid,
      shopId,
      userId,
    });

    
    const [customer, shop, user] = await Promise.all([
      Customer.findByPk(customerId, { attributes: ['id', 'name'] }),
      Shop.findByPk(shopId, { attributes: ['id', 'name'] }),
      User.findByPk(userId, { attributes: ['id', 'fullName', 'username'] }),
    ]);

    
    const enrichedItems = await Promise.all(
      sale.items.map(async (item) => {
        const itemDetails = await Item.findByPk(item.itemId, {
          attributes: ['id', 'name', 'unit'],
        });
        return {
          ...item,
          itemDetails,
        };
      })
    );

    res.status(201).json({
      message: 'Sale recorded successfully',
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
        { model: Customer, as: 'customer', attributes: ['id', 'name'] },
        { model: Shop, as: 'shop', attributes: ['id', 'name'] },
        { model: User, as: 'user', attributes: ['id', 'fullName'] },
      ],
      order: [['createdAt', 'DESC']],
    });

    const enrichedSales = await Promise.all(
      sales.map(async (sale) => {
        const parsedItem = JSON.parse(sale.items || '[]');
        const enrichedItem = await Promise.all(
          parsedItem.map(async (item) => {
            const itemDetails = await Item.findByPk(item.itemId, {
              attributes: ['id', 'name', 'unit'],
            });
            return {
              ...item,
              name: itemDetails?.name || null,
              unit: itemDetails?.unit || null,
            };
          })
        )
        const plainSale = sale.get({ plain: true })
        return {
          ...plainSale,
          items: enrichedItem
        }
      })
    )


    res.json(enrichedSales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


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
