const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const basename = path.basename(__filename);
const db = {};

// Load all models dynamically
fs.readdirSync(__dirname)
  .filter(file => file !== basename && file.endsWith('.js'))
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });

// Run associate() methods
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Manual associations (if needed)
if (db.Customer && db.Item && db.Purchase) {
  db.Customer.hasMany(db.Purchase, { foreignKey: 'customerId' });
  db.Purchase.belongsTo(db.Customer, { foreignKey: 'customerId' });

  // db.Item.hasMany(db.Purchase, { foreignKey: 'itemId' });
  // db.Purchase.belongsTo(db.Item, { foreignKey: 'itemId' });
}

if (db.Shop && db.ShopInventory) {
  db.Shop.hasMany(db.ShopInventory, { foreignKey: 'shopId' });
  db.ShopInventory.belongsTo(db.Shop, { foreignKey: 'shopId' });
}

// if (db.Purchase && db.ShopInventory) {
//   db.Purchase.hasMany(db.ShopInventory, { foreignKey: 'purchaseId' });
//   db.ShopInventory.belongsTo(db.Purchase, { foreignKey: 'purchaseId' });
// }

if (db.Item && db.ShopInventory) {
  db.Item.hasMany(db.ShopInventory, { foreignKey: 'itemId' });
  db.ShopInventory.belongsTo(db.Item, { foreignKey: 'itemId' });
}

if (db.Customer && db.Sales) {
  db.Customer.hasMany(db.Sales, { foreignKey: 'customerId' });
  db.Sales.belongsTo(db.Customer, { foreignKey: 'customerId', as: 'customer' });
}

// if (db.Item && db.Sales) {
//   db.Item.hasMany(db.Sales, { foreignKey: 'itemId' });
//   db.Sales.belongsTo(db.Item, { foreignKey: 'itemId', as: 'item' });
// }

if (db.Shop && db.Sales) {
  db.Shop.hasMany(db.Sales, { foreignKey: 'shopId' });
  db.Sales.belongsTo(db.Shop, { foreignKey: 'shopId', as: 'shop' });
}

if (db.User && db.Sales) {
  db.User.hasMany(db.Sales, { foreignKey: 'userId' });
  db.Sales.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
}
if (db.Shop && db.Expense) {
  db.Shop.hasMany(db.Expense, { foreignKey: 'shopId' });
  db.Expense.belongsTo(db.Shop, { foreignKey: 'shopId', as: 'shop' });
}
if (db.Damage && db.Item && db.Shop) {
  db.Item.hasMany(db.Damage, { foreignKey: 'itemId' });
  db.Damage.belongsTo(db.Item, { foreignKey: 'itemId', as: 'item' });
  db.Shop.hasMany(db.Damage, { foreignKey: 'shopId' });
  db.Damage.belongsTo(db.Shop, { foreignKey: 'shopId', as: 'shop' });
}



db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
