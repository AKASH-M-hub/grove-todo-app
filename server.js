// server.js

const express = require('express');
const cors = require('cors');
const fs = require('fs'); // -- ADD THIS LINE to import the File System module
const path = require('path'); // -- ADD THIS LINE to help with file paths

const app = express();
const PORT = 3000;

// -- ADD THIS LINE to define the path to your database file
const dbFilePath = path.join(__dirname, 'tasks.json');

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DATABASE ---
let tasks = []; // -- MODIFIED: Start with an empty array. We'll load from the file.

// -- NEW FUNCTION: A helper function to write the tasks array back to the file
const saveTasksToFile = () => {
  try {
    // JSON.stringify converts the JavaScript array into a string format for the file
    // The 'null, 2' part makes the JSON file nicely formatted and readable
    fs.writeFileSync(dbFilePath, JSON.stringify(tasks, null, 2));
  } catch (error) {
    console.error('Error saving tasks to file:', error);
  }
};

// -- NEW FUNCTION: A helper function to load tasks from the file
const loadTasksFromFile = () => {
    try {
        // Check if the file exists before trying to read it
        if (fs.existsSync(dbFilePath)) {
            const data = fs.readFileSync(dbFilePath);
            // JSON.parse converts the file's string content back into a JavaScript array
            tasks = JSON.parse(data);
        }
    } catch (error) {
        console.error('Error loading tasks from file:', error);
        tasks = []; // If there's an error, default to an empty array
    }
};

// --- API ROUTES (ENDPOINTS) ---

// 1. GET /tasks - Read all tasks (No changes needed here)
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

// 2. POST /tasks - Create a new task
// In server.js, update your POST route to look like this:

app.post('/tasks', (req, res) => {
  const { text } = req.body;

  // --- NEW: VALIDATION LOGIC ---
  if (!text || text.trim() === '') {
    // If text is missing or just consists of empty spaces
    return res.status(400).json({ error: 'Task text cannot be empty.' });
  }
  if (text.length > 140) {
    // Optional: Add a character limit for your tasks
    return res.status(400).json({ error: 'Task cannot exceed 140 characters.' });
  }
  // --- END: VALIDATION LOGIC ---

  const newId = tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1;

  const newTask = {
    id: newId,
    text: text,
    completed: false
  };

  tasks.push(newTask);
  saveTasksToFile();
  res.status(201).json(newTask);
});

// 3. DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const taskIndex = tasks.findIndex(t => t.id === taskId);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }
  
  tasks.splice(taskIndex, 1);
  saveTasksToFile(); // -- ADD THIS LINE to save after deleting a task
  res.status(204).send();
});

// 4. PUT /tasks/:id - Update a task
app.put('/tasks/:id', (req, res) => {
  const taskId = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === taskId);

  if (task) {
    task.completed = !task.completed;
    saveTasksToFile(); // -- ADD THIS LINE to save after updating a task
    res.json(task);
  } else {
    res.status(404).json({ error: 'Task not found' });
  }
});


// --- START THE SERVER ---
app.listen(PORT, () => {
  loadTasksFromFile(); // -- ADD THIS LINE to load tasks when the server starts
  console.log(`Server is running on http://localhost:${PORT}`);
});