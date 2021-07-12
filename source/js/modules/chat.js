import sonyaAnimation from '../modules/web-animation/animate-sonya';
import animateGameResult from '../modules/svg/animate-game-result';
import gameCountdown from '../modules/countdown/animate-game-countdown';

const playSelector = `.js-play`;
const resultSelector = `.screen--result`;
const formId = `message-form`;
const fieldId = `message-field`;
const messageListId = `messages`;
const chatSelector = `.js-chat`;

const visibleClass = `screen--show`;
const hiddenClass = `screen--hidden`;

const binaryAnswers = [`да`, `нет`];

const Level = {
  first: `first`,
  second: `second`,
  failure: `failure`,
};

const QuestionLevel = {
  [Level.first]: `это антарктида?`,
  [Level.second]: `антарктида?`,
};

const ResultId = {
  first: `result`,
  second: `result2`,
  failure: `result3`,
};

const messageList = document.getElementById(messageListId);
const field = document.getElementById(fieldId);
const results = [...document.querySelectorAll(resultSelector)];

function play() {
  const playBtn = document.querySelector(playSelector);
  if (!playBtn) {
    return;
  }

  playBtn.addEventListener(`click`, handlePlay);
}

function handlePlay() {
  results.forEach((el) => {
    el.classList.remove(visibleClass);
    el.classList.add(hiddenClass);
  });

  messageList.innerHTML = ``;
  field.focus();
  sonyaAnimation.start();
  gameCountdown.startCountdown();
}

function scrollToBottom(list, chat) {
  if (list.scrollHeight > chat.offsetHeight) {
    chat.scrollTop = list.scrollHeight;
  }
}

function handleFormSubmit(event) {
  event.preventDefault();

  const chat = document.querySelector(chatSelector);

  const getAnswer = (question) => {
    const level = Object.keys(QuestionLevel).find((key) => QuestionLevel[key] === question);
    if (level) {
      sonyaAnimation.end(() => showResultScreen(level));
      return;
    }

    const answerIndex = Math.floor(Math.random() * 2);
    const answerText = binaryAnswers[answerIndex];

    const answerEl = createAnswerElement(answerText);
    messageList.appendChild(answerEl);
    scrollToBottom(messageList, chat);

    setTimeout(showAnswer, 700);
  };

  const postQuestion = () => {
    const value = field.value;
    if (!value) {
      return;
    }

    const messageEl = createQuestionElement(value);
    messageList.appendChild(messageEl);
    scrollToBottom(messageList, chat);

    field.value = ``;
    field.setAttribute(`disabled`, `true`);

    setTimeout(() => getAnswer(value.toLowerCase()), 700);

    field.removeAttribute(`disabled`);
    field.focus();
  };

  postQuestion();

}

function createQuestionElement(question) {
  const messageEl = document.createElement(`li`);
  messageEl.classList.add(`chat__message`);
  const text = document.createElement(`p`);
  text.innerText = question;
  messageEl.appendChild(text);
  messageEl.classList.add(`chat__message--outcoming`);

  return messageEl;
}

function createAnswerElement(answer) {
  const answerEl = document.createElement(`li`);
  const placeholder = document.createElement(`div`);
  const textEl = document.createElement(`p`);

  placeholder.classList.add(`chat__placeholder`);
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement(`span`);
    dot.classList.add(`chat__placeholder-dot`);
    placeholder.appendChild(dot);
  }
  answerEl.appendChild(placeholder);
  answerEl.classList.add(`chat__message`);
  answerEl.classList.add(`chat__message--incoming`);
  answerEl.classList.add(`chat__message--last`);

  textEl.innerText = answer;
  textEl.classList.add(`hidden`);
  answerEl.appendChild(textEl);

  return answerEl;
}


function showAnswer() {
  const lastMessage = document.querySelector(`.chat__message--last`);
  if (lastMessage) {
    const lastMessagePlaceholder = lastMessage.querySelector(`.chat__placeholder`);
    const lastMessageText = lastMessage.querySelector(`p`);
    lastMessagePlaceholder.classList.add(`chat__placeholder--hidden`);
    setTimeout(function () {
      lastMessagePlaceholder.remove();
    }, 400);
    lastMessageText.classList.remove(`hidden`);
    lastMessage.classList.remove(`chat__message--last`);
  }
}

function showScreen(id, level) {
  const screen = results.find((result) => result.id === id);

  screen.classList.remove(hiddenClass);
  screen.classList.add(visibleClass);

  const animate = animateGameResult[level];
  animate();
}

function showResultScreen(level) {
  const resultId = ResultId[level];
  showScreen(resultId, level);
}

export function showFailureScreen() {
  showScreen(ResultId.failure, Level.failure);
}

export default () => {
  play();

  const form = document.getElementById(formId);
  form.addEventListener(`submit`, handleFormSubmit);
};
