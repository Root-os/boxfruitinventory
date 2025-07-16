const { User, Shop } = require('../models');
const { generateToken, hashPassword, comparePassword, deleteObject } = require('../utils/auth');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new user
// Create new user
exports.createUser = async (req, res) => {
  try {
    const { username, password, role, fullName } = req.body;
    const hashedPassword = await hashPassword(password);
    const newUser = await User.create({ username, password : hashedPassword, role, fullName });
    res.status(201).json(
      deleteObject(newUser, { password }),
    )
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { username, password, role, fullName } = req.body;
        const hashedPassword = await hashPassword(password);
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.update({ username, hashedPassword, role, fullName });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    await user.destroy();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: 'Username and password are required' });
    const doesUserExist = await User.findOne({ where: { username } });
    if (!doesUserExist) return res.status(404).json({ message: 'User not found' });
    const isPasswordCorrect = await comparePassword(password, doesUserExist.password);
    if (!isPasswordCorrect) return res.status(401).json({ message: 'Invalid credentials' });
    let shopId = null
    if (doesUserExist.role === 'salesman') {
        shopId = await Shop.findOne({ where: { salesmanId: doesUserExist.id }, attributes: ['id', 'name'] });
    }
    const token = generateToken({ id: doesUserExist.id, role: doesUserExist.role, fullName : doesUserExist.fullName,shopId });
    res.json({ 
      ...deleteObject(doesUserExist, { password }),
      shopId,
      token
     });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}