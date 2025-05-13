import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  aiKey: {
    type: String,
    required: true,
    index: true
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'assistant']
  },
  content: {
    mood: {
      type: String,
      required: false
    },
    text: {
      type: String,
      required: true
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  versionKey: false // Disable the __v field
});

// 인덱스 생성
messageSchema.index({ userId: 1, aiKey: 1 })

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema)

export default Message 