import React, { useRef, useState } from 'react';
import { Bot, Loader2, MessageCircle, Send, X } from 'lucide-react';
import { aiService } from '../../services/aiService';
import './AiChatbot.css';

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'Hi, I can help you understand spending, budgets, and recent transactions.'
};

const createId = () => {
  const browserCrypto = typeof window !== 'undefined' ? window.crypto : null;
  return browserCrypto?.randomUUID
    ? browserCrypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
};

const AiChatbot = () => {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const inputRef = useRef(null);

  const toggleOpen = () => {
    setOpen(prev => !prev);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const sendMessage = async (event) => {
    event.preventDefault();
    const trimmedInput = input.trim();

    if (!trimmedInput || loading) {
      return;
    }

    const userMessage = {
      id: createId(),
      role: 'user',
      content: trimmedInput
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.sendMessage(trimmedInput, messages);
      setMessages(prev => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content: response.reply || 'I could not prepare a response.'
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: createId(),
          role: 'assistant',
          content: error.message || 'Assistant is unavailable right now.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-chatbot">
      {open && (
        <section className="ai-chatbot-panel" aria-label="Finance assistant">
          <header className="ai-chatbot-header">
            <div className="ai-chatbot-title">
              <span className="ai-chatbot-avatar"><Bot size={18} /></span>
              <div>
                <h2>Finance Assistant</h2>
                <p>Ask about budgets, savings, and trends</p>
              </div>
            </div>
            <button className="ai-chatbot-close" onClick={() => setOpen(false)} aria-label="Close assistant">
              <X size={18} />
            </button>
          </header>

          <div className="ai-chatbot-messages">
            {messages.map(message => (
              <div key={message.id} className={`ai-message ${message.role}`}>
                {message.content}
              </div>
            ))}
            {loading && (
              <div className="ai-message assistant loading">
                <Loader2 size={16} />
                Thinking
              </div>
            )}
          </div>

          <form className="ai-chatbot-form" onSubmit={sendMessage}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about your finances..."
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send message">
              <Send size={18} />
            </button>
          </form>
        </section>
      )}

      <button className="ai-chatbot-toggle" onClick={toggleOpen} aria-label="Open finance assistant">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </div>
  );
};

export default AiChatbot;
