const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken')
const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1]
        if (!token) return res.status(403).json({ message: 'Access denied' })
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Session expired!' })
            req.user = decoded
            next()
        })
    } catch (error) {
        next(error)
    }
};
const isAdmin = (req, res, next) => {
    authMiddleware(req, res, () => {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' })
        next()
    })
};

const generateToken = (user) => {
    const token = jwt.sign(user, process.env.JWT_SECRET)
    return token
}

const hashPassword = async (plainPassword) => {
    const genSalt = await bcryptjs.genSalt(10);
    return bcryptjs.hash(plainPassword, genSalt);
}
const comparePassword = async (plainPassword, hashedPassword) => {
    return bcryptjs.compare(plainPassword, hashedPassword);
}
const deleteObject = (object, keys) => {
    const plainObject = object.get({ plain: true });
    console.log(plainObject)
    for (const key in keys) {
        if(plainObject.hasOwnProperty(key)) {
            delete plainObject[key]
        }
    }
    return plainObject
}
module.exports = {
    authMiddleware,
    isAdmin,
    generateToken,
    hashPassword,
    comparePassword,
    deleteObject
}