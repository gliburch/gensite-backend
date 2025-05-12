import mongoose from 'mongoose'

const currentYear = new Date().getFullYear()

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false
  },
  birthYear: {
    type: Number,
    required: false,
    min: [1900, '출생년도는 1900년 이후여야 합니다.'],
    max: [currentYear, '출생년도는 현재 연도보다 클 수 없습니다.'],
    validate: {
      validator: Number.isInteger,
      message: '출생년도는 정수여야 합니다.'
    }
  },
  gender: {
    type: String,
    required: false,
    enum: {
      values: ['male', 'female', 'other'],
      message: '성별은 male, female, other 중 하나여야 합니다.'
    }
  },
  region: {
    type: String,
    required: false,
    // 표준법정동코드: https://www.code.go.kr/stdcode/regCodeL.do
    validate: {
      validator: function(v) {
        return /^\d{10}$/.test(v)
      },
      message: '표준법정동코드는 10자리 숫자여야 합니다.'
    }
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
})

// 인덱스 생성
userSchema.index({ region: 1 })
userSchema.index({ birthYear: 1 })  // 생년 기반 검색을 위한 인덱스

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User 