import "./ChatWindow.css"
import Chat from "./Chat.jsx"
import { MyContext } from "./MyContext.jsx"
import { useContext, useEffect, useState } from "react"
import { ScaleLoader } from "react-spinners";

const API = import.meta.env.VITE_API_URL;
//  || "https://gemai-a-smart-writing-assistant.onrender.com/api";
const ChatWindow = () => {

  const { prompt, setPrompt, reply, setReply, currThreadId, prevChats, setPrevChats, newChat, setNewChat, token, handleLogout, setIsSidebarOpen } = useContext(MyContext);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const getReply = async () => {
    if (!prompt.trim()) return; // Don't send if input is empty
    setLoading(true);
    setNewChat(false);
    // console.log("message:", prompt, "threadId", currThreadId);
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message: prompt,
        threadId: currThreadId
      })
    }
    try {
      const response = await fetch(`${API}/chat`, options);

      const res = await response.json()

      // Check if response is successful
      if (!response.ok) {
        // Handle different error types
        const errorMessage = res.error || "Failed to get AI response. Please try again.";

        // Set error as reply so it displays in chat
        setReply(`❌ **Error:** ${errorMessage}`);
        console.error("AI Error:", res);

        setLoading(false);
        return;
      }

      // Success - set the reply
      setReply(res.reply)
      // console.log(res);

    } catch (error) {
      console.log("error in getReply function:", error);

      // Network or unexpected error
      setReply("❌ **Error:** Network error. Please check your connection and try again.");

    }
    setLoading(false);
  }
  //Append new chat to prevChats
  useEffect(() => {
    if (prompt && reply) {
      setPrevChats(prevChats => (
        [...prevChats, {
          role: "user",
          content: prompt
        }, {
          role: "assistant",
          content: reply
        }]
      ));
    }

    setPrompt("");
  }, [reply]);



  const handleProfileClick = () => {
    setIsOpen(!isOpen);
  }

  return (
    <div className="chatWindow">
      <div className="navbar">
        <div className="nav-left">
          <button className="menu-toggle" onClick={() => setIsSidebarOpen(true)}>
            <i className="fa-solid fa-bars"></i>
          </button>
          <img src="/gemAILogo.png" className="logo" alt="GemAI" />
        </div>
        <div className="upgradeDiv">
          <span><button>Upgrade to Plus</button></span>
        </div>
        <div className="barIconDiv">
          <span className="barIcon" onClick={handleProfileClick}><i className="fa-solid fa-bars"></i></span>
        </div>
      </div>
      {
        isOpen &&
        <div className="dropDown">
          <div className="dropDownItem"><i class="fa-solid fa-gear"></i> Settings</div>
          {/* <div className="dropDownItem"><i class="fa-solid fa-caret-up"></i> Upgrade plan</div> */}
          <div onClick={handleLogout} className="dropDownItem"><i class="fa-solid fa-arrow-right-from-bracket"></i> Log out</div>
        </div>
      }
      <Chat />
      <ScaleLoader color="#fff" loading={loading} />
      <div className="chatInput">
        <div className="inputBox">
          <input
            placeholder={newChat ? "How can I help you today?" : "Say what’s on your mind…"}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && prompt.trim() ? getReply() : ""}
          >

          </input>
          <div
            id="submit"
            onClick={getReply}
            className={!prompt.trim() ? "disabled" : ""}
            style={{ opacity: !prompt.trim() ? 0.5 : 1, cursor: !prompt.trim() ? 'not-allowed' : 'pointer' }}
          >
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>
        <p className="info">
          GemAI can make mistakes. Check important info. See Cookie Preferences.
        </p>
      </div>
    </div>
  )
}

export default ChatWindow
