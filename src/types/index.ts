/**
 * MERI SCHOOL DIARY — Domain Entities and Type Definitions
 */

export type UserRole = 'parent' | 'teacher' | 'student' | 'admin';

export type AuthScreen = 'home' | 'role_select' | 'login' | 'signup' | 'app';

export interface DemoAuthSession {
  isAuthenticated: boolean;
  role: UserRole;
  userName: string;
  identifier: string;
}
export interface School {
  id: string;
  name: string;
  sindhEmisCode: string;
  address: string;
  unit?: string;
  city: string;
  district: string;
  province: string;
  telephone: string;
  principalName: string;
  establishedYear?: number;
  email?: string;
  academicYear?: string;
  shift?: string;
  level?: string;
}

export interface AcademicYear {
  id: string;
  name: string; // e.g. "2026–27"
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  isCurrent: boolean;
}

export interface SchoolClass {
  id: string;
  name: string; // "Class 6", "Class 7"
  order: number;
  description?: string;
}

export interface Section {
  id: string;
  classId: string;
  name: string; // "6-A", "6-B", "7-A"
  roomNumber: string;
  classTeacherId: string; // Teacher ID
}

export interface Student {
  id: string;
  admissionNumber: string; // Unique
  rollNumber: number; // Unique within section
  fullName: string;
  fatherName: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  sectionId: string;
  guardianId: string;
  isActive: boolean;
  emergencyContact: string;
}

export interface Guardian {
  id: string;
  fullName: string;
  relation: 'Father' | 'Mother' | 'Guardian';
  phone: string;
  cnic: string;
  occupation: string;
  address: string;
}

export interface Teacher {
  id: string;
  fullName: string;
  designation: string; // e.g., "Senior Subject Specialist", "HST", "EST", "JST"
  phone: string;
  email?: string;
  cnic: string;
  qualification: string;
  joiningDate: string;
  isActive: boolean;
}

export interface Subject {
  id: string;
  name: string; // Sindhi, Urdu, English, Mathematics, Science, Islamiat, Social Studies, Computer Education
  code: string; // e.g., "SIND-06", "MATH-06"
  isCore: boolean;
}

export interface TeacherAssignment {
  id: string;
  teacherId: string;
  subjectId: string;
  sectionId: string;
}

export type CalendarEventType = 'holiday' | 'half_day' | 'event' | 'examination';

export interface SchoolCalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  type: CalendarEventType;
  isMultiDay: boolean;
}

export interface TimetableSlot {
  id: string;
  sectionId: string;
  dayOfWeek: 1 | 2 | 3 | 4 | 5 | 6; // 1: Monday ... 6: Saturday
  periodNumber: number; // 1 to 6
  startTime: string; // "08:00"
  endTime: string; // "08:40"
  subjectId: string;
  teacherId: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'leave';

export interface AttendanceRecord {
  id: string;
  studentId: string;
  sectionId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  markedById: string; // Teacher ID
  notes?: string;
  recordedAt: string; // ISO string
}

export interface HomeworkItem {
  id: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  title: string;
  instructions: string;
  assignedDate: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  isClasswork: boolean;
  pdfAttachmentName?: string;
  pdfAttachmentSize?: string;
  pdfAttachmentData?: string;
}

export type SubmissionStatus = 'pending' | 'submitted' | 'checked';

export interface HomeworkSubmission {
  id: string;
  homeworkId: string;
  studentId: string;
  status: SubmissionStatus;
  submittedAt?: string; // ISO string
  studentNote?: string;
  teacherFeedback?: string;
  checkedAt?: string; // ISO string
  checkedById?: string;
  isLate: boolean;
  pdfFileName?: string;
  pdfFileSize?: string;
  pdfDataUrl?: string;
}

export interface TimelineUpdate {
  id: string;
  date: string; // YYYY-MM-DD
  sectionId: string;
  periodNumber: number; // 1 to 6
  startTime: string; // "08:00"
  endTime: string; // "08:40"
  subjectId: string;
  teacherId: string; // Originally scheduled or assigned teacher
  isSubstitute: boolean;
  substituteTeacherId?: string;
  whatWasTaught: string; // Main activity / topic
  teacherNotes?: string;
  relatedHomeworkId?: string;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  isBackdated: boolean;
}

export interface EndOfDayReport {
  id: string;
  date: string; // YYYY-MM-DD
  sectionId: string;
  summaryText: string;
  reportedById: string; // Teacher ID
  submittedAt: string; // ISO string
}

export interface Test {
  id: string;
  sectionId: string;
  subjectId: string;
  teacherId: string;
  title: string; // e.g. "Monthly Assessment - Chapter 4"
  date: string; // YYYY-MM-DD
  totalMarks: number;
  passingMarks: number;
  description?: string;
}

export interface TestResult {
  id: string;
  testId: string;
  studentId: string;
  obtainedMarks: number;
  remarks?: string;
  isAbsent?: boolean;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveApplication {
  id: string;
  studentId: string;
  guardianId: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  reason: string;
  status: LeaveStatus;
  reviewedById?: string; // Teacher ID
  reviewedAt?: string; // ISO
  teacherFeedback?: string;
  appliedAt: string; // ISO
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  publishDate: string; // YYYY-MM-DD
  publishedBy: string;
  priority: 'normal' | 'important' | 'urgent';
  targetRole?: UserRole | 'all';
}

export interface SchoolDatabase {
  school: School;
  academicYears: AcademicYear[];
  classes: SchoolClass[];
  sections: Section[];
  students: Student[];
  guardians: Guardian[];
  teachers: Teacher[];
  subjects: Subject[];
  teacherAssignments: TeacherAssignment[];
  calendarEvents: SchoolCalendarEvent[];
  timetableSlots: TimetableSlot[];
  attendanceRecords: AttendanceRecord[];
  homeworkItems: HomeworkItem[];
  homeworkSubmissions: HomeworkSubmission[];
  timelineUpdates: TimelineUpdate[];
  endOfDayReports: EndOfDayReport[];
  tests: Test[];
  testResults: TestResult[];
  leaveApplications: LeaveApplication[];
  announcements: Announcement[];
}
