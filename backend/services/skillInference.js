// Skill inference rules: if you know X, you likely know Y
const inferenceRules = [
  { trigger: 'Next.js', infers: [{ name: 'React', confidence: 0.98 }, { name: 'JavaScript', confidence: 0.99 }] },
  { trigger: 'Nuxt.js', infers: [{ name: 'Vue.js', confidence: 0.98 }, { name: 'JavaScript', confidence: 0.99 }] },
  { trigger: 'Gatsby', infers: [{ name: 'React', confidence: 0.97 }, { name: 'GraphQL', confidence: 0.75 }] },
  { trigger: 'Express.js', infers: [{ name: 'Node.js', confidence: 0.99 }, { name: 'JavaScript', confidence: 0.99 }] },
  { trigger: 'NestJS', infers: [{ name: 'Node.js', confidence: 0.99 }, { name: 'TypeScript', confidence: 0.95 }] },
  { trigger: 'Django', infers: [{ name: 'Python', confidence: 0.99 }] },
  { trigger: 'Flask', infers: [{ name: 'Python', confidence: 0.99 }] },
  { trigger: 'FastAPI', infers: [{ name: 'Python', confidence: 0.99 }, { name: 'REST API', confidence: 0.90 }] },
  { trigger: 'Spring Boot', infers: [{ name: 'Java', confidence: 0.99 }, { name: 'Spring', confidence: 0.95 }] },
  { trigger: 'Laravel', infers: [{ name: 'PHP', confidence: 0.99 }] },
  { trigger: 'Ruby on Rails', infers: [{ name: 'Ruby', confidence: 0.99 }] },
  { trigger: 'Tailwind CSS', infers: [{ name: 'CSS', confidence: 0.95 }, { name: 'HTML', confidence: 0.95 }] },
  { trigger: 'Styled Components', infers: [{ name: 'CSS', confidence: 0.90 }, { name: 'React', confidence: 0.80 }] },
  { trigger: 'Redux', infers: [{ name: 'React', confidence: 0.85 }, { name: 'JavaScript', confidence: 0.95 }] },
  { trigger: 'GraphQL', infers: [{ name: 'REST API', confidence: 0.70 }] },
  { trigger: 'AWS Lambda', infers: [{ name: 'Serverless', confidence: 0.95 }, { name: 'AWS', confidence: 0.99 }] },
  { trigger: 'AWS ECS', infers: [{ name: 'Docker', confidence: 0.90 }, { name: 'AWS', confidence: 0.99 }] },
  { trigger: 'AWS RDS', infers: [{ name: 'AWS', confidence: 0.99 }, { name: 'SQL', confidence: 0.80 }] },
  { trigger: 'Kubernetes', infers: [{ name: 'Docker', confidence: 0.95 }, { name: 'DevOps', confidence: 0.90 }] },
  { trigger: 'Terraform', infers: [{ name: 'DevOps', confidence: 0.90 }, { name: 'Infrastructure as Code', confidence: 0.95 }] },
  { trigger: 'Ansible', infers: [{ name: 'DevOps', confidence: 0.90 }, { name: 'Linux', confidence: 0.80 }] },
  { trigger: 'MongoDB', infers: [{ name: 'NoSQL', confidence: 0.95 }] },
  { trigger: 'PostgreSQL', infers: [{ name: 'SQL', confidence: 0.99 }, { name: 'Relational Databases', confidence: 0.95 }] },
  { trigger: 'MySQL', infers: [{ name: 'SQL', confidence: 0.99 }, { name: 'Relational Databases', confidence: 0.95 }] },
  { trigger: 'Redis', infers: [{ name: 'Caching', confidence: 0.95 }, { name: 'NoSQL', confidence: 0.70 }] },
  { trigger: 'ElasticSearch', infers: [{ name: 'Search', confidence: 0.95 }, { name: 'NoSQL', confidence: 0.70 }] },
  { trigger: 'React Native', infers: [{ name: 'React', confidence: 0.85 }, { name: 'Mobile Development', confidence: 0.95 }, { name: 'JavaScript', confidence: 0.99 }] },
  { trigger: 'Flutter', infers: [{ name: 'Dart', confidence: 0.99 }, { name: 'Mobile Development', confidence: 0.95 }] },
  { trigger: 'TypeScript', infers: [{ name: 'JavaScript', confidence: 0.99 }] },
  { trigger: 'Socket.IO', infers: [{ name: 'WebSockets', confidence: 0.95 }, { name: 'Real-time Applications', confidence: 0.90 }] },
  { trigger: 'TensorFlow', infers: [{ name: 'Machine Learning', confidence: 0.95 }, { name: 'Python', confidence: 0.90 }] },
  { trigger: 'PyTorch', infers: [{ name: 'Machine Learning', confidence: 0.95 }, { name: 'Python', confidence: 0.90 }] },
  { trigger: 'OpenCV', infers: [{ name: 'Computer Vision', confidence: 0.95 }, { name: 'Python', confidence: 0.80 }] },
  { trigger: 'Jenkins', infers: [{ name: 'CI/CD', confidence: 0.95 }, { name: 'DevOps', confidence: 0.85 }] },
  { trigger: 'GitHub Actions', infers: [{ name: 'CI/CD', confidence: 0.95 }, { name: 'Git', confidence: 0.99 }] },
  { trigger: 'Stripe', infers: [{ name: 'Payment Integration', confidence: 0.95 }, { name: 'REST API', confidence: 0.80 }] },
  { trigger: 'Razorpay', infers: [{ name: 'Payment Integration', confidence: 0.95 } ] },
];

const inferSkills = (existingSkills) => {
  const existingNames = new Set(existingSkills.map(s => s.name.toLowerCase()));
  const inferredSkills = [];

  for (const rule of inferenceRules) {
    const triggerExists = existingSkills.some(
      s => s.name.toLowerCase() === rule.trigger.toLowerCase()
    );

    if (triggerExists) {
      for (const inferred of rule.infers) {
        if (!existingNames.has(inferred.name.toLowerCase())) {
          existingNames.add(inferred.name.toLowerCase());
          const triggerSkill = existingSkills.find(
            s => s.name.toLowerCase() === rule.trigger.toLowerCase()
          );
          inferredSkills.push({
            name: inferred.name,
            category: categorizeSkill(inferred.name),
            proficiency: downgradeProficiency(triggerSkill?.proficiency || 'Intermediate'),
            yearsOfExperience: Math.max(0, (triggerSkill?.yearsOfExperience || 1) - 0.5),
            isInferred: true,
            inferredFrom: rule.trigger,
            confidenceScore: inferred.confidence
          });
        }
      }
    }
  }

  return inferredSkills;
};

const categorizeSkill = (skillName) => {
  const categories = {
    Language: ['JavaScript', 'TypeScript', 'Python', 'Java', 'Go', 'Rust', 'C++', 'C#', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Dart', 'SQL', 'HTML', 'CSS'],
    Framework: ['React', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring Boot', 'Laravel', 'Ruby on Rails', 'Gatsby', 'Svelte', 'Tailwind CSS', 'Redux'],
    Database: ['MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'ElasticSearch', 'Cassandra', 'SQLite', 'DynamoDB', 'Firebase', 'NoSQL', 'Relational Databases'],
    DevOps: ['Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible', 'CI/CD', 'DevOps', 'Infrastructure as Code', 'Linux'],
    Cloud: ['AWS', 'Google Cloud', 'Azure', 'AWS Lambda', 'AWS ECS', 'Serverless', 'Vercel', 'Netlify', 'Heroku'],
    Tool: ['Git', 'GitHub', 'Jira', 'Figma', 'Postman', 'VS Code', 'Webpack', 'Vite', 'npm'],
    Platform: ['React Native', 'Flutter', 'Android', 'iOS', 'Mobile Development'],
    Domain: ['Machine Learning', 'Deep Learning', 'Computer Vision', 'NLP', 'Fintech', 'Healthcare', 'E-commerce', 'Payment Integration', 'Real-time Applications', 'WebSockets', 'Caching', 'Search']
  };

  for (const [category, skills] of Object.entries(categories)) {
    if (skills.some(s => s.toLowerCase() === skillName.toLowerCase())) {
      return category;
    }
  }
  return 'Other';
};

const downgradeProficiency = (proficiency) => {
  const levels = { 'Expert': 'Advanced', 'Advanced': 'Intermediate', 'Intermediate': 'Beginner', 'Beginner': 'Beginner' };
  return levels[proficiency] || 'Beginner';
};

module.exports = { inferSkills, categorizeSkill };
