const { db } = require("../utils/dbPool");
const { buildProjectsWhere, buildProjectsOrderBy } = require("../utils/sql/sqlBuilder");

const ProjectSQL = {
    async getAll(filters = {}) {
        const { whereSql, values, nextIndex } = buildProjectsWhere(filters);
        const orderBy = buildProjectsOrderBy(filters);
        
        const page = filters.page || 1;
        const limit = filters.limit || 10;
        const offset = (page - 1) * limit;

        const countSql = `
            SELECT COUNT(*)::int AS total
            FROM "projects"
            WHERE ${whereSql}
        `;
        const countRes = await db.query(countSql, values);
        const total = countRes.rows[0]?.total || 0;

        const dataSql = `
            SELECT
            id,
            name,
            description,
            clientname AS "clientName",
            status,
            startdate AS "startDate",
            enddate AS "endDate",
            createdat AS "createdAt",
            updatedat AS "updatedAt",
            deletedat AS "deletedAt"
            FROM projects
            WHERE ${whereSql}
            ORDER BY ${orderBy}
            LIMIT $${nextIndex} OFFSET $${nextIndex + 1}
        `;

        const dataValues = [...values, limit, offset];
        const dataRes = await db.query(dataSql, dataValues);
        return {
            rows: dataRes.rows,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.max(1, Math.ceil(total / limit)),
            },
        }
    },

    async getById(id) {
        const res = await db.query(
            "SELECT * FROM projects WHERE id = $1 AND deletedAt IS NULL",
            [id]
        );
        return res.rows[0];
    },
    
    async create({ name, description, clientName, startDate, endDate }) {
        try {
            await db.query('BEGIN');
            const res = await db.query(
                `INSERT INTO projects(name, description, clientName, startDate, endDate)
                VALUES($1, $2, $3, $4, $5)
                RETURNING *`,
                [name, description ?? null, clientName, startDate, endDate ?? null]
            );
            await db.query('COMMIT');
            return res.rows[0];
        }catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    },

    async update(id, { name, description, clientName, status, startDate, endDate }) {
        try {
            await db.query('BEGIN');
            const res = await db.query(
                `UPDATE projects
                SET name = $1, description = $2, clientName = $3, status = $4, startDate = $5, endDate = $6, updatedAt = NOW()
                WHERE id = $7 AND deletedAt IS NULL
                RETURNING *`,
                [name, description ?? null, clientName, status, startDate, endDate ?? null, id]
            );
            await db.query('COMMIT');
            return res.rows[0];
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    },

    async delete(id) {
        try {
            await db.query('BEGIN');
            const res = await db.query(
                "UPDATE projects SET deletedAt = NOW() WHERE id = $1 AND deletedAt IS NULL RETURNING *",
                [id]
            );
            await db.query('COMMIT');
            return res.rows[0];
        } catch (error) {
            await db.query('ROLLBACK');
            throw error;
        }
    }
};

module.exports = { ProjectSQL };