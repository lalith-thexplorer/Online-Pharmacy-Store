
const { MongoClient } = require('mongodb');

const uri = 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function getDb() {
  await client.connect();
  return client.db('pharmacy');
}

module.exports = getDb;
