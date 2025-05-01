import mongoose from 'mongoose'

// Define Vector Schema
const VectorSchema = new mongoose.Schema({
  aiName: String,
  text: String,
  embedding: {
    type: [Number],
    required: true,
    index: {
      name: 'embedding_index',
      type: 'vectorSearch',
      vectorOptions: {
        dimensions: 1024,
        similarity: 'cosine'
      }
    }
  },
  embeddingModel: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  versionKey: false // Disable the __v field
});

// Create and export the model
const Vector = mongoose.models.Vector || mongoose.model('Vector', VectorSchema, 'vectors')

export default Vector 