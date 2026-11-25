export const FAQ_CATEGORIES = [
  { id: 'all', label: 'All', icon: 'bi-grid-fill' },
  { id: 'joining', label: 'Joining', icon: 'bi-person-plus-fill' },
  { id: 'projects', label: 'Projects', icon: 'bi-kanban-fill' },
  { id: 'tools', label: 'Tools & Stack', icon: 'bi-tools' },
  { id: 'careers', label: 'Careers', icon: 'bi-briefcase-fill' },
  { id: 'general', label: 'General', icon: 'bi-info-circle-fill' },
];

export const FAQS = [
  // Joining
  { cat: 'joining', q: 'Who can join the DevLab Collective?', a: 'Any student or recent graduate with basic programming experience can apply. You do not need to be an expert — curiosity, reliability and a willingness to receive code review matter most.' },
  { cat: 'joining', q: 'How do I apply?', a: 'Use the contact form on the home page and choose “Join the Lab” as the subject. We open intake at the start of each semester and invite applicants to a short technical conversation and a small pairing exercise.' },
  { cat: 'joining', q: 'What is the weekly time commitment?', a: 'Plan for about 6–8 hours a week: a planning or review session, a stand-up rhythm, and focused build time. Exam periods are planned around in advance.' },
  { cat: 'joining', q: 'Can I join remotely?', a: 'Yes. Our workflow is built around Git, pull requests and async updates, so hybrid and remote members contribute fully. Demos and retrospectives run on video as well as in person.' },
  // Projects
  { cat: 'projects', q: 'How are projects chosen?', a: 'Projects come from campus needs, community partners and open-source gaps. The mentors team scores each proposal on learning value, scope and user impact before it enters the roadmap.' },
  { cat: 'projects', q: 'Can I propose my own project?', a: 'Absolutely. Submit a one-page proposal with the problem, target users and a rough tech stack. If approved, you become the product owner for the first sprint.' },
  { cat: 'projects', q: 'How do sprints work?', a: 'Every sprint lasts two weeks: planning on day one, daily asynchronous stand-ups, a demo to stakeholders and a retrospective at the end. Velocity and bug counts are tracked on the project board.' },
  { cat: 'projects', q: 'Who owns the code we write?', a: 'Lab projects are released under open-source licences chosen per project (usually MIT). Contributors keep credit for their commits and may reference the work in their portfolios.' },
  // Tools
  { cat: 'tools', q: 'Which languages and frameworks do you use?', a: 'Mostly JavaScript/TypeScript (React, Node.js), Python (FastAPI) and SQL. We pick the right tool per project rather than forcing one stack, and mentors help you ramp up.' },
  { cat: 'tools', q: 'What does the CI/CD pipeline look like?', a: 'Every pull request triggers linting, unit tests and a preview build. Merges to main run the full test suite, build container images and deploy to staging, with production releases gated by a reviewer.' },
  { cat: 'tools', q: 'What are the testing expectations?', a: 'New features ship with tests. We aim for at least 80% coverage on business logic and require passing checks before a pull request can be merged.' },
  // Careers
  { cat: 'careers', q: 'Will the lab help with internships and jobs?', a: 'Yes. Mentors from industry run mock interviews, review portfolios and share openings. Many members land internships after one or two semesters of lab work.' },
  { cat: 'careers', q: 'Do I get a certificate?', a: 'Members who complete at least two sprints and one release receive a lab completion certificate and a written reference describing their contribution.' },
  // General
  { cat: 'general', q: 'Is the lab free?', a: 'Yes — membership is free. Hosting and tooling costs are covered by sponsors and university support.' },
  { cat: 'general', q: 'How do I report a security issue in a lab project?', a: 'Please email the lab address with “Security” in the subject and include steps to reproduce. We acknowledge reports promptly and credit responsible disclosure in our release notes.' },
  { cat: 'general', q: 'How can industry partners get involved?', a: 'Reach out through the contact form. Partners can sponsor projects, mentor teams, offer real-world problem statements or host demo days.' },
];
