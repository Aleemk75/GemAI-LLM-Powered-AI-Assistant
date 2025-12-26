import "./Sidebar.css";
import { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext";
import { v1 as uuidv1 } from "uuid"
const API = import.meta.env.VITE_API_URL;
//  || "https://gemai-a-smart-writing-assistant.onrender.com/api";
const Sidebar = () => {
  const { allThreads, setALLThreads, newChat, setNewChat, currThreadId, setPrompt, setReply, setCurrThreadId, prevChats, setPrevChats, user, handleLogout, isSidebarOpen, setIsSidebarOpen } = useContext(MyContext);
  const [isLoadingThread, setIsLoadingThread] = useState(false);

  const getUserThreads = async () => {
    try {
      const response = await fetch(`${API}/threads`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      })

      const res = await response.json();
      const filteredData = res.map(thread => (
        {
          threadId: thread.threadId,
          title: thread.title
        }
      ))

      // console.log(filteredData);
      setALLThreads(filteredData)

    } catch (error) {
      console.log(error);

    }
  }

  useEffect(() => {
    getUserThreads();
  }, [currThreadId])

  // Restore active chat on load if applicable
  useEffect(() => {
    // If we have a currThreadId on mount, it's not a new chat, and we have no messages yet...
    if (currThreadId && !newChat && prevChats.length === 0) {
      // Fetch the messages for this thread
      getThread(currThreadId);
    }
  }, []);

  //create a new chat button
  const createNewChat = () => {
    setNewChat(true)
    setPrompt("");
    setReply([]);
    setCurrThreadId(uuidv1());
    setPrevChats([])
    // Close sidebar on mobile after clicking new chat
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  }

  // get thread by the id / to click on the title
  const getThread = async (threadId) => {
    setIsLoadingThread(true);
    setCurrThreadId(threadId);
    try {
      const response = await fetch(`${API}/thread/${threadId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch thread');
      }

      const res = await response.json();
      // console.log(res);

      setPrevChats(res);
      setNewChat(false);
      setReply(null);

      // Close sidebar on mobile after selecting a thread
      if (window.innerWidth <= 768) {
        setIsSidebarOpen(false);
      }
    } catch (error) {
      console.log("error in getThread function:", error);
      // If thread not found (e.g. deleted or invalid ID), revert to new chat
      createNewChat();
    } finally {
      setIsLoadingThread(false);
    }
  }

  //delete thread by threadId(uuid)
  const deleteThread = async (threadId) => {
    try {
      const response = await fetch(`${API}/thread/${threadId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        method: "DELETE"
      })
      const res = await response.json();
      console.log(res);

      //updated thread re-render
      setALLThreads(prev => prev.filter(thread => thread.threadId !== threadId));

      if (threadId === currThreadId) {
        createNewChat();
      }
    } catch (error) {
      console.log("error in deleteThread function:", error);
    }
  }
  return (
    <>
      {isSidebarOpen && <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)}></div>}
      <section className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="logoDiv">
            <img src="/gemAILogo.png" alt="logo" className="logo1" />
          </div>
          <button className="close-sidebar" onClick={() => setIsSidebarOpen(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <button onClick={createNewChat}>
          {/* <img src="/gemAILogo.png" alt="logo" className="logo" /> */}
          <p>New Chat</p>
          <span><i className="fa-solid fa-pen-to-square"></i></span>
        </button>

        {/* history */}
        <ul className="history">

          {
            allThreads?.map((thread, idx) => (
              <li onClick={() => getThread(thread.threadId)} key={idx}
                className={thread.threadId === currThreadId ? "highlighted" : ""}
              >

                {thread.title}
                <i className="fa-solid fa-trash"
                  onClick={(e) => {
                    e.stopPropagation(); //stop event bubbling
                    deleteThread(thread.threadId);
                  }}
                ></i>
              </li>
            ))
          }
        </ul>


        {/* sign app owner */}
        <div className="sign">
          {user && (
            <div className="sidebar-user">
              <span className="user-circle">{user.name.charAt(0).toUpperCase()}</span>
              <p className="username">{user.name}</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

export default Sidebar

