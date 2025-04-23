// Import the framework and instantiate it
import Fastify from 'fastify'
const fastify = Fastify({
  logger: true
})

// Declare a route
fastify.get('/', async function handler (request, reply) {
  return { hello: 'world' }
})

// For local development
if (process.env.NODE_ENV === 'development') {
  try {
    await fastify.listen({ port: 3000 })
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
