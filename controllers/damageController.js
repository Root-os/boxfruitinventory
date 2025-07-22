const Damage = require("../models/damageModel");
const ShopInventory = require("../models/storeInvetory");

exports.createDamage = async (req, res) => {
    try {
        const { itemId, shopId, quantity, reason } = req.body;

        // Find the shop inventory with the associated Item
        const findShopInventoryForShop = await ShopInventory.findOne({
            where: { shopId, itemId },
            include: [{
                model: Item,
                attributes: ['name']
            }]
        });

        // Check if the inventory exists
        if (!findShopInventoryForShop) {
            return res.status(404).json({ message: "Item not found in shop inventory" });
        }

        // Update the quantity in the shop inventory
        findShopInventoryForShop.quantity -= quantity;
        await findShopInventoryForShop.save();

        // Create the damage record
        const damage = await Damage.create({ itemId, shopId, quantity, reason });

        // Return success response
        res.status(201).json({
            message: `Damage created successfully for ${findShopInventoryForShop.Item.name}`,
            damage
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getDamgeByShopId = async (req, res) => {
    try {
        const { shopId } = req.params
        const findAllDamagesPerShop = await Damage.findAll({ where: { shopId } })
        res.status(200).json(findAllDamagesPerShop)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}