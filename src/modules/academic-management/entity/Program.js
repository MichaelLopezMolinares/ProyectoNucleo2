class Program {
  constructor({ id, name, code, faculty, semesters, createdAt }) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.faculty = faculty;
    this.semesters = semesters;
    this.createdAt = createdAt;
  }
}

class Subject {
  constructor({ id, name, code, credits, hoursPerWeek, programId, semester }) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.credits = credits;
    this.hoursPerWeek = hoursPerWeek;
    this.programId = programId;
    this.semester = semester;
  }
}

class Group {
  constructor({ id, code, subjectId, semester, year, enrolledStudents }) {
    this.id = id;
    this.code = code;
    this.subjectId = subjectId;
    this.semester = semester;
    this.year = year;
    this.enrolledStudents = enrolledStudents;
  }
}

module.exports = { Program, Subject, Group };
