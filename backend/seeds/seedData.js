require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Employee = require('../models/Employee');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsync_ai';

const hrUsers = [
  { name: 'Priya Sharma', email: 'priya.hr@skillsync.ai', password: 'password123', role: 'hr' },
  { name: 'Rohit Verma', email: 'rohit.hr@skillsync.ai', password: 'password123', role: 'hr' }
];

const employeeData = [
  {
    user: { name: 'Rahul Mehta', email: 'rahul@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Rahul Mehta', email: 'rahul@example.com',
      role: 'Senior Frontend Developer', location: 'Pune, Maharashtra',
      phone: '+91-9876543210', summary: 'Senior frontend developer with 5+ years building scalable React applications. Expert in real-time systems and fintech solutions.',
      totalYearsOfExperience: 5,
      skills: [
        { name: 'React', category: 'Framework', proficiency: 'Expert', yearsOfExperience: 5 },
        { name: 'TypeScript', category: 'Language', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'JavaScript', category: 'Language', proficiency: 'Expert', yearsOfExperience: 6 },
        { name: 'Next.js', category: 'Framework', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'Socket.IO', category: 'Tool', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'Redux', category: 'Framework', proficiency: 'Advanced', yearsOfExperience: 4 },
        { name: 'Tailwind CSS', category: 'Framework', proficiency: 'Expert', yearsOfExperience: 3 },
        { name: 'GraphQL', category: 'Tool', proficiency: 'Intermediate', yearsOfExperience: 2 },
        { name: 'Node.js', category: 'Language', proficiency: 'Intermediate', yearsOfExperience: 2 }
      ],
      projects: [
        { name: 'PayFlow Dashboard', description: 'Real-time payment tracking dashboard with WebSocket integration', technologies: ['React', 'Socket.IO', 'TypeScript'], duration: '6 months', role: 'Lead Developer' },
        { name: 'TradeSense Platform', description: 'Fintech trading platform with live market data', technologies: ['Next.js', 'Redux', 'Chart.js'], duration: '8 months', role: 'Frontend Architect' }
      ],
      previousCompanies: [
        { name: 'Razorpay', role: 'Senior Frontend Engineer', duration: '2 years', from: '2022', to: '2024' },
        { name: 'Flipkart', role: 'Frontend Developer', duration: '2 years', from: '2020', to: '2022' }
      ],
      certifications: [{ name: 'AWS Certified Developer', issuer: 'Amazon', year: 2023 }],
      availability: 'available', status: 'approved'
    }
  },
  {
    user: { name: 'Sneha Kulkarni', email: 'sneha@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Sneha Kulkarni', email: 'sneha@example.com',
      role: 'Full Stack Developer', location: 'Bangalore, Karnataka',
      phone: '+91-9876543211', summary: 'Full-stack developer with expertise in MERN stack and cloud deployments. Passionate about building scalable microservices.',
      totalYearsOfExperience: 4,
      skills: [
        { name: 'Node.js', category: 'Language', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'Express.js', category: 'Framework', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'React', category: 'Framework', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'MongoDB', category: 'Database', proficiency: 'Advanced', yearsOfExperience: 4 },
        { name: 'Docker', category: 'DevOps', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'AWS', category: 'Cloud', proficiency: 'Intermediate', yearsOfExperience: 2 },
        { name: 'Redis', category: 'Database', proficiency: 'Intermediate', yearsOfExperience: 1 },
        { name: 'TypeScript', category: 'Language', proficiency: 'Advanced', yearsOfExperience: 2 }
      ],
      projects: [
        { name: 'MicroCommerce Engine', description: 'Microservices-based e-commerce platform handling 10k+ orders/day', technologies: ['Node.js', 'Docker', 'MongoDB', 'Redis'], duration: '8 months', role: 'Backend Lead' },
        { name: 'CloudSync API', description: 'RESTful API for real-time file synchronization across devices', technologies: ['Express.js', 'AWS S3', 'MongoDB'], duration: '4 months', role: 'Full Stack Developer' }
      ],
      previousCompanies: [
        { name: 'Swiggy', role: 'Backend Engineer', duration: '2 years', from: '2022', to: '2024' },
        { name: 'Infosys', role: 'Software Engineer', duration: '2 years', from: '2020', to: '2022' }
      ],
      certifications: [
        { name: 'AWS Solutions Architect', issuer: 'Amazon', year: 2023 },
        { name: 'MongoDB Developer', issuer: 'MongoDB University', year: 2022 }
      ],
      availability: 'available', status: 'approved'
    }
  },
  {
    user: { name: 'Arjun Nair', email: 'arjun@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Arjun Nair', email: 'arjun@example.com',
      role: 'DevOps Engineer', location: 'Hyderabad, Telangana',
      phone: '+91-9876543212', summary: 'DevOps engineer specializing in cloud infrastructure and CI/CD pipelines. Expert in Kubernetes and Terraform.',
      totalYearsOfExperience: 6,
      skills: [
        { name: 'Kubernetes', category: 'DevOps', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'Docker', category: 'DevOps', proficiency: 'Expert', yearsOfExperience: 5 },
        { name: 'Terraform', category: 'DevOps', proficiency: 'Expert', yearsOfExperience: 3 },
        { name: 'AWS', category: 'Cloud', proficiency: 'Expert', yearsOfExperience: 5 },
        { name: 'Jenkins', category: 'DevOps', proficiency: 'Advanced', yearsOfExperience: 4 },
        { name: 'Ansible', category: 'DevOps', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'Python', category: 'Language', proficiency: 'Intermediate', yearsOfExperience: 3 },
        { name: 'GitHub Actions', category: 'DevOps', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'Prometheus', category: 'Tool', proficiency: 'Advanced', yearsOfExperience: 2 }
      ],
      projects: [
        { name: 'ZeroDowntime Deploy', description: 'Zero-downtime deployment system for 200+ microservices', technologies: ['Kubernetes', 'Terraform', 'AWS EKS'], duration: '1 year', role: 'Lead DevOps' },
        { name: 'AutoScale Platform', description: 'Auto-scaling infrastructure handling 1M+ concurrent users', technologies: ['AWS', 'Terraform', 'Prometheus'], duration: '8 months', role: 'DevOps Architect' }
      ],
      previousCompanies: [
        { name: 'Amazon', role: 'Senior DevOps Engineer', duration: '3 years', from: '2021', to: '2024' },
        { name: 'Wipro', role: 'Cloud Engineer', duration: '3 years', from: '2018', to: '2021' }
      ],
      certifications: [
        { name: 'AWS DevOps Professional', issuer: 'Amazon', year: 2023 },
        { name: 'CKA - Certified Kubernetes Administrator', issuer: 'CNCF', year: 2022 }
      ],
      availability: 'notice-period', status: 'approved'
    }
  },
  {
    user: { name: 'Kavya Reddy', email: 'kavya@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Kavya Reddy', email: 'kavya@example.com',
      role: 'AI/ML Engineer', location: 'Chennai, Tamil Nadu',
      phone: '+91-9876543213', summary: 'AI/ML engineer with expertise in NLP, computer vision, and production ML systems. Research background at IIT Madras.',
      totalYearsOfExperience: 3,
      skills: [
        { name: 'Python', category: 'Language', proficiency: 'Expert', yearsOfExperience: 5 },
        { name: 'TensorFlow', category: 'Framework', proficiency: 'Expert', yearsOfExperience: 3 },
        { name: 'PyTorch', category: 'Framework', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'NLP', category: 'Domain', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'OpenCV', category: 'Tool', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'FastAPI', category: 'Framework', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'Docker', category: 'DevOps', proficiency: 'Intermediate', yearsOfExperience: 1 },
        { name: 'AWS SageMaker', category: 'Cloud', proficiency: 'Intermediate', yearsOfExperience: 1 }
      ],
      projects: [
        { name: 'SentimentEdge', description: 'Real-time sentiment analysis system processing 500k+ reviews/day', technologies: ['TensorFlow', 'FastAPI', 'Docker'], duration: '5 months', role: 'ML Engineer' },
        { name: 'VisionGuard', description: 'Computer vision-based security system for retail chains', technologies: ['PyTorch', 'OpenCV', 'AWS'], duration: '6 months', role: 'AI Engineer' }
      ],
      previousCompanies: [
        { name: 'Google', role: 'ML Software Engineer', duration: '2 years', from: '2022', to: '2024' },
        { name: 'Samsung R&D', role: 'Research Engineer', duration: '1 year', from: '2021', to: '2022' }
      ],
      certifications: [{ name: 'TensorFlow Developer Certificate', issuer: 'Google', year: 2022 }],
      availability: 'available', status: 'approved'
    }
  },
  {
    user: { name: 'Vikram Singh', email: 'vikram@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Vikram Singh', email: 'vikram@example.com',
      role: 'Java Backend Developer', location: 'Mumbai, Maharashtra',
      phone: '+91-9876543214', summary: 'Java developer with 7 years experience building enterprise-grade microservices. Expert in Spring Boot and distributed systems.',
      totalYearsOfExperience: 7,
      skills: [
        { name: 'Java', category: 'Language', proficiency: 'Expert', yearsOfExperience: 7 },
        { name: 'Spring Boot', category: 'Framework', proficiency: 'Expert', yearsOfExperience: 5 },
        { name: 'Microservices', category: 'Domain', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'Apache Kafka', category: 'Tool', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'PostgreSQL', category: 'Database', proficiency: 'Advanced', yearsOfExperience: 5 },
        { name: 'Redis', category: 'Database', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'Docker', category: 'DevOps', proficiency: 'Intermediate', yearsOfExperience: 2 },
        { name: 'AWS', category: 'Cloud', proficiency: 'Intermediate', yearsOfExperience: 2 }
      ],
      projects: [
        { name: 'BankCore Microservices', description: 'Core banking system migrated from monolith to microservices (2M+ users)', technologies: ['Java', 'Spring Boot', 'Kafka', 'PostgreSQL'], duration: '1.5 years', role: 'Tech Lead' },
        { name: 'LoanFlow Engine', description: 'Automated loan processing engine with ML-based credit scoring', technologies: ['Java', 'Spring Boot', 'Redis'], duration: '8 months', role: 'Senior Developer' }
      ],
      previousCompanies: [
        { name: 'HDFC Bank', role: 'Senior Software Engineer', duration: '3 years', from: '2021', to: '2024' },
        { name: 'TCS', role: 'Java Developer', duration: '4 years', from: '2017', to: '2021' }
      ],
      certifications: [
        { name: 'Oracle Certified Java Professional', issuer: 'Oracle', year: 2021 },
        { name: 'Spring Professional', issuer: 'VMware', year: 2022 }
      ],
      availability: 'busy', status: 'approved'
    }
  },
  {
    user: { name: 'Ananya Iyer', email: 'ananya@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Ananya Iyer', email: 'ananya@example.com',
      role: 'Mobile Developer', location: 'Pune, Maharashtra',
      phone: '+91-9876543215', summary: 'Cross-platform mobile developer with 4 years experience in React Native and Flutter. Delivered apps with 1M+ downloads.',
      totalYearsOfExperience: 4,
      skills: [
        { name: 'React Native', category: 'Framework', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'Flutter', category: 'Framework', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'JavaScript', category: 'Language', proficiency: 'Expert', yearsOfExperience: 5 },
        { name: 'Dart', category: 'Language', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'Firebase', category: 'Database', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'Redux', category: 'Framework', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'REST API', category: 'Tool', proficiency: 'Expert', yearsOfExperience: 4 }
      ],
      projects: [
        { name: 'HealthConnect App', description: 'Healthcare app connecting patients with doctors (2M+ downloads)', technologies: ['React Native', 'Firebase', 'Redux'], duration: '10 months', role: 'Lead Mobile Developer' },
        { name: 'ShopEasy', description: 'E-commerce mobile app with AR try-on feature', technologies: ['Flutter', 'Firebase', 'Dart'], duration: '6 months', role: 'Mobile Developer' }
      ],
      previousCompanies: [
        { name: 'PharmEasy', role: 'Senior Mobile Developer', duration: '2 years', from: '2022', to: '2024' },
        { name: 'Zomato', role: 'Mobile Developer', duration: '2 years', from: '2020', to: '2022' }
      ],
      certifications: [{ name: 'Google Associate Android Developer', issuer: 'Google', year: 2021 }],
      availability: 'available', status: 'approved'
    }
  },
  {
    user: { name: 'Rohan Gupta', email: 'rohan@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Rohan Gupta', email: 'rohan@example.com',
      role: 'Data Engineer', location: 'Bangalore, Karnataka',
      phone: '+91-9876543216', summary: 'Data engineer specializing in large-scale data pipelines and analytics. Built systems processing petabytes of data at Ola.',
      totalYearsOfExperience: 5,
      skills: [
        { name: 'Python', category: 'Language', proficiency: 'Expert', yearsOfExperience: 5 },
        { name: 'Apache Spark', category: 'Tool', proficiency: 'Expert', yearsOfExperience: 3 },
        { name: 'Apache Kafka', category: 'Tool', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'Airflow', category: 'Tool', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'AWS', category: 'Cloud', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'Snowflake', category: 'Database', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'dbt', category: 'Tool', proficiency: 'Intermediate', yearsOfExperience: 1 },
        { name: 'PostgreSQL', category: 'Database', proficiency: 'Advanced', yearsOfExperience: 4 }
      ],
      projects: [
        { name: 'RideInsights Platform', description: 'Real-time analytics platform processing 50M+ ride events daily', technologies: ['Spark', 'Kafka', 'AWS', 'Snowflake'], duration: '1 year', role: 'Data Engineer' },
        { name: 'DataLake Architecture', description: 'AWS-based data lake serving 200+ analysts across the organization', technologies: ['AWS', 'Airflow', 'Python', 'dbt'], duration: '8 months', role: 'Lead Data Engineer' }
      ],
      previousCompanies: [
        { name: 'Ola', role: 'Senior Data Engineer', duration: '3 years', from: '2021', to: '2024' },
        { name: 'Mu Sigma', role: 'Data Analyst', duration: '2 years', from: '2019', to: '2021' }
      ],
      certifications: [
        { name: 'AWS Data Analytics Specialty', issuer: 'Amazon', year: 2023 },
        { name: 'Databricks Spark Developer', issuer: 'Databricks', year: 2022 }
      ],
      availability: 'available', status: 'approved'
    }
  },
  {
    user: { name: 'Pooja Joshi', email: 'pooja@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Pooja Joshi', email: 'pooja@example.com',
      role: 'UI/UX Engineer', location: 'Delhi, NCR',
      phone: '+91-9876543217', summary: 'UI/UX engineer bridging design and development. Expert in design systems and micro-interactions using Framer and React.',
      totalYearsOfExperience: 3,
      skills: [
        { name: 'React', category: 'Framework', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'Figma', category: 'Tool', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'Framer Motion', category: 'Framework', proficiency: 'Expert', yearsOfExperience: 2 },
        { name: 'CSS', category: 'Language', proficiency: 'Expert', yearsOfExperience: 5 },
        { name: 'Tailwind CSS', category: 'Framework', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'JavaScript', category: 'Language', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'Storybook', category: 'Tool', proficiency: 'Advanced', yearsOfExperience: 2 }
      ],
      projects: [
        { name: 'DesignSystem Pro', description: 'Enterprise design system with 100+ components used by 30 teams', technologies: ['React', 'Storybook', 'Figma', 'Framer Motion'], duration: '8 months', role: 'Design Engineer' },
        { name: 'AnimateUI', description: 'Animation library for React with 50+ ready-to-use micro-interactions', technologies: ['React', 'Framer Motion', 'CSS'], duration: '4 months', role: 'Creator' }
      ],
      previousCompanies: [
        { name: 'Meesho', role: 'UI Engineer', duration: '2 years', from: '2022', to: '2024' },
        { name: 'Nykaa', role: 'Frontend Developer', duration: '1 year', from: '2021', to: '2022' }
      ],
      availability: 'available', status: 'approved'
    }
  },
  {
    user: { name: 'Suresh Babu', email: 'suresh@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Suresh Babu', email: 'suresh@example.com',
      role: 'Cloud Architect', location: 'Hyderabad, Telangana',
      phone: '+91-9876543218', summary: 'Cloud architect with 8 years experience designing multi-cloud architectures. AWS and GCP certified expert.',
      totalYearsOfExperience: 8,
      skills: [
        { name: 'AWS', category: 'Cloud', proficiency: 'Expert', yearsOfExperience: 7 },
        { name: 'Google Cloud', category: 'Cloud', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'Azure', category: 'Cloud', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'Terraform', category: 'DevOps', proficiency: 'Expert', yearsOfExperience: 5 },
        { name: 'Kubernetes', category: 'DevOps', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'Python', category: 'Language', proficiency: 'Advanced', yearsOfExperience: 5 },
        { name: 'Security', category: 'Domain', proficiency: 'Advanced', yearsOfExperience: 4 }
      ],
      projects: [
        { name: 'MultiCloud Migration', description: 'Led migration of 500+ services to multi-cloud setup saving $2M/year', technologies: ['AWS', 'GCP', 'Terraform', 'Kubernetes'], duration: '2 years', role: 'Cloud Architect' }
      ],
      previousCompanies: [
        { name: 'Deloitte', role: 'Cloud Architect', duration: '4 years', from: '2020', to: '2024' },
        { name: 'Accenture', role: 'Cloud Consultant', duration: '4 years', from: '2016', to: '2020' }
      ],
      certifications: [
        { name: 'AWS Solutions Architect Professional', issuer: 'Amazon', year: 2023 },
        { name: 'Google Cloud Professional Architect', issuer: 'Google', year: 2022 }
      ],
      availability: 'busy', status: 'approved'
    }
  },
  {
    user: { name: 'Meera Pillai', email: 'meera@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Meera Pillai', email: 'meera@example.com',
      role: 'Backend Developer', location: 'Kochi, Kerala',
      phone: '+91-9876543219', summary: 'Backend developer specializing in Go and distributed systems. Built high-throughput APIs serving millions of requests.',
      totalYearsOfExperience: 4,
      skills: [
        { name: 'Go', category: 'Language', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'gRPC', category: 'Tool', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'PostgreSQL', category: 'Database', proficiency: 'Advanced', yearsOfExperience: 4 },
        { name: 'Redis', category: 'Database', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'Docker', category: 'DevOps', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'Kubernetes', category: 'DevOps', proficiency: 'Intermediate', yearsOfExperience: 2 },
        { name: 'Apache Kafka', category: 'Tool', proficiency: 'Intermediate', yearsOfExperience: 2 }
      ],
      projects: [
        { name: 'GoAPI Gateway', description: 'High-performance API gateway handling 1M+ requests/second', technologies: ['Go', 'gRPC', 'Redis', 'Kubernetes'], duration: '8 months', role: 'Lead Backend Developer' }
      ],
      previousCompanies: [
        { name: 'CRED', role: 'Senior Backend Engineer', duration: '2.5 years', from: '2021', to: '2024' },
        { name: 'Byju\'s', role: 'Backend Developer', duration: '1.5 years', from: '2020', to: '2021' }
      ],
      availability: 'available', status: 'approved'
    }
  },
  {
    user: { name: 'Karan Malhotra', email: 'karan@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Karan Malhotra', email: 'karan@example.com',
      role: 'React Developer', location: 'Gurgaon, Haryana',
      phone: '+91-9876543220', summary: 'React developer with 2 years experience building modern SPAs. Passionate about performance optimization and accessibility.',
      totalYearsOfExperience: 2,
      skills: [
        { name: 'React', category: 'Framework', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'JavaScript', category: 'Language', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'CSS', category: 'Language', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'Tailwind CSS', category: 'Framework', proficiency: 'Advanced', yearsOfExperience: 1 },
        { name: 'Vue.js', category: 'Framework', proficiency: 'Intermediate', yearsOfExperience: 1 },
        { name: 'REST API', category: 'Tool', proficiency: 'Advanced', yearsOfExperience: 2 }
      ],
      projects: [
        { name: 'JobBoard Pro', description: 'Job listing platform with AI-based recommendations', technologies: ['React', 'Tailwind CSS', 'REST API'], duration: '4 months', role: 'Frontend Developer' }
      ],
      previousCompanies: [
        { name: 'MakeMyTrip', role: 'Junior Frontend Developer', duration: '2 years', from: '2022', to: '2024' }
      ],
      availability: 'available', status: 'approved'
    }
  },
  {
    user: { name: 'Divya Agarwal', email: 'divya@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Divya Agarwal', email: 'divya@example.com',
      role: 'Healthcare Tech Developer', location: 'Mumbai, Maharashtra',
      phone: '+91-9876543221', summary: 'Full-stack developer specialized in healthcare technology. Built HIPAA-compliant systems and telemedicine platforms.',
      totalYearsOfExperience: 5,
      skills: [
        { name: 'React', category: 'Framework', proficiency: 'Advanced', yearsOfExperience: 4 },
        { name: 'Node.js', category: 'Language', proficiency: 'Advanced', yearsOfExperience: 4 },
        { name: 'Python', category: 'Language', proficiency: 'Intermediate', yearsOfExperience: 3 },
        { name: 'PostgreSQL', category: 'Database', proficiency: 'Advanced', yearsOfExperience: 4 },
        { name: 'HL7 FHIR', category: 'Domain', proficiency: 'Expert', yearsOfExperience: 3 },
        { name: 'Healthcare IT', category: 'Domain', proficiency: 'Expert', yearsOfExperience: 5 },
        { name: 'AWS', category: 'Cloud', proficiency: 'Intermediate', yearsOfExperience: 2 }
      ],
      projects: [
        { name: 'TeleMed Connect', description: 'HIPAA-compliant telemedicine platform with video consultation (100k+ patients)', technologies: ['React', 'Node.js', 'PostgreSQL', 'HL7 FHIR'], duration: '1 year', role: 'Tech Lead' }
      ],
      previousCompanies: [
        { name: 'Apollo Hospitals', role: 'Senior Software Engineer', duration: '3 years', from: '2021', to: '2024' },
        { name: 'Practo', role: 'Software Developer', duration: '2 years', from: '2019', to: '2021' }
      ],
      availability: 'on-leave', status: 'approved'
    }
  },
  {
    user: { name: 'Aditya Kumar', email: 'aditya@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Aditya Kumar', email: 'aditya@example.com',
      role: 'Blockchain Developer', location: 'Bangalore, Karnataka',
      phone: '+91-9876543222', summary: 'Blockchain developer with expertise in Ethereum, Solidity, and DeFi protocols. Built TVL $50M+ DeFi applications.',
      totalYearsOfExperience: 3,
      skills: [
        { name: 'Solidity', category: 'Language', proficiency: 'Expert', yearsOfExperience: 3 },
        { name: 'Ethereum', category: 'Platform', proficiency: 'Expert', yearsOfExperience: 3 },
        { name: 'Web3.js', category: 'Framework', proficiency: 'Expert', yearsOfExperience: 3 },
        { name: 'React', category: 'Framework', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'Node.js', category: 'Language', proficiency: 'Intermediate', yearsOfExperience: 2 },
        { name: 'Smart Contracts', category: 'Domain', proficiency: 'Expert', yearsOfExperience: 3 },
        { name: 'DeFi', category: 'Domain', proficiency: 'Advanced', yearsOfExperience: 2 }
      ],
      projects: [
        { name: 'DeFiVault Protocol', description: 'DeFi yield aggregator with $50M TVL', technologies: ['Solidity', 'Ethereum', 'Web3.js', 'React'], duration: '10 months', role: 'Smart Contract Developer' }
      ],
      previousCompanies: [
        { name: 'CoinDCX', role: 'Blockchain Developer', duration: '2 years', from: '2022', to: '2024' },
        { name: 'WazirX', role: 'Junior Developer', duration: '1 year', from: '2021', to: '2022' }
      ],
      availability: 'available', status: 'approved'
    }
  },
  {
    user: { name: 'Nisha Sharma', email: 'nisha@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Nisha Sharma', email: 'nisha@example.com',
      role: 'QA Automation Engineer', location: 'Noida, UP',
      phone: '+91-9876543223', summary: 'QA automation engineer with strong expertise in Selenium, Cypress and API testing. Reduced bug escape rate by 80% at previous role.',
      totalYearsOfExperience: 4,
      skills: [
        { name: 'Cypress', category: 'Tool', proficiency: 'Expert', yearsOfExperience: 3 },
        { name: 'Selenium', category: 'Tool', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'JavaScript', category: 'Language', proficiency: 'Advanced', yearsOfExperience: 4 },
        { name: 'Python', category: 'Language', proficiency: 'Intermediate', yearsOfExperience: 2 },
        { name: 'Jest', category: 'Tool', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'Postman', category: 'Tool', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'CI/CD', category: 'DevOps', proficiency: 'Intermediate', yearsOfExperience: 2 }
      ],
      projects: [
        { name: 'TestAutomation Suite', description: 'End-to-end test automation suite covering 10k+ test cases', technologies: ['Cypress', 'JavaScript', 'Jenkins'], duration: '6 months', role: 'QA Lead' }
      ],
      previousCompanies: [
        { name: 'Paytm', role: 'Senior QA Engineer', duration: '2.5 years', from: '2021', to: '2024' },
        { name: 'Mphasis', role: 'QA Engineer', duration: '1.5 years', from: '2020', to: '2021' }
      ],
      availability: 'available', status: 'approved'
    }
  },
  {
    user: { name: 'Deepak Tiwari', email: 'deepak@example.com', password: 'password123', role: 'employee' },
    profile: {
      name: 'Deepak Tiwari', email: 'deepak@example.com',
      role: 'Security Engineer', location: 'Pune, Maharashtra',
      phone: '+91-9876543224', summary: 'Application security engineer with OSCP certification. Expert in penetration testing, secure code review, and DevSecOps.',
      totalYearsOfExperience: 5,
      skills: [
        { name: 'Python', category: 'Language', proficiency: 'Advanced', yearsOfExperience: 5 },
        { name: 'Penetration Testing', category: 'Domain', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'OWASP', category: 'Domain', proficiency: 'Expert', yearsOfExperience: 5 },
        { name: 'Burp Suite', category: 'Tool', proficiency: 'Expert', yearsOfExperience: 4 },
        { name: 'AWS Security', category: 'Cloud', proficiency: 'Advanced', yearsOfExperience: 3 },
        { name: 'DevSecOps', category: 'DevOps', proficiency: 'Advanced', yearsOfExperience: 2 },
        { name: 'Docker', category: 'DevOps', proficiency: 'Intermediate', yearsOfExperience: 2 }
      ],
      projects: [
        { name: 'SecureBank Audit', description: 'Complete security audit of banking platform, found 45 critical vulnerabilities', technologies: ['Burp Suite', 'Python', 'OWASP'], duration: '3 months', role: 'Lead Security Engineer' }
      ],
      previousCompanies: [
        { name: 'IBM Security', role: 'Security Engineer', duration: '3 years', from: '2021', to: '2024' },
        { name: 'HCL Technologies', role: 'Junior Security Analyst', duration: '2 years', from: '2019', to: '2021' }
      ],
      certifications: [
        { name: 'OSCP - Offensive Security Certified Professional', issuer: 'Offensive Security', year: 2022 },
        { name: 'CEH - Certified Ethical Hacker', issuer: 'EC-Council', year: 2021 }
      ],
      availability: 'notice-period', status: 'approved'
    }
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Employee.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create HR users
    for (const hrData of hrUsers) {
      const user = await User.create(hrData);
      console.log(`✅ Created HR user: ${user.name}`);
    }

    // Create employees
    for (const data of employeeData) {
      const user = await User.create(data.user);
      await Employee.create({ userId: user._id, ...data.profile });
      console.log(`✅ Created employee: ${data.profile.name}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('HR Login: priya.hr@skillsync.ai / password123');
    console.log('Employee Login: rahul@example.com / password123');
    console.log('(All employees use password: password123)');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

seedDatabase();
