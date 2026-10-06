// REST API endpoint.
const API_URL = "http://localhost:3000/tasks";

const greeting = document.getElementById("greeting");
const refreshBtn = document.getElementById("refreshBtn");
const tableBody = document.getElementById("taskTableBody");
const statusMessage = document.getElementById("statusMessage");

const totalTasks = document.getElementById("totalTasks");
const todoTasks = document.getElementById("todoTasks");
const progressTasks = document.getElementById("progressTasks");
const completedTasks = document.getElementById("completedTasks");

const activityList = document.getElementById("activityList");


// Fetch API data when the page loads.
loadTasks();


// Fetch again when Refresh Data is clicked.
refreshBtn.addEventListener("click", loadTasks);


async function loadTasks() {

  statusMessage.textContent = "Loading tasks...";
  tableBody.innerHTML = `
    <tr>
      <td colspan="4" class="message-row">
        Fetching data from REST API...
      </td>
    </tr>
  `;

  try {

    // Fetch data from the backend.
    const response = await fetch(API_URL);

    // Check whether the HTTP request was successful.
    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    // Convert the API response into JavaScript data.
    const tasks = await response.json();

    // show greetings
    greeting.textContent = "Good morning 👋";

    // Display API data on the page.
    displayTasks(tasks);

    // Update dashboard numbers.
    updateSummary(tasks);

    // Create recent activity.
    displayActivity(tasks);

    statusMessage.textContent =
      `${tasks.length} tasks loaded from the API`;

  } catch (error) {

    console.error(error);

    statusMessage.textContent = "API connection failed.";

    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="message-row error-row">
          Unable to load tasks. Check that your REST API
          is running and API_URL is correct.
        </td>
      </tr>
    `;
  }
}


// Dynamically create table rows.
function displayTasks(tasks) {

  if (!Array.isArray(tasks) || tasks.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="4" class="message-row">
          No tasks found.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = tasks.map(task => {

    const statusClass = getStatusClass(task.status);
    const priorityClass = getPriorityClass(task.priority);

    return `
      <tr>

        <td>
          <strong>${escapeHtml(task.title)}</strong>
        </td>

        <td>
          ${escapeHtml(task.assignedTo)}
        </td>

        <td>
          <span class="priority ${priorityClass}">
            ${escapeHtml(task.priority)}
          </span>
        </td>

        <td>
          <span class="status ${statusClass}">
            ${escapeHtml(task.status)}
          </span>
        </td>

      </tr>
    `;

  }).join("");
}


// Calculate dashboard statistics.
function updateSummary(tasks) {

  totalTasks.textContent = tasks.length;

  todoTasks.textContent =
    tasks.filter(task =>
      task.status.toLowerCase() === "to do"
    ).length;

  progressTasks.textContent =
    tasks.filter(task =>
      task.status.toLowerCase() === "in progress"
    ).length;

  completedTasks.textContent =
    tasks.filter(task =>
      task.status.toLowerCase() === "completed"
    ).length;
}


// Display a few recent activities.
function displayActivity(tasks) {

  const recentTasks = tasks.slice(0, 3);

  if (recentTasks.length === 0) {
    activityList.innerHTML = "<p>No recent activity.</p>";
    return;
  }

  activityList.innerHTML = recentTasks.map(task => `
    <div class="activity">

      <span class="activity-dot"></span>

      <div>
        <strong>${escapeHtml(task.assignedTo)}</strong>
        updated
        <strong>${escapeHtml(task.title)}</strong>

        <small>
          Status: ${escapeHtml(task.status)}
        </small>
      </div>

    </div>
  `).join("");
}


// Convert status into a CSS class.
function getStatusClass(status) {

  const value = status.toLowerCase();

  if (value === "completed") {
    return "completed";
  }

  if (value === "in progress") {
    return "in-progress";
  }

  return "todo";
}


// Convert priority into a CSS class.
function getPriorityClass(priority) {

  const value = priority.toLowerCase();

  if (value === "high") {
    return "high";
  }

  if (value === "medium") {
    return "medium";
  }

  return "low";
}


// Prevent API text from being inserted as HTML.
function escapeHtml(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
