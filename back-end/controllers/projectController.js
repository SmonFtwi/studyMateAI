import { Project } from "../models/project.js";
import fs from "fs";
import mongoose from "mongoose";
import { File } from "../models/file.js"; // simple filename + projectId + userId schema
import { embedFileToVectorDB } from "../utils/embedFile.js"; // this will handle vector insert

export const createProject = async (req, res) => {
  console.log("req.body", req.body);
  const { title, description } = req.body;
  const userId = req.user.user_id || req.user.userId;

  try {
    const project = await Project.create({ title, description, userId });

    console.log("project created", project);
    res.status(200).json({ message: "Project created successfully", project });
  } catch (error) {
    console.error("Error creating project:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProjects = async (req, res) => {
  const userId = req.user.user_id || req.user.userId;
  try {
    const projects = await Project.find({ userId });
    console.log("projects", projects);
    if (!projects) {
      return res.status(404).json({ error: "No projects found" });
    }

    // Build counts of files per project
    const projectIds = projects.map((p) => p._id);
    let counts = [];
    if (projectIds.length) {
      counts = await File.aggregate([
        {
          $match: {
            projectId: { $in: projectIds },
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
        { $group: { _id: "$projectId", count: { $sum: 1 } } },
      ]);
    }
    const countMap = counts.reduce((acc, c) => {
      acc[c._id.toString()] = c.count;
      return acc;
    }, {});

    // Map _id to project_id and include sources
    const formatted = projects.map((p) => ({
      project_id: p._id.toString(),
      title: p.title,
      description: p.description,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      sources: countMap[p._id.toString()] || 0,
    }));

    res
      .status(200)
      .json({ message: "Projects fetched successfully", projects: formatted });
  } catch (error) {
    console.error("Error getting projects:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deleteProject = async (req, res) => {
  console.log("req.body", req.body);
  const { project_id } = req.params;
  try {
    const project = await Project.findByIdAndDelete(project_id);
    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }
    console.log("project deleted", project);
    res.status(200).json({ message: "Project deleted successfully", project });
  } catch (error) {
    console.error("Error deleting project:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const uploadProjectFiles = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.userId;
    const projectId = req.params.projectId || req.body.projectId;

    if (!projectId) return res.status(400).json({ error: "Missing projectId" });
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ error: "No files uploaded" });

    const uploadedFiles = [];

    for (const file of req.files) {
      const newFile = await File.create({
        projectId,
        userId,
        filename: file.originalname,
      });

      // Optional — embed content in vector DB
      let vectorInfo = null;
      try {
        vectorInfo = await embedFileToVectorDB(
          file.path,
          projectId,
          newFile._id,
          file.originalname
        );

        if (vectorInfo) {
          newFile.vectorNamespace = vectorInfo.namespace;
          newFile.vectorIds = vectorInfo.vectorIds || [];
          await newFile.save();
        }
      } catch (err) {
        console.error("Embedding failed, continuing without embedding:", err);
      } finally {
        // cleanup temporary file after embedding attempt completes
        if (file.path && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      }

      uploadedFiles.push(newFile);
    }

    res.status(200).json({
      message: "Files uploaded and embedded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("File upload error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProjectFiles = async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.userId;
    const { projectId } = req.params;

    if (!projectId) {
      return res.status(400).json({ error: "Missing projectId" });
    }

    const files = await File.find({ projectId, userId }).select(
      "filename _id createdAt updatedAt"
    );

    const formatted = files.map((f) => ({
      file_id: f._id.toString(),
      filename: f.filename,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));

    return res.status(200).json({
      message: "Files fetched successfully",
      files: formatted,
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
