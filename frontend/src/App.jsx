import { useState, useEffect } from "react";
import { Search, Plus, Share2, Moon, Sun, ArrowUp, Sparkles, FileCheck, UserCheck, FileText, ThumbsUp, ThumbsDown, Copy, RotateCcw, MessageSquare, Menu, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { sendMessageToBackend } from "./api/chatAPI";

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [fullResponseText, setFullResponseText] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { id: 1, title: "Check loan eligibility for...", date: "TODAY" },
    { id: 2, title: "Verify customer documents...", date: "TODAY" },
    { id: 3, title: "Generate sanction letter for...", date: "YESTERDAY" },
    { id: 4, title: "Calculate EMI for personal...", date: "YESTERDAY" },
    { id: 5, title: "Review credit score analysis...", date: "PREVIOUS" },
    { id: 6, title: "Process loan application...", date: "PREVIOUS" },
  ]);

  // Typing animation effect
  useEffect(() => {
    if (fullResponseText && typingText.length < fullResponseText.length) {
      const timeout = setTimeout(() => {
        setTypingText(fullResponseText.slice(0, typingText.length + 1));
      }, 10); // Adjust speed here (lower = faster)
      return () => clearTimeout(timeout);
    } else if (fullResponseText && typingText.length === fullResponseText.length && fullResponseText.length > 0) {
      // Typing complete, update the actual message
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: fullResponseText,
          isComplete: true
        };
        return updated;
      });
      setFullResponseText("");
      setTypingText("");
    }
  }, [typingText, fullResponseText]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setShowWelcome(false);

    // Add user's message instantly
    const newMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, newMessage]);

    // Reset input
    const userInput = input;
    setInput("");

    // Show loading state
    setIsLoading(true);
    setMessages((prev) => [...prev, { role: "assistant", content: "", isLoading: true }]);

    // Call backend API
    const response = await sendMessageToBackend(userInput);

    // Remove loading message and add placeholder for typing
    setMessages((prev) => {
      const updated = [...prev];
      updated[updated.length - 1] = {
        role: "assistant",
        content: "",
        isTyping: true
      };
      return updated;
    });

    // Stop loading and start typing animation
    setIsLoading(false);
    const responseText = response.reply || "No response received.";
    setFullResponseText(responseText);
  };

  const handleCardClick = (action) => {
    setShowWelcome(false);
    const message = { role: "user", content: action };
    setMessages([message, { role: "assistant", content: "Let me help you with that...", isComplete: true }]);
    
    const newChat = {
      id: chatHistory.length + 1,
      title: action.substring(0, 30) + "...",
      date: "TODAY"
    };
    setChatHistory((prev) => [newChat, ...prev]);
  };

  const groupChatsByDate = () => {
    const grouped = {
      TODAY: [],
      YESTERDAY: [],
      PREVIOUS: []
    };
    
    chatHistory.forEach(chat => {
      if (grouped[chat.date]) {
        grouped[chat.date].push(chat);
      }
    });
    
    return grouped;
  };

  const groupedChats = groupChatsByDate();

  // Loading dots component
  const LoadingDots = () => (
    <div className="flex gap-1 items-center py-2">
      <div className={`w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }}></div>
      <div className={`w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }}></div>
      <div className={`w-2 h-2 ${darkMode ? 'bg-gray-400' : 'bg-gray-600'} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }}></div>
    </div>
  );

  return (
    <div
      className={`h-screen flex relative ${
        darkMode ? "bg-[#0a0e13]" : "bg-white"
      }`}
    >
      {darkMode && (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-96 bg-gradient-to-b from-blue-900/20 via-blue-800/10 to-transparent blur-3xl pointer-events-none"></div>
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none"></div>
        </>
      )}

      {/* Sidebar */}
      {messages.length > 0 && (
        <div
          className={`${
            sidebarOpen ? "w-72" : "w-0"
          } ${
            darkMode ? "bg-[#0f1419] border-[#1f2937]" : "bg-gray-50 border-gray-200"
          } border-r flex-shrink-0 transition-all duration-300 overflow-hidden relative z-20 flex flex-col`}
        >
          {sidebarOpen && (
            <>
              {/* Sidebar Header */}
              <div className="p-4 border-b border-[#1f2937]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`${darkMode ? "text-white" : "text-gray-600"} font-semibold text-sm`}>Capita AI</h2>
                    <p className="text-gray-500 text-xs">v1.20</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMessages([]);
                    setShowWelcome(true);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 bg-[#1a2332] hover:bg-[#1f2937] rounded-lg transition text-gray-300 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add new chat</span>
                </button>
              </div>

              {/* Chat History */}
              <div className="flex-1 overflow-y-auto p-3">
                {Object.entries(groupedChats).map(([date, chats]) => (
                  chats.length > 0 && (
                    <div key={date} className="mb-4">
                      <h3 className="text-gray-500 text-xs font-medium mb-2 px-2">
                        {date}
                      </h3>
                      <div className="space-y-1">
                        {chats.map((chat) => (
                          <button
                            key={chat.id}
                            className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1a2332] rounded-lg transition text-left group"
                          >
                            <MessageSquare className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <span className="text-gray-400 text-sm truncate">
                              {chat.title}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                ))}
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-[#1f2937] space-y-2">
                <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1a2332] rounded-lg transition text-gray-400 text-sm">
                  <Search className="w-4 h-4" />
                  <span>Search</span>
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 hover:bg-[#1a2332] rounded-lg transition text-gray-400 text-sm">
                  <FileText className="w-4 h-4" />
                  <span>Documentation</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header
          className={`px-6 py-4 ${
            darkMode ? "border-[#1f2937]" : "border-gray-200"
          } border-b flex items-center justify-between relative z-10`}
        >
          <div className="flex items-center gap-3">
            {messages.length > 0 && (
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`p-2 ${
                  darkMode ? "hover:bg-[#1a2332]" : "hover:bg-gray-100"
                } rounded-lg transition`}
              >
                {sidebarOpen ? (
                  <X className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                ) : (
                  <Menu className={`w-5 h-5 ${darkMode ? "text-gray-400" : "text-gray-600"}`} />
                )}
              </button>
            )}
            <button
              className={`p-2 ${
                darkMode ? "hover:bg-[#1a2332]" : "hover:bg-gray-100"
              } rounded-lg transition`}
            >
              <Search
                className={`w-5 h-5 ${
                  darkMode ? "text-gray-500" : "text-gray-600"
                }`}
              />
            </button>
            <button
              onClick={() => {
                setMessages([]);
                setShowWelcome(true);
              }}
              className={`flex items-center gap-2 px-3 py-2 ${
                darkMode ? "hover:bg-[#1a2332]" : "hover:bg-gray-100"
              } rounded-lg transition`}
            >
              <Plus
                className={`w-5 h-5 ${
                  darkMode ? "text-gray-500" : "text-gray-600"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-700"
                }`}
              >
                New Chat
              </span>
            </button>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 ${
                darkMode ? "hover:bg-[#1a2332]" : "hover:bg-gray-100"
              } rounded-lg transition`}
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <button
              className={`flex items-center gap-2 px-3 py-2 ${
                darkMode ? "hover:bg-[#1a2332]" : "hover:bg-gray-100"
              } rounded-lg transition`}
            >
              <Share2
                className={`w-5 h-5 ${
                  darkMode ? "text-gray-500" : "text-gray-600"
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  darkMode ? "text-gray-400" : "text-gray-700"
                }`}
              >
                Share
              </span>
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto flex items-start justify-center relative z-10 pt-8">
          {showWelcome && messages.length === 0 ? (
            <div className="flex flex-col items-center px-6 max-w-6xl w-full">
              <div
                className={`w-16 h-16 ${
                  darkMode
                    ? "bg-[#1a2332] border-[#2d3748]"
                    : "bg-gray-50 border-gray-200"
                } rounded-full flex items-center justify-center mb-4 border`}
              >
                <Sparkles
                  className={`w-6 h-6 ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                />
              </div>

              <h1
                className={`text-4xl font-normal ${
                  darkMode ? "text-white" : "text-gray-900"
                } mb-2`}
              >
                Good Morning,{" "}
                <span className={darkMode ? "text-gray-500" : "text-gray-600"}>
                  Mohab
                </span>
              </h1>
              <p
                className={`${
                  darkMode ? "text-gray-500" : "text-gray-600"
                } mb-12`}
              >
                Welcome to your AI-powered NBFC Assistant. How can I help you
                today?
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                <div
                  onClick={() =>
                    handleCardClick("Check loan eligibility for a customer")
                  }
                  className={`${
                    darkMode
                      ? "bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10"
                      : "bg-white border-gray-200 hover:shadow-lg"
                  } border rounded-xl p-6 transition cursor-pointer`}
                >
                  <div
                    className={`w-12 h-12 ${
                      darkMode ? "bg-blue-500/10" : "bg-blue-50"
                    } rounded-lg flex items-center justify-center mb-4`}
                  >
                    <UserCheck
                      className={`w-6 h-6 ${
                        darkMode ? "text-blue-400" : "text-blue-600"
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-2`}
                  >
                    Check Loan Eligibility
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-500" : "text-gray-600"
                    } mb-6`}
                  >
                    Assess customer eligibility for loans using AI-powered
                    analysis of income, credit score, and financial history.
                  </p>
                  <button
                    className={`text-sm font-medium ${
                      darkMode
                        ? "text-gray-400 hover:text-blue-400"
                        : "text-gray-900 hover:text-blue-600"
                    } transition`}
                  >
                    Start Assessment
                  </button>
                </div>

                <div
                  onClick={() =>
                    handleCardClick("Verify customer documents and details")
                  }
                  className={`${
                    darkMode
                      ? "bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10"
                      : "bg-white border-gray-200 hover:shadow-lg"
                  } border rounded-xl p-6 transition cursor-pointer`}
                >
                  <div
                    className={`w-12 h-12 ${
                      darkMode ? "bg-orange-500/10" : "bg-orange-50"
                    } rounded-lg flex items-center justify-center mb-4`}
                  >
                    <FileCheck
                      className={`w-6 h-6 ${
                        darkMode ? "text-orange-400" : "text-orange-600"
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-2`}
                  >
                    Verify Customer Details
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-500" : "text-gray-600"
                    } mb-6`}
                  >
                    Automatically verify customer documents, KYC information, and
                    employment details through intelligent validation.
                  </p>
                  <button
                    className={`text-sm font-medium ${
                      darkMode
                        ? "text-gray-400 hover:text-orange-400"
                        : "text-gray-900 hover:text-orange-600"
                    } transition`}
                  >
                    Verify Now
                  </button>
                </div>

                <div
                  onClick={() =>
                    handleCardClick("Generate a loan sanction letter")
                  }
                  className={`${
                    darkMode
                      ? "bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10"
                      : "bg-white border-gray-200 hover:shadow-lg"
                  } border rounded-xl p-6 transition cursor-pointer`}
                >
                  <div
                    className={`w-12 h-12 ${
                      darkMode ? "bg-green-500/10" : "bg-green-50"
                    } rounded-lg flex items-center justify-center mb-4`}
                  >
                    <FileText
                      className={`w-6 h-6 ${
                        darkMode ? "text-green-400" : "text-green-600"
                      }`}
                    />
                  </div>
                  <h3
                    className={`text-lg font-semibold ${
                      darkMode ? "text-white" : "text-gray-900"
                    } mb-2`}
                  >
                    Generate Sanction Letter
                  </h3>
                  <p
                    className={`text-sm ${
                      darkMode ? "text-gray-500" : "text-gray-600"
                    } mb-6`}
                  >
                    Create professional loan sanction letters with all necessary
                    terms, conditions, and approval details automatically.
                  </p>
                  <button
                    className={`text-sm font-medium ${
                      darkMode
                        ? "text-gray-400 hover:text-green-400"
                        : "text-gray-900 hover:text-green-600"
                    } transition`}
                  >
                    Generate Letter
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-6 max-w-4xl w-full mx-auto">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mr-3 ${
                        darkMode ? "bg-blue-600" : "bg-blue-600"
                      }`}
                    >
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start max-w-full"
                    }`}
                  >
                    {msg.role === "user" && (
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-400" : "text-gray-600"
                          }`}
                        >
                          You
                        </span>
                        <div
                          className={`w-7 h-7 rounded-full flex items-center justify-center ${
                            darkMode ? "bg-gray-700" : "bg-gray-300"
                          }`}
                        >
                          <span className="text-xs font-medium text-white">
                            M
                          </span>
                        </div>
                      </div>
                    )}

                    {msg.role === "assistant" && (
                      <div className="mb-2">
                        <span
                          className={`text-sm font-medium ${
                            darkMode ? "text-gray-300" : "text-gray-700"
                          }`}
                        >
                          Capita AI
                        </span>
                      </div>
                    )}

                    <div
                      className={`px-5 py-3 rounded-xl ${
                        msg.role === "user"
                          ? darkMode
                            ? "bg-white/10 backdrop-blur-xl border border-white/20 text-gray-100 inline-block"
                            : "bg-blue-600 text-white inline-block"
                          : darkMode
                          ? "bg-white/5 backdrop-blur-xl text-gray-300 border border-white/10 w-full"
                          : "bg-gray-100 text-gray-800 w-full"
                      }`}
                    >
                      {msg.isLoading ? (
                        <LoadingDots />
                      ) : msg.role === "assistant" && msg.isTyping && typingText ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {typingText}
                        </ReactMarkdown>
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      )}
                    </div>

                    {msg.role === "assistant" && !msg.isLoading && (
                      <div className="flex items-center gap-2 mt-3">
                        <button
                          className={`p-1.5 ${
                            darkMode ? "hover:bg-white/10" : "hover:bg-gray-200"
                          } rounded-md transition`}
                        >
                          <ThumbsUp
                            className={`w-4 h-4 ${
                              darkMode ? "text-gray-500" : "text-gray-600"
                            }`}
                          />
                        </button>
                        <button
                          className={`p-1.5 ${
                            darkMode ? "hover:bg-white/10" : "hover:bg-gray-200"
                          } rounded-md transition`}
                        >
                          <ThumbsDown
                            className={`w-4 h-4 ${
                              darkMode ? "text-gray-500" : "text-gray-600"
                            }`}
                          />
                        </button>
                        <button
                          className={`p-1.5 ${
                            darkMode ? "hover:bg-white/10" : "hover:bg-gray-200"
                          } rounded-md transition`}
                        >
                          <Copy
                            className={`w-4 h-4 ${
                              darkMode ? "text-gray-500" : "text-gray-600"
                            }`}
                          />
                        </button>
                        <button
                          className={`p-1.5 ${
                            darkMode ? "hover:bg-white/10" : "hover:bg-gray-200"
                          } rounded-md transition`}
                        >
                          <RotateCcw
                            className={`w-4 h-4 ${
                              darkMode ? "text-gray-500" : "text-gray-600"
                            }`}
                          />
                        </button>
                        <div
                          className={`ml-auto text-xs ${
                            darkMode ? "text-gray-500" : "text-gray-500"
                          }`}
                        >
                          CapitaFlex
                        </div>
                      </div>
                    )}
                  </div>

                  {msg.role === "user" && <div className="w-8"></div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className={`p-6 relative z-10`}>
          <div className="max-w-4xl mx-auto">
            <div
              className={`flex items-center gap-3 ${
                darkMode
                  ? "bg-white/5 backdrop-blur-xl border-white/10"
                  : "bg-white border-gray-300"
              } border rounded-2xl px-4 py-3 shadow-sm hover:shadow-md transition`}
            >
              <button
                className={`p-1 ${
                  darkMode ? "hover:bg-[#1f2937]" : "hover:bg-gray-100"
                } rounded-full transition`}
              >
                <Plus
                  className={`w-5 h-5 ${
                    darkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                />
              </button>
              <input
                type="text"
                placeholder="Ask about loan eligibility, document verification, or sanction letters..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                className={`flex-1 px-2 py-1 focus:outline-none bg-transparent ${
                  darkMode
                    ? "text-gray-100 placeholder-gray-500"
                    : "text-gray-700 placeholder-gray-400"
                }`}
              />
              <button
                onClick={handleSend}
                className={`p-2 ${
                  input.trim()
                    ? darkMode
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-blue-600 hover:bg-blue-700"
                    : darkMode
                    ? "bg-[#1f2937]"
                    : "bg-gray-200"
                } rounded-full transition`}
                disabled={!input.trim()}
              >
                <ArrowUp
                  className={`w-5 h-5 ${
                    input.trim()
                      ? "text-white"
                      : darkMode
                      ? "text-gray-600"
                      : "text-gray-400"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;