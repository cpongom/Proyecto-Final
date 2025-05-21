let xmlDoc;
let questions = [];
let currentIndex = 0;
let score = 0;
let timerInterval;
let timeElapsed = 0;

const questionText = document.getElementById('questionText');
const choicesContainer = document.getElementById('choicesContainer');
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const resultMessage = document.getElementById('resultMessage');
const languageSelect = document.getElementById('languageSelect');

const colors = ['green', 'red', 'blue', 'yellow'];

function loadXML(lang) {
  const xhr = new XMLHttpRequest();
  const file = lang === 'es' ? 'preguntas_es.xml' : 'preguntas_en.xml';

  xhr.open('GET', file, true);
  xhr.onload = function () {
    if (this.status === 200) {
      const parser = new DOMParser();
      xmlDoc = parser.parseFromString(this.responseText, 'application/xml');

      if (xmlDoc.getElementsByTagName('parsererror').length > 0) {
        questionText.textContent = 'Error al analizar el archivo XML.';
        choicesContainer.innerHTML = '';
        return;
      }

      questions = Array.from(xmlDoc.getElementsByTagName('question'));
      if (questions.length === 0) {
        questionText.textContent = 'No se encontraron preguntas en el XML.';
        choicesContainer.innerHTML = '';
        return;
      }

      currentIndex = 0;
      score = 0;
      timeElapsed = 0;
      scoreDisplay.textContent = `Puntuación: ${score}`;
      timerDisplay.textContent = `Tiempo: 0s`;
      resultMessage.textContent = '';

      startTimer();
      showQuestion();

    } else {
      questionText.textContent = 'Error al cargar el archivo XML.';
      choicesContainer.innerHTML = '';
    }
  };

  xhr.onerror = function () {
    questionText.textContent = 'Error al cargar el archivo XML.';
    choicesContainer.innerHTML = '';
  };

  xhr.send();
}

function showQuestion() {
  if (currentIndex >= questions.length) {
    endQuiz();
    return;
  }

  choicesContainer.innerHTML = '';

  const q = questions[currentIndex];
  const wording = q.getElementsByTagName('wording')[0].textContent;
  questionText.textContent = wording;

  const choices = q.getElementsByTagName('choice');

  for (let i = 0; i < choices.length; i++) {
    const choiceText = choices[i].textContent;
    const isCorrect = choices[i].getAttribute('correct') === 'yes';

    const btn = document.createElement('button');
    btn.classList.add('choice-btn', colors[i]);
    btn.textContent = choiceText;
    btn.onclick = () => handleAnswer(isCorrect, btn);

    choicesContainer.appendChild(btn);
  }
}

function handleAnswer(isCorrect, btn) {
  Array.from(choicesContainer.children).forEach(b => b.disabled = true);

  if (isCorrect) {
    score++;
    scoreDisplay.textContent = `Puntuación: ${score}`;
    btn.style.border = '4px solid #00FF00';
  } else {
    btn.style.border = '4px solid #FF0000';
  }

  setTimeout(() => {
    currentIndex++;
    showQuestion();
  }, 1500);
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeElapsed++;
    timerDisplay.textContent = `Tiempo: ${timeElapsed}s`;
  }, 1000);
}

function endQuiz() {
  clearInterval(timerInterval);
  questionText.textContent = languageSelect.value === 'es' ? 
    '¡Concurso finalizado!' : 'Quiz finished!';
  choicesContainer.innerHTML = '';
  resultMessage.textContent = languageSelect.value === 'es' ? 
    `Tu puntuación final es ${score} de ${questions.length} en ${timeElapsed} segundos.` : 
    `Your final score is ${score} out of ${questions.length} in ${timeElapsed} seconds.`;
}

languageSelect.addEventListener('change', () => {
  clearInterval(timerInterval);
  loadXML(languageSelect.value);
});

loadXML(languageSelect.value);
