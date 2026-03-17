const questionField = document.getElementById('question');
const attemptField = document.getElementById('attempt');
const difficultyField = document.getElementById('difficulty');
const topicField = document.getElementById('topic');
const output = document.getElementById('output');
const statsField = document.getElementById('stats');
const historyList = document.getElementById('history');

const hintBtn = document.getElementById('hintBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
const checkBtn = document.getElementById('checkBtn');
const practiceBtn = document.getElementById('practiceBtn');
const saveBtn = document.getElementById('saveBtn');
const clearBtn = document.getElementById('clearBtn');
const themeBtn = document.getElementById('themeBtn');

const historyKey = 'sparxCoachHistory';
const statsKey = 'sparxCoachStats';

const state = {
  hintIndex: 0,
  stats: {
    hintsUsed: 0,
    checksDone: 0,
    sessionsSaved: 0
  },
  history: []
};

const hintsByDifficulty = {
  easy: [
    'Underline what the question asks for, then list known values.',
    'Write the formula before substituting any numbers.',
    'Do one operation at a time and keep units on each line.'
  ],
  medium: [
    'Split the problem into two mini-steps and solve the first part only.',
    'Check signs and order of operations before simplifying.',
    'Estimate the final value first to sanity-check your result.'
  ],
  hard: [
    'Define variables clearly, then rewrite the question algebraically.',
    'Look for equivalent forms (factorise, rearrange, or substitute).',
    'After solving, test your result in the original question.'
  ]
};

function detectTopic(question) {
  const q = question.toLowerCase();
  if (q.includes('x') || q.includes('equation')) return 'Algebra';
  if (q.includes('angle') || q.includes('triangle') || q.includes('circle')) return 'Geometry';
  if (q.includes('%') || q.includes('probability')) return 'Percentages / Probability';
  if (q.includes('ratio') || q.includes(':')) return 'Ratio';
  if (q.includes('mean') || q.includes('median') || q.includes('mode')) return 'Statistics';
  return 'General maths';
}

function readInput() {
  const question = questionField.value.trim();
  const attempt = attemptField.value.trim();
  const difficulty = difficultyField.value;
  const topic = question ? detectTopic(question) : 'No question yet';
  return { question, attempt, difficulty, topic };
}

function renderStats() {
  statsField.textContent = `Hints used: ${state.stats.hintsUsed} • Checks done: ${state.stats.checksDone} • Sessions saved: ${state.stats.sessionsSaved}`;
}

function renderHistory() {
  historyList.innerHTML = '';
  if (!state.history.length) {
    historyList.innerHTML = '<li>No saved sessions yet.</li>';
    return;
  }

  state.history.slice(0, 5).forEach((entry) => {
    const li = document.createElement('li');
    li.textContent = `${entry.topic} (${entry.difficulty}) — ${entry.question.slice(0, 70)}${entry.question.length > 70 ? '…' : ''}`;
    historyList.appendChild(li);
  });
}

function persist() {
  localStorage.setItem(historyKey, JSON.stringify(state.history));
  localStorage.setItem(statsKey, JSON.stringify(state.stats));
}

function loadPersisted() {
  const history = localStorage.getItem(historyKey);
  const stats = localStorage.getItem(statsKey);

  if (history) {
    state.history = JSON.parse(history);
  }

  if (stats) {
    state.stats = JSON.parse(stats);
  }

  renderStats();
  renderHistory();
}

questionField.addEventListener('input', () => {
  const { topic } = readInput();
  topicField.textContent = topic;
});

hintBtn.addEventListener('click', () => {
  const { question, difficulty, topic } = readInput();
  if (!question) {
    output.textContent = 'Please paste your question first so I can guide you.';
    return;
  }

  const set = hintsByDifficulty[difficulty] || hintsByDifficulty.medium;
  output.textContent = `Topic: ${topic}\nHint ${state.hintIndex + 1} (${difficulty}):\n${set[state.hintIndex]}`;
  state.hintIndex = (state.hintIndex + 1) % set.length;
  state.stats.hintsUsed += 1;
  renderStats();
  persist();
});

nextStepBtn.addEventListener('click', () => {
  const { question, attempt, topic } = readInput();
  if (!question) {
    output.textContent = 'Add your question first.';
    return;
  }

  if (!attempt) {
    output.textContent = 'Show your attempt and I will suggest the next step tailored to your working.';
    return;
  }

  output.textContent = `Next step coach (${topic}):\n- Compare your current method to the relevant formula/rule.\n- Check one line at a time for sign, units, and arithmetic errors.\n- Then complete one final line and re-check your substitution.`;
});

checkBtn.addEventListener('click', () => {
  const { question, attempt, topic } = readInput();

  if (!question) {
    output.textContent = 'Please enter a question first.';
    return;
  }

  if (!attempt) {
    output.textContent =
      'I can\'t provide a full solution yet. Please show your attempt first, and I\'ll explain where to improve.';
    return;
  }

  const effortScore = Math.min(100, Math.max(45, attempt.length));
  output.textContent =
    `Feedback summary (${topic}):\n- Good effort shown.\n- Confidence in your approach: ${effortScore}%\n- Likely checks: verify substitution, order of operations, and final units.\n\nIf you want, click Generate practice question for another one at a similar level.`;
  state.stats.checksDone += 1;
  renderStats();
  persist();
});

practiceBtn.addEventListener('click', () => {
  const { topic, difficulty } = readInput();
  const practiceBank = {
    Algebra: 'Solve: 5x - 8 = 22',
    Geometry: 'A triangle has angles 2x, x, and 60°. Find x.',
    'Percentages / Probability': 'Increase 240 by 15%.',
    Ratio: 'Share £84 in the ratio 2:5.',
    Statistics: 'Find the mean of: 6, 8, 11, 5, 10.',
    'General maths': 'Round 47.386 to 2 decimal places.'
  };

  const question = practiceBank[topic] || practiceBank['General maths'];
  output.textContent = `Practice question (${difficulty}):\n${question}\n\nTry it in the boxes above, then use Hint or Check my answer.`;
});

saveBtn.addEventListener('click', () => {
  const { question, attempt, difficulty, topic } = readInput();
  if (!question) {
    output.textContent = 'Add a question first before saving a session.';
    return;
  }

  state.history.unshift({ question, attempt, difficulty, topic, savedAt: new Date().toISOString() });
  state.stats.sessionsSaved += 1;
  renderHistory();
  renderStats();
  persist();
  output.textContent = 'Session saved. Check Recent sessions below.';
});

clearBtn.addEventListener('click', () => {
  questionField.value = '';
  attemptField.value = '';
  topicField.textContent = 'No question yet';
  output.textContent = 'Cleared. Paste a new question to continue.';
});

themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark');
});

loadPersisted();
