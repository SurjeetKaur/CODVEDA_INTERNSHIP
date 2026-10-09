
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { io } from "socket.io-client";

import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import DashboardStats from "./components/DashboardStats";
import TaskForm from "./components/TaskForm";
import TaskList from "./components/TaskList";
import TeamChat from "./components/TeamChat";
import Notifications from "./components/Notifications";
import "./App.css";

const API_URL = "http://localhost:5000";
const SOCKET_URL = "http://localhost:5000";

function App() {
  const [users, setUsers] = useState([
    { id: "admin", name: "Admin", role: "Admin" },
    { id: "emp1", name: "Aman Sharma", role: "Employee" },
    { id: "emp2", name: "Priya Kaur", role: "Employee" },
  ]);

  const [currentUserId, setCurrentUserId] = useState("admin");
  const [tasks, setTasks] = useState([]);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chatText, setChatText] = useState("");
  const [filter, setFilter] = useState("All");
  const [activePage, setActivePage] = useState("Dashboard");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [connected, setConnected] = useState(false);

  const socketRef = useRef(null);

  const currentUser = useMemo(
    () => users.find((user) => user.id === currentUserId) || null,
    [users, currentUserId]
  );

  // Clear temporary success messages.
  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(""), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  // Load users, tasks and previous chat messages.
  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [usersResponse, tasksResponse, messagesResponse] =
          await Promise.all([
            fetch(`${API_URL}/api/users`),
            fetch(`${API_URL}/api/tasks`),
            fetch(`${API_URL}/api/messages`),
          ]);

        if (
          !usersResponse.ok ||
          !tasksResponse.ok ||
          !messagesResponse.ok
        ) {
          throw new Error(
            "Unable to load workspace data from the server."
          );
        }

        const [usersData, tasksData, messagesData] =
          await Promise.all([
            usersResponse.json(),
            tasksResponse.json(),
            messagesResponse.json(),
          ]);

        if (cancelled) return;

        if (Array.isArray(usersData) && usersData.length > 0) {
          setUsers(usersData);

          // Keep the current selection only if its database ID exists.
          setCurrentUserId((currentId) => {
            const userExists = usersData.some(
              (user) => String(user.id) === String(currentId)
            );

            if (userExists) return currentId;

            const adminUser = usersData.find(
              (user) => user.role === "Admin"
            );

            return adminUser ? adminUser.id : usersData[0].id;
          });
        }

        setTasks(Array.isArray(tasksData) ? tasksData : []);
        setMessages(Array.isArray(messagesData) ? messagesData : []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.message ||
              "Unable to load data. Please check that the backend is running."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, []);

  // Load saved notifications belonging to the selected user.
  useEffect(() => {
  if (!currentUser?.id) return;
    let cancelled = false;
    const userId = currentUser.id;

    async function loadNotifications() {
      try {
        const response = await fetch(
          `${API_URL}/api/notifications/${encodeURIComponent(userId)}`
        );

        if (!response.ok) {
          throw new Error("Failed to load saved notifications.");
        }

        const data = await response.json();

        if (cancelled) return;

        setNotifications((previous) => {
          const combined = [...data, ...previous];
          const unique = new Map();

          for (const item of combined) {
            if (String(item.userId) !== String(userId)) continue;
            unique.set(String(item.id), item);
          }

          return [...unique.values()]
            .sort(
              (a, b) =>
                new Date(b.createdAt) - new Date(a.createdAt)
            )
            .slice(0, 50);
        });
      } catch (err) {
        if (!cancelled) {
          console.error("Unable to load saved notifications:", err);
        }
      }
    }

    loadNotifications();

    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  // Real-time task updates, private notifications and team chat.
  useEffect(() => {
    if (!currentUser?.id) return;

    const userId = currentUser.id;
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    function handleConnect() {
      setConnected(true);
      socket.emit("user:join", userId);
      socket.emit("chat:join", "team");
    }

    function handleDisconnect() {
      setConnected(false);
    }

    function handleConnectError(err) {
      setConnected(false);
      console.error("Socket connection error:", err.message);
    }

    function handleTaskCreated(newTask) {
      if (!newTask) return;

      setTasks((previous) => {
        const exists = previous.some(
          (task) => String(task.id) === String(newTask.id)
        );

        return exists ? previous : [newTask, ...previous];
      });
    }

    function handleTaskUpdated(updatedTask) {
      if (!updatedTask) return;

      setTasks((previous) =>
        previous.map((task) =>
          String(task.id) === String(updatedTask.id)
            ? { ...task, ...updatedTask }
            : task
        )
      );
    }

    function handleTaskDeleted(deletedTask) {
      if (!deletedTask?.id) return;

      setTasks((previous) =>
        previous.filter(
          (task) => String(task.id) !== String(deletedTask.id)
        )
      );
    }

    function handleNewNotification(notification) {
      if (!notification) return;

      // Never show another user's private notification.
      if (
        notification.userId &&
        String(notification.userId) !== String(userId)
      ) {
        return;
      }

      const item = {
        ...notification,
        userId,
        id:
          notification.id ||
          `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        createdAt: notification.createdAt || new Date().toISOString(),
      };

      setNotifications((previous) => {
        const exists = previous.some(
          (entry) => String(entry.id) === String(item.id)
        );

        if (exists) return previous;

        return [item, ...previous].slice(0, 50);
      });
    }

    function handleNewMessage(message) {
      if (!message) return;

      setMessages((previous) => {
        const exists = previous.some(
          (item) => String(item.id) === String(message.id)
        );

        return exists ? previous : [...previous, message];
      });
    }

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);
    socket.on("connect_error", handleConnectError);
    socket.on("task:created", handleTaskCreated);
    socket.on("task:updated", handleTaskUpdated);
    socket.on("task:deleted", handleTaskDeleted);
    socket.on("notification:new", handleNewNotification);
    socket.on("chat:new", handleNewMessage);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("connect_error", handleConnectError);
      socket.off("task:created", handleTaskCreated);
      socket.off("task:updated", handleTaskUpdated);
      socket.off("task:deleted", handleTaskDeleted);
      socket.off("notification:new", handleNewNotification);
      socket.off("chat:new", handleNewMessage);

      socket.disconnect();

      if (socketRef.current === socket) {
        socketRef.current = null;
      }

      setConnected(false);
    };
  }, [currentUser]);

  // Create a task.
  const createTask = useCallback(async (taskData) => {
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: taskData.title,
          description: taskData.description,
          assignedTo: taskData.assignedTo,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Could not create the task.");
      }

      setTasks((previous) => {
        const exists = previous.some(
          (task) => String(task.id) === String(data.id)
        );

        return exists ? previous : [data, ...previous];
      });

      setNotice("Task created successfully.");
      return true;
    } catch (err) {
      setError(err.message || "Unable to create task.");
      return false;
    }
  }, []);

  // Update task status.
  const updateStatus = useCallback(
    async (taskId, status) => {
      setError("");
      setNotice("");

      if (!currentUser) {
        setError("Unable to identify the current user.");
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/tasks/${encodeURIComponent(taskId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status,
              updatedBy: currentUser.id,
              updatedByName: currentUser.name,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Could not update task status."
          );
        }

        setTasks((previous) =>
          previous.map((task) =>
            String(task.id) === String(taskId)
              ? { ...task, ...data }
              : task
          )
        );

        setNotice("Task status updated successfully.");
      } catch (err) {
        setError(err.message || "Unable to update task status.");
      }
    },
    [currentUser]
  );

  // Edit task details.
  const editTask = useCallback(
    async (taskId, taskData) => {
      setError("");
      setNotice("");

      if (currentUser?.role !== "Admin") {
        setError("Only Admin can edit tasks.");
        return false;
      }

      try {
        const response = await fetch(
          `${API_URL}/api/tasks/${encodeURIComponent(taskId)}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              title: taskData.title,
              description: taskData.description,
              assignedTo: taskData.assignedTo,
              dueDate: taskData.dueDate,
              priority: taskData.priority,
              status: taskData.status,
              updatedBy: currentUser.id,
              updatedByName: currentUser.name,
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not edit task.");
        }

        setTasks((previous) =>
          previous.map((task) =>
            String(task.id) === String(taskId)
              ? { ...task, ...data }
              : task
          )
        );

        setNotice("Task updated successfully.");
        return true;
      } catch (err) {
        setError(err.message || "Unable to edit task.");
        return false;
      }
    },
    [currentUser]
  );

  // Delete task.
  const deleteTask = useCallback(
    async (taskId, taskTitle) => {
      if (currentUser?.role !== "Admin") {
        setError("Only Admin can delete tasks.");
        return;
      }

      const confirmed = window.confirm(
        `Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`
      );

      if (!confirmed) return;

      setError("");
      setNotice("");

      try {
        const response = await fetch(
          `${API_URL}/api/tasks/${encodeURIComponent(taskId)}`,
          { method: "DELETE" }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not delete task.");
        }

        setTasks((previous) =>
          previous.filter(
            (task) => String(task.id) !== String(taskId)
          )
        );

        setNotice("Task deleted successfully.");
      } catch (err) {
        setError(err.message || "Unable to delete task.");
      }
    },
    [currentUser]
  );

  // Send a real-time team chat message.
  const sendMessage = useCallback(() => {
    const text = chatText.trim();
    const socket = socketRef.current;

    if (!text || !socket?.connected || !currentUser) {
      if (!socket?.connected) {
        setError("Chat is disconnected. Please wait for reconnection.");
      }
      return;
    }

    socket.emit("chat:send", {
      senderId: currentUser.id,
      senderName: currentUser.name,
      text,
      room: "team",
    });

    setChatText("");
    setError("");
  }, [chatText, currentUser]);

  // Admin sees all tasks; employees see only their assigned tasks.
  const visibleTasks = useMemo(() => {
    let result =
      currentUser?.role === "Admin"
        ? tasks
        : tasks.filter(
            (task) =>
              String(task.assignedTo) === String(currentUser?.id)
          );

    if (filter !== "All") {
      result = result.filter((task) => task.status === filter);
    }

    return result;
  }, [tasks, currentUser, filter]);

  function handleUserChange(userId) {
    setCurrentUserId(userId);
    setFilter("All");
    setNotifications([]);
    setError("");
    setNotice("");
  }

  function handlePageChange(page) {
    setActivePage(page);
    setError("");
    setNotice("");

    const pageIds = {
      Dashboard: "dashboard",
      Tasks: "tasks",
      "Team Chat": "chat",
      Notifications: "notifications",
    };

    const target = document.getElementById(pageIds[page]);

    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  return (
    <div className="app-layout">
      <Header
        currentUser={currentUser}
        onUserChange={handleUserChange}
        users={users}
        connected={connected}
      />

      <div className="workspace-layout">
        <Sidebar
          activePage={activePage}
          onPageChange={handlePageChange}
          currentUser={currentUser}
        />

        <main className="main-content">
          <section id="dashboard" className="page-heading">
            <p>TEAM OVERVIEW</p>
            <h1>Real-Time Workspace</h1>
            <p className="subtitle">
              Manage tasks, track progress, and stay connected with your team.
            </p>
          </section>

          {error && (
            <div className="error-message" role="alert">
              {error}
            </div>
          )}

          {notice && (
            <div className="notice-message" role="status">
              {notice}
            </div>
          )}

          {loading ? (
            <div className="loading-state">Loading your workspace...</div>
          ) : (
            <>
              <DashboardStats tasks={visibleTasks} />

              <div className="workspace-grid">
                <div className="workspace-left">
                  <section id="tasks" className="task-section">
                    <div className="section-heading">
                      <div>
                        <h2>
                          {currentUser?.role === "Admin"
                            ? "Team Tasks"
                            : "My Tasks"}
                        </h2>
                        <p>
                          {currentUser?.role === "Admin"
                            ? "Review and manage your team's workload."
                            : "View your assigned work and update progress."}
                        </p>
                      </div>
                    </div>

                    <div className="task-filters">
                      {[
                        "All",
                        "Pending",
                        "In Progress",
                        "Completed",
                      ].map((status) => (
                        <button
                          type="button"
                          key={status}
                          className={filter === status ? "active" : ""}
                          onClick={() => setFilter(status)}
                        >
                          {status}
                        </button>
                      ))}
                    </div>

                    <TaskList
                      tasks={visibleTasks}
                      currentUser={currentUser}
                      onStatusChange={updateStatus}
                      onEdit={editTask}
                      onDelete={deleteTask}
                    />
                  </section>

                  <div id="chat">
                    <TeamChat
                      messages={messages}
                      currentUser={currentUser}
                      chatText={chatText}
                      onChatTextChange={setChatText}
                      onSendMessage={sendMessage}
                    />
                  </div>
                </div>

                <div className="workspace-right">
                  {currentUser?.role === "Admin" && (
                    <TaskForm
                      users={users}
                      onCreateTask={createTask}
                      loading={loading}
                    />
                  )}

                  <div id="notifications">
                    <Notifications
                      notifications={notifications}
                      onClear={() => setNotifications([])}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      <footer className="app-footer">
        Taskflow · Real-Time Team Workspace · Designed for team productivity
      </footer>
    </div>
  );
}

export default App;




// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useRef,
//   useState,
// } from "react";
// import { io } from "socket.io-client";

// import Header from "./components/Header";
// import Sidebar from "./components/Sidebar";
// import DashboardStats from "./components/DashboardStats";
// import TaskForm from "./components/TaskForm";
// import TaskList from "./components/TaskList";
// import TeamChat from "./components/TeamChat";
// import Notifications from "./components/Notifications";
// import "./App.css";

// const API_URL = "http://localhost:5000";
// const SOCKET_URL = "http://localhost:5000";

// function App() {
//   const [users, setUsers] = useState([
//     { id: "admin", name: "Admin", role: "Admin" },
//     { id: "emp1", name: "Aman Sharma", role: "Employee" },
//     { id: "emp2", name: "Priya Kaur", role: "Employee" },
//   ]);

//   const [currentUserId, setCurrentUserId] = useState("admin");
//   const [tasks, setTasks] = useState([]);
//   const [messages, setMessages] = useState([]);
//   const [notifications, setNotifications] = useState([]);
//   const [chatText, setChatText] = useState("");
//   const [filter, setFilter] = useState("All");
//   const [activePage, setActivePage] = useState("Dashboard");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [notice, setNotice] = useState("");
//   const [connected, setConnected] = useState(false);
  

// useEffect(() => {
//   if (!notice) return;

//   const timer = setTimeout(() => {
//     setNotice("");
//   }, 3000);

//   return () => clearTimeout(timer);
// }, [notice]);

//   const socketRef = useRef(null);

//   const currentUser = useMemo(
//     () => users.find((user) => user.id === currentUserId) || null,
//     [users, currentUserId]
//   );

//   // Load users, tasks and previous chat messages.
//   useEffect(() => {
//     let cancelled = false;

//     async function loadData() {
//       setLoading(true);
//       setError("");

//       try {
//         const [usersResponse, tasksResponse, messagesResponse] =
//           await Promise.all([
//             fetch(`${API_URL}/api/users`),
//             fetch(`${API_URL}/api/tasks`),
//             fetch(`${API_URL}/api/messages`),
//           ]);

//         if (
//           !usersResponse.ok ||
//           !tasksResponse.ok ||
//           !messagesResponse.ok
//         ) {
//           throw new Error("Unable to load workspace data from the server.");
//         }

//         const [usersData, tasksData, messagesData] = await Promise.all([
//           usersResponse.json(),
//           tasksResponse.json(),
//           messagesResponse.json(),
//         ]);

//         if (cancelled) return;

        
// if (Array.isArray(usersData) && usersData.length > 0) {
//   setUsers(usersData);

//   setCurrentUserId((currentId) => {
//     const userExists = usersData.some(
//       (user) => String(user.id) === String(currentId)
//     );

//     if (userExists) {
//       return currentId;
//     }

//     const adminUser = usersData.find(
//       (user) => user.role === "Admin"
//     );

//     return adminUser ? adminUser.id : usersData[0].id;
//   });
// }


//         setTasks(Array.isArray(tasksData) ? tasksData : []);
//         setMessages(Array.isArray(messagesData) ? messagesData : []);
//       } catch (err) {
//         if (!cancelled) {
//           setError(
//             err.message ||
//               "Unable to load data. Please check that the backend is running."
//           );
//         }
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }

//     loadData();

//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   // Real-time task updates, notifications and team chat.
//   useEffect(() => {
//     if (!currentUser) return;

//     const socket = io(SOCKET_URL);
//     socketRef.current = socket;

//     function handleConnect() {
//       setConnected(true);
//       socket.emit("user:join", currentUser.id);
//       socket.emit("chat:join", "team");
//     }

//     function handleDisconnect() {
//       setConnected(false);
//     }

//     function handleConnectError() {
//       setConnected(false);
//     }

//     function handleTaskCreated(newTask) {
//       if (!newTask) return;

//       setTasks((previous) => {
//         const exists = previous.some(
//           (task) => String(task.id) === String(newTask.id)
//         );

//         return exists ? previous : [newTask, ...previous];
//       });
//     }

//     function handleTaskUpdated(updatedTask) {
//       if (!updatedTask) return;

//       setTasks((previous) =>
//         previous.map((task) =>
//           String(task.id) === String(updatedTask.id)
//             ? { ...task, ...updatedTask }
//             : task
//         )
//       );
//     }

//     function handleTaskDeleted(deletedTask) {
//       if (!deletedTask?.id) return;

//       setTasks((previous) =>
//         previous.filter(
//           (task) => String(task.id) !== String(deletedTask.id)
//         )
//       );
//     }

//     function handleNewNotification(notification) {
//       if (!notification) return;

//       setNotifications((previous) => [
//         {
//           ...notification,
//           id:
//             notification.id ||
//             `${Date.now()}-${Math.random().toString(36).slice(2)}`,
//           createdAt: notification.createdAt || new Date().toISOString(),
//         },
//         ...previous,
//       ].slice(0, 50));
//     }

//     function handleNewMessage(message) {
//       if (!message) return;

//       setMessages((previous) => {
//         const exists = previous.some(
//           (item) => String(item.id) === String(message.id)
//         );

//         return exists ? previous : [...previous, message];
//       });
//     }

//     socket.on("connect", handleConnect);
//     socket.on("disconnect", handleDisconnect);
//     socket.on("connect_error", handleConnectError);
//     socket.on("task:created", handleTaskCreated);
//     socket.on("task:updated", handleTaskUpdated);
//     socket.on("task:deleted", handleTaskDeleted);
//     socket.on("notification:new", handleNewNotification);
//     socket.on("chat:new", handleNewMessage);

//     return () => {
//       socket.off("connect", handleConnect);
//       socket.off("disconnect", handleDisconnect);
//       socket.off("connect_error", handleConnectError);
//       socket.off("task:created", handleTaskCreated);
//       socket.off("task:updated", handleTaskUpdated);
//       socket.off("task:deleted", handleTaskDeleted);
//       socket.off("notification:new", handleNewNotification);
//       socket.off("chat:new", handleNewMessage);

//       socket.disconnect();

//       if (socketRef.current === socket) {
//         socketRef.current = null;
//       }

//       setConnected(false);
//     };
//   }, [currentUser]);

//   // Create a task.
//   const createTask = useCallback(async (taskData) => {
//     setError("");
//     setNotice("");

//     try {
//       const response = await fetch(`${API_URL}/api/tasks`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           title: taskData.title,
//           description: taskData.description,
//           assignedTo: taskData.assignedTo,
//           priority: taskData.priority,
//           dueDate: taskData.dueDate,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || "Could not create the task.");
//       }

//       setTasks((previous) => {
//         const exists = previous.some(
//           (task) => String(task.id) === String(data.id)
//         );

//         return exists ? previous : [data, ...previous];
//       });

//       setNotice("Task created successfully.");
//       return true;
//     } catch (err) {
//       setError(err.message || "Unable to create task.");
//       return false;
//     }
//   }, []);

//   // Update task status.
//   const updateStatus = useCallback(
//     async (taskId, status) => {
//       setError("");
//       setNotice("");

//       if (!currentUser) {
//         setError("Unable to identify the current user.");
//         return;
//       }

//       try {
//         const response = await fetch(
//           `${API_URL}/api/tasks/${encodeURIComponent(taskId)}`,
//           {
//             method: "PATCH",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               status,
//               updatedBy: currentUser.id,
//               updatedByName: currentUser.name,
//             }),
//           }
//         );

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(
//             data.message || "Could not update task status."
//           );
//         }

//         setTasks((previous) =>
//           previous.map((task) =>
//             String(task.id) === String(taskId)
//               ? { ...task, ...data }
//               : task
//           )
//         );

//         setNotice("Task status updated successfully.");
//       } catch (err) {
//         setError(err.message || "Unable to update task status.");
//       }
//     },
//     [currentUser]
//   );

//   // EDIT: Update task details through the backend API.
//   const editTask = useCallback(
//     async (taskId, taskData) => {
//       setError("");
//       setNotice("");

//       if (currentUser?.role !== "Admin") {
//         setError("Only Admin can edit tasks.");
//         return false;
//       }

//       try {
//         const response = await fetch(
//           `${API_URL}/api/tasks/${encodeURIComponent(taskId)}`,
//           {
//             method: "PATCH",
//             headers: {
//               "Content-Type": "application/json",
//             },
//             body: JSON.stringify({
//               title: taskData.title,
//               description: taskData.description,
//               assignedTo: taskData.assignedTo,
//               dueDate: taskData.dueDate,
//               priority: taskData.priority,
//               status: taskData.status,
//               updatedBy: currentUser.id,
//               updatedByName: currentUser.name,
//             }),
//           }
//         );

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.message || "Could not edit task.");
//         }

//         // Use the returned task data to keep the dashboard up to date.
//         setTasks((previous) =>
//           previous.map((task) =>
//             String(task.id) === String(taskId)
//               ? { ...task, ...data }
//               : task
//           )
//         );

//         setNotice("Task updated successfully.");
//         return true;
//       } catch (err) {
//         setError(err.message || "Unable to edit task.");
//         return false;
//       }
//     },
//     [currentUser]
//   );

//   // DELETE: Confirm before permanently removing a task.
//   const deleteTask = useCallback(
//     async (taskId, taskTitle) => {
//       if (currentUser?.role !== "Admin") {
//         setError("Only Admin can delete tasks.");
//         return;
//       }

//       const confirmed = window.confirm(
//         `Are you sure you want to delete "${taskTitle}"? This action cannot be undone.`
//       );

//       if (!confirmed) return;

//       setError("");
//       setNotice("");

//       try {
//         const response = await fetch(
//           `${API_URL}/api/tasks/${encodeURIComponent(taskId)}`,
//           {
//             method: "DELETE",
//           }
//         );

//         const data = await response.json();

//         if (!response.ok) {
//           throw new Error(data.message || "Could not delete task.");
//         }

//         setTasks((previous) =>
//           previous.filter(
//             (task) => String(task.id) !== String(taskId)
//           )
//         );

//         setNotice("Task deleted successfully.");
//       } catch (err) {
//         setError(err.message || "Unable to delete task.");
//       }
//     },
//     [currentUser]
//   );

//   // Send a real-time team chat message.
//   const sendMessage = useCallback(() => {
//     const text = chatText.trim();
//     const socket = socketRef.current;

//     if (!text || !socket?.connected || !currentUser) {
//       if (!socket?.connected) {
//         setError("Chat is disconnected. Please wait for reconnection.");
//       }
//       return;
//     }

//     socket.emit("chat:send", {
//       senderId: currentUser.id,
//       senderName: currentUser.name,
//       text,
//       room: "team",
//     });

//     setChatText("");
//     setError("");
//   }, [chatText, currentUser]);

//   // Admin sees all tasks; employees see their assigned tasks.
//   const visibleTasks = useMemo(() => {
//     let result =
//       currentUser?.role === "Admin"
//         ? tasks
//         : tasks.filter(
//             (task) =>
//               String(task.assignedTo) === String(currentUser?.id)
//           );

//     if (filter !== "All") {
//       result = result.filter((task) => task.status === filter);
//     }

//     return result;
//   }, [tasks, currentUser, filter]);

  
// function handleUserChange(userId) {
//   setCurrentUserId(userId);
//   setFilter("All");
//   setNotifications([]);
//   setError("");
//   setNotice("");
// }

//   function handlePageChange(page) {
//     setActivePage(page);
//     setError("");
//     setNotice("");

//     const pageIds = {
//       Dashboard: "dashboard",
//       Tasks: "tasks",
//       "Team Chat": "chat",
//       Notifications: "notifications",
//     };

//     const target = document.getElementById(pageIds[page]);

//     if (target) {
//       target.scrollIntoView({
//         behavior: "smooth",
//         block: "start",
//       });
//     }
//   }

//   return (
//     <div className="app-layout">
//       <Header
//         currentUser={currentUser}
//         onUserChange={handleUserChange}
//         users={users}
//         connected={connected}
//       />

//       <div className="workspace-layout">
//         <Sidebar
//           activePage={activePage}
//           onPageChange={handlePageChange}
//           currentUser={currentUser}
//         />

//         <main className="main-content">
//           <section id="dashboard" className="page-heading">
//             <p>TEAM OVERVIEW</p>
//             <h1>Real-Time Workspace</h1>
//             <p className="subtitle">
//               Manage tasks, track progress, and stay connected with your team.
//             </p>
//           </section>

//           {error && (
//             <div className="error-message" role="alert">
//               {error}
//             </div>
//           )}

//           {notice && (
//             <div className="notice-message" role="status">
//               {notice}
//             </div>
//           )}

//           {loading ? (
//             <div className="loading-state">
//               Loading your workspace...
//             </div>
//           ) : (
//             <>
//               <DashboardStats tasks={visibleTasks} />

//               <div className="workspace-grid">
//                 <div className="workspace-left">
//                   <section id="tasks" className="task-section">
//                     <div className="section-heading">
//                       <div>
//                         <h2>
//                           {currentUser?.role === "Admin"
//                             ? "Team Tasks"
//                             : "My Tasks"}
//                         </h2>
//                         <p>
//                           {currentUser?.role === "Admin"
//                             ? "Review and manage your team's workload."
//                             : "View your assigned work and update progress."}
//                         </p>
//                       </div>
//                     </div>

//                     <div className="task-filters">
//                       {[
//                         "All",
//                         "Pending",
//                         "In Progress",
//                         "Completed",
//                       ].map((status) => (
//                         <button
//                           type="button"
//                           key={status}
//                           className={filter === status ? "active" : ""}
//                           onClick={() => setFilter(status)}
//                         >
//                           {status}
//                         </button>
//                       ))}
//                     </div>

//                     <TaskList
//                       tasks={visibleTasks}
//                       currentUser={currentUser}
//                       onStatusChange={updateStatus}
//                       onEdit={editTask}
//                       onDelete={deleteTask}
//                     />
//                   </section>

//                   <div id="chat">
//                     <TeamChat
//                       messages={messages}
//                       currentUser={currentUser}
//                       chatText={chatText}
//                       onChatTextChange={setChatText}
//                       onSendMessage={sendMessage}
//                     />
//                   </div>
//                 </div>

//                 <div className="workspace-right">
//                   {currentUser?.role === "Admin" && (
//                     <TaskForm
//                       users={users}
//                       onCreateTask={createTask}
//                       loading={loading}
//                     />
//                   )}

//                   <div id="notifications">
//                     <Notifications
//                       notifications={notifications}
//                       onClear={() => setNotifications([])}
//                     />
//                   </div>
//                 </div>
//               </div>
//             </>
//           )}
//         </main>
//       </div>

//       <footer className="app-footer">
//         Taskflow · Real-Time Team Workspace · Designed for team productivity
//       </footer>
//     </div>
//   );
// }

// export default App;

