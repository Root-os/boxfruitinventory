const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Shop = sequelize.define('Shop', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    salesmanId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  Shop.associate = (models) => {
    Shop.belongsTo(models.User, {
      foreignKey: 'salesmanId',
      as: 'salesman',
    });
  };

  return Shop;
};
