import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 입력 파일과 출력 파일 경로 설정
const INPUT_FILE = path.join(__dirname, 'inputs/input.md')
const OUTPUT_FILE = path.join(__dirname, 'outputs/output.json')

function parseMarkdown(content) {
  // 줄바꿈으로 분할
  const lines = content.split('\n')
  const result = []
  
  let currentSection = ''
  let currentSubsection = ''
  let currentH3 = ''
  let currentContent = []
  
  function saveCurrentContent() {
    if (currentContent.length > 0 && currentSubsection && currentH3) {
      const text = `${currentSection}\n${currentSubsection}\n${currentH3}\n${currentContent.join('\n').trim()}`
      result.push(text)
    }
    currentContent = []
  }
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    
    // # 섹션 검출
    if (line.startsWith('# ')) {
      saveCurrentContent()
      currentSection = line.trim()
      currentSubsection = ''
      currentH3 = ''
    }
    // ## 서브섹션 검출
    else if (line.startsWith('## ')) {
      saveCurrentContent()
      currentSubsection = line.trim()
      currentH3 = ''
    }
    // ### 이하 컨텐츠 시작
    else if (line.startsWith('### ')) {
      saveCurrentContent()
      currentH3 = line.trim()
      // 새 컨텐츠 시작
      currentContent = []
    }
    // 일반 텍스트는 현재 컨텐츠에 추가
    else {
      currentContent.push(line)
    }
  }
  
  // 마지막 컨텐츠 처리
  saveCurrentContent()
  
  // 필터링: 모든 레벨의 제목이 있는 항목만 포함
  return result.filter(text => 
    text.includes('# ') && 
    text.includes('## ') && 
    text.includes('### ')
  )
}

async function main() {
  try {
    console.log('Reading markdown file...')
    const markdownContent = fs.readFileSync(INPUT_FILE, 'utf-8')
    
    console.log('Parsing markdown content...')
    const parsedContent = parseMarkdown(markdownContent)
    
    console.log('Writing JSON file...')
    fs.writeFileSync(
      OUTPUT_FILE,
      JSON.stringify(parsedContent, null, 2)
    )
    
    console.log(`✅ Successfully converted to JSON!`)
    console.log(`📝 Total sections processed: ${parsedContent.length}`)
  } catch (error) {
    console.error('Error processing file:', error)
    process.exit(1)
  }
}

main().catch(console.error)
