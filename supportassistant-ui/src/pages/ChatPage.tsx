import { useState } from "react";

import {
  MessageSquare,
  Send,
} from "lucide-react";

import api from "../services/api";

interface Message {
  userMessage: string;
  aiResponse: string;
}

export default function ChatPage() {
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState<Message[]>([]);

  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);

    try {
      const response = await api.post("/chat", {
        message,
      });

      setMessages((prev) => [
        ...prev,
        response.data,
      ]);

      setMessage("");
    } catch {
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex bg-gray-950 text-white">
      {/* Sidebar */}
      <div className="w-72 bg-black border-r border-gray-800 p-5 hidden md:block">
        <div className="flex items-center gap-2 text-2xl font-bold mb-8">
          <MessageSquare />
          AI Assistant
        </div>

        <button className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-xl">
          + New Chat
        </button>

        <div className="mt-8 text-gray-400 text-sm">
          Recent conversations will appear here.
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 bg-black">
          <h1 className="text-xl font-semibold">
            AI Support Assistant
          </h1>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex items-center justify-center text-gray-500">
              Start chatting with AI...
            </div>
          )}

          {messages.map((msg, index) => (
            <div key={index}>
              {/* User */}
              <div className="flex justify-end">
                <div className="bg-blue-600 px-5 py-3 rounded-2xl max-w-lg">
                  {msg.userMessage}
                </div>
              </div>

              {/* AI */}
              <div className="flex justify-start mt-3">
                <div className="bg-gray-800 px-5 py-3 rounded-2xl max-w-lg">
                  {msg.aiResponse}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="text-gray-400 animate-pulse">
              AI is typing...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-5 border-t border-gray-800 bg-black">
          <div className="flex gap-3">
            <input
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              placeholder="Ask anything..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-2xl px-5 py-3 outline-none"
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 transition px-5 rounded-2xl"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}