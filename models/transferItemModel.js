module.exports = (sequelize, DataTypes) => {
  const InventoryTransfer = sequelize.define("InventoryTransfer", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    fromShopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    toShopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });
  return InventoryTransfer;
};
