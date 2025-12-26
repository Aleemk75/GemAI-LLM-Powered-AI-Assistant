// App.js - Updated with proper state management
import "./App.css"
import Sidebar from './Sidebar'
import ChatWindow from './ChatWindow'
import { MyContext } from './MyContext'
import { useEffect, useState } from "react"
import { v1 as uuidv1 } from "uuid"
import AuthPage from "./AuthPage"

const App = () => {
  const [prompt, setPrompt] = useState("");
  const [reply, setReply] = useState(null);
  /* 
    Initialize currThreadId from localStorage if available (and valid), 
    otherwise generate new UUID.
  */
  const [currThreadId, setCurrThreadId] = useState(() => {
    const savedThreadId = localStorage.getItem('activeThreadId');
    return savedThreadId ? savedThreadId : uuidv1();
  });

  const [prevChats, setPrevChats] = useState([]); // stores all chats of curr threads

  /* 
    Initialize newChat state:
    If we have a saved thread ID, it's not a new chat (unless specifically marked otherwise).
    However, usually if we reload with a thread ID, we want to fetch that thread's messages.
    So newChat should be false if we have a saved ID. 
  */
  const [newChat, setNewChat] = useState(() => {
    return !localStorage.getItem('activeThreadId');
  });
  const [allThreads, setALLThreads] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Authentication states
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);


  useEffect(() => {
    // Load from localStorage when the app starts
    const savedToken = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('authUser');

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setIsAuthChecking(false);
  }, []);

  useEffect(() => {
    // Save current thread ID to localStorage whenever it changes
    // Only save if it's not a "new chat" session being dynamically created before first message
    if (currThreadId) {
      localStorage.setItem('activeThreadId', currThreadId);
    }
  }, [currThreadId]);

  // Logout function
  const handleLogout = () => {
    setUser(null);
    setToken(null);
    // Reset chat states
    setPrompt("");
    setReply(null);
    const newId = uuidv1();
    setCurrThreadId(newId);
    setPrevChats([]);
    setNewChat(true);
    setALLThreads([]);

    // Clear persisted data
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('activeThreadId'); // Clear active thread on logout

    // Disable Google auto-select
    if (window.google) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const providerValues = {
    prompt, setPrompt,
    reply, setReply,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    prevChats, setPrevChats,
    allThreads, setALLThreads,
    // Add authentication values
    user,
    token,
    handleLogout,
    isSidebarOpen,
    setIsSidebarOpen
  };

  // Login screen
  if (isAuthChecking) {
    return (
      <div className="app-loader">
        <div className="loader"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage setUser={setUser} setToken={setToken} />
    );
  }

  // Main app (after login)
  return (
    <div className='app'>
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  )
}

export default App