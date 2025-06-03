import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const MOODS = [
  'admiration',
  'adoration', 
  'aesthetic-appreciation',
  'amusement',
  'anger',
  'anxiety',
  'awe',
  'awkwardness',
  'boredom',
  'calmness',
  'confusion',
  'craving',
  'disgust',
  'empathetic-pain',
  'entrancement',
  'excitement',
  'fear',
  'horror',
  'interest',
  'joy',
  'nostalgia',
  'relief',
  'romance',
  'sadness',
  'satisfaction',
  'sexual-desire',
  'surprise'
]

const SOURCE_FILE = path.join(__dirname, 'inputs/default.png')
const OUTPUT_DIR = path.join(__dirname, 'outputs')

// Create outputs directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR)
}

// Copy default.png to each mood filename
MOODS.forEach(mood => {
  const outputPath = path.join(OUTPUT_DIR, `${mood}.png`)
  fs.copyFileSync(SOURCE_FILE, outputPath)
  console.log(`Created ${mood}.png`)
})

console.log('✅ Successfully duplicated images for all moods!')
