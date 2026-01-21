require("dotenv").config();
const http = require('http');

const { sequelize } = require("../models");

const app = require("../routes");

const server = http.createServer(app);

const PORT = process.env.PORT || 3000;

(async () => {
    try {
        await sequelize.authenticate();
        console.log("✅ PostgreSQL connected");

        // await sequelize.sync({ alter: true, force: true });
        await sequelize.sync();
        console.log("✅ Models synced");

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error("❌ Unable to start server:", err);
        process.exit(1);
    }
})();
