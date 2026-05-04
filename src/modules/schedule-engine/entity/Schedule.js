class Schedule {
  constructor({ id, name, academicPeriod, year, semester, status, generatedAt, programId }) {
    this.id = id;
    this.name = name;
    this.academicPeriod = academicPeriod;
    this.year = year;
    this.semester = semester;
    this.status = status; // 'draft' | 'generating' | 'generated' | 'published' | 'failed'
    this.generatedAt = generatedAt;
    this.programId = programId;
  }
}

class ScheduleAssignment {
  constructor({ id, scheduleId, groupId, teacherId, classroomId, dayOfWeek, startTime, endTime }) {
    this.id = id;
    this.scheduleId = scheduleId;
    this.groupId = groupId;
    this.teacherId = teacherId;
    this.classroomId = classroomId;
    this.dayOfWeek = dayOfWeek;
    this.startTime = startTime;
    this.endTime = endTime;
  }
}

module.exports = { Schedule, ScheduleAssignment };
