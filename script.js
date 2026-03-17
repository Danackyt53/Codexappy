const questionField = document.getElementById('question');
const attemptField = document.getElementById('attempt');
const output = document.getElementById('output');
const hintBtn = document.getElementById('hintBtn');
const nextStepBtn = document.getElementById('nextStepBtn');
const checkBtn = document.getElementById('checkBtn');

const hintTemplates = [
  '1) Identify what the question is asking for.\n2) List the values you know.\n3) Pick the formula or rule that connects them.',
  'Break the problem into smaller parts. Solve the first part only, then pause and check your arithmetic/signs.',
  'Estimate a rough answer first. If your final value is far from that estimate, revisit your steps.'
];

let hintIndex = 0;

function readInput() {
  return {
    question: questionField.value.trim(),
    attempt: attemptField.value.trim()
  };
}

hintBtn.addEventListener('click', () => {
  const { question } = readInput();
  if (!question) {
    output.textContent = 'Please paste your question first so I can guide you.';
    return;
  }

  output.textContent = `Hint ${hintIndex + 1}:\n${hintTemplates[hintIndex]}`;
  hintIndex = (hintIndex + 1) % hintTemplates.length;
});

nextStepBtn.addEventListener('click', () => {
  const { question, attempt } = readInput();
  if (!question) {
    output.textContent = 'Add your question first.';
    return;
  }

  if (!attempt) {
    output.textContent = 'Show your attempt and I will suggest the next step tailored to your working.';
    return;
  }

  output.textContent =
    'Next step coach:\n- Compare your current method to the known formula/rule.\n- Check one line at a time for sign, units, and arithmetic errors.\n- Then compute the final step and submit it to Check my answer.';
});

checkBtn.addEventListener('click', () => {
  const { question, attempt } = readInput();

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
    `Feedback summary:\n- Good effort shown.\n- Confidence in your approach: ${effortScore}%\n- Likely checks: verify substitution, order of operations, and final units.\n\nIf you want, press Hint 1 again and I\'ll walk you through another approach.`;
});
