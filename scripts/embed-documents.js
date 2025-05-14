import * as dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { VoyageAIClient } from 'voyageai';
import Vector from '../models/Vector.js';

// Import AI configurations
import luckyBeach from '../ai.lucky-beach.js'
import mbtiCounsel from '../ai.mbti-counsel.js'
import peoplePowerParty from '../ai.people-power-party.js'
import reformParty from '../ai.reform-party.js'
import theMinjooParty from '../ai.the-minjoo-party.js'

const AI_KEY = process.env.AI_KEY;
const AI_EMBEDDINGS = {
  'luckyBeach': luckyBeach.EMBEDDING,
  'mbtiCounsel': mbtiCounsel.EMBEDDING,
  'peoplePowerParty': peoplePowerParty.EMBEDDING,
  'reformParty': reformParty.EMBEDDING,
  'theMinjooParty': theMinjooParty.EMBEDDING,
}
const embeddingModel = AI_EMBEDDINGS[AI_KEY].MODEL;
const embeddingDocuments = AI_EMBEDDINGS[AI_KEY].DOCUMENTS;

// Configuration
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;
const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;
const VOYAGE_MODEL = embeddingModel;
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

// Connect to MongoDB with Mongoose
async function connectToMongoose() {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: MONGODB_DB
    });
    console.log('Connected to MongoDB with Mongoose');
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB with Mongoose:', error);
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
async function processBatch(documents) {
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
        aiKey: AI_KEY,
        text: text,
        embedding: embeddings[index],
        embeddingModel: VOYAGE_MODEL,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      // Store in MongoDB using Mongoose
      await Vector.insertMany(embeddedDocs);
      
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
  try {
    
    const documents = embeddingDocuments;
    
    console.log(`Found ${documents.length} documents to process`);
    
    // Connect to MongoDB
    await connectToMongoose();

    // Delete existing vectors for this AI_KEY before inserting new ones
    await Vector.deleteMany({ aiKey: AI_KEY });
    console.log(`Deleted existing vectors for aiKey: ${AI_KEY}`);
    
    // Process documents
    const processedCount = await processBatch(documents);
    
    console.log(`Successfully processed ${processedCount} documents`);
  } catch (error) {
    console.error('Error in main process:', error);
  } finally {
    // Close MongoDB connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect();
      console.log('MongoDB connection closed');
    }
  }
}

// Run main function
main().catch(console.error);
