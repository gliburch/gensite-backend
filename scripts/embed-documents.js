import * as dotenv from 'dotenv';
dotenv.config();

import { MongoClient } from 'mongodb';
import { VoyageAIClient } from 'voyageai';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = 'lucky-beach';
const MONGODB_COLLECTION = 'vectors';
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const VOYAGE_MODEL = 'voyage-3';
const BATCH_SIZE = 10; // Number of documents to embed in a single API call

// Make sure we have necessary environment variables
if (!MONGODB_URI) {
  console.error('MONGODB_URI is required in .env file');
  process.exit(1);
}

if (!VOYAGE_API_KEY) {
  console.error('VOYAGE_API_KEY is required in .env file');
  process.exit(1);
}

// Initialize Voyage AI client
const voyage = new VoyageAIClient({
  apiKey: VOYAGE_API_KEY
});

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('Connected to MongoDB');
    return client;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

// Generate embeddings using Voyage AI
async function generateEmbeddings(texts) {
  try {
    console.log(`Generating embeddings for ${texts.length} texts...`);
    
    const response = await voyage.embed({
      model: VOYAGE_MODEL,
      input: texts
    });
    return response.data.map(item => item.embedding);
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

// Process documents in batches
async function processBatch(documents, db) {
  const collection = db.collection(MONGODB_COLLECTION);
  const batches = [];
  
  // Split documents into batches
  for (let i = 0; i < documents.length; i += BATCH_SIZE) {
    batches.push(documents.slice(i, i + BATCH_SIZE));
  }
  
  let processedCount = 0;
  
  // Process each batch
  for (const [batchIndex, batch] of batches.entries()) {
    try {
      console.log(`Processing batch ${batchIndex + 1}/${batches.length}...`);
      
      // Extract text for embedding
      const texts = batch;
      
      // Generate embeddings
      const embeddings = await generateEmbeddings(texts);
      
      // Prepare documents with embeddings for MongoDB
      const embeddedDocs = batch.map((text, index) => ({
        text: text,
        embedding: embeddings[index],
        embeddingModel: VOYAGE_MODEL,
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      console.log({embeddedDocs});
      
      // Store in MongoDB
      await collection.insertMany(embeddedDocs);
      
      processedCount += batch.length;
      console.log(`Processed ${processedCount}/${documents.length} documents`);
      
      // Sleep a bit to avoid rate limiting
      if (batchIndex < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error(`Error processing batch ${batchIndex + 1}:`, error);
      // Continue with next batch
    }
  }
  
  return processedCount;
}

// Main function
async function main() {
  let mongoClient;
  
  try {
    // Import AI configuration with documents
    const aiModulePath = path.resolve(__dirname, '../ai.lucky-beach.js');
    
    // Check if file exists
    try {
      await fs.access(aiModulePath);
    } catch (error) {
      console.error(`AI configuration file does not exist at ${aiModulePath}`);
      process.exit(1);
    }
    
    // Import module
    const aiModule = await import(aiModulePath);
    const config = aiModule.default;
    
    if (!config || !config.documents || !Array.isArray(config.documents)) {
      console.error('No valid documents array found in ai.lucky-beach.js');
      return;
    }
    
    const documents = config.documents;
    
    console.log(`Found ${documents.length} documents to process`);
    
    // Connect to MongoDB
    mongoClient = await connectToMongoDB();
    const db = mongoClient.db(MONGODB_DB);
    
    // Process documents
    const processedCount = await processBatch(documents, db);
    
    console.log(`Successfully processed ${processedCount} documents`);
  } catch (error) {
    console.error('Error in main process:', error);
  } finally {
    // Close MongoDB connection
    if (mongoClient) {
      await mongoClient.close();
      console.log('MongoDB connection closed');
    }
  }
}

// Run main function
main().catch(console.error);
