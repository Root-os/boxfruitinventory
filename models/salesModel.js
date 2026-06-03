module.exports = (sequlize, DataTypes) => {
  const Sales = sequlize.define(
    "Sales",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      customerId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      customerName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      items: {
        type: DataTypes.JSON,
        validate: {
          isValidItemArray(value) {
            if (!Array.isArray(value)) {
              throw new Error("itemId must be an array of objects");
            }
            for (const item of value) {
              if (
                typeof item !== "object" ||
                typeof item.itemId !== "number" ||
                typeof item.quantity !== "number" ||
                typeof item.price !== "number" ||
                typeof item.unit !== "string"
              ) {
                throw new Error(
                  'Each item must have a number "itemId" and a number "quantity"',
                );
              }
            }
          },
        },
      },
      quantity: {
        type: DataTypes.INTEGER,
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
      },
      paymentMethodId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    { timestamps: true },
  );

  return Sales;
};
