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

  db.Item.hasMany(db.Purchase, { foreignKey: 'itemId' });
  db.Purchase.belongsTo(db.Item, { foreignKey: 'itemId' });
}

if (db.Shop && db.ShopInventory) {
  db.Shop.hasMany(db.ShopInventory, { foreignKey: 'shopId' });
  db.ShopInventory.belongsTo(db.Shop, { foreignKey: 'shopId' });
}

if (db.Purchase && db.ShopInventory) {
  db.Purchase.hasMany(db.ShopInventory, { foreignKey: 'purchaseId' });
  db.ShopInventory.belongsTo(db.Purchase, { foreignKey: 'purchaseId' });
}

if (db.Item && db.ShopInventory) {
  db.Item.hasMany(db.ShopInventory, { foreignKey: 'itemId' });
  db.ShopInventory.belongsTo(db.Item, { foreignKey: 'itemId' });
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
