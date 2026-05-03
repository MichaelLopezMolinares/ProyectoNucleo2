module.exports = {
  secret: process.env.JWT_SECRET || 'agenda_facil_secret_key_dev',
  expiresIn: process.env.JWT_EXPIRES_IN || '8h',
};
