module.exports = (sequelize, DataTypes) => {
  const Pricing = sequelize.define("Pricing", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    shopId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    itemId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unit: {
      type: DataTypes.STRING(50), // e.g., "kg", "pcs", "liters"
      allowNull: false,
      defaultValue: "pcs",
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
      },
    },
  });
  return Pricing;
};
