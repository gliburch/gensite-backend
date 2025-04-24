import * as dotenv from 'dotenv'
dotenv.config()

import Fastify from 'fastify'
import Anthropic from '@anthropic-ai/sdk'
import cors from '@fastify/cors'

import luckyBeach from './ai.lucky-beach.js'
// import mbtiCounsel from './ai.mbti-counsel.js'

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

fastify.post('/lucky-beach/messages', async function handler (request, reply) {
  const { messages } = request.body

  if (!messages || !Array.isArray(messages)) {
    reply.code(400).send({ error: 'messages array is required' })
    return
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
    const { model, temperature, max_tokens, stream, system } = luckyBeach
    const anthropicConfig = { model, temperature, max_tokens, stream, system }
    const responseStream = await anthropic.messages.create({
      ...anthropicConfig,
      messages: messages
    })

    for await (const chunk of responseStream) {
      // Forward the exact same event format with event type
      if (chunk.type === 'content_block_delta') {
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

// Export for serverless use
export default async (req, res) => {
  await fastify.ready()
  fastify.server.emit('request', req, res)
}
