export type Project = {
  slug: string;
  name: string;
  kicker: string;
  description: string;
  stack: string[];
  github?: string;
  demo?: string;
  product?: string;
  image?: string;
};

export const projects: Project[] = [
  { slug: 'intelli-credit', name: 'IntelliCredit', kicker: 'Credit risk, made legible', description: 'An AI-powered credit-risk assessment platform with an end-to-end machine-learning pipeline and an interactive Streamlit interface.', stack: ['Python', 'Machine learning', 'Streamlit', 'Pandas', 'REST APIs'], github: 'https://github.com/AdvaithD-572/intellicredit-ai-project' },
  { slug: 'recovery-companion', name: 'Recovery Companion', kicker: 'A calmer path after discharge', description: 'A mobile-first recovery platform combining patient check-ins, prescription tracking, multilingual voice support and clinician-focused recovery signals.', stack: ['Flutter', 'FastAPI', 'PostgreSQL', 'Docker', 'Google Cloud AI'], github: 'https://github.com/AdvaithD-572/Recovery-companion' },
  { slug: 'sienna', name: 'SIENNA', kicker: 'AI with an adjustable personality', description: 'A configurable Flask and Groq assistant with isolated agent sessions, tunable personality parameters, conversation memory and transcript export.', stack: ['Python', 'Flask', 'Groq', 'LLMs', 'Session management'], github: 'https://github.com/AdvaithD-572/SIENNA' },
  { slug: 'sports-intelligence', name: 'Sports Intelligence', kicker: 'Answers that show their evidence', description: 'An agentic RAG application that routes sports questions across cricket and Olympics indexes, fuses retrieval results and cites the supplied evidence.', stack: ['Python', 'FastAPI', 'Qdrant', 'BM25', 'RAG'], github: 'https://github.com/AdvaithD-572/team1-jardajanardhan', demo: 'https://drive.google.com/file/d/1xYbdZJTMuA6rBXW4tCNmsfXAqFcsQ3S4/view?usp=sharing', image: '/assets/sports-intelligence-frame.jpg' },
];

export const products = [
  { name: 'ClientFlow Global', description: 'A buyer-owned client portal source kit for collecting files, delivering versioned work, gathering contextual feedback and recording approvals.', href: 'https://forgeproject.gumroad.com/l/clientflow' },
  { name: 'Vantiros', description: 'A self-hosted multi-channel ecommerce operating system with unified operations, analytics and deployment-ready source code.', href: 'https://forgeproject.gumroad.com/l/vantiros' },
  { name: 'AuditFlow', description: 'A self-hosted website-audit kit that turns observable page signals into editable, client-ready strategic briefs.', href: 'https://forgeproject.gumroad.com/l/vjabxi' },
];

export const skills = [
  ['Languages', 'Python, Java, C, SQL, JavaScript, HTML and CSS'],
  ['Application', 'React, Node.js, FastAPI, REST APIs, Flutter'],
  ['Data and AI', 'PostgreSQL, Redis, data analytics, LLMs, prompt engineering'],
  ['Delivery', 'Git, Docker, Google Cloud, testing, debugging'],
];

export const links = {
  github: 'https://github.com/AdvaithD-572', linkedin: 'https://www.linkedin.com/in/advaith-dabilipuram/', codechef: 'https://www.codechef.com/users/advaith_d', leetcode: 'https://leetcode.com/u/5xTW3nK0DT/', email: 'mailto:dabilipuramadvaith@gmail.com', resume: '/assets/advaith-dabilipuram-resume.pdf'
};
