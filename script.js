const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=Your_key';

// store any selected files so user can see attachments
window.attachedFiles = [];

/* ---------- Ask Gemini (same as before) ---------- */
function askgemini() {
  const qEl = document.getElementById("questionInput");
  const question = qEl.value.trim();
  const answerTextEl = document.getElementById("answerText");

  if (!question) {
    answerTextEl.innerText = "⚠️ Please type a question.";
    return;
  }

  // UI feedback
  const askBtn = document.getElementById("askBtn");
  askBtn.disabled = true;
  askBtn.innerText = "Thinking...";

  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: question }] }]
    })
  })
    .then((r) => r.json())
    .then((data) => {
      askBtn.disabled = false;
      askBtn.innerText = "Ask";
      try {
        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (answer) {
          answerTextEl.innerText = answer;
        } else {
          answerTextEl.innerText = "⚠️ No response from API.";
        }
      } catch (e) {
        answerTextEl.innerText = "⚠️ Unexpected API response.";
      }
    })
    .catch((err) => {
      askBtn.disabled = false;
      askBtn.innerText = "Ask";
      // fallback message + show the error in console
      console.error(err);
      answerTextEl.innerText =
        "❌ API request failed. See console for details. (Falling back to a simple local reply.)";
    });
}

/* ---------- Attach button behavior ---------- */
function handleAttachClick() {
  document.getElementById("fileInput").click();
}

function handleFileChange(event) {
  const files = Array.from(event.target.files || []);
  if (!files.length) return;
  const attachmentsEl = document.getElementById("attachments");
  attachmentsEl.innerHTML = ""; // clear previous attachments preview
  window.attachedFiles = files;

  files.forEach((file, index) => {
    const box = document.createElement("div");
    box.className = "attachment";

    const title = document.createElement("div");
    title.innerText = `${file.name} · ${Math.round(file.size / 1024)} KB`;
    box.appendChild(title);

    // If image — show preview
    if (file.type.startsWith("image/")) {
      const img = document.createElement("img");
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
      box.appendChild(img);
    } else if (file.type.startsWith("text/") || file.name.endsWith(".md")) {
      // for text files show a small snippet
      const reader = new FileReader();
      reader.onload = (e) => {
        const pre = document.createElement("pre");
        pre.style.whiteSpace = "pre-wrap";
        pre.style.maxHeight = "120px";
        pre.style.overflow = "auto";
        pre.innerText = e.target.result.slice(0, 1000);
        box.appendChild(pre);
      };
      reader.readAsText(file);
    } else {
      const hint = document.createElement("div");
      hint.innerText = `Type: ${file.type || "unknown"}`;
      hint.style.color = "#9aa0a6";
      box.appendChild(hint);
    }

    attachmentsEl.appendChild(box);
  });

  // show short message in answer area about attachments
  const ans = document.getElementById("answerText");
  ans.innerText = `Attached ${files.length} file(s). You can refer to them in your question or Summarize them (if text).`;
}

/* ---------- Search button behavior ---------- */
function handleSearch() {
  // priority: 1) question input 2) selection 3) answer text
  const qInput = document.getElementById("questionInput").value.trim();
  const selection = window.getSelection().toString().trim();
  const answerText = document.getElementById("answerText").innerText.trim();

  let query = qInput || selection || answerText.split(/\s+/).slice(0, 20).join(" ");
  if (!query) {
    alert("Type or select some text to search.");
    return;
  }

  // Open a new tab with Google search for the query
  const url = "https://www.google.com/search?q=" + encodeURIComponent(query);
  window.open(url, "_blank");
}

/* ---------- Summarize button behavior ---------- */
function handleSummarize() {
  // get text to summarize: selected text > answer text > input text
  const selection = window.getSelection().toString().trim();
  const answerText = document.getElementById("answerText").innerText.trim();
  const inputText = document.getElementById("questionInput").value.trim();

  const textToSummarize = selection || answerText || inputText;
  if (!textToSummarize) {
    alert("There is no text to summarize. Type or select a text first.");
    return;
  }

  const targetEl = document.getElementById("answerText");
  targetEl.innerText = "⏳ Summarizing...";

  // Build a summarization prompt for the API
  const prompt = `Summarize the following text in 2-3 short sentences:\n\n${textToSummarize}`;

  // Try remote API first (if API key valid and CORS allowed). If it fails, fallback to local summarizer.
  fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  })
    .then((r) => r.json())
    .then((data) => {
      try {
        const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (answer) {
          targetEl.innerText = answer;
        } else {
          // fallback
          targetEl.innerText = fallbackSummarize(textToSummarize);
        }
      } catch (e) {
        console.error(e);
        targetEl.innerText = fallbackSummarize(textToSummarize);
      }
    })
    .catch((err) => {
      console.warn("API summarize failed or blocked (CORS/Key). Using local fallback.", err);
      targetEl.innerText = fallbackSummarize(textToSummarize);
    });
}

/* ---------- Fallback summarizer (client-side, simple) ---------- */
function fallbackSummarize(text) {
  // naive sentence splitter and pick first 2 sentences
  // if no clear sentences, truncate to ~220 chars
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [];
  if (sentences.length >= 2) {
    return sentences.slice(0, 2).join(" ").trim();
  } else if (sentences.length === 1) {
    return sentences[0].trim();
  } else {
    // fallback truncation
    const t = text.trim();
    return t.length > 220 ? t.slice(0, 220).trim() + "…" : t;
  }
}

/* ---------- Utility ---------- */
function clearResponse() {
  document.getElementById("answerText").innerText = "Ask something to see the response here...";
  document.getElementById("attachments").innerHTML = "";
  document.getElementById("fileInput").value = "";
  window.attachedFiles = [];
}

