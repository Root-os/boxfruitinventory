const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Sales = sequelize.define('Sales', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
      customerId: {
      type: DataTypes.INTEGER,
    allowNull: false,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    amount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      unpaid: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      shopId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }
  });

  return Sales;
};
