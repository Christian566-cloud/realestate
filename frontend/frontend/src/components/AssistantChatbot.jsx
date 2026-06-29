import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiHome,
  FiMapPin,
  FiMaximize2,
  FiMessageCircle,
  FiMinimize2,
  FiRefreshCw,
  FiSend,
  FiShield,
  FiSliders,
  FiX,
} from 'react-icons/fi';
import { chatAPI } from '../services/api';

const welcomeMessage = {
  id: 'welcome',
  role: 'assistant',
  text: 'Hello. I can help you find rooms, apartments, houses, offices, land, rentals, homes for sale, compare options, explain bookings, and guide you before payment.',
  properties: [],
  propositions: [],
};

const quickPrompts = [
  'Rooms in Douala',
  'Compare apartments in Yaounde',
  'Available areas',
  'What should I check before paying?',
];

const starterActions = [
  { icon: <FiMapPin />, label: 'Find by location', prompt: 'Rooms in Bonamoussadi' },
  { icon: <FiSliders />, label: 'Match my budget', prompt: 'Apartments under 300000' },
  { icon: <FiHome />, label: 'Buy or rent', prompt: 'Homes for sale' },
  { icon: <FiShield />, label: 'Rental safety', prompt: 'What should I check before paying?' },
];

export default function AssistantChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState([welcomeMessage]);
  const [quickReplies, setQuickReplies] = useState(quickPrompts);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isOpen]);

  const sendMessage = async (text = input) => {
    const message = text.trim();
    if (!message || loading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: message,
      properties: [],
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages
        .filter((item) => item.id !== 'welcome')
        .slice(-8)
        .map(({ role, text }) => ({ role, text }));
      const response = await chatAPI.askAssistant(message, history);
      setQuickReplies(response.data.quick_replies || quickPrompts);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: response.data.answer,
          properties: response.data.properties || [],
          propositions: response.data.propositions || [],
        },
      ]);
    } catch {
      setQuickReplies(quickPrompts);
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          text: 'I could not reach the assistant right now. Please make sure the backend server is running.',
          properties: [],
          propositions: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const resetChat = () => {
    setMessages([welcomeMessage]);
    setQuickReplies(quickPrompts);
    setInput('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className={`assistant-widget ${isOpen ? 'open' : ''} ${isExpanded ? 'expanded' : ''}`}>
      {isOpen && (
        <section className="assistant-panel" aria-label="Real estate assistant">
          <div className="assistant-header">
            <div className="assistant-title">
              <span className="assistant-avatar"><FiHome /></span>
              <div>
                <strong>Property Assistant</strong>
                <small>Answers real estate questions</small>
              </div>
            </div>
            <div className="assistant-actions">
              <button type="button" onClick={() => setIsExpanded((value) => !value)} aria-label={isExpanded ? 'Shrink chat' : 'Expand chat'}>
                {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
              </button>
              <button type="button" onClick={resetChat} aria-label="Reset assistant">
                <FiRefreshCw />
              </button>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close assistant">
                <FiX />
              </button>
            </div>
          </div>

          <div className="assistant-messages">
            {messages.map((message) => (
              <div key={message.id} className={`assistant-message ${message.role}`}>
                <div className="assistant-bubble">
                  {message.text.split('\n').map((line, index) => (
                    <p key={`${message.id}-${index}`}>{line}</p>
                  ))}
                </div>
                {message.properties.length > 0 && (
                  <div className="assistant-results">
                    {message.properties.map((property) => (
                      <Link key={property.id} to={`/properties/${property.id}`} className="assistant-property" onClick={() => setIsOpen(false)}>
                        {property.cover_image ? (
                          <img src={property.cover_image} alt={property.title} />
                        ) : (
                          <span className="assistant-property-fallback"><FiHome /></span>
                        )}
                        <div>
                          <strong>{property.title}</strong>
                          <small>{property.state}, {property.city}</small>
                          <span>
                            {property.property_type} - {property.bedroom} bed - {property.bathroom} bath
                          </span>
                          <b>{Number(property.price).toLocaleString()} XAF</b>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
                {message.propositions?.length > 0 && (
                  <div className="assistant-propositions">
                    {message.propositions.map((item) => (
                      <button key={`${message.id}-${item.title}`} type="button" onClick={() => sendMessage(item.prompt)}>
                        <strong>{item.title}</strong>
                        <span>{item.detail}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="assistant-message assistant">
                <div className="assistant-bubble assistant-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="assistant-starters">
              {starterActions.map((action) => (
                <button key={action.label} type="button" onClick={() => sendMessage(action.prompt)}>
                  {action.icon}
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}

          <div className="assistant-prompts">
            {quickReplies.map((prompt) => (
              <button key={prompt} type="button" onClick={() => sendMessage(prompt)} disabled={loading}>
                {prompt}
              </button>
            ))}
          </div>

          <form className="assistant-input" onSubmit={(event) => { event.preventDefault(); sendMessage(); }}>
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask: rooms in Akwa, compare options, booking steps..."
              rows="1"
            />
            <button type="submit" disabled={loading || !input.trim()} aria-label="Send message">
              <FiSend />
            </button>
          </form>
        </section>
      )}

      <button type="button" className="assistant-toggle" onClick={() => setIsOpen((value) => !value)} aria-label="Open real estate assistant">
        {isOpen ? <FiX /> : <FiMessageCircle />}
      </button>
    </div>
  );
}
