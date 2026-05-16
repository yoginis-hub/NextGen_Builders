/**
 * Generates sample PDF resumes compatible with pdf-parse (raw PDF 1.4 format).
 */
const fs = require('fs')
const path = require('path')

const outDir = path.join(__dirname, 'sample-resumes')
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir)

// Build a minimal valid PDF with plain text content
function makePDF(lines) {
  const pageWidth = 595
  const pageHeight = 842
  const leftMargin = 50
  const lineGap = 16

  // Use absolute Tm positioning (avoids cumulative Td drift)
  let streamParts = ['BT']
  let y = pageHeight - 60

  for (const { text, size } of lines) {
    if (y < 60) break
    const safeText = String(text)
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f-\xff]/g, '') // strip non-printable
    // Tm sets the text matrix: 1 0 0 1 x y Tm  (identity + translation)
    streamParts.push(`/F1 ${size} Tf`)
    streamParts.push(`1 0 0 1 ${leftMargin} ${y} Tm`)
    streamParts.push(`(${safeText}) Tj`)
    y -= lineGap
  }

  streamParts.push('ET')
  const streamContent = streamParts.join('\n')
  // Build PDF objects
  const objs = []

  // obj 1: Catalog
  objs.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj')
  // obj 2: Pages
  objs.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj')
  // obj 3: Page
  objs.push(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj`)
  // obj 4: Content stream — length must be exact byte count between stream\n and \nendstream
  const streamLen = Buffer.byteLength(streamContent, 'latin1')
  objs.push(`4 0 obj\n<< /Length ${streamLen} >>\nstream\n${streamContent}\nendstream\nendobj`)
  // obj 5: Font
  objs.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj')

  // Build PDF body and xref
  let body = '%PDF-1.4\n'
  const offsets = []

  for (let i = 0; i < objs.length; i++) {
    offsets.push(body.length)
    body += objs[i] + '\n'
  }

  const xrefOffset = body.length
  body += 'xref\n'
  body += `0 ${objs.length + 1}\n`
  body += '0000000000 65535 f \n'
  for (const off of offsets) {
    body += String(off).padStart(10, '0') + ' 00000 n \n'
  }
  body += 'trailer\n'
  body += `<< /Size ${objs.length + 1} /Root 1 0 R >>\n`
  body += 'startxref\n'
  body += `${xrefOffset}\n`
  body += '%%EOF'

  return Buffer.from(body, 'latin1')
}

function resumeLines(data) {
  const L = (text, size = 10) => ({ text, size })
  const SEP = L('--------------------------------------------------', 9)
  const BLANK = L('', 8)

  const lines = [
    L(data.name, 18),
    L(data.role, 12),
    BLANK,
    L(`Email: ${data.email}`, 10),
    L(`Phone: ${data.phone}   Location: ${data.location}`, 10),
  ]

  if (data.linkedin) lines.push(L(`LinkedIn: ${data.linkedin}`, 9))

  lines.push(BLANK, SEP, L('SUMMARY', 11), SEP)
  // Word-wrap summary at ~90 chars
  const words = data.summary.split(' ')
  let cur = ''
  for (const w of words) {
    if ((cur + ' ' + w).trim().length > 90) { lines.push(L(cur.trim(), 10)); cur = w }
    else cur = cur ? `${cur} ${w}` : w
  }
  if (cur) lines.push(L(cur.trim(), 10))

  lines.push(BLANK, SEP, L('WORK EXPERIENCE', 11), SEP)
  for (const exp of data.experience) {
    lines.push(L(`${exp.role} | ${exp.company}`, 11))
    lines.push(L(`${exp.from} - ${exp.to} (${exp.duration})`, 9))
    const dw = exp.description.split(' ')
    let dl = ''
    for (const w of dw) {
      if ((dl + ' ' + w).trim().length > 88) { lines.push(L('  ' + dl.trim(), 10)); dl = w }
      else dl = dl ? `${dl} ${w}` : w
    }
    if (dl) lines.push(L('  ' + dl.trim(), 10))
    lines.push(BLANK)
  }

  lines.push(SEP, L('TECHNICAL SKILLS', 11), SEP)
  for (const cat of data.skills) {
    const text = `${cat.category}: ${cat.items.join(', ')}`
    const sw = text.split(' ')
    let sl = ''
    for (const w of sw) {
      if ((sl + ' ' + w).trim().length > 88) { lines.push(L(sl.trim(), 10)); sl = w }
      else sl = sl ? `${sl} ${w}` : w
    }
    if (sl) lines.push(L(sl.trim(), 10))
  }

  lines.push(BLANK, SEP, L('EDUCATION', 11), SEP)
  for (const edu of data.education) {
    lines.push(L(`${edu.degree} | ${edu.institution}`, 10))
    lines.push(L(`Field: ${edu.field}   Year: ${edu.year}`, 9))
  }

  if (data.certifications?.length) {
    lines.push(BLANK, SEP, L('CERTIFICATIONS', 11), SEP)
    for (const c of data.certifications) {
      lines.push(L(`- ${c.name} (${c.issuer}, ${c.year})`, 10))
    }
  }

  return lines
}

const resumes = [
  {
    filename: 'priya_sharma_frontend.pdf',
    data: {
      name: 'Priya Sharma',
      role: 'Senior Frontend Developer',
      email: 'priya.sharma@example.com',
      phone: '+91 98765 43210',
      location: 'Mumbai, India',
      linkedin: 'linkedin.com/in/priyasharma',
      summary: 'Senior Frontend Developer with 6 years of experience building scalable web applications using React, TypeScript, and Tailwind CSS. Led frontend teams and improved performance by 40 percent at TechNova.',
      experience: [
        { role: 'Senior Frontend Developer', company: 'TechNova Solutions', from: '2021', to: '2024', duration: '3 years', description: 'Led 4 developers building React dashboards. Reduced bundle size 40 percent via code splitting. Implemented design system with Storybook and Tailwind CSS.' },
        { role: 'Frontend Developer', company: 'StartupBridge', from: '2018', to: '2021', duration: '3 years', description: 'Built SPA with React and Redux. Integrated REST and GraphQL APIs. Wrote tests using Jest and React Testing Library.' }
      ],
      skills: [
        { category: 'Languages', items: ['JavaScript', 'TypeScript', 'HTML5', 'CSS3'] },
        { category: 'Frameworks', items: ['React', 'Next.js', 'Vue.js', 'Tailwind CSS'] },
        { category: 'Tools', items: ['Git', 'Webpack', 'Vite', 'Storybook', 'Figma'] },
        { category: 'Testing', items: ['Jest', 'React Testing Library', 'Cypress'] },
      ],
      education: [{ degree: 'B.E. Computer Engineering', institution: 'Mumbai University', field: 'Computer Engineering', year: 2018 }],
      certifications: [{ name: 'Meta Front-End Developer Certificate', issuer: 'Coursera', year: 2022 }, { name: 'Google UX Design Certificate', issuer: 'Coursera', year: 2023 }]
    }
  },
  {
    filename: 'rahul_gupta_backend.pdf',
    data: {
      name: 'Rahul Gupta',
      role: 'Backend Engineer - Java and Microservices',
      email: 'rahul.gupta@example.com',
      phone: '+91 91234 56789',
      location: 'Bangalore, India',
      linkedin: 'linkedin.com/in/rahulgupta',
      summary: 'Backend Engineer with 8 years in Java, Spring Boot, and microservices. Designed payment systems handling 2 million daily transactions. Strong in Kafka, Docker, Kubernetes, and AWS.',
      experience: [
        { role: 'Lead Backend Engineer', company: 'PayFast India', from: '2020', to: '2024', duration: '4 years', description: 'Built payment microservices for 2M daily transactions. Event-driven architecture with Kafka. Optimised PostgreSQL reducing latency from 800ms to 120ms.' },
        { role: 'Backend Developer', company: 'ShopEase Technologies', from: '2016', to: '2020', duration: '4 years', description: 'REST APIs with Spring Boot for 500K daily users. Containerised services on Docker. Deployed on AWS ECS.' }
      ],
      skills: [
        { category: 'Languages', items: ['Java', 'Kotlin', 'SQL', 'Python'] },
        { category: 'Frameworks', items: ['Spring Boot', 'Spring Cloud', 'Hibernate', 'gRPC'] },
        { category: 'Databases', items: ['PostgreSQL', 'MySQL', 'Redis', 'MongoDB'] },
        { category: 'Cloud and DevOps', items: ['Docker', 'Kubernetes', 'AWS', 'Apache Kafka'] },
      ],
      education: [{ degree: 'B.Tech Computer Science', institution: 'IIT Roorkee', field: 'Computer Science', year: 2016 }],
      certifications: [{ name: 'AWS Certified Solutions Architect Associate', issuer: 'AWS', year: 2022 }, { name: 'Spring Professional Certification', issuer: 'VMware', year: 2021 }]
    }
  },
  {
    filename: 'ananya_patel_data_scientist.pdf',
    data: {
      name: 'Ananya Patel',
      role: 'Data Scientist and ML Engineer',
      email: 'ananya.patel@example.com',
      phone: '+91 87654 32109',
      location: 'Hyderabad, India',
      linkedin: 'linkedin.com/in/ananyapatel',
      summary: 'Data Scientist with 5 years in machine learning, NLP, and data pipelines. Built fraud detection models with 98.5 percent accuracy. Skilled in Python, TensorFlow, and AWS SageMaker.',
      experience: [
        { role: 'Senior Data Scientist', company: 'InsightAI Labs', from: '2021', to: '2024', duration: '3 years', description: 'Fraud detection model using XGBoost and LSTM at 98.5 percent accuracy. NLP pipeline in 5 languages. Deployed on AWS SageMaker for 10M predictions per day.' },
        { role: 'Data Scientist', company: 'RetailMind Analytics', from: '2019', to: '2021', duration: '2 years', description: 'Product recommendation engine with collaborative filtering. Data pipelines with Apache Spark and Airflow. Dashboards in Tableau and Power BI.' }
      ],
      skills: [
        { category: 'Languages', items: ['Python', 'R', 'SQL', 'Scala'] },
        { category: 'ML and AI', items: ['TensorFlow', 'PyTorch', 'scikit-learn', 'XGBoost', 'Hugging Face'] },
        { category: 'Data Engineering', items: ['Apache Spark', 'Airflow', 'Kafka', 'dbt'] },
        { category: 'Cloud and Tools', items: ['AWS SageMaker', 'GCP Vertex AI', 'MLflow', 'Docker'] },
      ],
      education: [{ degree: 'M.Tech Data Science', institution: 'IIIT Hyderabad', field: 'Data Science and AI', year: 2019 }, { degree: 'B.Sc Mathematics', institution: 'Pune University', field: 'Mathematics', year: 2017 }],
      certifications: [{ name: 'TensorFlow Developer Certificate', issuer: 'Google', year: 2022 }, { name: 'AWS Certified Machine Learning Specialty', issuer: 'AWS', year: 2023 }]
    }
  },
  {
    filename: 'amit_verma_devops.pdf',
    data: {
      name: 'Amit Verma',
      role: 'DevOps and Cloud Infrastructure Engineer',
      email: 'amit.verma@example.com',
      phone: '+91 99887 76655',
      location: 'Pune, India',
      linkedin: 'linkedin.com/in/amitverma',
      summary: 'DevOps Engineer with 7 years in cloud infrastructure, CI/CD, and SRE. Expert in AWS, Kubernetes, and Terraform. Cut deployment time by 80 percent and infra costs by 35 percent.',
      experience: [
        { role: 'Senior DevOps Engineer', company: 'CloudScale Systems', from: '2020', to: '2024', duration: '4 years', description: 'AWS multi-region infra with 99.99 percent uptime. Zero-downtime deployments via GitHub Actions and ArgoCD. Terraform IaC managing 200 resources.' },
        { role: 'DevOps Engineer', company: 'FinStack Technologies', from: '2017', to: '2020', duration: '3 years', description: 'Migrated monolith to Kubernetes microservices. Monitoring with Prometheus and Grafana. Automated vulnerability scanning in CI pipeline.' }
      ],
      skills: [
        { category: 'Cloud', items: ['AWS EKS', 'Lambda', 'RDS', 'S3', 'GCP', 'Azure'] },
        { category: 'DevOps', items: ['Kubernetes', 'Docker', 'Terraform', 'Helm', 'ArgoCD'] },
        { category: 'CI/CD', items: ['GitHub Actions', 'Jenkins', 'GitLab CI'] },
        { category: 'Monitoring', items: ['Prometheus', 'Grafana', 'ELK Stack', 'Datadog'] },
        { category: 'Languages', items: ['Bash', 'Python', 'Go', 'YAML'] },
      ],
      education: [{ degree: 'B.E. Information Technology', institution: 'Pune Institute of Engineering', field: 'Information Technology', year: 2017 }],
      certifications: [{ name: 'AWS Certified DevOps Engineer Professional', issuer: 'AWS', year: 2022 }, { name: 'Certified Kubernetes Administrator', issuer: 'CNCF', year: 2023 }]
    }
  }
]

async function main() {
  console.log('Generating sample resumes...')
  for (const r of resumes) {
    const lines = resumeLines(r.data)
    const buf = makePDF(lines)
    fs.writeFileSync(path.join(outDir, r.filename), buf)
    console.log(`  + ${r.filename}`)
  }
  console.log(`\nDone! Files in: ${outDir}`)
}

main().catch(console.error)
