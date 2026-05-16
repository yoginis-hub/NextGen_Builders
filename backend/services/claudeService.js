const Anthropic = require('@anthropic-ai/sdk')

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

// ─────────────────────────────────────────────
//  LOCAL FALLBACK — regex resume extractor
// ─────────────────────────────────────────────

const SKILL_KEYWORDS = [
  // Languages
  'JavaScript','TypeScript','Python','Java','Kotlin','Go','Rust','C++','C#','Ruby','PHP','Swift','Scala','R','Bash','SQL','HTML5','CSS3','HTML','CSS','YAML',
  // Frameworks / Libraries
  'React','Angular','Vue.js','Vue','Next.js','Nuxt','Express','Node.js','Django','Flask','FastAPI','Spring Boot','Spring','Laravel','Rails','ASP.NET','Hibernate','gRPC','GraphQL','Redux','Tailwind CSS','Tailwind','Bootstrap','Svelte','Storybook',
  // Databases
  'MongoDB','PostgreSQL','MySQL','SQLite','Redis','Elasticsearch','DynamoDB','Cassandra','Oracle','Firebase','Supabase',
  // Cloud & DevOps
  'AWS','Azure','GCP','Docker','Kubernetes','Terraform','Ansible','Jenkins','GitHub Actions','GitLab CI','ArgoCD','Helm','Prometheus','Grafana','Datadog','ELK Stack','ELK','Nginx','Apache Kafka','Kafka','RabbitMQ','Airflow','dbt',
  // ML / AI
  'TensorFlow','PyTorch','scikit-learn','Keras','XGBoost','Pandas','NumPy','OpenCV','Hugging Face','LangChain','MLflow','Apache Spark','Spark',
  // Tools
  'Git','Jira','Figma','Postman','Webpack','Vite','Cypress','Jest','Playwright'
]

const SKILL_CATEGORY_MAP = {
  Language: ['JavaScript','TypeScript','Python','Java','Kotlin','Go','Rust','C++','C#','Ruby','PHP','Swift','Scala','R','Bash','SQL','HTML5','CSS3','HTML','CSS','YAML'],
  Framework: ['React','Angular','Vue.js','Vue','Next.js','Nuxt','Express','Node.js','Django','Flask','FastAPI','Spring Boot','Spring','Laravel','Rails','ASP.NET','Hibernate','gRPC','GraphQL','Redux','Tailwind CSS','Tailwind','Bootstrap','Svelte','Storybook'],
  Database: ['MongoDB','PostgreSQL','MySQL','SQLite','Redis','Elasticsearch','DynamoDB','Cassandra','Oracle','Firebase','Supabase'],
  Cloud: ['AWS','Azure','GCP'],
  DevOps: ['Docker','Kubernetes','Terraform','Ansible','Jenkins','GitHub Actions','GitLab CI','ArgoCD','Helm','Prometheus','Grafana','Datadog','ELK Stack','ELK','Nginx','Apache Kafka','Kafka','RabbitMQ','Airflow','dbt'],
  'AI/ML': ['TensorFlow','PyTorch','scikit-learn','Keras','XGBoost','Pandas','NumPy','OpenCV','Hugging Face','LangChain','MLflow','Apache Spark','Spark'],
  Tool: ['Git','Jira','Figma','Postman','Webpack','Vite','Cypress','Jest','Playwright']
}

function getSkillCategory(skill) {
  for (const [cat, list] of Object.entries(SKILL_CATEGORY_MAP)) {
    if (list.some(s => s.toLowerCase() === skill.toLowerCase())) return cat
  }
  return 'Other'
}

function localExtractSkillsFromResume(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)

  // Name — first line
  const name = lines[0] || ''

  // Role — second line (skip blank/separator lines)
  let role = ''
  for (const line of lines.slice(1, 6)) {
    if (line && !line.startsWith('-') && line !== name) { role = line; break }
  }

  // Email
  const emailMatch = text.match(/Email:\s*([\w.+-]+@[\w-]+\.[a-z]{2,})/i) || text.match(/([\w.+-]+@[\w-]+\.[a-z]{2,})/i)
  const email = emailMatch ? emailMatch[1].trim() : ''

  // Phone
  const phoneMatch = text.match(/Phone:\s*([+\d][\d\s\-()+.]{6,})/i)
  const phone = phoneMatch ? phoneMatch[1].trim() : ''

  // Location
  const locationMatch = text.match(/Location:\s*([^\n]+)/i)
  const location = locationMatch ? locationMatch[1].trim() : ''

  // Summary — text between SUMMARY heading and next section
  let summary = ''
  const summaryMatch = text.match(/SUMMARY\s*[-\n]+([\s\S]+?)(?=\n[-]{5,}|\n[A-Z ]{4,}\n)/i)
  if (summaryMatch) {
    summary = summaryMatch[1].replace(/-{3,}/g, '').replace(/\n+/g, ' ').trim().slice(0, 400)
  }

  // Total years of experience — from summary/text
  const expMatch = text.match(/(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s+)?experience/i)
  const totalYearsOfExperience = expMatch ? parseInt(expMatch[1]) : 0

  // Skills — scan for known keywords in text
  const textLower = text.toLowerCase()
  const skills = SKILL_KEYWORDS
    .filter(skill => {
      const re = new RegExp(`\\b${skill.replace(/[.+]/g, '\\$&')}\\b`, 'i')
      return re.test(textLower)
    })
    .map(skill => ({
      name: skill,
      category: getSkillCategory(skill),
      proficiency: 'Intermediate',
      yearsOfExperience: 0
    }))

  // Previous companies — "Role | Company\nYear - Year"
  const previousCompanies = []
  const expSection = text.match(/WORK EXPERIENCE[\s\S]+?(?=\n[-]{5,}\n[A-Z]|$)/i)
  if (expSection) {
    const entries = [...expSection[0].matchAll(/([^|\n]+)\s*\|\s*([^\n]+)\n([^\n]+)/g)]
    for (const m of entries) {
      const yearMatch = m[3].match(/(\d{4})\s*[-–]\s*(\d{4}|Present)/i)
      previousCompanies.push({
        name: m[2]?.trim() || '',
        role: m[1]?.trim() || '',
        from: yearMatch?.[1] || '',
        to: yearMatch?.[2] || '',
        duration: ''
      })
    }
  }

  // Education — "Degree | Institution"
  const education = []
  const eduSection = text.match(/EDUCATION[\s\S]+?(?=\n[-]{5,}\n[A-Z]|$)/i)
  if (eduSection) {
    const entries = [...eduSection[0].matchAll(/([^|\n]+)\s*\|\s*([^\n]+)\nField:\s*([^\s]+)[^\n]*Year:\s*(\d{4})/gi)]
    for (const m of entries) {
      education.push({ degree: m[1]?.trim() || '', institution: m[2]?.trim() || '', field: m[3]?.trim() || '', year: parseInt(m[4]) || 0 })
    }
  }

  return { name, email, role, location, phone, summary, totalYearsOfExperience, skills, projects: [], certifications: [], previousCompanies, education }
}

// ─────────────────────────────────────────────
//  LOCAL FALLBACK — smart keyword/skill engine
// ─────────────────────────────────────────────

const STOP_WORDS = new Set(['the','and','or','with','for','who','has','have','in','a','an','to','of','is','are','be','been','on','at','by','as','up','it','its'])

function detectTeamSize(requirement) {
  // "only 3 members", "3-person", "3 member", "team of 3"
  const explicit =
    requirement.match(/(\d+)[- ]?(?:persons?|members?|people)/i) ||
    requirement.match(/team\s+of\s+(\d+)/i) ||
    requirement.match(/only\s+(\d+)/i)
  if (explicit) return Math.min(parseInt(explicit[1]), 10)
  return 5
}

function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9.#+\s]/g, ' ').split(/\s+/).filter(w => w.length > 1 && !STOP_WORDS.has(w))
}

function localSemanticSearch(query, employees) {
  const tokens = tokenize(query)

  // Detect min experience from query e.g. "5+ years" "3 years"
  const expMatch = query.match(/(\d+)\+?\s*(?:years?|yrs?)/i)
  const minExp = expMatch ? parseInt(expMatch[1]) : 0

  // Detect seniority
  const wantsSenior = /senior|lead|principal|architect|expert/i.test(query)
  const wantsJunior = /junior|fresher|entry/i.test(query)

  const scored = employees.map(emp => {
    let score = 0
    const matchingSkills = []

    for (const token of tokens) {
      // Skill match — highest weight
      emp.skills.forEach(s => {
        const sn = s.name.toLowerCase()
        if (sn.includes(token) || token.includes(sn)) {
          const profWeight = { expert: 4, advanced: 3, intermediate: 2, beginner: 1 }
          score += (profWeight[s.proficiency?.toLowerCase()] || 2) * 12
          if (!matchingSkills.find(m => m.toLowerCase() === s.name.toLowerCase())) {
            matchingSkills.push(s.name)
          }
        }
      })

      // Role match
      if (emp.role && emp.role.toLowerCase().includes(token)) score += 18
      // Location match
      if (emp.location && emp.location.toLowerCase().includes(token)) score += 12
      // Summary match
      if (emp.summary && emp.summary.toLowerCase().includes(token)) score += 6
    }

    // Experience scoring
    if (minExp > 0) {
      score += emp.totalYearsOfExperience >= minExp ? 25 : -15
    }

    // Seniority scoring
    if (wantsSenior && emp.totalYearsOfExperience >= 5) score += 15
    if (wantsJunior && emp.totalYearsOfExperience <= 2) score += 15

    // Availability bonus
    if (emp.availability === 'available') score += 10
    else if (emp.availability === 'busy') score -= 5

    return { emp, score, matchingSkills }
  })

  const maxScore = Math.max(...scored.map(s => s.score), 1)

  return scored
    .filter(s => s.score > 5)
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map(({ emp, score, matchingSkills }, idx) => {
      const matchPercentage = Math.min(96, Math.max(32, Math.round((score / maxScore) * 80) + 15))
      const topSkills = matchingSkills.slice(0, 3)
      const expertSkills = emp.skills.filter(s => !s.isInferred && (s.proficiency === 'Expert' || s.proficiency === 'Advanced')).map(s => s.name)
      const categories = [...new Set(emp.skills.filter(s => !s.isInferred && s.proficiency !== 'Beginner').map(s => s.category))]

      return {
        id: emp._id.toString(),
        matchPercentage,
        rank: idx + 1,
        matchingSkills: topSkills,
        summary: `${emp.name} is a ${emp.role || 'professional'} with ${emp.totalYearsOfExperience || 0} years of experience${emp.location ? ` in ${emp.location}` : ''}. ${topSkills.length ? `Skilled in ${topSkills.join(', ')}.` : ''} ${emp.availability === 'available' ? 'Currently available.' : ''}`.trim(),
        reasoning: `Profile matched your query on ${topSkills.length ? `key skills (${topSkills.join(', ')})` : 'role and experience'}. ${emp.totalYearsOfExperience >= (minExp || 0) ? `Has ${emp.totalYearsOfExperience} years of experience, meeting the requirement.` : ''} Availability: ${emp.availability}.`,
        strengthAreas: categories.slice(0, 3),
        concerns: emp.availability !== 'available' ? `Currently ${emp.availability.replace('-', ' ')}` : '',
      }
    })
}

function localBuildTeam(requirement, employees) {
  const tokens = tokenize(requirement)

  // Score each employee for team fit
  const scored = employees.map(emp => {
    let score = 0
    const matchingSkills = []

    tokens.forEach(token => {
      emp.skills.forEach(s => {
        if (s.name.toLowerCase().includes(token) || token.includes(s.name.toLowerCase())) {
          const w = { expert: 4, advanced: 3, intermediate: 2, beginner: 1 }
          score += (w[s.proficiency?.toLowerCase()] || 2) * 10
          if (!matchingSkills.includes(s.name)) matchingSkills.push(s.name)
        }
      })
      if (emp.role?.toLowerCase().includes(token)) score += 15
    })

    if (emp.availability === 'available') score += 20
    score += Math.min(emp.totalYearsOfExperience * 2, 20)

    return { emp, score, matchingSkills }
  })

  const size = detectTeamSize(requirement)
  const top = scored.sort((a, b) => b.score - a.score).slice(0, size)

  // Gather all covered skills
  const coveredSkills = [...new Set(top.flatMap(t => t.emp.skills.filter(s => !s.isInferred).map(s => s.name)))]

  // Simple gap detection against requirement tokens
  const gaps = tokens.filter(t => !coveredSkills.some(s => s.toLowerCase().includes(t))).map(t => t.charAt(0).toUpperCase() + t.slice(1)).slice(0, 3)

  const teamName = `${requirement.split(' ').slice(0, 3).join(' ')} Team`
  const overallScore = Math.min(95, Math.round((top.reduce((s, t) => s + t.score, 0) / Math.max(top.length, 1)) / 5))

  return {
    teamName,
    projectSummary: `A hand-picked team assembled for: ${requirement}`,
    teamSize: top.length,
    members: top.map(({ emp, matchingSkills }) => ({
      id: emp._id.toString(),
      name: emp.name,
      suggestedRole: emp.role || 'Team Member',
      whySelected: `Strong in ${matchingSkills.slice(0, 3).join(', ') || 'relevant skills'} with ${emp.totalYearsOfExperience || 0} years of experience. ${emp.availability === 'available' ? 'Currently available.' : ''}`,
      keyContributions: matchingSkills.slice(0, 2).map(s => `${s} expertise`),
    })),
    skillCoverage: {
      covered: coveredSkills.slice(0, 8),
      gaps,
      overallScore: isNaN(overallScore) ? 70 : overallScore,
    },
    teamAnalysis: `This team covers ${coveredSkills.length} skills relevant to the project. ${gaps.length ? `Potential gaps: ${gaps.join(', ')}.` : 'Good skill coverage for the requirement.'} All selected members have solid experience profiles.`,
  }
}

// ─────────────────────────────────────────────
//  EXPORTED FUNCTIONS — Claude first, fallback second
// ─────────────────────────────────────────────

const extractSkillsFromResume = async (resumeText) => {
  try {
    const prompt = `You are an expert HR AI assistant. Extract comprehensive skill information from the following resume text.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{
  "name": "Full Name",
  "role": "Current/Target Role",
  "location": "City, State/Country",
  "phone": "Phone number or empty string",
  "email": "Email or empty string",
  "summary": "Professional summary (2-3 sentences)",
  "totalYearsOfExperience": 5,
  "skills": [{"name":"React","category":"Framework","proficiency":"Expert","yearsOfExperience":4}],
  "projects": [{"name":"Project Name","description":"Brief description","technologies":["React"],"duration":"3 months","role":"Lead Developer"}],
  "certifications": [{"name":"AWS Certified","issuer":"Amazon","year":2023}],
  "previousCompanies": [{"name":"Company","role":"Title","duration":"2 years","from":"2020","to":"2022"}],
  "education": [{"degree":"B.Tech","institution":"University","year":2019,"field":"CS"}]
}
Skill categories: Language, Framework, Database, DevOps, Cloud, Tool, Platform, Domain, Other
Proficiency: Beginner, Intermediate, Advanced, Expert

Resume text:
${resumeText}`

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = response.content[0].text.trim()
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Failed to extract JSON from Claude response')
    return JSON.parse(jsonMatch[0])
  } catch (err) {
    console.warn('⚠️  Claude API unavailable, using regex fallback for resume extraction:', err.message)
    return localExtractSkillsFromResume(resumeText)
  }
}

const semanticSearch = async (query, employees) => {
  try {
    const employeeSummaries = employees.map((emp, idx) => ({
      id: emp._id.toString(),
      index: idx + 1,
      name: emp.name,
      role: emp.role,
      location: emp.location,
      yearsOfExperience: emp.totalYearsOfExperience,
      skills: emp.skills.filter(s => !s.isInferred).map(s => `${s.name} (${s.proficiency})`).join(', '),
      availability: emp.availability
    }))

    const prompt = `You are an expert technical recruiter AI. Rank employees by relevance to the search query.

Search Query: "${query}"
Available Employees: ${JSON.stringify(employeeSummaries, null, 2)}

Return ONLY a valid JSON array:
[{"id":"employee_id","matchPercentage":94,"summary":"2-3 sentence summary","reasoning":"Why they match","matchingSkills":["React","Node.js"],"strengthAreas":["Frontend"],"concerns":"","rank":1}]

Only include employees with at least 30% relevance. Sort by matchPercentage descending. Maximum 10 results.`

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = response.content[0].text.trim()
    const jsonMatch = content.match(/\[[\s\S]*\]/)
    if (!jsonMatch) throw new Error('Failed to extract search results from Claude')
    return JSON.parse(jsonMatch[0])

  } catch (err) {
    // If Claude API fails (no credits, quota, etc.) use smart local search
    console.warn('⚠️  Claude API unavailable, using local smart search:', err.message)
    return localSemanticSearch(query, employees)
  }
}

const buildTeam = async (requirement, employees) => {
  try {
    const employeeSummaries = employees.map(emp => ({
      id: emp._id.toString(),
      name: emp.name,
      role: emp.role,
      location: emp.location,
      yearsOfExperience: emp.totalYearsOfExperience,
      skills: emp.skills.filter(s => !s.isInferred).map(s => `${s.name} (${s.proficiency})`).join(', '),
      availability: emp.availability
    }))

    const size = detectTeamSize(requirement)
    const prompt = `You are an expert AI team composition advisor. Build the optimal team.

Team Requirement: "${requirement}"
Team Size: Select EXACTLY ${size} members. Do not select more or fewer.
Available Members: ${JSON.stringify(employeeSummaries, null, 2)}

Return ONLY a valid JSON object:
{"teamName":"Name","projectSummary":"Purpose","teamSize":${size},"members":[{"id":"emp_id","name":"Name","suggestedRole":"Role","whySelected":"Reason","keyContributions":["Contribution"]}],"skillCoverage":{"covered":["React"],"gaps":["Mobile"],"overallScore":87},"teamAnalysis":"Analysis"}`

    const response = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }]
    })

    const content = response.content[0].text.trim()
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Failed to extract team composition from Claude')
    return JSON.parse(jsonMatch[0])

  } catch (err) {
    // Fallback to local team builder
    console.warn('⚠️  Claude API unavailable, using local team builder:', err.message)
    return localBuildTeam(requirement, employees)
  }
}

module.exports = { extractSkillsFromResume, semanticSearch, buildTeam }
