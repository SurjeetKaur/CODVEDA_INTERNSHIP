import { useState } from "react";

function TaskCard({
  task,
  currentUser,
  onStatusChange,
  onEdit,
  onDelete,
}) {
  const isAdmin = currentUser?.role === "Admin";

  const isAssignedEmployee =
    String(currentUser?.id) === String(task.assignedTo);

  const canUpdateStatus = isAdmin || isAssignedEmployee;

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    dueDate: task.dueDate
      ? String(task.dueDate).slice(0, 10)
      : "",
    priority: task.priority || "Medium",
    status: task.status || "Pending",
  });

  const dueDate = task.dueDate
    ? new Date(`${String(task.dueDate).slice(0, 10)}T00:00:00`)
    : null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const validDueDate =
    dueDate && !Number.isNaN(dueDate.getTime());

  const isCompleted = task.status === "Completed";

  const isOverdue =
    validDueDate && dueDate < today && !isCompleted;

  const isDueToday =
    validDueDate &&
    dueDate.getTime() === today.getTime() &&
    !isCompleted;

  const formattedDueDate = validDueDate
    ? dueDate.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Not set";

  function startEditing() {
    setFormData({
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate
        ? String(task.dueDate).slice(0, 10)
        : "",
      priority: task.priority || "Medium",
      status: task.status || "Pending",
    });

    setIsEditing(true);
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleEditSubmit(event) {
    event.preventDefault();

    if (!formData.title.trim()) {
      alert("Please enter a task title.");
      return;
    }

    if (!formData.dueDate) {
      alert("Please select a due date.");
      return;
    }

    try {
      setSaving(true);

      await onEdit(task.id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        dueDate: formData.dueDate,
        priority: formData.priority,
        status: formData.status,
      });

      setIsEditing(false);
    } catch (error) {
      console.error("Unable to update task:", error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="task-card">
      <div className="task-card-header">
        <div className="task-card-title">
          <h3>{task.title}</h3>
          <p>
            Assigned to: {task.assignedToName || "Team member"}
          </p>
        </div>

        <span
          className={`priority priority-${(
            task.priority || "Medium"
          ).toLowerCase()}`}
        >
          {task.priority || "Medium"}
        </span>
      </div>

      {task.description && (
        <p className="task-description">{task.description}</p>
      )}

      <div className="task-due-date">
        <span>Due date: {formattedDueDate}</span>

        {!isCompleted && isOverdue && (
          <span className="due-badge overdue-badge">
            Overdue
          </span>
        )}

        {!isCompleted && isDueToday && (
          <span className="due-badge due-today-badge">
            Due today
          </span>
        )}
      </div>

      <div className="task-card-footer">
        <span
          className={`task-status status-${(
            task.status || "Pending"
          )
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
        >
          {task.status || "Pending"}
        </span>

        {canUpdateStatus && (
          <select
            aria-label={`Update status for ${task.title}`}
            value={task.status || "Pending"}
            onChange={(event) =>
              onStatusChange(task.id, event.target.value)
            }
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        )}
      </div>

      {isAdmin && (
        <div className="task-admin-actions">
          <button
            type="button"
            onClick={startEditing}
            disabled={saving}
          >
            Edit Task
          </button>

          <button
            type="button"
            onClick={() => onDelete(task.id, task.title)}
            disabled={saving}
          >
            Delete Task
          </button>
        </div>
      )}

      {isAdmin && isEditing && (
        <form
          className="task-edit-form"
          onSubmit={handleEditSubmit}
        >
          <h4>Edit Task</h4>

          <label>
            Task title
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              maxLength={150}
              required
            />
          </label>

          <label>
            Description
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              maxLength={2000}
            />
          </label>

          <label>
            Due date
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Priority
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>

          <label>
            Status
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </label>

          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => setIsEditing(false)}
            disabled={saving}
          >
            Cancel
          </button>
        </form>
      )}
    </article>
  );
}

export default TaskCard;

// import { useState } from "react";

// function TaskCard({
//   task,
//   currentUser,
//   users = [],
//   onStatusChange,
//   onEdit,
//   onDelete,
// }) {
//   const isAdmin = currentUser?.role === "Admin";

//   const isAssignedEmployee =
//     String(currentUser?.id) === String(task.assignedTo);

//   const canUpdateStatus = isAdmin || isAssignedEmployee;

//   const [isEditing, setIsEditing] = useState(false);
//   const [saving, setSaving] = useState(false);

//   const [formData, setFormData] = useState(() => ({
//     title: task.title || "",
//     description: task.description || "",
//     assignedTo: task.assignedTo || "",
//     dueDate: task.dueDate
//       ? String(task.dueDate).slice(0, 10)
//       : "",
//     priority: task.priority || "Medium",
//     status: task.status || "Pending",
//   }));

//   // Only show actual employees, not administrators.
//   const employees = users.filter(
//     (user) => user.role === "Employee"
//   );

//   const dueDate = task.dueDate
//     ? new Date(`${String(task.dueDate).slice(0, 10)}T00:00:00`)
//     : null;

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const validDueDate =
//     dueDate && !Number.isNaN(dueDate.getTime());

//   const isCompleted = task.status === "Completed";

//   const isOverdue =
//     validDueDate && dueDate < today && !isCompleted;

//   const isDueToday =
//     validDueDate &&
//     dueDate.getTime() === today.getTime() &&
//     !isCompleted;

//   const formattedDueDate = validDueDate
//     ? dueDate.toLocaleDateString("en-IN", {
//         day: "numeric",
//         month: "short",
//         year: "numeric",
//       })
//     : "Not set";

//   function startEditing() {
//     // Populate the form from the latest task only when
//     // the user clicks Edit Task.
//     setFormData({
//       title: task.title || "",
//       description: task.description || "",
//       assignedTo: task.assignedTo || "",
//       dueDate: task.dueDate
//         ? String(task.dueDate).slice(0, 10)
//         : "",
//       priority: task.priority || "Medium",
//       status: task.status || "Pending",
//     });

//     setIsEditing(true);
//   }

//   function handleChange(event) {
//     const { name, value } = event.target;

//     setFormData((previous) => ({
//       ...previous,
//       [name]: value,
//     }));
//   }

//   async function handleEditSubmit(event) {
//     event.preventDefault();

//     if (!formData.title.trim()) {
//       alert("Please enter a task title.");
//       return;
//     }

//     if (!formData.assignedTo) {
//       alert("Please select an employee.");
//       return;
//     }

//     if (!formData.dueDate) {
//       alert("Please select a due date.");
//       return;
//     }

//     try {
//       setSaving(true);

//       await onEdit(task.id, {
//         ...formData,
//         title: formData.title.trim(),
//         description: formData.description.trim(),
//       });

//       setIsEditing(false);
//     } catch (error) {
//       console.error("Unable to update task:", error);
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <article className="task-card">
//       <div className="task-card-header">
//         <div className="task-card-title">
//           <h3>{task.title}</h3>
//           <p>
//             Assigned to: {task.assignedToName || "Team member"}
//           </p>
//         </div>

//         <span
//           className={`priority priority-${(
//             task.priority || "Medium"
//           ).toLowerCase()}`}
//         >
//           {task.priority || "Medium"}
//         </span>
//       </div>

//       {task.description && (
//         <p className="task-description">{task.description}</p>
//       )}

//       <div className="task-due-date">
//         <span>Due date: {formattedDueDate}</span>

//         {!isCompleted && isOverdue && (
//           <span className="due-badge overdue-badge">
//             Overdue
//           </span>
//         )}

//         {!isCompleted && isDueToday && (
//           <span className="due-badge due-today-badge">
//             Due today
//           </span>
//         )}
//       </div>

//       <div className="task-card-footer">
//         <span
//           className={`task-status status-${(
//             task.status || "Pending"
//           )
//             .toLowerCase()
//             .replace(/\s+/g, "-")}`}
//         >
//           {task.status || "Pending"}
//         </span>

//         {canUpdateStatus && (
//           <select
//             aria-label={`Update status for ${task.title}`}
//             value={task.status || "Pending"}
//             onChange={(event) =>
//               onStatusChange(task.id, event.target.value)
//             }
//           >
//             <option value="Pending">Pending</option>
//             <option value="In Progress">In Progress</option>
//             <option value="Completed">Completed</option>
//           </select>
//         )}
//       </div>

//       {isAdmin && (
//         <div className="task-admin-actions">
//           <button
//             type="button"
//             onClick={startEditing}
//             disabled={saving}
//           >
//             Edit Task
//           </button>

//           <button
//             type="button"
//             onClick={() => onDelete(task.id, task.title)}
//             disabled={saving}
//           >
//             Delete Task
//           </button>
//         </div>
//       )}

//       {isAdmin && isEditing && (
//         <form
//           className="task-edit-form"
//           onSubmit={handleEditSubmit}
//         >
//           <h4>Edit Task</h4>

//           <label>
//             Task title
//             <input
//               type="text"
//               name="title"
//               value={formData.title}
//               onChange={handleChange}
//               maxLength={150}
//               required
//             />
//           </label>

//           <label>
//             Description
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               maxLength={2000}
//             />
//           </label>

//          <label>
//             Due date
//             <input
//               type="date"
//               name="dueDate"
//               value={formData.dueDate}
//               onChange={handleChange}
//               required
//             />
//           </label>

//           <label>
//             Priority
//             <select
//               name="priority"
//               value={formData.priority}
//               onChange={handleChange}
//             >
//               <option value="Low">Low</option>
//               <option value="Medium">Medium</option>
//               <option value="High">High</option>
//             </select>
//           </label>

//           <label>
//             Status
//             <select
//               name="status"
//               value={formData.status}
//               onChange={handleChange}
//             >
//               <option value="Pending">Pending</option>
//               <option value="In Progress">In Progress</option>
//               <option value="Completed">Completed</option>
//             </select>
//           </label>

//           <button
//             type="submit"
//             // disabled={saving || employees.length === 0}
//             disabled={saving || !title.trim() || !assignedTo || !dueDate}
//           >
//             {saving ? "Saving..." : "Save Changes"}
//           </button>

//           <button
//             type="button"
//             onClick={() => setIsEditing(false)}
//             disabled={saving}
//           >
//             Cancel
//           </button>
//         </form>
//       )}
//     </article>
//   );
// }

// export default TaskCard;


// import { useState ,useEffect} from "react";

// function TaskCard({ task, currentUser, users=[], onStatusChange, onEdit, onDelete }) {
//   const isAdmin = currentUser?.role === "Admin";
//   const isAssignedEmployee = currentUser?.id === task.assignedTo;
//   const canUpdateStatus = isAdmin || isAssignedEmployee;

//   const [isEditing, setIsEditing] = useState(false);
//   const [formData, setFormData] = useState({
//     title: task.title || "",
//     description: task.description || "",
//     assignedTo: task.assignedTo || "emp1",
//     dueDate: task.dueDate ? String(task.dueDate).slice(0, 10) : "",
//     priority: task.priority || "Medium",
//     status: task.status || "Pending",
//   });
//   const [saving, setSaving] = useState(false);

//   const dueDate = task.dueDate
//     ? new Date(`${String(task.dueDate).slice(0, 10)}T00:00:00`)
//     : null;

//   const today = new Date();
//   today.setHours(0, 0, 0, 0);

//   const isCompleted = task.status === "Completed";
//   const isOverdue = dueDate && dueDate < today && !isCompleted;
//   const isDueToday =
//     dueDate &&
//     dueDate.getTime() === today.getTime() &&
//     !isCompleted;

//   const formattedDueDate =
//     dueDate && !Number.isNaN(dueDate.getTime())
//       ? dueDate.toLocaleDateString("en-IN", {
//           day: "numeric",
//           month: "short",
//           year: "numeric",
//         })
//       : "Not set";

//   function handleChange(event) {
//     const { name, value } = event.target;
//     setFormData((previous) => ({
//       ...previous,
//       [name]: value,
//     }));
//   }

//   async function handleEditSubmit(event) {
//     event.preventDefault();

//     if (!formData.title.trim() || !formData.dueDate) {
//       alert("Please enter a task title and due date.");
//       return;
//     }

//     try {
//       setSaving(true);
//       await onEdit(task.id, {
//         ...formData,
//         title: formData.title.trim(),
//         description: formData.description.trim(),
//       });
//       setIsEditing(false);
//     } catch {
//       // The parent should display the API error.
//     } finally {
//       setSaving(false);
//     }
//   }

//   return (
//     <article className="task-card">
//       <div className="task-card-header">
//         <div className="task-card-title">
//           <h3>{task.title}</h3>
//           <p>
//             Assigned to: {task.assignedToName || "Team member"}
//           </p>
//         </div>

//         <span
//           className={`priority priority-${(
//             task.priority || "Medium"
//           ).toLowerCase()}`}
//         >
//           {task.priority || "Medium"}
//         </span>
//       </div>

//       {task.description && (
//         <p className="task-description">{task.description}</p>
//       )}

//       <div className="task-due-date">
//         <span>Due date: {formattedDueDate}</span>

//         {!isCompleted && isOverdue && (
//           <span className="due-badge overdue-badge">Overdue</span>
//         )}

//         {!isCompleted && isDueToday && (
//           <span className="due-badge due-today-badge">Due today</span>
//         )}
//       </div>

//       <div className="task-card-footer">
//         <span
//           className={`task-status status-${(
//             task.status || "Pending"
//           )
//             .toLowerCase()
//             .replace(/\s+/g, "-")}`}
//         >
//           {task.status || "Pending"}
//         </span>

//         {canUpdateStatus && (
//           <select
//             aria-label={`Update status for ${task.title}`}
//             value={task.status || "Pending"}
//             onChange={(event) =>
//               onStatusChange(task.id, event.target.value)
//             }
//           >
//             <option value="Pending">Pending</option>
//             <option value="In Progress">In Progress</option>
//             <option value="Completed">Completed</option>
//           </select>
//         )}
//       </div>

//       {isAdmin && (
//         <div className="task-admin-actions">
//           <button
//             type="button"
//             onClick={() => setIsEditing((previous) => !previous)}
//           >
//             {isEditing ? "Cancel Edit" : "Edit Task"}
//           </button>

//           <button
//             type="button"
//             onClick={() => onDelete(task.id, task.title)}
//           >
//             Delete Task
//           </button>
//         </div>
//       )}

//       {isAdmin && isEditing && (
//         <form className="task-edit-form" onSubmit={handleEditSubmit}>
//           <h4>Edit Task</h4>

//           <label>
//             Task title
//             <input
//               name="title"
//               value={formData.title}
//               onChange={handleChange}
//               maxLength={150}
//               required
//             />
//           </label>

//           <label>
//             Description
//             <textarea
//               name="description"
//               value={formData.description}
//               onChange={handleChange}
//               maxLength={2000}
//             />
//           </label>

//           <label>
//             Assign to
//             <select
//               name="assignedTo"
//               value={formData.assignedTo}
//               onChange={handleChange}
//               required
//             >
//               {/* <option value="emp1">Aman Sharma</option>
//               <option value="emp2">Priya Kaur</option> */}
//             </select>
//           </label>

//           <label>
//             Due date
//             <input
//               type="date"
//               name="dueDate"
//               value={formData.dueDate}
//               onChange={handleChange}
//               required
//             />
//           </label>

//           <label>
//             Priority
//             <select
//               name="priority"
//               value={formData.priority}
//               onChange={handleChange}
//             >
//               <option value="Low">Low</option>
//               <option value="Medium">Medium</option>
//               <option value="High">High</option>
//             </select>
//           </label>

//           <label>
//             Status
//             <select
//               name="status"
//               value={formData.status}
//               onChange={handleChange}
//             >
//               <option value="Pending">Pending</option>
//               <option value="In Progress">In Progress</option>
//               <option value="Completed">Completed</option>
//             </select>
//           </label>

//           <button type="submit" disabled={saving}>
//             {saving ? "Saving..." : "Save Changes"}
//           </button>
//         </form>
//       )}
//     </article>
//   );
// }

// export default TaskCard;


