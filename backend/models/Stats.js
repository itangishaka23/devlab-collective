import { pool } from '../config/db.js';

const count = async (sql) => (await pool.query(sql))[0][0].n;

export default {
  async overview() {
    const q = (t, w = '') => count(`SELECT COUNT(*) AS n FROM ${t} ${w}`);
    const [hostedProjects, projects, posts, faqs, messages, newMessages, subscribers, interests, members, applications, pendingApplications, events, registrations, pendingComments] =
      await Promise.all([
        q('hosted_projects'), q('projects'), q('posts'), q('faqs'), q('contact_messages'), q('contact_messages', "WHERE status = 'new'"),
        q('subscribers'), q('project_interests'), q('users', "WHERE role = 'member'"), q('applications'),
        q('applications', "WHERE status = 'pending'"), q('events'), q('event_registrations'), q('comments', "WHERE status = 'pending'"),
      ]);
    return {
      hostedProjects, projects, posts, faqs, messages, newMessages, subscribers, projectInterests: interests, members,
      applications, pendingApplications, events, registrations, pendingComments,
    };
  },
};
