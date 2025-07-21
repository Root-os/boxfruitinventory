const { Expense, Shop } = require('../models');


exports.createExpense = async (req, res) => {
  try {
    const { name, description, amount, date, shopId } = req.body;

    // Only check for shop if shopId is provided
    if (shopId) {
      const shop = await Shop.findByPk(shopId);
      if (!shop) {
        return res.status(404).json({ message: 'Shop not found' });
      }
    }

    const expense = await Expense.create({
      name,
      description,
      amount,
      date,
      shopId: shopId || null, // optional: set null explicitly if not provided
    });

    res.status(201).json({
      message: 'Expense created successfully',
      expense,
    });
  } catch (err) {
    const isDuplicate = err.name === 'SequelizeUniqueConstraintError';
    res.status(isDuplicate ? 400 : 500).json({
      message: isDuplicate ? 'Description must be unique' : err.message,
    });
  }
};



exports.getAllExpenses = async (req, res) => {
  try {
    const expenses = await Expense.findAll({
      include: {
        model: Shop,
        as: 'shop',
        attributes: ['id', 'name'],
      },
      order: [['createdAt', 'DESC']],
    });

    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id, {
      include: {
        model: Shop,
        as: 'shop',
        attributes: ['id', 'name'],
      },
    });

    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    res.json(expense);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.updateExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    const allowedFields = ['name', 'description', 'amount', 'date', 'shopId'];
    const fieldsToUpdate = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        fieldsToUpdate[field] = req.body[field];
      }
    }

    
    if (fieldsToUpdate.shopId) {
      const shop = await Shop.findByPk(fieldsToUpdate.shopId);
      if (!shop) return res.status(400).json({ message: 'Invalid shopId' });
    }

    await expense.update(fieldsToUpdate);

    res.json({ message: 'Expense updated successfully', expense });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByPk(req.params.id);
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    await expense.destroy();

    res.json({ message: 'Expense deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
