
import { useEffect, useRef } from "react";

function TeamChat({
  messages,
  currentUser,
  chatText,
  onChatTextChange,
  onSendMessage,
}) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  function handleSubmit(event) {
    event.preventDefault();

    if (!chatText.trim()) return;

    onSendMessage();
  }

  return (
    <section className="team-chat">
      <div className="section-heading">
        <div>
          <h2>Team Chat</h2>
          <p>Communicate with your team in real time.</p>
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage =
              message.userId === currentUser?.id ||
              message.senderId === currentUser?.id;

            return (
              <div
                key={message.id}
                className={`chat-message ${
                  isOwnMessage ? "own-message" : ""
                }`}
              >
                <div className="chat-message-meta">
                  <strong>
                    {message.userName ||
                      message.senderName ||
                      "Team member"}
                  </strong>

                  {message.createdAt && (
                    <time>
                      {new Date(message.createdAt).toLocaleTimeString(
                        [],
                        { hour: "2-digit", minute: "2-digit" }
                      )}
                    </time>
                  )}
                </div>

                <p>{message.text}</p>
              </div>
            );
          })
        )}

        <div ref={messagesEndRef} />
      </div>

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={chatText}
          onChange={(event) => onChatTextChange(event.target.value)}
          placeholder="Write a message..."
          aria-label="Chat message"
          maxLength={500}
        />

        <button type="submit" disabled={!chatText.trim()}>
          Send
        </button>
      </form>
    </section>
  );
}

export default TeamChat;
