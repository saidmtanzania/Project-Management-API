const SORTABLE_COLUMNS = {
    createdAt: "createdAt",
    startDate: "startDate",
};

function buildProjectsWhere({ status, search }) {
    const clauses = ["deletedAt IS NULL"];
    const values = [];
    let i = 1;
    
    if (status) {
        clauses.push(`status = $${i}::project_status_enum`);
        values.push(status);
        i++;
    }
    
    if (search) {
        clauses.push(`(name ILIKE $${i} OR clientName ILIKE $${i})`);
        values.push(`%${search}%`);
        i++;
    }
    
    return { whereSql: clauses.join(" AND "), values, nextIndex: i };
}

function buildProjectsOrderBy({ sortBy, sortDir }) {
    const col = SORTABLE_COLUMNS[sortBy] || SORTABLE_COLUMNS.createdAt;
    const dir = sortDir === "asc" ? "ASC" : "DESC";
    // stable ordering with id
    return `${col} ${dir}, id DESC`;
}

module.exports = { buildProjectsWhere, buildProjectsOrderBy };

