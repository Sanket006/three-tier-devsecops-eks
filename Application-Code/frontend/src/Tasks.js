import { Component } from "react";
import {
    addTask,
    getTasks,
    updateTask,
    deleteTask,
} from "./services/taskServices";

class Tasks extends Component {
    state = {
        tasks: [],
        title: "",
        description: "",
        category: "To-Do",
        color: "#6366f1", // default Indigo
        isModalOpen: false,
    };

    loadTasks = async () => {
        try {
            const { data } = await getTasks();
            this.setState({ tasks: Array.isArray(data) ? data : [] });
        } catch (error) {
            console.log("Error loading tasks:", error);
            this.setState({ tasks: [] });
        }
    };

    async componentDidMount() {
        await this.loadTasks();
    }

    handleInputChange = (e) => {
        const { name, value } = e.target;
        this.setState({ [name]: value });
    };

    handleSubmitTask = async (e) => {
        e.preventDefault();
        const { title, description, category, color, tasks } = this.state;
        if (!title.trim()) return;

        try {
            const { data } = await addTask({
                title,
                description,
                category,
                color,
            });
            this.setState({
                tasks: [...tasks, data],
                title: "",
                description: "",
                category: "To-Do",
                color: "#6366f1",
                isModalOpen: false,
            });
        } catch (error) {
            console.log("Error adding task:", error);
        }
    };

    handleMoveTask = async (id, newCategory) => {
        const { tasks } = this.state;
        const originalTasks = [...tasks];
        try {
            const updatedTasks = tasks.map((t) =>
                t._id === id ? { ...t, category: newCategory, completed: newCategory === "Done" } : t
            );
            this.setState({ tasks: updatedTasks });
            await updateTask(id, { category: newCategory });
        } catch (error) {
            console.log("Error moving task:", error);
            this.setState({ tasks: originalTasks });
        }
    };

    handleDeleteTask = async (id) => {
        const { tasks } = this.state;
        const originalTasks = [...tasks];
        try {
            this.setState({ tasks: tasks.filter((t) => t._id !== id) });
            await deleteTask(id);
        } catch (error) {
            console.log("Error deleting task:", error);
            this.setState({ tasks: originalTasks });
        }
    };
}

export default Tasks;
