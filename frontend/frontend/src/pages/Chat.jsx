import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { chatAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiSend, FiMessageSquare, FiUser } from 'react-icons/fi';

export default function Chat() {
  const { id } = useParams();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConv, setActiveConv] = useState(id ? parseInt(id, 10) : null);
  const [content, setContent] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    chatAPI.getConversations().then((r) => setConversations(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (activeConv) {
      chatAPI.getConversation(activeConv).then((r) => {
        setMessages(r.data.messages || []);
      }).catch(() => {});
    }
  }, [activeConv]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async () => {
    if (!content.trim() || !activeConv) return;
    try {
      const res = await chatAPI.sendMessage(activeConv, content);
      setMessages((prev) => [...prev, res.data]);
      setContent('');
    } catch { alert('Failed to send message'); }
  };

  const otherParticipant = (conv) => {
    return conv.participants?.find((p) => p.id !== user?.id);
  };

  return (
    <div className="chat-page">
      <div className="chat-sidebar">
        <h3><FiMessageSquare /> Conversations</h3>
        {conversations.length === 0 && <p className="empty-msg">No conversations yet.</p>}
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`chat-conv-item ${activeConv === conv.id ? 'active' : ''}`}
            onClick={() => setActiveConv(conv.id)}
          >
            <div className="conv-avatar">
              {otherParticipant(conv)?.username?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="conv-info">
              <strong>{otherParticipant(conv)?.username || 'Unknown'}</strong>
              {conv.property && <small>{conv.property.title}</small>}
            </div>
          </div>
        ))}
      </div>

      <div className="chat-main">
        {activeConv ? (
          <>
            <div className="chat-header">
              <h4>
                {(() => {
                  const currentConv = conversations.find((c) => c.id === activeConv);
                  return currentConv ? (otherParticipant(currentConv)?.username || 'Chat') : 'Chat';
                })()}
              </h4>
            </div>
            <div className="chat-messages">
              {messages.length === 0 && <p className="empty-msg">No messages yet. Start the conversation!</p>}
              {messages.map((msg) => (
                <div key={msg.id} className={`msg ${msg.sender?.id === user?.id ? 'msg-sent' : 'msg-received'}`}>
                  <div className="msg-sender">{msg.sender?.username}</div>
                  <div className="msg-content">{msg.content}</div>
                  <div className="msg-time">{new Date(msg.created_at).toLocaleString()}</div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Type a message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button onClick={handleSend}><FiSend /></button>
            </div>
          </>
        ) : (
          <div className="chat-placeholder">
            <FiMessageSquare size={48} />
            <h3>Select a conversation</h3>
            <p>Choose a conversation from the left to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
