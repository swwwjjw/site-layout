'use strict';

/* =========================================================
   1. ДАННЫЕ
   ========================================================= */
const QUESTIONS = [
  {
    text: 'А голос у него был не такой, как у почтальона Печкина, дохленький. ' +
          'У Гаврюши голосище был, как у электрички. Он ____ ____ на ноги поднимал.',
    answers: [
      { text: 'Пол деревни, за раз', correct: false },
      { text: 'Полдеревни, зараз',   correct: true  },
      { text: 'Пол-деревни, за раз', correct: false }
    ],
    explanation: 'Правильно! Раздельно существительное пишется при наличии дополнительного ' +
                 'слова между частицей и существительным. «Полдеревни» — слитно. ' +
                 '«Зараз» (ударение на второй слог) — наречие, пишется слитно, значит «быстро, одним махом».'
  },
  {
    text: 'А эти слова как пишутся?',
    answers: [
      { text: 'Капуччино и эспрессо',  correct: false },
      { text: 'Каппуччино и экспресо', correct: false },
      { text: 'Капучино и эспрессо',   correct: true  }
    ],
    explanation: 'Конечно! По орфографическим нормам русского языка единственно верным ' +
                 'написанием будут «капучино» и «эспрессо».'
  },
  {
    text: 'Как нужно писать?',
    answers: [
      { text: 'Черезчур',  correct: false },
      { text: 'Черес-чур', correct: false },
      { text: 'Чересчур',  correct: true  }
    ],
    explanation: 'Да! Слово появилось от соединения предлога «через» и древнего слова «чур» ' +
                 '(«граница», «край»). Написание нужно запомнить: «чересчур».'
  },
  {
    text: 'Где допущена ошибка?',
    answers: [
      { text: 'Аккордеон', correct: false },
      { text: 'Белиберда', correct: false },
      { text: 'Эпелепсия', correct: true  }
    ],
    explanation: 'Верно! Это слово пишется так: «эпИлепсия».'
  },
  {
    text: 'В каком предложении слово «одевать» употреблено правильно ' +
          'с точки зрения литературной нормы?',
    answers: [
      { text: 'Мама одевает ребёнка перед прогулкой.',       correct: true  },
      { text: 'Он одевает пальто и выходит на улицу.',       correct: false },
      { text: 'Она одевает шапку и бежит на работу.',        correct: false },
      { text: 'Стилист одевает клиента перед фотосессией.', correct: true }
    ],
    explanation: 'Правильно! «Одевать» — переходный глагол: одевают КОГО-ТО другого ' +
                 '(ребёнка, клиента). А «надевать» — что-то НА себя или на кого-то: надеть пальто, надеть шапку.'
  }
];

/* =========================================================
   2. СОСТОЯНИЕ
   ========================================================= */
const state = {
  total: 0,
  answered: 0,
  correct: 0,
  locked: true,
  finished: false,
  openReveal: null,
  cards: []
};

/* =========================================================
   3. DOM-ССЫЛКИ
   ========================================================= */
const quizEl     = document.getElementById('quiz');
const finishEl   = document.getElementById('finish');
const statsEl    = document.getElementById('stats');
const progressEl = document.getElementById('progress');

/* =========================================================
   4. ПЕРЕМЕШИВАНИЕ
   ========================================================= */
function shuffle(array) {
  const copy = array.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/* =========================================================
   5. СОЗДАНИЕ КАРТОЧКИ
   ========================================================= */
function createQuestionCard(question, number) {

  const card = document.createElement('article');
  card.className = 'question';

  const head = document.createElement('div');
  head.className = 'question__head';

  const num = document.createElement('span');
  num.className = 'question__num';
  num.textContent = number;

  const mark = document.createElement('span');
  mark.className = 'question__mark';

  head.append(num, mark);

  const title = document.createElement('p');
  title.className = 'question__text';
  title.textContent = question.text;

  const correctAnswer = question.answers.find(a => a.correct);

  const reveal = document.createElement('div');
  reveal.className = 'reveal';

  const rLabel = document.createElement('div');
  rLabel.className = 'reveal__label';
  rLabel.textContent = 'Правильный ответ';

  const rText = document.createElement('div');
  rText.className = 'reveal__text';
  rText.textContent = correctAnswer.text;

  const rExp = document.createElement('div');
  rExp.className = 'reveal__exp';
  rExp.textContent = question.explanation;

  reveal.append(rLabel, rText, rExp);

  const answersBox = document.createElement('div');
  answersBox.className = 'question__answers';

  shuffle(question.answers).forEach(answer => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'answer';
    btn.dataset.correct = answer.correct ? '1' : '0';

    const answerText = document.createElement('span');
    answerText.className = 'answer__text';
    answerText.textContent = answer.text;

    const exp = document.createElement('span');
    exp.className = 'answer__exp';
    exp.textContent = question.explanation;

    btn.append(answerText, exp);
    btn.addEventListener('click', () => chooseAnswer(card, btn));
    answersBox.appendChild(btn);
  });

  card.append(head, title, reveal, answersBox);

  card.addEventListener('click', () => {
    if (!state.finished) return;
    toggleReveal(reveal);
  });

  return card;
}

/* =========================================================
   6. ВЫБОР ОТВЕТА
   ========================================================= */
function chooseAnswer(card, btn) {
  if (state.locked) return;
  if (card.dataset.done === '1') return;

  state.locked = true;
  card.dataset.done = '1';
  btn.classList.add('answer--selected');

  const isCorrect = btn.dataset.correct === '1';
  const mark = card.querySelector('.question__mark');
  const allAnswers = Array.from(card.querySelectorAll('.answer'));

  if (isCorrect) {
    mark.textContent = '✓';
    mark.classList.add('question__mark--ok');
    card.classList.add('question--ok');
    btn.classList.add('answer--open');
  } else {
    mark.textContent = '✗';
    mark.classList.add('question__mark--bad');
    card.classList.add('question--bad');
    btn.classList.add('answer--wrong');
  }

  setTimeout(() => {
    const moving = isCorrect
      ? allAnswers.filter(a => a !== btn)
      : allAnswers;
    
    if (isCorrect) btn.classList.add('answer--gone');

    setTimeout(() => {
      moving.forEach((answer, i) => {
      setTimeout(() => answer.classList.add('answer--down'), i * 250);
      });

      setTimeout(() => {
        finishQuestion(isCorrect);
      }, 500);
      
    }, 500);

  }, 3000);
}

/* =========================================================
   7. ЗАВЕРШЕНИЕ ВОПРОСА
   ========================================================= */
function finishQuestion(isCorrect) {
  state.answered += 1;
  if (isCorrect) state.correct += 1;

  const isLast = state.answered >= state.total;

  if (isLast) {
    state.finished = true;
    showFinish();
  } else {
    setTimeout(() => showQuestion(state.answered), 350);
  }
}

/* =========================================================
   8. ПОКАЗ СЛЕДУЮЩЕЙ КАРТОЧКИ
   ========================================================= */
function showQuestion(index) {
  const card = state.cards[index];
  if (!card) return;

  card.classList.add('question--visible');
  state.locked = false;
  updateProgress();
}

/* =========================================================
   9. ФИНАЛ
   ========================================================= */
function showFinish() {
  state.locked = false;
  quizEl.classList.add('quiz--finished');
  finishEl.hidden = false;
  statsEl.textContent = `Правильных ответов: ${state.correct} из ${state.total}`;
  updateProgress();
}

/* =========================================================
   10. ПЕРЕКЛЮЧЕНИЕ БЛОКА «ПРАВИЛЬНЫЙ ОТВЕТ»
   ========================================================= */
function toggleReveal(reveal) {
  if (state.openReveal && state.openReveal !== reveal) {
    state.openReveal.classList.remove('reveal--open');
  }
  if (reveal.classList.contains('reveal--open')) {
    reveal.classList.remove('reveal--open');
    state.openReveal = null;
  } else {
    reveal.classList.add('reveal--open');
    state.openReveal = reveal;
  }
}

/* =========================================================
   11. ПРОГРЕСС
   ========================================================= */
function updateProgress() {
  if (state.finished) {
    progressEl.textContent = `Отвечено: ${state.answered} из ${state.total}`;
  } else {
    progressEl.textContent = `Вопрос ${state.answered + 1} из ${state.total}`;
  }
}

/* =========================================================
   12. СТАРТ
   ========================================================= */
function init() {
  const ordered = shuffle(QUESTIONS);
  state.total = ordered.length;

  ordered.forEach((question, index) => {
    const card = createQuestionCard(question, index + 1);
    quizEl.appendChild(card);
    state.cards.push(card);
  });

  showQuestion(0);
}

init();