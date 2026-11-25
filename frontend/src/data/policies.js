// Block types: p, ul (items: [{b, t}] or strings), callout {text, warn}
export const PRIVACY = {
  title: 'Privacy Policy',
  icon: 'bi-shield-lock-fill',
  eyebrow: 'Legal',
  lead: 'How the DevLab Collective collects, uses and protects the information you share as a member, applicant or visitor.',
  updated: 'Last updated: November 1, 2026',
  sections: [
    { id: 'overview', title: 'Overview', blocks: [
      { type: 'p', text: 'DevLab Collective (“the Lab”, “we”, “us”) is a student-run software engineering lab. This policy explains how we handle information when you visit our website, apply to join, contribute to a project or contact us.' },
      { type: 'p', text: 'By using the site you agree to the practices described here. If you do not agree, please stop using the site.' },
    ] },
    { id: 'information-we-collect', title: 'Information We Collect', blocks: [
      { type: 'p', text: 'We collect information in the following ways:' },
      { type: 'ul', items: [
        { b: 'Information you provide', t: ' — name, email address, programme of study and the message you send through forms.' },
        { b: 'Membership details', t: ' — skills, availability and the tracks you are interested in.' },
        { b: 'Contribution data', t: ' — your public commit history, pull requests and issue comments in lab repositories.' },
        { b: 'Automatic data', t: ' — browser type, device information and pages visited, collected through cookies and similar technologies.' },
      ] },
    ] },
    { id: 'how-we-use-it', title: 'How We Use It', blocks: [
      { type: 'ul', items: [
        'Review applications and manage membership',
        'Assign people to projects and sprints',
        'Send lab announcements and newsletters (you can opt out anytime)',
        'Respond to enquiries',
        'Improve the website and our programmes',
        'Meet legal and institutional obligations',
      ] },
      { type: 'callout', text: 'We never sell your personal information.' },
    ] },
    { id: 'accounts-and-repositories', title: 'Accounts & Repositories', blocks: [
      { type: 'p', text: 'Lab projects are hosted on third-party platforms such as GitHub. Commits, issues and pull requests are usually public and permanent. Please do not commit personal data, passwords or API keys. If you do so by mistake, tell a mentor immediately so the secret can be rotated.' },
    ] },
    { id: 'cookies', title: 'Cookies & Tracking', blocks: [
      { type: 'p', text: 'We use a small number of cookies to remember preferences and understand how the site is used. You can disable cookies in your browser; some features may then work differently.' },
    ] },
    { id: 'sharing', title: 'Sharing & Disclosure', blocks: [
      { type: 'p', text: 'We share information only with service providers who help us operate the lab (for example hosting and email), with university staff where required for academic purposes, or when the law requires it.' },
    ] },
    { id: 'data-retention', title: 'Data Retention', blocks: [
      { type: 'p', text: 'We keep membership records while you are active and for up to two years afterwards so we can provide references. Application data from people who do not join is deleted after one year.' },
    ] },
    { id: 'your-rights', title: 'Your Rights & Choices', blocks: [
      { type: 'ul', items: ['Request a copy of the personal data we hold about you', 'Ask us to correct or delete it', 'Withdraw consent for emails at any time', 'Object to certain uses of your data'] },
    ] },
    { id: 'minors', title: 'Minors', blocks: [
      { type: 'p', text: 'The lab is intended for people aged 16 and over. If you believe a younger person has given us information, contact us and we will remove it.' },
    ] },
    { id: 'security', title: 'Security', blocks: [
      { type: 'p', text: 'We use HTTPS, access controls, two-factor authentication for maintainers and regular dependency audits. No system is perfectly secure, so we encourage responsible disclosure of any issue you find.' },
    ] },
    { id: 'international', title: 'International Transfers', blocks: [
      { type: 'p', text: 'Some providers store data in other countries. Where this happens we rely on providers that offer appropriate safeguards.' },
    ] },
    { id: 'changes', title: 'Changes to This Policy', blocks: [
      { type: 'p', text: 'We may update this policy as the lab evolves. Material changes will be announced on the site and by email to active members.' },
    ] },
    { id: 'contact-us', title: 'Contact Us', blocks: [
      { type: 'p', text: 'Questions about privacy? Use the contact form on our home page and select “Privacy” as the subject.' },
    ] },
  ],
};

export const TERMS = {
  title: 'Terms of Use',
  icon: 'bi-file-earmark-text-fill',
  eyebrow: 'Legal',
  lead: 'The ground rules for using our website and taking part in DevLab Collective projects.',
  updated: 'Last updated: November 1, 2026',
  sections: [
    { id: 'acceptance', title: 'Acceptance of Terms', blocks: [
      { type: 'p', text: 'By accessing this website or participating in lab activities you agree to these Terms. If you do not agree, please do not use the site or join the lab.' },
    ] },
    { id: 'eligibility', title: 'Eligibility & Membership', blocks: [
      { type: 'p', text: 'Membership is open to students and recent graduates aged 16 or older who are accepted through our application process. We may decline or end membership to protect the community or the quality of our work.' },
    ] },
    { id: 'contributions', title: 'Contributions & Licensing', blocks: [
      { type: 'p', text: 'When you contribute code, documentation or designs to a lab project, you confirm that you have the right to do so and you agree that your contribution is released under that project’s open-source licence (shown in its repository).' },
      { type: 'callout', text: 'You keep credit for your commits. Do not submit code copied from sources you are not allowed to reuse.' },
    ] },
    { id: 'academic-integrity', title: 'Academic Integrity', blocks: [
      { type: 'p', text: 'Lab work may overlap with coursework. You are responsible for following your institution’s rules on collaboration and attribution, and for declaring lab contributions where required.' },
    ] },
    { id: 'conduct', title: 'Code of Conduct', blocks: [
      { type: 'ul', items: ['Be respectful and constructive in reviews and discussions', 'No harassment, discrimination or bullying', 'Credit others’ work', 'Report concerns to a mentor or the lab director'] },
    ] },
    { id: 'accounts-access', title: 'Accounts & Access', blocks: [
      { type: 'p', text: 'You are responsible for the security of the accounts and credentials you use for lab systems. Never share access tokens, and enable two-factor authentication where available.' },
    ] },
    { id: 'security-research', title: 'Security & Responsible Testing', blocks: [
      { type: 'p', text: 'Only test systems you have been authorised to test. If you find a vulnerability, report it privately to the lab and give us reasonable time to fix it before disclosure.' },
    ] },
    { id: 'intellectual-property', title: 'Intellectual Property', blocks: [
      { type: 'p', text: 'The DevLab Collective name, logo and website design are owned by the lab. Open-source code remains under its respective licence.' },
    ] },
    { id: 'third-party-links', title: 'Third-Party Links', blocks: [
      { type: 'p', text: 'Our site and projects may link to or depend on third-party services. We do not control them and are not responsible for their content or policies.' },
    ] },
    { id: 'disclaimers', title: 'Disclaimers', blocks: [
      { type: 'p', text: 'Lab software is provided “as is” without warranty of any kind. Projects are educational and may contain bugs; do not rely on them for critical purposes.' },
    ] },
    { id: 'liability', title: 'Limitation of Liability', blocks: [
      { type: 'p', text: 'To the fullest extent permitted by law, the lab and its mentors are not liable for indirect or consequential losses arising from use of the site or lab software.' },
    ] },
    { id: 'termination', title: 'Termination', blocks: [
      { type: 'p', text: 'You may leave at any time. We may suspend access for violations of these Terms. Open-source contributions already merged remain under their licences.' },
    ] },
    { id: 'changes-terms', title: 'Changes to These Terms', blocks: [
      { type: 'p', text: 'We may update these Terms. Continued use after changes means you accept the new version.' },
      { type: 'callout', warn: true, text: 'This document is a general template for informational purposes and is not legal advice. Have it reviewed by your institution or a qualified professional before relying on it.' },
    ] },
    { id: 'contact-terms', title: 'Contact', blocks: [
      { type: 'p', text: 'Questions about these Terms? Reach out through the contact form on the home page.' },
    ] },
  ],
};
