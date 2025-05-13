import * as dotenv from 'dotenv'
dotenv.config()

// Import dependencies
import Fastify from 'fastify'
import cors from '@fastify/cors'
import mongoose from 'mongoose'
import { handleMongooseError } from './utils/error-handler.js'
import Anthropic from '@anthropic-ai/sdk'
import { VoyageAIClient } from 'voyageai'

// Import models
import Vector from './models/Vector.js'
import User from './models/User.js'
import Message from './models/Message.js'

// Import AI configurations
import luckyBeach from './ai.lucky-beach.js'
import mbtiCounsel from './ai.mbti-counsel.js'
import theMinjooParty from './ai.the-minjoo-party.js'
import peoplePowerParty from './ai.people-power-party.js'
import reformParty from './ai.reform-party.js'

const AI_CONFIGS = {
  'luckyBeach': luckyBeach.CONFIG,
  'mbtiCounsel': mbtiCounsel.CONFIG,
  'theMinjooParty': theMinjooParty.CONFIG,
  'peoplePowerParty': peoplePowerParty.CONFIG,
  'reformParty': reformParty.CONFIG,
}

const voyage = new VoyageAIClient({
  apiKey: process.env.VOYAGE_API_KEY
})

// Connect to MongoDB with Mongoose
async function connectToMongoose() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'lucky-beach'
    })
    console.log('Connected to MongoDB with Mongoose')
    return true
  } catch (error) {
    console.error('Failed to connect to MongoDB with Mongoose:', error)
    return false
  }
}

// Connect to MongoDB on startup
connectToMongoose()

// Vector search function
async function searchVectorDB(query, aiKey, limit = 3) {
  try {
    // Get last message text from query
    const lastMessage = query[query.length - 1]
    if (!lastMessage || !lastMessage.content || lastMessage.role !== 'user') {
      return []
    }
    
    const userMessage = lastMessage.content
    
    // 쿼리 임베딩 - Query embedding using Voyage AI
    const embedResponse = await voyage.embed({
      model: 'voyage-3',
      input: [userMessage]
    })
    
    const queryEmbd = embedResponse.data[0].embedding
    
    // Get all documents from MongoDB
    const documents = await Vector.find({ aiKey }, { text: 1, embedding: 1, _id: 0 }).lean()
    
    // Calculate cosine similarities
    const similarities = []
    for (const doc of documents) {
      // Calculate dot product
      let dotProduct = 0
      let magnitudeA = 0
      let magnitudeB = 0
      
      for (let i = 0; i < queryEmbd.length; i++) {
        dotProduct += queryEmbd[i] * doc.embedding[i]
        magnitudeA += queryEmbd[i] * queryEmbd[i]
        magnitudeB += doc.embedding[i] * doc.embedding[i]
      }
      
      magnitudeA = Math.sqrt(magnitudeA)
      magnitudeB = Math.sqrt(magnitudeB)
      
      const similarity = dotProduct / (magnitudeA * magnitudeB)
      
      similarities.push({
        text: doc.text,
        score: similarity
      })
    }
    
    // Sort by similarity (highest first)
    similarities.sort((a, b) => b.score - a.score)
    
    // Return top results
    return similarities.slice(0, limit)
  } catch (error) {
    console.error('Error searching vector DB:', error)
    return []
  }
}

const fastify = Fastify({
  logger: true
})

// CORS
await fastify.register(cors, {
  origin: process.env.NODE_ENV === 'development'
    ? true // Allow all origins in development 
    : process.env.CORS_ORIGIN.split(','), // Restrict in production
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
  credentials: true,
  preflight: true,
  preflightContinue: true
})

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Helper function to send SSE message
const sendSSE = (reply, event, data) => {
  reply.raw.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

// Routes
fastify.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})

// User creation endpoint
fastify.post('/users', async function handler (request, reply) {
  try {
    const user = await User.create(request.body)
    return reply.code(201).send(user)
  } catch (error) {
    const { code, body } = handleMongooseError(error)
    return reply.code(code).send(body)
  }
})

// Generic message handler for all AI configurations
fastify.post('/messages', async function handler (request, reply) {
  const {
    userId,
    aiKey,
    aiResourceName,
    messages,
    messagesNew
  } = request.body

  const aiConfig = AI_CONFIGS[aiKey]
  const { MODEL, TEMPERATURE, MAX_TOKENS, SYSTEM, STREAM } = aiConfig

  if (!aiConfig) {
    reply.code(404).send({ error: `AI configuration '${aiKey}' not found` })
    return
  }

  // 요청 본문 유효성 검사
  if (!messages || !Array.isArray(messages)) {
    return reply.code(400).send({ error: 'messages array is required' })
  }

  if (!messagesNew || !Array.isArray(messagesNew)) {
    return reply.code(400).send({ error: 'messagesNew array is required' })
  }

  // 메시지 형식 검증
  const isValidMessage = (msg) => msg && 
    typeof msg === 'object' && 
    typeof msg.role === 'string' && 
    msg.content && 
    typeof msg.content === 'object' &&
    typeof msg.content.text === 'string'

  if (!messages.every(isValidMessage) || !messagesNew.every(isValidMessage)) {
    return reply.code(400).send({ 
      error: 'Invalid message format. Expected: { role: string, content: { text: string } }' 
    })
  }

  // Set headers for SSE with CORS
  reply.raw.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': request.headers.origin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  })

  try {
    // DB 에 사용자 메시지 적재
    if (messagesNew.length > 0) {
      await Message.insertMany(messagesNew.map(message => ({
        userId: userId,
        aiKey: aiKey,
        role: message.role,
        content: message.content
      })))
    }
    // 메시지 형식을 Anthropic API 형식으로 변환
    const transformedMessages = [...messages].map(message => ({
      role: message.role,
      content: message.content.text // 현재는 { text}  필드만 받기 때문에 토큰 사용 최소화를 위해 최소한으로 참조합니다.
    }))

    // Search for relevant context in vector DB
    const relevantDocs = await searchVectorDB(transformedMessages, aiKey)
    if (process.env.NODE_ENV === 'development') console.log({relevantDocs})
    
    // Extract the base system prompt
    const baseSystemPrompt = SYSTEM
    
    // Add relevant context to system prompt if available
    let enhancedSystemPrompt = baseSystemPrompt
    if (relevantDocs.length > 0) {
      const contextSection = relevantDocs.map(doc => doc.text).join('\n\n')
      
      enhancedSystemPrompt = `
${baseSystemPrompt}

The following information is relevant to the conversation. When answering the user, incorporate this information naturally without explicitly mentioning that it comes from a knowledge base:

${contextSection}
      `.trim()
    }
    
    const responseStream = await anthropic.messages.create({
      model: MODEL, 
      temperature: TEMPERATURE, 
      max_tokens: MAX_TOKENS, 
      stream: STREAM, 
      system: enhancedSystemPrompt,
      messages: transformedMessages
    })

    // 완성된 메시지를 저장할 변수
    let completeMessage = {
      text: '',
      mood: null
    }

    for await (const chunk of responseStream) {
      // Forward the exact same event format with event type
      if (chunk.type === 'content_block_delta') {
        completeMessage.text += chunk.delta.text || ''
        sendSSE(reply, 'content_block_delta', chunk)
      } else if (chunk.type === 'content_block_start') {
        sendSSE(reply, 'content_block_start', chunk)
      } else if (chunk.type === 'content_block_stop') {
        sendSSE(reply, 'content_block_stop', chunk)
      } else if (chunk.type === 'message_delta') {
        sendSSE(reply, 'message_delta', chunk)
      }
    }

    // Send message_stop event
    sendSSE(reply, 'message_stop', { type: 'message_stop' })
    reply.raw.end()

    // 완성된 메시지에서 구조화된 데이터로 복원 시도
    try {
      const messageObj = JSON.parse(completeMessage.text)
      if (messageObj.mood && messageObj.text) {
        completeMessage = {
          text: messageObj.text,
          mood: messageObj.mood
        }
      }
    } catch (e) {
      console.log('Failed to parse message as JSON, using raw text')
    }

    // DB에 AI 답변 적재
    await Message.create({
      userId: userId,
      aiKey: aiKey,
      role: 'assistant',
      content: {
        text: completeMessage.text,
        mood: completeMessage.mood
      }
    })
  } catch (error) {
    fastify.log.error(error)
    // Send error in the same format
    sendSSE(reply, 'error', { 
      type: 'error',
      error: {
        type: error.type || 'server_error',
        message: error.message
      }
    })
    reply.raw.end()
  }
})

// For local development
if (process.env.NODE_ENV === 'development') {
  try {
    await fastify.listen({ port: process.env.PORT })
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

// Ensure clean shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...')
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect()
    console.log('MongoDB connection closed')
  }
  process.exit(0)
})

// Export for serverless use
export default async (req, res) => {
  await fastify.ready()
  fastify.server.emit('request', req, res)
}
