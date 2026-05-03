class Classroom {
  constructor({ id, name, code, building, floor, capacity, type, features }) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.building = building;
    this.floor = floor;
    this.capacity = capacity;
    this.type = type;       // 'lecture' | 'lab' | 'workshop' | 'auditorium'
    this.features = features; // ['projector', 'ac', 'computers', etc.]
  }
}

module.exports = { Classroom };
