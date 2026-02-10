const { db } = require("../utils/pool");

const ProjectSQL = {
    async getAll() {
        const res = await db.query(
            "SELECT * FROM projects WHERE deletedAt IS NULL ORDER BY id DESC"
        );
        return res.rows;
    },

    async getById(id) {
        const res = await db.query(
            "SELECT * FROM projects WHERE id = $1 AND deletedAt IS NULL",
            [id]
        );
        return res.rows[0];
    },
    
    async create({ name, description, clientName, startDate, endDate }) {
        const res = await db.query(
            `INSERT INTO projects(name, description, clientName, startDate, endDate)
            VALUES($1, $2, $3, $4, $5)
            RETURNING *`,
            [name, description ?? null, clientName, startDate, endDate ?? null]
        );
        return res.rows[0];
    },

    async update(id, { name, description, clientName, startDate, endDate }) {
        const res = await db.query(
            `UPDATE projects
            SET name = $1, description = $2, clientName = $3, startDate = $4, endDate = $5
            WHERE id = $6 AND deletedAt IS NULL
            RETURNING *`,
            [name, description ?? null, clientName, startDate, endDate ?? null, id]
        );
        return res.rows[0];
    },

    async delete(id) {
        const res = await db.query(
            "UPDATE projects SET deletedAt = NOW() WHERE id = $1 AND deletedAt IS NULL RETURNING *",
            [id]
        );
        return res.rows[0];
    }
};

module.exports = { ProjectSQL };