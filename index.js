require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TodoModel = require('./Models/Todo');

const app = express();
app.use(cors());
app.use(express.json());

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("✅ Connected to MongoDB"))
    .catch((err) => console.error("❌ Error connecting to MongoDB:", err));

// ...rest of your code...

// Get all todos
app.get('/get', async (req, res) => {
    try {
        const todos = await TodoModel.find().sort({ createdAt: -1 });
        console.log("Fetched todos:", todos); // Debug log
        res.json(todos);
    } catch (err) {
        console.error("❌ Error fetching todos:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Add new todo
app.post('/add', async (req, res) => {
    try {
        const { task } = req.body;
        if (!task) {
            return res.status(400).json({ success: false, message: "Task is required" });
        }
        const newTodo = new TodoModel({ task, completed: false });
        const savedTodo = await newTodo.save();
        console.log("Added todo:", savedTodo); // Debug log
        res.status(201).json({ success: true, todo: savedTodo });
    } catch (err) {
        console.error("❌ Error adding todo:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Update todo
app.put('/update/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        
        const updatedTodo = await TodoModel.findByIdAndUpdate(
            id,
            updates,
            { new: true, runValidators: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({ success: false, message: "Todo not found" });
        }

        console.log("Updated todo:", updatedTodo); // Debug log
        res.json({ success: true, todo: updatedTodo });
    } catch (err) {
        console.error("❌ Error updating todo:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// Delete todo
app.delete('/delete/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTodo = await TodoModel.findByIdAndDelete(id);
        
        if (!deletedTodo) {
            return res.status(404).json({ success: false, message: "Todo not found" });
        }

        console.log("Deleted todo:", deletedTodo); // Debug log
        res.json({ success: true, message: "Todo deleted successfully" });
    } catch (err) {
        console.error("❌ Error deleting todo:", err);
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server is Running on port ${PORT}`);
});