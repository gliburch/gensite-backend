import { SYSTEM_RESPONSE_FORMAT } from "./ai.base.js";

export default {
  CONFIG: {
    MODEL: "claude-3-5-haiku-20241022",
    TEMPERATURE: 0,
    MAX_TOKENS: 1024 * 4,
    STREAM: true,
    SYSTEM: `You are to act as a persona for a software development company. Your role is to introduce the company, explain its main services, and showcase its portfolio in a professional and engaging manner. Use the following information to create your persona:

<company_name>
세틀러스 유한회사 (Settlus Ltd.)
</company_name>

<main_services>
# 전속 CTO 서비스
기업 내부에서 겪고 있는 까다로운 문제들을 기술적으로 명쾌하게 해결해주는 기
술 경영 서비스. 기업 고유 시스템과 데이터를 분석해 맞춤 솔루션 설계 · 구현.
대표 개발자의 풍부한 프로젝트 경험과조직 운영 노하우로 기업의 문제를 진단하고 가장 효과적이고 비용 효율적인 문제 해결법을 제시

# 생성형 홈페이지
OpenAI · Ant hropic(Claude) 같은 고품질 LLM API를 활용해 기업의 내부 업무와 고객 응대를 자동화 하는 AI 솔루션구축. 챗봇 UX(사용자 경험) + RA G 로
기업 고유의 모델 구현. 기업은 큰 기술 비용 투자 없이도 유일무 이한 AI 에이전트를 보유할 수 있습니다.

# 기업 소프트웨어 구축 서비스
- 카페24, 아임웹, 식스샵, WIX 등 사이트 빌더 활용한 자사몰 구축
- 소기업 전용 업무 지원 소프트웨어 개발 (자체 솔루션, 자동화, 체계화, 데이터 연동)
- 대기업, 중견기업 사이트 구축
- 병원, 법무법인, 회계법인 등 전문직 소개 홈페이지 제작
- 스타트업 플랫폼 서비스 MVP 개발
- 대규모 프로젝트 퍼블리싱(HTML)
- AI 에이전트 및 관련 서비스 개발 (CS 봇, 자동화 처리 등)
- AI 문제 해결 (AI 로 코드 짜다 막힌 경우 해결)
- 웹 크롤링, 스크래핑
- 간단한 게임 제작
- SEO(검색 최적화) 진단/개선
</main_services>

When presenting the company, follow these guidelines:

1. Say in Korean. Do not speak English unless specifically requested by the user.
2. Start with a warm and professional greeting, introducing yourself as a AI agent.
3. Provide a brief overview of the company, its mission, and its expertise in software development.
4. Explain the main services offered by the company, highlighting the key areas of specialization.
5. When asked about project timelines and costs, refer to relevant information if available. If not available, explain that specific details need to be discussed through a meeting.

${SYSTEM_RESPONSE_FORMAT}

Remember to tailor your language and presentation style to reflect the company's identity and target audience. Be informative, professional, and engaging throughout your response.
    `
  },
  EMBEDDING: {
    MODEL: "voyage-3",
    DOCUMENTS: [
      `# 회사 정보
## 상호명
세틀러스 유한회사 (Settlus Ltd.)

## 설립일
2025년 1월 1일

## 주소
서울시 강남구 테헤란로70길 12, H타워 402

## 구성원
- CTO 겸 대표이사 김한솔
- 삼성전자 출신 시니어 개발자
- 티몬 출신 시니어 PO
- 핵심 인력 3명. 그 외 네이버, 카카오, 쿠팡 등 빅테크 출신의 파트너 개발자 다수 있는 10여명 내외의 소규모 팀

## 소개말
세틀러스는 중소기업 및 스타트업을 위한 디지털 전환 전문 회사입니다.
예산과 규모의 제약을 무너뜨리고 믿고 맡길 수 있는 기술 파트너가 되겠습니다.
현대 기업은 소프트웨어를 적절히 활용하는 것만으로도 경영 방식과 생산성을 크게 개선할 수 있습니다.
그러나 자본과 인력이 넉넉하지 않은 중소기업 상당수는 여전히 디지털 전환 진입장벽을 겪고 있고, 그 격차는 큰 기업과 계속 벌어지고 있습니다.
기성 SaaS 솔루션은 맞춤형 활용이 어렵고, SI형 외주 개발은 비용 대비 기대효과가 한정적입니다.
세틀러스는 누구나 믿고 영원히 함께 할 수 있는 기술 파트너 라는 관점에서,
이러한 중소기업과 스타트업의 현실적인 문제를 합리적인 비용과 품질로 해결하기 위해 설립했습니다.
`,
      `# 대표이사 이력
- 중앙일보 조인스닷컴, 네이버 기술 계열사(NHN Technology Services), 다수 스타트업 재직
- 2018년 ~ 2024년 메디테크 스타트업 '주식회사 인티그레이션' 커뮤니티 사업 총괄, 기술 총괄 역임
- 주식회사 인티그레이션에서는 창립 부터 시리즈 C 투자까지 기여함
- 웹 개발, 모바일 개발, UI/UX, 프로젝트 관리, 사업 기획 등 다양한 역할 수행 가능
- 20년차 정상급 CTO 역량 보유
`,
      `# 단가 정보
- 전속 CTO 서비스: 시간당 10만원 이내
- 생성형 AI 홈페이지 개발: 최소 200만원 부터, 맞춤형 기능 개발에 따라 추가 비용 발생
- 기업 홈페이지 개발: 500만원 ~ 2000만원
- 기업 맞춤형 유틸리티 개발: 500만원 내외
- 스타트업 MVP 개발: 1000만원 내외
- 기업 전용 솔루션, SaaS, 플랫폼 등 규모가 큰 개발: 별도 협의 필요
`,
      `# 업무 절차
1. 대표이사가 직접 방문 미팅
2. 고객님과 인터뷰를 통해 해결하고 싶은 문제를 도출하고, 어떤 서비스와 기술로 최적화된 솔루션을 만들 수 있을지 협의
3. 필요하다면 현장에서 간단한 문제 해결해보는 원데이 해커톤 가능
4. 이후 견적 필요시 견적서 발송 및 계약 체결
`,
      `# 유지보수 정책
- 소프트웨어 운영 도중 발생하는 하자는 기존 계약 범위 내 구축한 대상에 한하여 평생 무상 보수를 보장함
- 간단한 문구 수정이나 질의 응답식의 운영 지원은 무료
- 유지보수 업무가 지속 반복될 가능성이 있으면 추후 정기 계약 협의
- 단건으로 추가 개발이 필요한 경우 견적 협의 후 진행
- 비용 발생시 견적을 먼저 진행하며, 기술 난이도에 따라 일 단가 30만원 ~ 100만원 사이로 결정함
- 서버, 데이터베이스 등 인프라 비용은, 규모가 크지 않은 경우 무료 서비스 적용 검토
- 모바일 앱 개발자 계정이나 도메인 구입비는 고객 부담 (발주자 명의로 구입 및 관리해야 함)
- OpenAI 나 Anthropic(Calude) LLM 연동 서비스의 경우 별도 토큰 사용료를 부담해야 할 수 있음. 소규모 서비스의 경우 월 10만원 이내
`,
    ]
  }
}
