module.exports = (sequelize, DataTypes) => {
  const ShopInventory = sequelize.define('ShopInventory', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    minStockQuantity: {
      type: DataTypes.INTEGER,
      valdiate: {
        min : 1
      }
    }
  });

  return ShopInventory;
};
