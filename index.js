const express = require('express');
require('dotenv').config();
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const db = require('./models');
const userRoutes = require('./routes/userRoutes');
const shopRoutes = require('./routes/shopRoutes');
const customerRoutes = require('./routes/customerRoutes');
const purchaseRoutes = require('./routes/purchaseRoutes');
const itemRoutes = require('./routes/itemRoutes');
const shopInventoryRoutes = require('./routes/shopeInventorry');
const expenseRoutes = require('./routes/expenseRoutes');
const salesRoutes = require('./routes/salesRoutes');


const app = express();

// ✅ Middlewares
app.use(helmet()); // Security headers
app.use(cors({ origin: '*', credentials: true })); // Adjust origin as needed
app.use(compression()); // Gzip compression
app.use(express.json()); // Parse JSON



// ✅ Routes

require('./config/swagger')(app)

app.use('/api/items', itemRoutes);

app.use('/api/customers', customerRoutes);
app.use('/api/users', userRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/shop-inventory', shopInventoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/sales', salesRoutes);

// ✅ Sync DB
db.sequelize.sync({ force: false })
  .then(() => {
    console.log('Database synced successfully.');
  })
  .catch((err) => {
    console.error('DB sync error:', err);
  });

// ✅ Start server
const PORT=process.env.PORT|| 3006;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
