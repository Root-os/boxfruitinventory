const { PaymentMethod } = require('../models');

// Create
exports.createPaymentMethod = async (req, res) => {
  try {
    const { name } = req.body;

    const paymentMethod = await PaymentMethod.create({ name });

    res.status(201).json(paymentMethod);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get All
exports.getAllPaymentMethods = async (req, res) => {
  try {
    const paymentMethods = await PaymentMethod.findAll();
    res.status(200).json(paymentMethods);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get One
exports.getPaymentMethodById = async (req, res) => {
  try {
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findByPk(id);

    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    res.status(200).json(paymentMethod);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update
exports.updatePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const paymentMethod = await PaymentMethod.findByPk(id);

    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    await paymentMethod.update({ name });

    res.status(200).json(paymentMethod);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete
exports.deletePaymentMethod = async (req, res) => {
  try {
    const { id } = req.params;

    const paymentMethod = await PaymentMethod.findByPk(id);

    if (!paymentMethod) {
      return res.status(404).json({ message: "Payment method not found" });
    }

    await paymentMethod.destroy();

    res.status(200).json({ message: "Payment method deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};