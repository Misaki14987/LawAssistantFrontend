import type React from "react";
import { useState, useRef, memo } from "react";
import { AIModelSelector, SubmitButton } from "../../utils/ui";
import { showToast } from "../../utils/toast";
import { fetchWithAuth } from "../../utils/api";
import type { ChatBoxProps, ChatMessage } from "./types";

const ChatInputComponent = ({
  userChat,
  onChange,
  onKeyDown,
}: {
  userChat: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="space-y-2 relative">
      <textarea
        ref={textareaRef}
        value={userChat}
        onChange={(e) => onChange(e.target.value)}
        placeholder="输入您的问题，按Enter键发送..."
        style={{ height: "30px", minHeight: "30px" }}
        className="w-full px-4 py-3 pr-12 rounded-xl border border-white/30 bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#5d76c5] focus:border-transparent text-gray-800 placeholder-gray-500 resize-none overflow-auto transition-all duration-200 ease-in-out shadow-sm"
        onKeyDown={onKeyDown}
      />
    </div>
  );
};

const ChatInput = memo(ChatInputComponent);

const ChatBox = ({
  addMessage,
  setIsLoading,
  refreshHistory,
  selectedHistoryId,
  setSelectedHistoryId,
  currentTheme,
  setCurrentTheme,
}: ChatBoxProps) => {
  const [model, setModel] = useState<string>("moonshot");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputMessage, setInputMessage] = useState<string>("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.closest("form");
      if (form) form.requestSubmit();
    }
  };

  async function handleUserMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!inputMessage.trim()) {
      showToast("请输入问题内容", "error");
      return;
    }

    const wasInHistory = !!selectedHistoryId;
    if (wasInHistory) {
      setSelectedHistoryId(null);
    }

    setIsSubmitting(true);
    setIsLoading(true);

    const userMessageContent = inputMessage;
    setInputMessage("");

    try {
      const data = await fetchWithAuth("/api/ai/chat", "POST", {
        model,
        content: userMessageContent,
        theme: currentTheme,
      });

      // const reader = data.body.getReader();
      // const decoder = new TextDecoder();
      // while (true) {
      //   const {done, value} = await reader.read();
      //   if (done) {
      //     break;
      //   }
      //   const response = decoder.decode(value);
      //   const aiResponse = JSON.parse(response).message;
      //   console.log(aiResponse);
        
      // }

      let aiResponse = "";
      if (typeof data.data === "string") {
        aiResponse = data.data;
      } else if (data.data && typeof data.data.message === "string") {
        aiResponse = data.data.message;
      } else if (data.message && typeof data.message === "string") {
        aiResponse = data.message;
      } else {
        aiResponse = JSON.stringify(data.data || data);
      }

      // 创建用户消息
      const userMessage: ChatMessage = {
        role: "user",
        content: userMessageContent,
        timestamp: Date.now(),
      };

      // 创建助手消息
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse,
        timestamp: Date.now() + 1,
      };

      // 添加消息到对话
      addMessage(userMessage);
      addMessage(assistantMessage);

      if (data.theme && setCurrentTheme) {
        setCurrentTheme(data.theme);
      }

      if (refreshHistory) {
        refreshHistory();
      }

      showToast("请求处理成功", "success");
    } catch {
      // Error handling is done in fetchWithAuth
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  }

  const handleNewChat = () => {
    setInputMessage("");
    if (setSelectedHistoryId) {
      setSelectedHistoryId(null);
    }
  };

  return (
    <div className="border-t border-white/30 bg-white/40 backdrop-blur-md shadow-lg pt-2">
      <div className="flex flex-col sm:flex-row justify-between items-center px-4 py-2 mb-2">
        <div className="flex items-center mb-2 sm:mb-0">
          {selectedHistoryId && (
            <button
              onClick={handleNewChat}
              className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-[#5d76c5] to-[#3a5199] hover:from-[#4a5fa3] hover:to-[#324785] text-white shadow-md transition-all"
            >
              新对话
            </button>
          )}
        </div>
        <AIModelSelector model={model} setModel={setModel} />
      </div>
      <div className="p-4 bg-gradient-to-b from-white/30 to-white/20 backdrop-blur-sm border-t border-white/30 shadow-inner">
        <form onSubmit={handleUserMessage} className="flex flex-col gap-2">
          <div className="flex-1">
            <ChatInput
              userChat={inputMessage}
              onChange={(data) => setInputMessage(data)}
              onKeyDown={handleKeyDown}
            />
          </div>
          <SubmitButton
            isSubmitting={isSubmitting}
            isDisabled={!inputMessage.trim()}
          />
        </form>
      </div>
    </div>
  );
};

export default ChatBox;
