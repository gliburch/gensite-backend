import mongoose from 'mongoose'

// Define Vector Schema
const VectorSchema = new mongoose.Schema({
  aiKey: {
    type: String,
    required: true,
    index: true
  },
  text: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true
  },
  embeddingModel: {
    type: String,
    required: true
  },
  createdAt: { 
    type: Date, 
    default: Date.now
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
}, {
  versionKey: false // Disable the __v field
});

// 복합 인덱스 필요한 경우 추가
VectorSchema.index({ aiKey: 1, embedding: 1 });

// Create and export the model
const Vector = mongoose.models.Vector || mongoose.model('Vector', VectorSchema, 'vectors')

export default Vector 