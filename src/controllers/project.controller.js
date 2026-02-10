const { validate: uuidValidate } = require("uuid");
const { ProjectSQL } = require("../services/project.service");
const { parseProjectsQuery } = require("../utils/queryParsers");

async function getProjects(req, res, next) {
    try {
        const filters = parseProjectsQuery(req.query);
        const result = await ProjectSQL.getAll(filters);

        res.json({
            data: result.rows,
            meta: result.meta,
        });
    } catch (error) {
        if (error.statusCode) return res.status(error.statusCode).json({ message: error.message });
        next(error);
    }
}

async function getProjectById(req, res, next) {
    const { id } = req.params;

    if (!uuidValidate(id) || !id) {
        return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await ProjectSQL.getById(id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
}

async function createProject(req, res, next) {
    const { name, description, clientName, startDate, endDate } = req.body;
    if (!name || !clientName || !startDate)
        return res.status(400).json({ message: "Name, clientName and startDate are required" });


    if(endDate && new Date(endDate) < new Date(startDate))
        return res.status(400).json({ message: "End date cannot be before start date" });

    try {
        const newProject = await ProjectSQL.create({ name, description, clientName, startDate, endDate });
        res.status(201).json(newProject);
    } catch (error) {
        next(error);
    }

}

async function updateProject(req, res, next) {
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
    
    try {
        const updatedProject = await ProjectSQL.update(id, { name, description, clientName, status, startDate, endDate });
        if (!updatedProject) return res.status(404).json({ message: "Project not found" });
        res.json(updatedProject);
    } catch (error) {
        next(error);
    }
}


async function deleteProject(req, res, next) {
    const { id } = req.params;
    if (!uuidValidate(id) || !id) {
        return res.status(400).json({ message: "Invalid project ID" });
    }
    try {
        const deletedProject = await ProjectSQL.delete(id);
        if (!deletedProject) return res.status(404).json({ message: "Project not found" });
        res.json({ message: "Project deleted successfully" });
    } catch (error) {
        next(error);
    }
}

module.exports = { getProjects, getProjectById, createProject, updateProject, deleteProject };