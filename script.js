const chatInput = document.querySelector("#chat-input");
const sendButton = document.querySelector("#send-btn");
const chatContainer = document.querySelector(".chat-container");

let userText = null;

const API_KEY = "";

const loadDataFromLocalstorage = () => {
    chatContainer.innerHTML = localStorage.getItem("all-chats");
}

loadDataFromLocalstorage();

const createElement = (html, className) => {
    const chatDiv = document.createElement("div");
    chatDiv.classList.add("chat", className);
    chatDiv.innerHTML = html;
    return chatDiv;
}

const getChatResponse = async (incomingChatDiv) =>{
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
            max_tokens: 100,
            temperature: 0.2,
            k: 0,
            p: 0.75
        })
    }

    try {

        const response = await (await fetch(API_URL, requestOptions)).json();
        pElement.textContent = response.generations[0].text.trim();
    
    } catch(error) {

        console.log(error);
    }

    incomingChatDiv.querySelector(".typing-animation").remove();
    incomingChatDiv.querySelector(".chat-details").appendChild(pElement);
    localStorage.setItem("all-chats", chatContainer.innerHTML);
}

const copyResponse = (copyBtn) => {
    const responseTextElement = copyBtn.parentElement.querySelector("p");
    navigator.clipboard.writeText(responseTextElement.textContent);
    copyBtn.textContent = "done";
    setTimeout(() => copyBtn.textContent = "content_copy", 1000);
}

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

    getChatResponse(incomingChatDiv);

}

const handleOutgoingChat = () => {
    userText = chatInput.value.trim();
    if(!userText) return;

    const html = `<div class="chat-content">
                    <div class="chat-details">
                        <img src="Images/user.jpg" alt="user-image">
                        <p></p>
                    </div>
                  </div>`;
    
    const outgoingChatDiv = createElement(html, "outgoing");
    outgoingChatDiv.querySelector("p").textContent = userText;
    chatContainer.appendChild(outgoingChatDiv);
    setTimeout(showTypingAnimation, 500);
}

sendButton.addEventListener("click", handleOutgoingChat);