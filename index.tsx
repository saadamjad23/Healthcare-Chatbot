import { GoogleGenAI } from "@google/genai";

// --- Constants ---
const GEMINI_MODEL_NAME = 'gemini-2.5-flash';
const SYSTEM_INSTRUCTION = `You are a helpful and friendly AI healthcare assistant. Your name is MediPal.
Provide informative and supportive responses to general health-related questions.
You must always include the following disclaimer at the end of every single response, without exception:
"Disclaimer: I am an AI assistant and not a medical professional. This information is not a substitute for professional medical advice. Please consult a doctor for any health concerns."
Do not provide diagnoses or prescribe treatments.
Keep your answers concise and easy to understand.
Start your first message with a warm welcome.`;

// --- DOM Elements ---
// FIX: Cast DOM elements to their specific types to resolve TypeScript errors.
const chatContainer = document.getElementById('chat-container') as HTMLElement;
const chatForm = document.getElementById('chat-form') as HTMLFormElement;
const chatInput = document.getElementById('chat-input') as HTMLInputElement;
const sendButton = document.getElementById('send-button') as HTMLButtonElement;
const sendIcon = document.getElementById('send-icon') as HTMLElement;
const loadingSpinner = document.getElementById('loading-spinner') as HTMLElement;
const botMessageTemplate = document.getElementById('bot-message-template') as HTMLTemplateElement;
const userMessageTemplate = document.getElementById('user-message-template') as HTMLTemplateElement;
const typingIndicatorTemplate = document.getElementById('typing-indicator-template') as HTMLTemplateElement;

let chat;
let isLoading = false;

// --- Functions ---

/**
 * Toggles the loading state of the UI
 * @param {boolean} loadingState The new loading state
 */
function setLoading(loadingState) {
  isLoading = loadingState;
  chatInput.disabled = isLoading;
  sendButton.disabled = isLoading;
  sendIcon.classList.toggle('hidden', isLoading);
  loadingSpinner.classList.toggle('hidden', !isLoading);
}

/**
 * Scrolls the chat container to the bottom
 */
function scrollToBottom() {
  setTimeout(() => {
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 0);
}

/**
 * Adds a message to the chat container
 * @param {'user' | 'bot'} author The author of the message
 * @param {string} text The message text
 * @returns {HTMLElement} The created message element
 */
function addMessage(author, text) {
  const template = author === 'user' ? userMessageTemplate : botMessageTemplate;
  const messageClone = template.content.cloneNode(true);
  const messageTextElement = messageClone.querySelector('.message-text');
  
  if (messageTextElement) {
    messageTextElement.textContent = text;
  }
  
  chatContainer.appendChild(messageClone);
  scrollToBottom();
  // FIX: Cast return value to match JSDoc and ensure type safety.
  return chatContainer.lastElementChild as HTMLElement;
}

/**
 * Adds a typing indicator to the chat
 * @returns {HTMLElement} The typing indicator element
 */
function showTypingIndicator() {
    const indicatorClone = typingIndicatorTemplate.content.cloneNode(true);
    chatContainer.appendChild(indicatorClone);
    scrollToBottom();
    // FIX: Cast return value to match JSDoc and ensure type safety.
    return chatContainer.lastElementChild as HTMLElement;
}

/**
 * Handles streaming response from the Gemini API
 * @param {AsyncGenerator<import("@google/genai").GenerateContentResponse>} responseStream The stream from sendMessageStream
 * @param {HTMLElement | null} typingIndicator The typing indicator element to remove
 */
async function handleStreamingResponse(responseStream, typingIndicator) {
    let botResponseText = '';
    let messageTextElement = null;

    for await (const chunk of responseStream) {
        botResponseText += chunk.text;
        
        if (typingIndicator) {
            typingIndicator.remove();
            typingIndicator = null;
        }
        
        if (!messageTextElement) {
            const botMessageElement = addMessage('bot', '');
            messageTextElement = botMessageElement.querySelector('.message-text');
        }

        if (messageTextElement) {
            messageTextElement.textContent = botResponseText;
        }
        scrollToBottom();
    }
    
    if (!messageTextElement && typingIndicator) {
        // Handle cases where the stream is empty
        typingIndicator.remove();
        addMessage('bot', "I received an empty response. Could you try rephrasing?");
    }
}


/**
 * Handles the chat form submission
 * @param {Event} e The form submission event
 */
async function handleFormSubmit(e) {
  e.preventDefault();
  const userInput = chatInput.value.trim();
  if (isLoading || !userInput || !chat) return;

  addMessage('user', userInput);
  chatForm.reset();
  setLoading(true);
  
  const typingIndicator = showTypingIndicator();

  try {
    const responseStream = await chat.sendMessageStream({ message: userInput });
    await handleStreamingResponse(responseStream, typingIndicator);
  } catch (err) {
    console.error("Message sending error:", err);
    if(typingIndicator) typingIndicator.remove();
    addMessage('bot', "Sorry, an error occurred while sending your message. Please try again.");
  } finally {
    setLoading(false);
  }
}

/**
 * Initializes the chat application
 */
async function initializeApp() {
  setLoading(true);
  const typingIndicator = showTypingIndicator();

  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chat = ai.chats.create({
      model: GEMINI_MODEL_NAME,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const responseStream = await chat.sendMessageStream({ message: "Hello" });
    await handleStreamingResponse(responseStream, typingIndicator);
    
  } catch (err) {
    console.error("Initialization error:", err);
    if(typingIndicator) typingIndicator.remove();
    const errorMsg = "Failed to initialize the AI chat. This could be due to a missing or invalid API key. Please ensure it's configured correctly and refresh the page.";
    addMessage('bot', errorMsg);
    // Disable input form permanently on init failure
    chatInput.placeholder = "Chat disabled.";
    // Keep loading spinner on button, but disable it.
    sendIcon.classList.add('hidden');
    loadingSpinner.classList.remove('hidden');
    setLoading(true); // This will disable the inputs
    return; // Stop execution
  }
  
  setLoading(false);
}

// --- Event Listeners & Initialization ---
chatForm.addEventListener('submit', handleFormSubmit);
initializeApp();