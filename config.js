require('dotenv').config();
exports.DATABASE_URL =  process.env.DATABASE_URL ||
                        process.env.MONGODB_URI ||
                        'mongodb://localhost/safedeliver' ||
                        'mongodb://jylei:pass123@ds137611.mlab.com:37611/safedeliver';

exports.CLIENT_ID = process.env.CLIENT_ID;
exports.CLIENT_SECRET = process.env.CLIENT_SECRET;

exports.PORT = process.env.PORT || 8000;