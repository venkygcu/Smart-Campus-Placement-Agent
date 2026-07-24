/**
 * skills.ts — Comprehensive tech skills list for autocomplete
 * ~500 skills across all major domains
 */
export const ALL_SKILLS: string[] = [
  // ── Languages ──────────────────────────────────────────────
  "JavaScript", "TypeScript", "Python", "Java", "C", "C++", "C#", "Go", "Rust",
  "Kotlin", "Swift", "Ruby", "PHP", "Scala", "Dart", "Elixir", "Haskell",
  "Lua", "R", "MATLAB", "Julia", "Perl", "Groovy", "Bash", "PowerShell",
  "Shell Scripting", "Assembly", "Objective-C", "F#", "Clojure", "Erlang",
  "Solidity", "Move", "Cairo", "Zig",

  // ── Web Frontend ───────────────────────────────────────────
  "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "SvelteKit",
  "Remix", "Astro", "Qwik", "Solid.js", "Lit", "Alpine.js", "jQuery",
  "HTML", "CSS", "SCSS", "Sass", "Less", "Tailwind CSS", "Bootstrap",
  "Material UI", "Chakra UI", "shadcn/ui", "Radix UI", "Ant Design",
  "Styled Components", "Emotion", "CSS Modules", "PostCSS",
  "WebAssembly", "Web Components", "PWA",

  // ── Web Backend ────────────────────────────────────────────
  "Node.js", "Express.js", "Fastify", "NestJS", "Hono", "Koa.js",
  "Django", "FastAPI", "Flask", "Tornado", "Starlette",
  "Spring Boot", "Spring Framework", "Quarkus", "Micronaut", "Vert.x",
  "ASP.NET Core", ".NET", "Blazor",
  "Ruby on Rails", "Sinatra", "Laravel", "Symfony", "CodeIgniter",
  "Phoenix (Elixir)", "Actix-web", "Axum", "Gin (Go)", "Echo (Go)", "Fiber (Go)",
  "GraphQL", "REST API", "gRPC", "WebSockets", "tRPC", "SOAP",

  // ── Databases ──────────────────────────────────────────────
  "PostgreSQL", "MySQL", "SQLite", "MariaDB", "Oracle DB", "MS SQL Server",
  "MongoDB", "Redis", "Cassandra", "DynamoDB", "CouchDB", "RavenDB",
  "Elasticsearch", "OpenSearch", "InfluxDB", "TimescaleDB", "Cockroachdb",
  "Supabase", "Firebase Firestore", "Firebase Realtime DB", "PlanetScale",
  "Turso", "Neon", "Xata", "FaunaDB", "Fauna",
  "Drizzle ORM", "Prisma", "TypeORM", "Sequelize", "SQLAlchemy", "Hibernate",
  "Mongoose", "Knex.js",

  // ── Cloud & DevOps ─────────────────────────────────────────
  "AWS", "Google Cloud (GCP)", "Microsoft Azure", "Vercel", "Netlify",
  "Railway", "Render", "Fly.io", "Heroku", "DigitalOcean", "Linode",
  "Docker", "Kubernetes", "Docker Compose", "Helm", "Podman",
  "Terraform", "Pulumi", "Ansible", "Chef", "Puppet",
  "CI/CD", "GitHub Actions", "GitLab CI", "Jenkins", "CircleCI",
  "Travis CI", "ArgoCD", "Flux", "Tekton",
  "Nginx", "Apache HTTP Server", "Caddy", "HAProxy", "Traefik",
  "Linux", "Ubuntu", "CentOS", "Debian", "Alpine Linux",
  "AWS Lambda", "AWS EC2", "AWS S3", "AWS RDS", "AWS ECS", "AWS EKS",
  "AWS CloudFront", "AWS SQS", "AWS SNS", "AWS API Gateway",
  "GCP Cloud Run", "GCP BigQuery", "GCP Pub/Sub",

  // ── Mobile ─────────────────────────────────────────────────
  "React Native", "Flutter", "Expo", "Ionic", "Capacitor",
  "Android Development", "iOS Development", "SwiftUI", "Jetpack Compose",
  "Xamarin", "Kotlin Multiplatform", "Unity (Mobile)",

  // ── AI / ML / Data Science ─────────────────────────────────
  "Machine Learning", "Deep Learning", "Neural Networks",
  "Natural Language Processing (NLP)", "Computer Vision",
  "Reinforcement Learning", "Generative AI", "LLM Fine-tuning", "RAG",
  "Prompt Engineering",
  "TensorFlow", "PyTorch", "Keras", "JAX", "scikit-learn",
  "Hugging Face Transformers", "LangChain", "LlamaIndex", "CrewAI",
  "OpenAI API", "Anthropic API", "Groq API", "Ollama",
  "Pandas", "NumPy", "SciPy", "Matplotlib", "Seaborn", "Plotly",
  "Jupyter Notebook", "Apache Spark", "Hadoop", "Hive", "Kafka",
  "Airflow", "dbt", "MLflow", "Weights & Biases", "DVC",
  "OpenCV", "YOLO", "Stable Diffusion", "Whisper",
  "Data Analysis", "Data Visualization", "Statistics", "Linear Algebra",
  "ETL Pipelines", "Feature Engineering", "Model Deployment",

  // ── System Design & Architecture ───────────────────────────
  "System Design", "Microservices", "Event-Driven Architecture",
  "Domain-Driven Design (DDD)", "CQRS", "Event Sourcing",
  "Distributed Systems", "Message Queues", "Apache Kafka", "RabbitMQ",
  "Redis Pub/Sub", "NATS", "AWS SQS",
  "Load Balancing", "Caching", "CDN", "API Design",
  "Database Sharding", "Replication", "CAP Theorem",

  // ── Security ───────────────────────────────────────────────
  "Cybersecurity", "Penetration Testing", "Ethical Hacking",
  "OWASP", "OAuth 2.0", "OpenID Connect", "JWT", "SAML",
  "SSL/TLS", "Cryptography", "Network Security",
  "Burp Suite", "Metasploit", "Nmap", "Wireshark",
  "Web Application Security", "Cloud Security", "DevSecOps",
  "SOC", "SIEM", "Incident Response",

  // ── Blockchain & Web3 ──────────────────────────────────────
  "Blockchain", "Ethereum", "Solana", "Aptos", "Sui",
  "Smart Contracts", "DeFi", "NFTs", "Web3.js", "ethers.js", "Viem",
  "Hardhat", "Foundry", "Truffle", "IPFS", "The Graph",
  "Metamask", "Wallet Integration",

  // ── Testing ────────────────────────────────────────────────
  "Unit Testing", "Integration Testing", "E2E Testing",
  "Jest", "Vitest", "Mocha", "Chai", "Jasmine",
  "React Testing Library", "Cypress", "Playwright", "Selenium",
  "pytest", "JUnit", "TestNG", "Mockito",
  "TDD", "BDD", "Load Testing", "k6", "Artillery",

  // ── Version Control & Collaboration ────────────────────────
  "Git", "GitHub", "GitLab", "Bitbucket", "SVN",
  "Jira", "Linear", "Notion", "Confluence", "Trello",
  "Agile", "Scrum", "Kanban", "SAFe",

  // ── Design & UI/UX ─────────────────────────────────────────
  "Figma", "Adobe XD", "Sketch", "InVision", "Zeplin",
  "UI Design", "UX Design", "Wireframing", "Prototyping",
  "User Research", "Design Systems", "Accessibility (a11y)",
  "Adobe Photoshop", "Adobe Illustrator", "After Effects", "Framer",

  // ── Embedded & IoT ─────────────────────────────────────────
  "Embedded Systems", "Arduino", "Raspberry Pi", "ESP32", "STM32",
  "RTOS", "FreeRTOS", "Zephyr OS", "MQTT", "Modbus", "CAN Bus",
  "IoT", "Firmware Development", "Hardware-Software Interface",

  // ── Game Development ───────────────────────────────────────
  "Unity", "Unreal Engine", "Godot", "Pygame", "Three.js", "Babylon.js",
  "WebGL", "OpenGL", "Vulkan", "DirectX",

  // ── Finance & Quant ────────────────────────────────────────
  "Quantitative Finance", "Algorithmic Trading", "Financial Modeling",
  "Options Pricing", "Risk Management", "Bloomberg API",

  // ── Soft Skills / Other ────────────────────────────────────
  "Problem Solving", "Data Structures", "Algorithms", "Competitive Programming",
  "System Design", "Communication", "Leadership", "Team Collaboration",
  "Project Management", "Technical Writing", "Open Source Contribution",
];

/**
 * Search skills with fuzzy matching — returns top N results.
 * Prioritizes: exact prefix > word prefix > substring match
 */
export function searchSkills(query: string, limit = 8): string[] {
  if (!query || query.trim().length < 1) return [];
  const q = query.toLowerCase().trim();

  const exactPrefix: string[] = [];
  const wordPrefix: string[] = [];
  const substring: string[] = [];

  for (const skill of ALL_SKILLS) {
    const lower = skill.toLowerCase();
    if (lower.startsWith(q)) {
      exactPrefix.push(skill);
    } else if (lower.split(/[\s./-]/).some((word) => word.startsWith(q))) {
      wordPrefix.push(skill);
    } else if (lower.includes(q)) {
      substring.push(skill);
    }
  }

  return [...exactPrefix, ...wordPrefix, ...substring].slice(0, limit);
}
