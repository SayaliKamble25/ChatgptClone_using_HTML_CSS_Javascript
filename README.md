# ChatgptClone_using_HTML_CSS_Javascript

This is a simple ChatGPT-like frontend built using **HTML, CSS, and JavaScript**.  
It allows users to ask questions to Google's **Gemini API** and get instant answers.  

---

## 🚀 Features
- Simple and clean interface.
- Input box to ask any question.
- Buttons for:
  - **Ask** → Sends your question to Gemini and displays the response.
  - **Attach** → Allows you to attach files (future enhancement).
  - **Summarize** → Summarizes given text (future enhancement).
- Responsive design with external CSS.
- Easy integration with Gemini API.

---

## 📂 Project Structure
```
chatgpt-clone/
│── index.html      # Main HTML file
│── style.css       # Stylesheet
│── script.js       # JavaScript logic
│── README.md       # Documentation
```

---

## ⚙️ Setup Instructions

1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/chatgpt-clone.git
   cd chatgpt-clone
   ```

2. Open `index.html` in your browser.

3. Replace `API-KEY` inside `script.js` with your actual Gemini API key:
   ```javascript
   fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=YOUR_API_KEY', {
       method: "POST",
       headers: { "Content-Type": "application/json" },
       body: JSON.stringify({
           contents: [{ parts: [{ text: question }] }]
       })
   })
   ```

4. Save and refresh the page. 🎉

---

## 🔑 How to Get Gemini API Key
1. Go to [Google AI Studio](https://aistudio.google.com/).
2. Sign in with your Google account.
3. Create a new API key.
4. Copy the key and paste it inside `script.js`.

---

## 📸 Screenshot
(Add your screenshot here, e.g., `![App Screenshot](screenshot.png)`)

---

## 🛠️ Future Improvements
- Add authentication (Google login).
- Enable file upload with "Attach" button.
- Implement "Summarize" feature using Gemini.
- Store chat history.

---

## 📜 License
This project is **open-source** under the MIT License.
