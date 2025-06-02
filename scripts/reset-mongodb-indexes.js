import mongoose from 'mongoose';
import * as dotenv from 'dotenv';

dotenv.config();

async function resetIndexes() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.MONGODB_DB
    });
    
    // 모든 컬렉션의 인덱스 삭제
    const collections = ['vectors', 'messages', 'users', 'analyses'];
    
    for (const collectionName of collections) {
      const collection = mongoose.connection.collection(collectionName);
      try {
        await collection.dropIndexes();
        console.log(`✓ Dropped all indexes from ${collectionName}`);
      } catch (err) {
        if (err.code === 26) {
          console.log(`- Collection ${collectionName} does not exist, skipping`);
        } else {
          console.error(`✗ Error dropping indexes from ${collectionName}:`, err);
        }
      }
    }
    
    console.log('\nAll indexes dropped successfully');
    console.log('You can now restart the application to recreate indexes\n');
    
  } catch (error) {
    console.error('Failed to reset indexes:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

resetIndexes(); 