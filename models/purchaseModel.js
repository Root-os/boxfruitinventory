const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const Purchase = sequelize.define('Purchase', {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users', 
        key: 'id',
      }
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'Customers', 
        key: 'id',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    items: {
      type: DataTypes.JSON, 
      allowNull: false,
      validate: {
        isValidItemArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('itemId must be an array of objects');
          }

          for (const item of value) {
            if (
              typeof item !== 'object' ||
              typeof item.itemId !== 'number' ||
              typeof item.quantity !== 'number'||
              typeof item.price !== 'number'
            ) {
              throw new Error(
                'Each item must have a string "itemId" and a number "quantity"'
              );
            }
          }
        },
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    totalPrice: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    cost: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    paid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    unpaid: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  });

  return Purchase;
};
