const STATUS_VALUES = new Set(["active", "on_hold", "completed"]);
const SORTABLE_FIELDS = { createdat: "createdAt", startdate: "startDate" };

function badRequest(message) {
    const err = new Error(message);
    err.statusCode = 400;
    return err;
}

function normalizeStatus(status) {
    if (typeof status !== "string") return undefined;
    const candidate = status.toLowerCase().replace(/-/g, "_").trim();
    if (!STATUS_VALUES.has(candidate)) throw badRequest("Invalid status filter");
    return candidate;
}

function normalizeSearch(search) {
    if (typeof search !== "string") return undefined;
    const s = search.trim();
    return s.length ? s : undefined;
}

function normalizeSort(sort) {
    if (typeof sort !== "string") return undefined;
    
    const raw = sort.trim();
    if (!raw) return undefined;
    
    const desc = raw.startsWith("-");
    const key = (desc ? raw.slice(1) : raw).toLowerCase();
    
    const mapped = SORTABLE_FIELDS[key];
    if (!mapped) throw badRequest("Invalid sort field");
    
    return { sortBy: mapped, sortDir: desc ? "desc" : "asc" };
}

function normalizePagination(page, limit) {
    const p = page === undefined ? 1 : Number(page);
    const l = limit === undefined ? 10 : Number(limit);
    
    if (!Number.isInteger(p) || p < 1) throw badRequest("Invalid page");
    if (!Number.isInteger(l) || l < 1 || l > 100) throw badRequest("Invalid limit (1-100)");
    
    return { page: p, limit: l };
}

function parseProjectsQuery(query) {
    const status = normalizeStatus(query.status);
    const search = normalizeSearch(query.search);
    const sort = normalizeSort(query.sort);
    const { page, limit } = normalizePagination(query.page, query.limit);
    
    return {
        status,
        search,
        sortBy: sort?.sortBy,
        sortDir: sort?.sortDir,
        page,
        limit,
    };
}

module.exports = { parseProjectsQuery };
