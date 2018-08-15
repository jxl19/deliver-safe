require('dotenv').config();
exports.DATABASE_URL =  process.env.DATABASE_URL ||
                        process.env.MONGODB_URI;

exports.REDIRECT_URL = process.env.REDIRECT_URL;
exports.CLIENT_ID = process.env.CLIENT_ID;
exports.CLIENT_SECRET = process.env.CLIENT_SECRET;
exports.GOOGLE_APIKEY = process.env.GOOGLE_APIKEY;
exports.BASE_URL = process.env.BASE_URL || "http://localhost:8000";
exports.JWT_SECRET = "secretkey";
exports.PORT = process.env.PORT || 8000;