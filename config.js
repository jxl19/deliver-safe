require('dotenv').config();
exports.DATABASE_URL =  process.env.DATABASE_URL ||
                        process.env.MONGODB_URI;

exports.REDIRECT_URL = process.env.REDIRECT_URL;
exports.CLIENT_ID = process.env.CLIENT_ID;
exports.CLIENT_SECRET = process.env.CLIENT_SECRET;

exports.PORT = process.env.PORT || 8000;