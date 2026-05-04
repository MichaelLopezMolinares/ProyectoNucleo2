/**
 * Utilidad para construir respuestas JSON estandarizadas
 */
class ResponseUtil {
  static success(res, data, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      data,
    });
  }

  static created(res, data) {
    return res.status(201).json({
      success: true,
      data,
    });
  }

  static noContent(res) {
    return res.status(204).send();
  }

  static paginated(res, data, pagination) {
    return res.status(200).json({
      success: true,
      data,
      pagination: {
        page: pagination.page,
        limit: pagination.limit,
        total: pagination.total,
        totalPages: Math.ceil(pagination.total / pagination.limit),
      },
    });
  }
}

module.exports = { ResponseUtil };
