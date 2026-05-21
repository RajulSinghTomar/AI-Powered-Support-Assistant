import { useEffect, useState } from "react";

import {
  MessageSquare,
  Send,
  LogOut,
  Plus,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import api from "../services/api";

interface Message {
  id?: number;
  userMessage: string;
  aiResponse: string;
  conversationId?: number;
}

interface Conversation {
  id: number;
  title: string;
}

export default function ChatPage() {
  const navigate = useNavigate();

  const [message, setMessage] =
    useState("");

  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [currentChat, setCurrentChat] =
    useState<Message[]>([]);

  const [selectedChatId, setSelectedChatId] =
    useState<number | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [visibleChats, setVisibleChats] =
    useState(5);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response =
        await api.get("/chat");

      const chats = response.data.sort(
        (
          a: Conversation,
          b: Conversation
        ) => b.id - a.id
      );

      setConversations(chats);
    } catch (error) {
      console.log(error);
    }
  };

  const openConversation = async (
    conversationId: number
  ) => {
    try {
      const response =
        await api.get(
          `/chat/${conversationId}`
        );

      setCurrentChat(response.data);

      setSelectedChatId(
        conversationId
      );
    } catch (error) {
      console.log(error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim()) return;

    setLoading(true);

    try {
      const response = await api.post(
        "/chat",
        {
          message,

          conversationId:
            selectedChatId,
        }
      );

      const newMessage: Message = {
        userMessage:
          response.data.userMessage,

        aiResponse:
          response.data.aiResponse,

        conversationId:
          response.data.conversationId,
      };

      setCurrentChat((prev) => [
        ...prev,
        newMessage,
      ]);

      if (!selectedChatId) {
        setSelectedChatId(
          response.data.conversationId
        );
      }

      await loadConversations();

      setMessage("");
    } catch (error) {
      console.log(error);

      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");

    navigate("/");
  };

  const newChat = () => {
    setCurrentChat([]);

    setSelectedChatId(null);
  };

  return (
    <div className="h-screen flex bg-gray-950 text-white">
      {/* Sidebar */}
      <div className="w-72 bg-black border-r border-gray-800 p-5 hidden md:flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-2 text-2xl font-bold mb-8">
          <MessageSquare />
          AI Assistant
        </div>

        {/* New Chat */}
        <button
          onClick={newChat}
          className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-xl flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          New Chat
        </button>

        {/* Recent Conversations */}
        <div className="mt-8 flex-1 overflow-y-auto">
          <h2 className="text-gray-400 text-sm mb-3">
            Recent Conversations
          </h2>

          <div className="space-y-2">
            {conversations
              .slice(0, visibleChats)
              .map(
                (
                  conversation,
                  index
                ) => (
                  <button
                    key={index}
                    onClick={() =>
                      openConversation(
                        conversation.id
                      )
                    }
                    className={`w-full text-left p-3 rounded-xl text-sm truncate border transition ${
                      selectedChatId ===
                      conversation.id
                        ? "bg-blue-600 border-blue-500"
                        : "bg-gray-900 border-gray-800 hover:border-gray-700"
                    }`}
                  >
                    {conversation.title}
                  </button>
                )
              )}
          </div>

          {/* Show More / Less */}
          <div className="flex gap-3 mt-4">
            {conversations.length >
              visibleChats && (
              <button
                onClick={() =>
                  setVisibleChats(
                    (prev) =>
                      prev + 5
                  )
                }
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Show More
              </button>
            )}

            {visibleChats > 5 && (
              <button
                onClick={() =>
                  setVisibleChats(5)
                }
                className="text-sm text-gray-400 hover:text-gray-300"
              >
                Show Less
              </button>
            )}
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="mt-4 bg-red-600 hover:bg-red-700 transition p-3 rounded-xl flex items-center justify-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>

      {/* Main Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-800 bg-black">
          <h1 className="text-xl font-semibold">
            AI Support Assistant
          </h1>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {currentChat.length === 0 && (
            <div className="h-full flex items-center justify-center text-gray-500">
              Start chatting with AI...
            </div>
          )}

          {currentChat.map(
            (msg, index) => (
              <div key={index}>
                {/* User */}
                <div className="flex justify-end">
                  <div className="bg-blue-600 px-5 py-3 rounded-2xl max-w-lg">
                    {msg.userMessage}
                  </div>
                </div>

                {/* AI */}
                <div className="flex justify-start mt-3">
                  <div className="bg-gray-800 px-5 py-3 rounded-2xl max-w-lg border border-gray-700 whitespace-pre-wrap">
                    {msg.aiResponse}
                  </div>
                </div>
              </div>
            )
          )}

          {/* Loading */}
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
                setMessage(
                  e.target.value
                )
              }
              placeholder="Ask anything..."
              className="flex-1 bg-gray-900 border border-gray-700 rounded-2xl px-5 py-3 outline-none focus:border-blue-500"
            />

            <button
              onClick={sendMessage}
              className="bg-blue-600 hover:bg-blue-700 transition px-5 rounded-2xl flex items-center justify-center"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}