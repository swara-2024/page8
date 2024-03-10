const recordBtn = document.querySelector(".record"),
  result = document.querySelector(".result"),
  downloadBtn = document.querySelector(".download"),
  inputLanguage = document.querySelector("#language"),
  clearBtn = document.querySelector(".clear"),
  stopBtn = document.querySelector(".stop"); // Add the stop button

let SpeechRecognition =
  window.SpeechRecognition || window.webkitSpeechRecognition,
  recognition,
  recording = false;

// Standard text for comparison
const standardText = "I like to play football";

function populateLanguages() {
  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.code;
    option.innerHTML = lang.name;
    inputLanguage.appendChild(option);
  });
}

populateLanguages();

function speechToText() {
  try {
    recognition = new SpeechRecognition();
    recognition.lang = inputLanguage.value;
    recognition.interimResults = true;
    recordBtn.classList.add("recording");
    recordBtn.querySelector("p").innerHTML = "Listening...";
    recognition.start();

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      if (event.results[0].isFinal) {
        result.innerHTML += " " + speechResult;
        result.querySelector("p").remove();
    
        const similarityPercentage = calculateSimilarityPercentage(speechResult.trim().toLowerCase(), standardText.trim().toLowerCase());
        displayResultWithPercentage(similarityPercentage);
      } else {
        // Rest of your interim result handling logic
      }
    };

    recognition.onspeechend = () => {
      speechToText();
    };

    recognition.onerror = (event) => {
      stopRecording();
      if (event.error === "no-speech") {
        alert("No speech was detected. Stopping...");
      } else if (event.error === "audio-capture") {
        alert("No microphone was found. Ensure that a microphone is installed.");
      } else if (event.error === "not-allowed") {
        alert("Permission to use the microphone is blocked.");
      } else if (event.error === "aborted") {
        alert("Listening Stopped.");
      } else {
        alert("Error occurred in recognition: " + event.error);
      }
    };
  } catch (error) {
    recording = false;
    console.log(error);
  }
}

// Function to compare the user's speech with the standard text
function compareText(userText, standardText) {
  // You might want to implement a more sophisticated comparison logic
  // For simplicity, this example is case-insensitive and ignores leading/trailing whitespaces
  return userText.trim().toLowerCase() === standardText.trim().toLowerCase();
}

// Function to display the result (correct or incorrect)
function displayResult(isCorrect) {
  const resultMessage = document.createElement("p");
  resultMessage.textContent = isCorrect ? "Correct!" : "Incorrect!";
  result.appendChild(resultMessage);
}

recordBtn.addEventListener("click", () => {
  if (!recording) {
    speechToText();
    recording = true;
  } else {
    stopRecording();
  }
});

// Add the stop button event listener
stopBtn.addEventListener("click", () => {
  stopRecording();
  stopBtn.disabled = true;
});

function stopRecording() {
  recognition.stop();
  recordBtn.querySelector("p").innerHTML = "Start Listening";
  recordBtn.classList.remove("recording");
  recording = false;
}

function download() {
  const text = result.innerText;
  const filename = "speech.txt";

  const element = document.createElement("a");
  element.setAttribute(
    "href",
    "data:text/plain;charset=utf-8," + encodeURIComponent(text)
  );
  element.setAttribute("download", filename);
  element.style.display = "none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

downloadBtn.addEventListener("click", download);

clearBtn.addEventListener("click", () => {
  result.innerHTML = "";
  downloadBtn.disabled = true;
});



/////

function calculateSimilarityPercentage(userText, standardText) {
  const maxLength = Math.max(userText.length, standardText.length);
  const distance = levenshteinDistance(userText, standardText);
  const similarity = ((maxLength - distance) / maxLength) * 100;
  return similarity.toFixed(2); // Return similarity percentage rounded to 2 decimal places
}

function levenshteinDistance(s1, s2) {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1.charAt(i - 1) === s2.charAt(j - 1) ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

function displayResultWithPercentage(similarityPercentage) {
  const resultMessage = document.createElement("p");
  resultMessage.textContent = `Similarity: ${similarityPercentage}%`;
  result.appendChild(resultMessage);
}

// Inside your recognition.onresult event handler

