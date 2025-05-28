import mongoose from 'mongoose'

const analysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  analysis: {
    type: mongoose.Schema.Types.Mixed,
    required: true
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
  versionKey: false,
  collection: 'analyses' // mongoose에서 기본적으로 복수형 변환을 지원하나, analysis의 올바른 복수형(analyses)을 보장하기 위해 명시적으로 컬렉션명 지정
})

const Analysis = mongoose.models.Analysis || mongoose.model('Analysis', analysisSchema)

export default Analysis 