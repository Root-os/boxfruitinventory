const { DataTypes } = require("sequelize");

const PaymentMethod = (sequelize) => {
  const PaymentMethod = sequelize.define("PaymentMethod", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  });
  return PaymentMethod;
};
module.exports = PaymentMethod;
