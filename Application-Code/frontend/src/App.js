import React from "react";
import Tasks from "./Tasks";
import "./App.css";

class App extends Tasks {
    render() {
        const { tasks, title, description, category, color, isModalOpen } = this.state;

        // Group tasks by category
        const todoTasks = tasks.filter((t) => t.category === "To-Do" || (!t.category && !t.completed));
        const inProgressTasks = tasks.filter((t) => t.category === "In-Progress");
        const doneTasks = tasks.filter((t) => t.category === "Done" || t.completed);

        // Stats calculation
        const totalCount = tasks.length;
        const completedCount = doneTasks.length;
        const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

        // Color options for tasks
        const colorPresets = [
            { value: "#6366f1", label: "Indigo" },
            { value: "#f59e0b", label: "Amber" },
            { value: "#10b981", label: "Emerald" },
            { value: "#ef4444", label: "Rose" },
            { value: "#0ea5e9", label: "Sky" },
        ];

        return (
            <div className="taskflow-container">
                {/* Header */}
                <header className="tf-header">
                    <div className="tf-logo-section">
                        <span className="tf-logo-icon">⚡</span>
                        <h1 className="tf-logo-text">TaskFlow</h1>
                    </div>
                    <button 
                        className="tf-add-btn"
                        onClick={() => this.setState({ isModalOpen: true })}
                    >
                        + Create Task
                    </button>
                </header>

                {/* Dashboard Stats */}
                <div className="tf-dashboard">
                    <div className="tf-stat-card glass">
                        <div className="tf-stat-title">Total Tasks</div>
                        <div className="tf-stat-value">{totalCount}</div>
                    </div>
                    <div className="tf-stat-card glass">
                        <div className="tf-stat-title">Completed Tasks</div>
                        <div className="tf-stat-value text-emerald">{completedCount}</div>
                    </div>
                    <div className="tf-stat-card glass tf-progress-card">
                        <div className="tf-progress-header">
                            <span className="tf-stat-title">Completion Rate</span>
                            <span className="tf-progress-percentage">{completionRate}%</span>
                        </div>
                        <div className="tf-progress-track">
                            <div 
                                className="tf-progress-bar" 
                                style={{ width: `${completionRate}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Kanban Board columns */}
                <div className="tf-board">
                    {/* To-Do Column */}
                    <div className="tf-column glass">
                        <div className="tf-column-header">
                            <span className="tf-column-title">📝 To Do</span>
                            <span className="tf-column-count">{todoTasks.length}</span>
                        </div>
                        <div className="tf-column-body">
                            {todoTasks.map((task) => (
                                <div 
                                    key={task._id} 
                                    className="tf-card glass"
                                    style={{ borderLeft: `5px solid ${task.color || "#6366f1"}` }}
                                >
                                    <div className="tf-card-header">
                                        <h3 className="tf-card-title">{task.title}</h3>
                                    </div>
                                    <p className="tf-card-desc">{task.description || "No description provided."}</p>
                                    <div className="tf-card-actions">
                                        <button 
                                            className="tf-card-action-btn next"
                                            onClick={() => this.handleMoveTask(task._id, "In-Progress")}
                                            title="Move to In-Progress"
                                        >
                                            Start ➔
                                        </button>
                                        <button 
                                            className="tf-card-action-btn delete"
                                            onClick={() => this.handleDeleteTask(task._id)}
                                            title="Delete Task"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* In Progress Column */}
                    <div className="tf-column glass">
                        <div className="tf-column-header">
                            <span className="tf-column-title">⚡ In Progress</span>
                            <span className="tf-column-count">{inProgressTasks.length}</span>
                        </div>
                        <div className="tf-column-body">
                            {inProgressTasks.map((task) => (
                                <div 
                                    key={task._id} 
                                    className="tf-card glass"
                                    style={{ borderLeft: `5px solid ${task.color || "#6366f1"}` }}
                                >
                                    <div className="tf-card-header">
                                        <h3 className="tf-card-title">{task.title}</h3>
                                    </div>
                                    <p className="tf-card-desc">{task.description || "No description provided."}</p>
                                    <div className="tf-card-actions">
                                        <button 
                                            className="tf-card-action-btn prev"
                                            onClick={() => this.handleMoveTask(task._id, "To-Do")}
                                            title="Move to To-Do"
                                        >
                                            Back
                                        </button>
                                        <button 
                                            className="tf-card-action-btn next"
                                            onClick={() => this.handleMoveTask(task._id, "Done")}
                                            title="Complete Task"
                                        >
                                            Done ➔
                                        </button>
                                        <button 
                                            className="tf-card-action-btn delete"
                                            onClick={() => this.handleDeleteTask(task._id)}
                                            title="Delete Task"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Done Column */}
                    <div className="tf-column glass">
                        <div className="tf-column-header">
                            <span className="tf-column-title">✅ Completed</span>
                            <span className="tf-column-count">{doneTasks.length}</span>
                        </div>
                        <div className="tf-column-body">
                            {doneTasks.map((task) => (
                                <div 
                                    key={task._id} 
                                    className="tf-card glass done-card"
                                    style={{ borderLeft: `5px solid ${task.color || "#6366f1"}` }}
                                >
                                    <div className="tf-card-header">
                                        <h3 className="tf-card-title">{task.title}</h3>
                                    </div>
                                    <p className="tf-card-desc">{task.description || "No description provided."}</p>
                                    <div className="tf-card-actions">
                                        <button 
                                            className="tf-card-action-btn prev"
                                            onClick={() => this.handleMoveTask(task._id, "In-Progress")}
                                            title="Move back to In-Progress"
                                        >
                                            Reopen
                                        </button>
                                        <button 
                                            className="tf-card-action-btn delete"
                                            onClick={() => this.handleDeleteTask(task._id)}
                                            title="Delete Task"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Create Task Modal Dialog */}
                {isModalOpen && (
                    <div className="tf-modal-overlay">
                        <div className="tf-modal glass">
                            <div className="tf-modal-header">
                                <h2>Create New Task</h2>
                                <button 
                                    className="tf-close-modal"
                                    onClick={() => this.setState({ isModalOpen: false })}
                                >
                                    ✕
                                </button>
                            </div>
                            <form onSubmit={this.handleSubmitTask} className="tf-modal-form">
                                <div className="form-group">
                                    <label>Task Title *</label>
                                    <input 
                                        type="text" 
                                        name="title"
                                        value={title}
                                        onChange={this.handleInputChange}
                                        placeholder="What needs to be done?"
                                        required
                                        autoComplete="off"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Description</label>
                                    <textarea 
                                        name="description"
                                        value={description}
                                        onChange={this.handleInputChange}
                                        placeholder="Add details about this task..."
                                        rows="3"
                                    />
                                </div>
                                <div className="form-row">
                                    <div className="form-group half">
                                        <label>Initial Status</label>
                                        <select 
                                            name="category"
                                            value={category}
                                            onChange={this.handleInputChange}
                                        >
                                            <option value="To-Do">To Do</option>
                                            <option value="In-Progress">In Progress</option>
                                            <option value="Done">Completed</option>
                                        </select>
                                    </div>
                                    <div className="form-group half">
                                        <label>Card Color Tag</label>
                                        <div className="tf-color-picker">
                                            {colorPresets.map((preset) => (
                                                <button
                                                    key={preset.value}
                                                    type="button"
                                                    className={`tf-color-dot ${color === preset.value ? "active" : ""}`}
                                                    style={{ backgroundColor: preset.value }}
                                                    onClick={() => this.setState({ color: preset.value })}
                                                    title={preset.label}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="tf-modal-actions">
                                    <button 
                                        type="button" 
                                        className="tf-cancel-btn"
                                        onClick={() => this.setState({ isModalOpen: false })}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="tf-submit-btn">
                                        Create Task
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default App;
