import mongoose from 'mongoose'

// Define Vector Schema
const VectorSchema = new mongoose.Schema({
  aiKey: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  embedding: {
    type: [Number],
    required: true,
    index: {
      name: 'embedding_index',
      type: 'vectorSearch',
      vectorOptions: {
        dimensions: 1024,
        similarity: 'cosine',
        numCandidates: 100,
        efConstruction: 128,
        efSearch: 100
      }
    }
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

// aiKey와 embedding을 함께 사용하는 복합 인덱스 추가
VectorSchema.index({ aiKey: 1, embedding: 1 });

// Create and export the model
const Vector = mongoose.models.Vector || mongoose.model('Vector', VectorSchema, 'vectors')

export default Vector 