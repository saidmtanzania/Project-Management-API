const { validate: uuidValidate } = require("uuid");
const { ProjectSQL } = require("../services/project.service");

async function getProjects(req, res) {
    const projects = await ProjectSQL.getAll();
    if (!projects || projects.length === 0) 
        return res.status(404).json({ message: "No projects found" });
    
    res.json(projects);
}

async function getProjectById(req, res) {
    const { id } = req.params;

    if (!uuidValidate(id) || !id) {
        return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await ProjectSQL.getById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
}

async function createProject(req, res) {
    const { name, description, clientName, startDate, endDate } = req.body;
    if (!name || !clientName || !startDate)
        return res.status(400).json({ message: "Name, clientName and startDate are required" });


    if(endDate && new Date(endDate) < new Date(startDate))
        return res.status(400).json({ message: "End date cannot be before start date" });

    const newProject = await ProjectSQL.create({ name, description, clientName, startDate, endDate });
    res.status(201).json(newProject);
}

async function updateProject(req, res) {
    const { id } = req.params;
    if (!uuidValidate(id) || !id) {
        return res.status(400).json({ message: "Invalid project ID" });
    }

    const { name, description, clientName, status, startDate, endDate } = req.body;
    if (!name || !clientName || !startDate)
        return res.status(400).json({ message: "Name, clientName and startDate are required" });

    if(endDate && new Date(endDate) < new Date(startDate))
        return res.status(400).json({ message: "End date cannot be before start date" });


    const existingProject = await ProjectSQL.getById(id);
    if(existingProject.status === "completed" && status && status !== "completed") {
        return res.status(400).json({ message: "Cannot change status of a completed project" });
    }
    
    const updatedProject = await ProjectSQL.update(id, { name, description, clientName, status, startDate, endDate });
    if (!updatedProject) return res.status(404).json({ message: "Project not found" });
    res.json(updatedProject);
}


async function deleteProject(req, res) {
    const { id } = req.params;
    if (!uuidValidate(id) || !id) {
        return res.status(400).json({ message: "Invalid project ID" });
    }
    const deletedProject = await ProjectSQL.delete(id);
    if (!deletedProject) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted successfully" });
}

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };