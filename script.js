const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");
const themeButton = document.querySelector("#theme-btn");
const deleteButton = document.querySelector("#delete-btn");

let userText = null;
const API_KEY = "Stavite_vas_API_kljuc_ovde"; 
/// Kljuc nisam ostavio iz bezbednosnih razloga, obzirom da je aplikacija samo klijentska,
/// ne postoji bezbedan nacin da prikrijem kljuc u sustini, a ujedno i aplikaciju postavim na github

const initialHeight = chatInput.scrollHeight; 
/// Uz pomoc ove promenljive, prilikom svakog refresh-a nase web stranice/aplikacije,
/// nasa web stranica ce biti skrolovana na sam kraj chat-a

/// Funkcija koja manipulise prikazom tekstualnog odgovora od strane chat-bota, karakter po karakter
const typeText = (element, text, delay = 50, callback = () => {}) => {
    let index = 0;
    element.innerHTML = ""; 

    const type = () => {
        if (index < text.length) {
            element.innerHTML += text.charAt(index);
            index++;
            setTimeout(type, delay);
        } else {
            callback();  
        }
    };
    
    type();
};

/// Funkcija koja ucitava sadrzaj (konverzaciju sa chat-botom, boju teme) iz lokalne memorije (local storage)
const loadDataFromLocalstorage = () => {
    const themeColor = localStorage.getItem("theme-color");

    document.body.classList.toggle("light-mode", themeColor === "light_mode");
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";

    const defaultText = `<div class="default-text">
                            <h1 id="title"></h1>
                            <p id="description-line1"></p>
                            <p id="description-line2"></p>
                         </div>`

    chatContainer.innerHTML = localStorage.getItem("all-chats") || defaultText;
    chatContainer.scrollTo(0, chatContainer.scrollHeight);

    if (!localStorage.getItem("all-chats")) {

        typeText(document.getElementById("title"), "ChatGPT Clone", 60); 

        setTimeout(() => typeText(document.getElementById("description-line1"), 
        "Start a conversation and explore the power of AI.", 20), 900);
    
        setTimeout(() => typeText(document.getElementById("description-line2"), 
        "Your chat history will be displayed here.", 20), 1800);

    }

}

loadDataFromLocalstorage();

/// Funkcija za kreiranje elemenata
const createElement = (html, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv;
}

/// Asinhrona funkcija koja uz pomoc API-ja pribavlja odgovore od strane chat-bota, a ujedno i hendluje potencijalne greske
const getChatResponse = async (incomingChatDiv) => {
    const API_URL = "https://api.cohere.ai/v1/generate";
    const pElement = document.createElement("p");

    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: "command",
            prompt: userText,
            max_tokens: 500,
            temperature: 0.2,
            k: 0,
            p: 0.75
        })
    }

    try {

        const response = await (await fetch(API_URL, requestOptions)).json();
        const fullText = response.generations[0].text.trim();

        typeText(pElement, fullText, 10, () => {
            localStorage.setItem("all-chats", chatContainer.innerHTML);
        });
    
    } catch(error) {

        pElement.classList.add("error");
        pElement.textContent = "Oops! Something went wrong while retrieving the response. Please try again.";

        setTimeout(() => {
            localStorage.setItem("all-chats", chatContainer.innerHTML);
        }, 1000);

    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
}

/// Funkcija koja sluzi za manipulisanje copy dugmeta
const copyResponse = (copyBtn) => {
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

/// Funkcija koja simulira cekanje odgovora od strane chat-bota (animacija sa 3 tacke)
const showTypingAnimation = () => {
    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="Images/chatbot.png" alt="chatbot-image">
                        <div class="typing-animation">
                            <div class="typing-dot" style="--delay: 0.2s"></div>
                            <div class="typing-dot" style="--delay: 0.3s"></div>
                            <div class="typing-dot" style="--delay: 0.4s"></div>
                        </div>
                    </div>
                    <span onclick="copyResponse(this)" class="material-symbols-rounded">content_copy</span>
                  </div>`;

    const incomingChatDiv = createElement(html, "incoming");
    chatContainer.appendChild(incomingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    getChatResponse(incomingChatDiv);

}

/// Funkcija koja pribavlja pitanja od klijenta (korisnika aplikacije)
const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if(!userText) return;

    chatInput.value = "";
    chatInput.style.height = `${initialHeight}px`;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="Images/user.jpg" alt="user-image">
                        <p></p>
                    </div>
                  </div>`;
    
    const outgoingChatDiv = createElement(html, "outgoing");
    outgoingChatDiv.querySelector("p").textContent = userText;
    document.querySelector(".default-text")?.remove();
    chatContainer.appendChild(outgoingChatDiv);
    chatContainer.scrollTo(0, chatContainer.scrollHeight);
    setTimeout(showTypingAnimation, 500);
}

/// Listener koji sluzi za menjanje tema (dark/light mode) od strane korisnika
themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme-color", themeButton.innerText);
    themeButton.innerText = document.body.classList.contains("light-mode") ? "dark_mode" : "light_mode";
});

/// Listener koji sluzi za brisanje sadrzaja chat-a
deleteButton.addEventListener("click", () => {
    if(confirm("Are you sure you want to delete all the chats?")) {
        localStorage.removeItem("all-chats");
        loadDataFromLocalstorage();
    }
});

/// Listener koji sluzi za manipulaciju polja za unos teksta (podesava njegovu "visinu")
chatInput.addEventListener("input", () => {
    chatInput.style.height = `${initialHeight}px`
    chatInput.style.height = `${chatInput.scrollHeight}px`
});

/// Listener koji sluzi za manipulaciju "Enter" dugmeta na tastaturi 
chatInput.addEventListener("keydown", (e) => {
    if(e.key === "Enter" && !e.shiftKey && window.innerWidth > 800) {
        e.preventDefault();
        handleOutgoingChat();
    }
}); 

/// Listener koji sluzi za manipulaciju send button-a
sendButton.addEventListener("click", handleOutgoingChat);