module.exports = (sequelize, DataTypes) => {
    const Damage = sequelize.define('Damage', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        itemId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Items',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        shopId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Shops',
                key: 'id',
            },
            onDelete: 'CASCADE',
            onUpdate: 'CASCADE',
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: false,
            validate: {
                min : 0
            }
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    })
    return Damage
}