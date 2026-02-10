const { Router } = require("express");
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require("../controllers/project.controller");
const router = Router();

// Define your routes here
router.get("/", getProjects);
router.post("/", createProject);
router.get("/:id", getProjectById);
router.patch("/:id", updateProject);
router.delete("/:id", deleteProject);

module.exports = router;
