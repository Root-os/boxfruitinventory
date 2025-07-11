const Damage = require("../models/damageModel");
const ShopInventory = require("../models/storeInvetory");
exports.createDamage = async (req, res) => {
    try {
        const { itemId, shopId, quantity, reason } = req.body
        const findShopInventoryForShop = await ShopInventory.findOne({
            where: { shopId, itemId }, include: {
                model: Item,
                attributes: ['name']
        } })
        if (!findShopInventoryForShop) {
            return res.status(404).json({ message: "Item not found in shop inventory" })
        }
        ShopInventory.quantity -= quantity
        await ShopInventory.save()
        const damage = await Damage.create({ itemId, shopId, quantity, reason })
        res.status(201).json({
            message: `Damage created successfully for ${findShopInventoryForShop.Item.name}`,
            damage
        })
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}
exports.getDamgeByShopId = async (req, res) => {
    try {
        const { shopId } = req.params
        const findAllDamagesPerShop = await Damage.findAll({ where: { shopId } })
        res.status(200).json(findAllDamagesPerShop)
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}