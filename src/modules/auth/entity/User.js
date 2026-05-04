class User {
  constructor({ id, username, email, passwordHash, role, active }) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.role = role; // 'admin' | 'coordinator' | 'teacher' | 'viewer'
    this.active = active;
  }
}

module.exports = { User };
