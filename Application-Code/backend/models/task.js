const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    category: {
        type: String,
        default: "To-Do", // "To-Do", "In-Progress", "Done"
    },
    color: {
        type: String,
        default: "#6366f1", // Indigo
    },
    completed: {
        type: Boolean,
        default: false,
    },
    task: {
        type: String,
    }
});

// Pre-save hook to ensure backwards compatibility with older pipelines or test scripts
taskSchema.pre("save", function (next) {
    if (!this.title && this.task) {
        this.title = this.task;
    }
    if (!this.task && this.title) {
        this.task = this.title;
    }
    if (this.category === "Done") {
        this.completed = true;
    } else {
        this.completed = false;
    }
    next();
});

module.exports = mongoose.model("task", taskSchema);
