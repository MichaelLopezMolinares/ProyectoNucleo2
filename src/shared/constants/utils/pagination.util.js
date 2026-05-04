/**
 * Utilidad de paginación para queries a base de datos
 */
class PaginationUtil {
  /**
   * Extrae y normaliza parámetros de paginación del query string
   * @param {object} query - req.query
   * @returns {{ page: number, limit: number, offset: number }}
   */
  static extract(query) {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 20));
    const offset = (page - 1) * limit;
    return { page, limit, offset };
  }
}

module.exports = { PaginationUtil };
