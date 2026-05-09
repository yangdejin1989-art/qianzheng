const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const sourceUri = process.env.LOCAL_MONGO_URI || 'mongodb://localhost:27017/visa-system';
const targetUri = process.env.MONGO_URI;

const skipCollections = new Set([
  'admins',
  'emailverifications'
]);

async function copyCollection(sourceDb, targetDb, collectionName) {
  const sourceCollection = sourceDb.collection(collectionName);
  const targetCollection = targetDb.collection(collectionName);
  const docs = await sourceCollection.find({}).toArray();

  if (docs.length === 0) {
    console.log(`- ${collectionName}: 0 documents`);
    return;
  }

  const operations = docs.map((doc) => ({
    replaceOne: {
      filter: { _id: doc._id },
      replacement: doc,
      upsert: true
    }
  }));

  const result = await targetCollection.bulkWrite(operations, { ordered: false });
  console.log(
    `- ${collectionName}: ${docs.length} copied, ` +
    `${result.upsertedCount || 0} inserted, ${result.modifiedCount || 0} updated`
  );
}

async function main() {
  if (!targetUri) {
    throw new Error('MONGO_URI is missing. Please set it in server/.env first.');
  }

  if (targetUri.includes('localhost') || targetUri.includes('127.0.0.1')) {
    throw new Error('MONGO_URI must be the Atlas connection string, not localhost.');
  }

  console.log('Source:', sourceUri);
  console.log('Target:', targetUri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'));

  const source = await mongoose.createConnection(sourceUri).asPromise();
  const target = await mongoose.createConnection(targetUri).asPromise();

  try {
    const collections = await source.db.listCollections().toArray();

    for (const collection of collections) {
      if (skipCollections.has(collection.name)) {
        console.log(`- ${collection.name}: skipped`);
        continue;
      }

      await copyCollection(source.db, target.db, collection.name);
    }

    console.log('Migration finished.');
  } finally {
    await source.close();
    await target.close();
  }
}

main().catch((error) => {
  console.error('Migration failed:', error.message);
  process.exit(1);
});
