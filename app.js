/* ===== SCHOLARIUM — Core App Logic ===== */

// ---- THEME ----
function applyTheme() {
  const theme = localStorage.getItem('scholarium_theme') || 'dark-academia';
  document.documentElement.setAttribute('data-theme', theme);
}

function setTheme(theme) {
  localStorage.setItem('scholarium_theme', theme);
  document.documentElement.setAttribute('data-theme', theme);
}

// ---- SUBJECTS ----
function getSubjects() {
  return JSON.parse(localStorage.getItem('scholarium_subjects') || '[]');
}
function saveSubjects(subjects) {
  localStorage.setItem('scholarium_subjects', JSON.stringify(subjects));
}

// ---- STREAK ----
function getStreakData() {
  return JSON.parse(localStorage.getItem('scholarium_streak') || '{"streak":0,"lastDate":null,"longestStreak":0,"history":[]}');
}
function saveStreakData(d) {
  localStorage.setItem('scholarium_streak', JSON.stringify(d));
}
function getStreak() {
  return getStreakData().streak || 0;
}

function checkAndUpdateStreak() {
  const today = new Date().toISOString().slice(0, 10);
  const d = getStreakData();
  if (d.lastDate === today) return; // already visited today
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (d.lastDate === yesterday) {
    d.streak = (d.streak || 0) + 1;
  } else if (d.lastDate !== today) {
    d.streak = 1;
  }
  d.lastDate = today;
  d.longestStreak = Math.max(d.longestStreak || 0, d.streak);
  if (!d.history) d.history = [];
  if (!d.history.includes(today)) d.history.push(today);
  saveStreakData(d);
  // update nav badge
  const el = document.getElementById('navStreakCount');
  if (el) el.textContent = d.streak;
}

// ---- SESSIONS / STUDY TIME ----
function getSessions() {
  return JSON.parse(localStorage.getItem('scholarium_sessions') || '[]');
}
function saveSessions(s) {
  localStorage.setItem('scholarium_sessions', JSON.stringify(s));
}
function logSession(subjectId, subjectName, minutes, emoji) {
  const sessions = getSessions();
  const today = new Date().toISOString().slice(0, 10);
  sessions.push({ date: today, subjectId, subjectName, minutes, emoji, ts: Date.now() });
  saveSessions(sessions);
  // also update subject time
  const subjects = getSubjects();
  const s = subjects.find(x => x.id === subjectId);
  if (s) { s.timeStudied = (s.timeStudied || 0) + minutes; saveSubjects(subjects); }
  // update daily log for streak/trees
  const treesData = getTreesData();
  const todayEntry = treesData.find(t => t.date === today);
  if (todayEntry) { todayEntry.minutes = (todayEntry.minutes || 0) + minutes; }
  else treesData.push({ date: today, minutes, trees: [] });
  saveTreesData(treesData);
}
function getTodayStudyMins() {
  const today = new Date().toISOString().slice(0, 10);
  return getSessions().filter(s => s.date === today).reduce((a, s) => a + s.minutes, 0);
}

// ---- TREES ----
function getTreesData() {
  return JSON.parse(localStorage.getItem('scholarium_trees') || '[]');
}
function saveTreesData(d) {
  localStorage.setItem('scholarium_trees', JSON.stringify(d));
}

// ---- TODOS ----
function getTodos() {
  return JSON.parse(localStorage.getItem('scholarium_todos') || '[]');
}
function saveTodos(t) {
  localStorage.setItem('scholarium_todos', JSON.stringify(t));
}

// ---- SETTINGS ----
function getSettings() {
  return JSON.parse(localStorage.getItem('scholarium_settings') || '{"theme":"dark-academia","notifications":false,"pomoDuration":25,"shortBreak":5,"longBreak":15,"dailyGoalMins":120,"soundEnabled":true}');
}
function saveSettings(s) {
  localStorage.setItem('scholarium_settings', JSON.stringify(s));
}

// ---- UTILITIES ----
function showToast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3100);
}

function toggleNav() {
  document.getElementById('navSidebar')?.classList.toggle('open');
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatMins(mins) {
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins/60)}h ${mins%60}m`;
}

// Click outside nav on mobile
document.addEventListener('click', (e) => {
  const nav = document.getElementById('navSidebar');
  const ham = document.getElementById('hamburger');
  if (nav && nav.classList.contains('open') && !nav.contains(e.target) && !ham?.contains(e.target)) {
    nav.classList.remove('open');
  }
});
