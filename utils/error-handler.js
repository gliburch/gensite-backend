/**
 * Mongoose ValidationError를 API 응답 형식으로 변환
 * @param {Error} error - Mongoose 에러 객체
 * @returns {{code: number, body: Object}} 상태 코드와 응답 본문
 */
export function handleMongooseError(error) {
  // Validation 에러 처리
  if (error.name === 'ValidationError') {
    return {
      code: 400,
      body: {
        error: 'Validation error',
        details: Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }))
      }
    }
  }

  // 기타 Mongoose 관련 에러들도 추가 가능
  // 예: Duplicate key error (code 11000)
  if (error.code === 11000) {
    return {
      code: 409,
      body: {
        error: 'Duplicate key error',
        details: error.keyValue
      }
    }
  }

  // 기본 서버 에러
  return {
    code: 500,
    body: {
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    }
  }
} 