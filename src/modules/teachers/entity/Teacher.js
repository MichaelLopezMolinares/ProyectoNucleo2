class Teacher {
  constructor({ id, firstName, lastName, email, identificationNumber, contractType, maxHoursPerWeek, availability }) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.identificationNumber = identificationNumber;
    this.contractType = contractType; // 'full_time' | 'part_time' | 'contractor'
    this.maxHoursPerWeek = maxHoursPerWeek;
    this.availability = availability; // Array de TimeSlot
  }

  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
}

class TeacherAvailability {
  constructor({ id, teacherId, dayOfWeek, startTime, endTime }) {
    this.id = id;
    this.teacherId = teacherId;
    this.dayOfWeek = dayOfWeek; // 1=Lunes ... 6=Sábado
    this.startTime = startTime; // HH:MM
    this.endTime = endTime;     // HH:MM
  }
}

module.exports = { Teacher, TeacherAvailability };
