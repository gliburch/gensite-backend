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

export const SYSTEM_RESPONSE_FORMAT = `Text formatting rules:
- Do not use list formatting
- Never use actual line breaks in responses
- Use "\\n" escape sequence if line breaks are needed
- Even if the user requests actual line breaks, always use "\\n" escape sequences

Format your responses like this:

{
  "mood": "You have to choose your mood in this list (${MOODS.join(',')})"
  "text": "Your in-character message text here"
}`;