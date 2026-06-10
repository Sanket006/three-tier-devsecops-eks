const Task = require("../models/task");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const body = { ...req.body };
        // Backwards compatibility mapping
        if (!body.title && body.task) {
            body.title = body.task;
        }
        if (!body.task && body.title) {
            body.task = body.title;
        }
        if (body.category === "Done") {
            body.completed = true;
        } else if (body.category) {
            body.completed = false;
        }
        const task = await new Task(body).save();
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.get("/", async (req, res) => {
    try {
        const tasks = await Task.find();
        res.send(tasks);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put("/:id", async (req, res) => {
    try {
        const body = { ...req.body };
        // Sync category and completed state
        if (body.completed !== undefined && body.category === undefined) {
            body.category = body.completed ? "Done" : "To-Do";
        } else if (body.category !== undefined) {
            body.completed = body.category === "Done";
        }
        
        // Sync title and task fields
        if (body.task && !body.title) {
            body.title = body.task;
        } else if (body.title && !body.task) {
            body.task = body.title;
        }

        const task = await Task.findOneAndUpdate(
            { _id: req.params.id },
            body,
            { new: true } // Return updated doc
        );
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        res.send(task);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;
