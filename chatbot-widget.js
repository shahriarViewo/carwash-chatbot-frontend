// chatbot-widget.js

class ChatbotWidget extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.API_URL = "https://carwash-chatbot-backend.onrender.com/ask"; // <-- EDIT THIS LINE
    }

    connectedCallback() {
        this.render();
        this.addEventListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
                }
                #chatBubble {
                    position: fixed;
                    bottom: 25px;
                    right: 25px;
                    width: 60px;
                    height: 60px;
                    background-color: #007bff;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
                    z-index: 9999;
                }
                #chatBubble:hover {
                    transform: scale(1.1);
                    box-shadow: 0 6px 12px rgba(0,0,0,0.3);
                }
                #chatWindow {
                    display: none;
                    opacity: 0;
                    transform: translateY(20px);
                    transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
                    position: fixed;
                    bottom: 100px;
                    right: 25px;
                    width: 90%;
                    max-width: 370px;
                    height: 70vh;
                    max-height: 550px;
                    background-color: white;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    flex-direction: column;
                    overflow: hidden;
                    z-index: 10000;
                }
                .header {
                    background: #007bff; color: white; padding: 16px; text-align: center; font-size: 1.1rem; flex-shrink: 0;
                }
                .messages {
                    flex-grow: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px;
                }
                .message {
                    padding: 10px 15px; border-radius: 18px; max-width: 80%; line-height: 1.5; word-wrap: break-word;
                }
                .message p { margin: 0; }
                .user { background-color: #007bff; color: white; align-self: flex-end; border-bottom-right-radius: 5px; }
                .bot { background-color: #e9e9eb; color: black; align-self: flex-start; border-bottom-left-radius: 5px; }
                .inputForm { display: flex; padding: 12px; border-top: 1px solid #ddd; background: #f9f9f9; flex-shrink: 0; }
                .inputForm input { flex-grow: 1; border: 1px solid #ccc; padding: 12px; border-radius: 24px; margin-right: 10px; font-size: 1rem; }
                .inputForm input:focus { outline: none; border-color: #007bff; }
                .inputForm button { padding: 12px 22px; border: none; background-color: #007bff; color: white; border-radius: 24px; cursor: pointer; font-size: 1rem; font-weight: 500; }
                .inputForm button:disabled { background-color: #a0c3ff; cursor: not-allowed; }
            </style>
            
            <div id="chatBubble">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </div>

            <div id="chatWindow">
                <div class="header">CarSwash Assistant</div>
                <div class="messages"></div>
                <form class="inputForm">
                    <input type="text" placeholder="Ask a question..." required>
                    <button type="submit">Send</button>
                </form>
            </div>
        `;
    }
    
    addEventListeners() {
        const chatBubble = this.shadowRoot.getElementById('chatBubble');
        const chatWindow = this.shadowRoot.getElementById('chatWindow');
        const chatForm = this.shadowRoot.querySelector('.inputForm');
        const chatInput = this.shadowRoot.querySelector('.inputForm input');
        
        chatBubble.addEventListener('click', () => {
            const isHidden = chatWindow.style.display === 'none' || chatWindow.style.display === '';
            if (isHidden) {
                chatWindow.style.display = 'flex';
                setTimeout(() => {
                    chatWindow.style.opacity = '1';
                    chatWindow.style.transform = 'translateY(0)';
                }, 10);
            } else {
                chatWindow.style.opacity = '0';
                chatWindow.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    chatWindow.style.display = 'none';
                }, 300);
            }
        });
        
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = chatInput.value.trim();
            if (!query) return;

            this.addMessage(query, 'user');
            chatInput.value = '';
            this.setFormDisabled(true);

            try {
                const response = await fetch(this.API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ query: query }),
                });

                if (!response.ok) throw new Error('API request failed');
                
                const data = await response.json();
                this.addMessage(data.answer, 'bot');

            } catch (error) {
                console.error('Error fetching from API:', error);
                this.addMessage('Sorry, I am having trouble connecting.', 'bot');
            } finally {
                this.setFormDisabled(false);
                chatInput.focus();
            }
        });
    }

    setFormDisabled(disabled) {
        this.shadowRoot.querySelector('.inputForm input').disabled = disabled;
        this.shadowRoot.querySelector('.inputForm button').disabled = disabled;
    }

    addMessage(text, type) {
        const messagesContainer = this.shadowRoot.querySelector('.messages');
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        
        const p = document.createElement('p');
        p.textContent = text;
        messageElement.appendChild(p);

        messagesContainer.appendChild(messageElement);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}

customElements.define('carwash-chatbot', ChatbotWidget);