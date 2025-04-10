let quizData = [];

    async function fetchQuizFile() {
      const urlParams = new URLSearchParams(window.location.search);
      const file = urlParams.get("file");

      if (!file) {
        alert("No quiz file specified in URL!");
        return;
      }

      try {
        const res = await fetch(file);
        quizData = await res.json();
        initializeQuiz();
      } catch (error) {
        alert("Failed to load quiz file: " + error.message);
      }
    }

    function initializeQuiz() {
      current = 0;
      correctCount = 0;
      selected = false;
      userAnswers = Array(quizData.length).fill(null);
      timer = 600;
      totalTime = 0;
      startTimer();
      loadQuestion();
    }

    let current = 0;
    let correctCount = 0;
    let selected = false;
    let userAnswers = [];
    let timer = 600;
    let totalTime = 0;
    let questionStartTime = Date.now();

    const questionEl = document.getElementById("question");
    const optionsEl = document.getElementById("options");
    const nextBtn = document.getElementById("nextBtn");
    const prevBtn = document.getElementById("prevBtn");
    const timeEl = document.getElementById("time");
    const footerText = document.getElementById("footerText");
    const retryBtn = document.getElementById("retryBtn");
    const nextQuizBtn = document.getElementById("nextQuizBtn");

    function updateFooter() {
      const answered = userAnswers.filter(a => a !== null).length;
      const accuracy = answered === 0 ? 0 : Math.round((correctCount / answered) * 100);
      footerText.textContent = `Question ${current + 1} of ${quizData.length} | Accuracy: ${accuracy}%`;
    }

    function loadQuestion() {
      questionStartTime = Date.now();
      const q = quizData[current];
      questionEl.textContent = `${q.question} (${q.difficulty})`;
      optionsEl.innerHTML = "";

      q.options.forEach((opt, idx) => {
        const li = document.createElement("li");
        li.textContent = `${String.fromCharCode(65 + idx)}. ${opt}`;
        if (userAnswers[current] !== null) {
          if (idx === quizData[current].answer) li.classList.add("correct");
          if (idx === userAnswers[current] && userAnswers[current] !== quizData[current].answer) li.classList.add("wrong");
        }
        li.onclick = () => handleAnswer(idx, li);
        optionsEl.appendChild(li);
      });

      selected = userAnswers[current] !== null;
      updateFooter();
    }

    function handleAnswer(idx, el) {
      if (selected) return;
      selected = true;
      const timeTaken = (Date.now() - questionStartTime) / 1000;
      totalTime += timeTaken;
      userAnswers[current] = idx;
      const correct = quizData[current].answer;
      if (idx === correct) {
        el.classList.add("correct");
        correctCount++;
      } else {
        el.classList.add("wrong");
        optionsEl.children[correct].classList.add("correct");
      }
      updateFooter();
    }

    function nextQuestion() {
      if (!selected) {
        alert("Please select an answer before moving to next.");
        return;
      }
      current++;
      if (current < quizData.length) {
        selected = userAnswers[current] !== null;
        loadQuestion();
      } else {
        showResult();
      }
    }

    function prevQuestion() {
      if (current > 0) {
        current--;
        selected = userAnswers[current] !== null;
        loadQuestion();
      }
    }

    function renderReview() {
      optionsEl.innerHTML = "";
      const speed = (totalTime / quizData.length).toFixed(2);

      optionsEl.innerHTML += `<li><strong>Score:</strong> ${correctCount}/${quizData.length}</li>`;
      optionsEl.innerHTML += `<li><strong>Accuracy:</strong> ${Math.round((correctCount / quizData.length) * 100)}%</li>`;
      optionsEl.innerHTML += `<li><strong>Average Speed:</strong> ${speed} seconds/question</li>`;

      quizData.forEach((q, idx) => {
        const details = document.createElement("details");
        const summary = document.createElement("summary");
        summary.textContent = `Q${idx + 1}: ${q.question}`;
        details.appendChild(summary);

        const userAnswer = userAnswers[idx] !== null ? q.options[userAnswers[idx]] : "Not Answered";
        const correctAnswer = q.options[q.answer];

        const answerFeedback = document.createElement("p");
        answerFeedback.innerHTML = `
          <strong>Your Answer:</strong> <span class="${userAnswers[idx] === q.answer ? 'correct-answer' : 'wrong-answer'}">${userAnswer}</span><br>
          <strong>Correct Answer:</strong> <span class="correct-answer">${correctAnswer}</span><br>
          ${q.explanation ? `<em>Explanation:</em> ${q.explanation}` : ""}
        `;
        details.appendChild(answerFeedback);
        optionsEl.appendChild(details);
      });
    }

    function showResult() {
      clearInterval(countdown);
      questionEl.textContent = "Quiz Completed!";
      optionsEl.innerHTML = `
        <hr>
        <h3>Review Answers:</h3>
      `;
      renderReview();
      document.querySelector(".actions").style.display = "flex";
      retryBtn.style.display = "inline-block";
      nextQuizBtn.style.display = "inline-block";
      nextBtn.style.display = "none";
      prevBtn.style.display = "none";
      footerText.textContent = `Completed | Final Accuracy: ${Math.round((correctCount / quizData.length) * 100)}%`;
    }

    function retryQuiz() {
      current = 0;
      correctCount = 0;
      selected = false;
      userAnswers = Array(quizData.length).fill(null);
      timer = 600;
      totalTime = 0;
      document.querySelector(".actions").style.display = "flex";
      retryBtn.style.display = "none";
      nextQuizBtn.style.display = "none";
      nextBtn.style.display = "inline-block";
      prevBtn.style.display = "inline-block";
      startTimer();
      loadQuestion();
    }

    let countdown;
    function startTimer() {
      clearInterval(countdown);
      countdown = setInterval(() => {
        timer--;
        timeEl.textContent = timer;
        if (timer === 0) {
          clearInterval(countdown);
          alert("Time's up!");
          showResult();
        }
      }, 1000);
    }

    retryBtn.onclick = retryQuiz;
    nextQuizBtn.onclick = () => window.location.href = "index.html";
    nextBtn.onclick = nextQuestion;
    prevBtn.onclick = prevQuestion;

    fetchQuizFile();