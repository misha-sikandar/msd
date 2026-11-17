/**
 * MERI SCHOOL DIARY — Central State & Local Persistence Context
 * Storage Key: app.school_data.v1
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  SchoolDatabase,
  UserRole,
  AuthScreen,
  DemoAuthSession,
  Student,
  Teacher,
  SchoolCalendarEvent,
  AttendanceRecord,
  AttendanceStatus,
  HomeworkItem,
  HomeworkSubmission,
  TimelineUpdate,
  EndOfDayReport,
  Test,
  TestResult,
  LeaveApplication,
  Announcement,
  TeacherAssignment,
  SchoolClass,
  Section,
  Subject,
  School,
} from '../types';
import { SEED_DATA } from '../data/seedData';

const STORAGE_KEY = 'app.school_data.v1';
const THEME_KEY = 'app.theme';

interface SchoolContextType {
  db: SchoolDatabase;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Authentication & Public Navigation
  authScreen: AuthScreen;
  selectedAuthRole: UserRole | null;
  authSession: DemoAuthSession | null;
  setAuthScreen: (screen: AuthScreen, role?: UserRole) => void;
  login: (role: UserRole, identifier: string, password?: string) => void;
  signup: (role: UserRole, formData: any) => void;
  logout: () => void;

  // Active identities for demo
  activeChildId: string;
  setActiveChildId: (id: string) => void;
  activeTeacherId: string;
  setActiveTeacherId: (id: string) => void;
  activeStudentId: string;
  setActiveStudentId: (id: string) => void;

  // Derived helpers
  activeChild: Student | undefined;
  activeTeacher: Teacher | undefined;
  activeStudent: Student | undefined;
  parentChildren: Student[];

  // Data Actions
  resetToDemoData: () => void;
  updateSchoolProfile: (school: Partial<School>) => void;

  // Attendance
  saveSectionAttendance: (
    sectionId: string,
    date: string,
    records: { studentId: string; status: AttendanceStatus; notes?: string }[]
  ) => void;

  // Homework
  createHomework: (homework: Omit<HomeworkItem, 'id'>) => HomeworkItem;
  submitHomework: (
    homeworkId: string,
    studentId: string,
    studentNote?: string,
    pdfInfo?: { pdfFileName: string; pdfFileSize: string; pdfDataUrl?: string }
  ) => void;
  checkHomework: (submissionId: string, teacherFeedback: string) => void;

  // Flagship: My School Day Timeline
  saveTimelineUpdate: (
    update: Omit<TimelineUpdate, 'id' | 'createdAt' | 'updatedAt' | 'isBackdated'> & { id?: string }
  ) => TimelineUpdate;
  saveEndOfDayReport: (report: Omit<EndOfDayReport, 'id' | 'submittedAt'>) => void;

  // Leave Applications
  submitLeaveApplication: (studentId: string, startDate: string, endDate: string, reason: string) => void;
  reviewLeaveApplication: (applicationId: string, status: 'approved' | 'rejected', feedback?: string) => void;

  // Calendar
  saveCalendarEvent: (event: Omit<SchoolCalendarEvent, 'id'> & { id?: string }) => void;
  deleteCalendarEvent: (id: string) => void;

  // Tests & Marks
  createTest: (test: Omit<Test, 'id'>) => Test;
  saveTestResults: (testId: string, results: { studentId: string; obtainedMarks: number; remarks?: string }[]) => void;

  // Announcements
  createAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;

  // Admin Management
  saveStudent: (student: Omit<Student, 'id'> & { id?: string }) => { success: boolean; message?: string };
  toggleStudentActive: (studentId: string) => void;
  saveTeacher: (teacher: Omit<Teacher, 'id'> & { id?: string }) => { success: boolean; message?: string };
  toggleTeacherActive: (teacherId: string) => void;
  saveClass: (schoolClass: Omit<SchoolClass, 'id'> & { id?: string }) => void;
  deleteClass: (classId: string) => { success: boolean; message?: string };
  saveSection: (section: Omit<Section, 'id'> & { id?: string }) => void;
  deleteSection: (sectionId: string) => { success: boolean; message?: string };
  saveSubject: (subject: Omit<Subject, 'id'> & { id?: string }) => void;
  deleteSubject: (subjectId: string) => { success: boolean; message?: string };
  saveTeacherAssignment: (assignment: Omit<TeacherAssignment, 'id'> & { id?: string }) => { success: boolean; message?: string };
  deleteTeacherAssignment: (assignmentId: string) => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Database state initialized from localStorage or seed
  const [db, setDb] = useState<SchoolDatabase>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.school && parsed.students && parsed.classes) {
          if (
            parsed.school.id === 'sch-latifabad-01' ||
            parsed.school.sindhEmisCode === '403020188'
          ) {
            return { ...parsed, school: SEED_DATA.school };
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored school data snapshot. Falling back to seed data.', e);
    }
    return SEED_DATA;
  });

  // Current session role
  const [currentRole, setCurrentRole] = useState<UserRole>('parent');

  // Public & Auth navigation state (initial screen: 'home')
  const [authScreen, setAuthScreenState] = useState<AuthScreen>('home');
  const [selectedAuthRole, setSelectedAuthRole] = useState<UserRole | null>(null);
  const [authSession, setAuthSession] = useState<DemoAuthSession | null>(null);

  const setAuthScreen = (screen: AuthScreen, role?: UserRole) => {
    setAuthScreenState(screen);
    if (role) {
      setSelectedAuthRole(role);
    }
  };

  const login = (role: UserRole, identifier: string, password?: string) => {
    setCurrentRole(role);
    let userName = 'Demo User';

    if (role === 'parent') {
      userName = 'Tariq Mehmood';
      setActiveChildId('std-bilal-tariq');
    } else if (role === 'student') {
      const found = db.students.find(
        s =>
          s.admissionNumber.toLowerCase() === identifier.toLowerCase() ||
          s.fullName.toLowerCase().includes(identifier.toLowerCase())
      );
      if (found) {
        setActiveStudentId(found.id);
        userName = found.fullName;
      } else {
        setActiveStudentId('std-bilal-tariq');
        userName = 'Bilal Tariq';
      }
    } else if (role === 'teacher') {
      const found = db.teachers.find(
        t =>
          t.phone.includes(identifier) ||
          t.fullName.toLowerCase().includes(identifier.toLowerCase())
      );
      if (found) {
        setActiveTeacherId(found.id);
        userName = found.fullName;
      } else {
        setActiveTeacherId('tch-abdul-qadir');
        userName = 'Sir Abdul Qadir Brohi';
      }
    } else if (role === 'admin') {
      userName =
        db.school.principalName && db.school.principalName !== 'Not provided'
          ? db.school.principalName
          : 'School Administrator';
    }

    setAuthSession({
      isAuthenticated: true,
      role,
      userName,
      identifier: identifier || 'demo_user',
    });
    setSelectedAuthRole(role);
    setAuthScreenState('app');
  };

  const signup = (role: UserRole, formData: any) => {
    setCurrentRole(role);
    let userName = formData.fullName || 'New User';

    if (role === 'student') {
      const newStd: Student = {
        id: `std-${Date.now()}`,
        fullName: formData.fullName,
        fatherName: formData.fatherName || 'Guardian',
        admissionNumber: formData.studentId || `GR-2026-${Math.floor(100 + Math.random() * 900)}`,
        rollNumber: Number(formData.rollNumber) || 15,
        sectionId: formData.sectionId || 'sec-6a',
        guardianId: 'grd-tariq-mehmood',
        gender: 'Male',
        dateOfBirth: '2014-01-01',
        isActive: true,
        emergencyContact: '0300-1234567',
      };
      setDb(prev => ({ ...prev, students: [newStd, ...prev.students] }));
      setActiveStudentId(newStd.id);
      userName = newStd.fullName;
    } else if (role === 'teacher') {
      const newTch: Teacher = {
        id: `tch-${Date.now()}`,
        fullName: formData.fullName,
        designation: formData.designation || 'High School Teacher (HST)',
        phone: formData.phone || formData.email || '0300-1234567',
        cnic: '41302-0000000-0',
        qualification: 'M.A, B.Ed',
        joiningDate: new Date().toISOString().split('T')[0],
        isActive: true,
      };
      setDb(prev => ({ ...prev, teachers: [newTch, ...prev.teachers] }));
      setActiveTeacherId(newTch.id);
      userName = newTch.fullName;
    } else if (role === 'parent') {
      userName = formData.fullName;
      setActiveChildId('std-bilal-tariq');
    } else if (role === 'admin') {
      userName = formData.fullName;
    }

    setAuthSession({
      isAuthenticated: true,
      role,
      userName,
      identifier: formData.email || formData.studentId || formData.phone || 'registered_user',
    });
    setSelectedAuthRole(role);
    setAuthScreenState('app');
  };

  const logout = () => {
    setAuthSession(null);
    setSelectedAuthRole(null);
    setAuthScreenState('home');
  };

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark' ? 'dark' : 'light';
  });

  // Active identities for demo
  const [activeChildId, setActiveChildId] = useState<string>('std-bilal-tariq');
  const [activeTeacherId, setActiveTeacherId] = useState<string>('tch-abdul-qadir');
  const [activeStudentId, setActiveStudentId] = useState<string>('std-bilal-tariq');

  // Persist db to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    } catch (e) {
      console.error('Failed to save school database to localStorage', e);
    }
  }, [db]);

  // Apply theme to document element
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const resetToDemoData = () => {
    setDb(SEED_DATA);
    setActiveChildId('std-bilal-tariq');
    setActiveTeacherId('tch-abdul-qadir');
    setActiveStudentId('std-bilal-tariq');
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DATA));
    } catch (e) {
      console.error(e);
    }
  };

  // Derived parent children (Guardian Tariq Mehmood)
  const parentChildren = db.students.filter(
    s => s.guardianId === 'grd-tariq-mehmood' && s.isActive
  );

  const activeChild = db.students.find(s => s.id === activeChildId) || parentChildren[0];
  const activeTeacher = db.teachers.find(t => t.id === activeTeacherId) || db.teachers[0];
  const activeStudent = db.students.find(s => s.id === activeStudentId) || db.students[0];

  // Helper actions
  const updateSchoolProfile = (schoolData: Partial<School>) => {
    setDb(prev => ({
      ...prev,
      school: { ...prev.school, ...schoolData },
    }));
  };

  const saveSectionAttendance = (
    sectionId: string,
    date: string,
    records: { studentId: string; status: AttendanceStatus; notes?: string }[]
  ) => {
    setDb(prev => {
      // Remove any existing attendance for this section and date
      const filtered = prev.attendanceRecords.filter(
        r => !(r.sectionId === sectionId && r.date === date)
      );

      const now = new Date().toISOString();
      const newRecords: AttendanceRecord[] = records.map((rec, idx) => ({
        id: `att-${sectionId}-${date}-${rec.studentId}`,
        studentId: rec.studentId,
        sectionId,
        date,
        status: rec.status,
        markedById: activeTeacherId,
        notes: rec.notes,
        recordedAt: now,
      }));

      return {
        ...prev,
        attendanceRecords: [...filtered, ...newRecords],
      };
    });
  };

  const createHomework = (homework: Omit<HomeworkItem, 'id'>): HomeworkItem => {
    const newId = `hw-${Date.now()}`;
    const newItem: HomeworkItem = { ...homework, id: newId };
    setDb(prev => ({
      ...prev,
      homeworkItems: [newItem, ...prev.homeworkItems],
    }));
    return newItem;
  };

  const submitHomework = (
    homeworkId: string,
    studentId: string,
    studentNote?: string,
    pdfInfo?: { pdfFileName: string; pdfFileSize: string; pdfDataUrl?: string }
  ) => {
    setDb(prev => {
      const existingIdx = prev.homeworkSubmissions.findIndex(
        s => s.homeworkId === homeworkId && s.studentId === studentId
      );

      const targetHomework = prev.homeworkItems.find(h => h.id === homeworkId);
      const isLate = targetHomework
        ? new Date().toISOString().split('T')[0] > targetHomework.dueDate
        : false;

      const now = new Date().toISOString();

      if (existingIdx >= 0) {
        const updated = [...prev.homeworkSubmissions];
        updated[existingIdx] = {
          ...updated[existingIdx],
          status: 'submitted',
          submittedAt: now,
          studentNote: studentNote !== undefined ? studentNote : updated[existingIdx].studentNote,
          isLate,
          pdfFileName: pdfInfo ? pdfInfo.pdfFileName : updated[existingIdx].pdfFileName,
          pdfFileSize: pdfInfo ? pdfInfo.pdfFileSize : updated[existingIdx].pdfFileSize,
          pdfDataUrl: pdfInfo ? pdfInfo.pdfDataUrl : updated[existingIdx].pdfDataUrl,
        };
        return { ...prev, homeworkSubmissions: updated };
      } else {
        const newSub: HomeworkSubmission = {
          id: `sub-${Date.now()}`,
          homeworkId,
          studentId,
          status: 'submitted',
          submittedAt: now,
          studentNote,
          isLate,
          pdfFileName: pdfInfo?.pdfFileName,
          pdfFileSize: pdfInfo?.pdfFileSize,
          pdfDataUrl: pdfInfo?.pdfDataUrl,
        };
        return {
          ...prev,
          homeworkSubmissions: [...prev.homeworkSubmissions, newSub],
        };
      }
    });
  };

  const checkHomework = (submissionId: string, teacherFeedback: string) => {
    setDb(prev => {
      const now = new Date().toISOString();
      return {
        ...prev,
        homeworkSubmissions: prev.homeworkSubmissions.map(sub =>
          sub.id === submissionId
            ? {
                ...sub,
                status: 'checked',
                teacherFeedback,
                checkedAt: now,
                checkedById: activeTeacherId,
              }
            : sub
        ),
      };
    });
  };

  const saveTimelineUpdate = (
    update: Omit<TimelineUpdate, 'id' | 'createdAt' | 'updatedAt' | 'isBackdated'> & { id?: string }
  ): TimelineUpdate => {
    const now = new Date().toISOString();
    const todayStr = new Date().toISOString().split('T')[0];
    const isBackdated = update.date < todayStr;

    let savedItem: TimelineUpdate;

    setDb(prev => {
      if (update.id) {
        // Edit existing
        const existing = prev.timelineUpdates.find(u => u.id === update.id);
        savedItem = {
          ...update,
          id: update.id,
          createdAt: existing ? existing.createdAt : now,
          updatedAt: now,
          isBackdated: existing ? existing.isBackdated || isBackdated : isBackdated,
        };
        return {
          ...prev,
          timelineUpdates: prev.timelineUpdates.map(u => (u.id === update.id ? savedItem : u)),
        };
      } else {
        // Create new
        savedItem = {
          ...update,
          id: `tu-${Date.now()}`,
          createdAt: now,
          updatedAt: now,
          isBackdated,
        };
        return {
          ...prev,
          timelineUpdates: [...prev.timelineUpdates, savedItem],
        };
      }
    });

    return savedItem!;
  };

  const saveEndOfDayReport = (report: Omit<EndOfDayReport, 'id' | 'submittedAt'>) => {
    const now = new Date().toISOString();
    setDb(prev => {
      const filtered = prev.endOfDayReports.filter(
        r => !(r.sectionId === report.sectionId && r.date === report.date)
      );
      const newReport: EndOfDayReport = {
        ...report,
        id: `eod-${report.sectionId}-${report.date}`,
        submittedAt: now,
      };
      return {
        ...prev,
        endOfDayReports: [...filtered, newReport],
      };
    });
  };

  const submitLeaveApplication = (studentId: string, startDate: string, endDate: string, reason: string) => {
    const student = db.students.find(s => s.id === studentId);
    const now = new Date().toISOString();
    const newLeave: LeaveApplication = {
      id: `lv-${Date.now()}`,
      studentId,
      guardianId: student ? student.guardianId : 'grd-tariq-mehmood',
      startDate,
      endDate,
      reason,
      status: 'pending',
      appliedAt: now,
    };

    setDb(prev => ({
      ...prev,
      leaveApplications: [newLeave, ...prev.leaveApplications],
    }));
  };

  const reviewLeaveApplication = (applicationId: string, status: 'approved' | 'rejected', feedback?: string) => {
    const now = new Date().toISOString();
    setDb(prev => {
      const app = prev.leaveApplications.find(l => l.id === applicationId);
      if (!app) return prev;

      const updatedApps = prev.leaveApplications.map(l =>
        l.id === applicationId
          ? {
              ...l,
              status,
              teacherFeedback: feedback || l.teacherFeedback,
              reviewedById: activeTeacherId,
              reviewedAt: now,
            }
          : l
      );

      // If approved, update attendance records for student across date range to 'leave'
      let updatedAttendance = [...prev.attendanceRecords];
      if (status === 'approved') {
        const student = prev.students.find(s => s.id === app.studentId);
        if (student) {
          // If single day or multiple days
          const cur = new Date(app.startDate);
          const end = new Date(app.endDate);
          while (cur <= end) {
            const dateStr = cur.toISOString().split('T')[0];
            // Remove any existing record for this date
            updatedAttendance = updatedAttendance.filter(
              r => !(r.studentId === student.id && r.date === dateStr)
            );
            updatedAttendance.push({
              id: `att-${student.sectionId}-${dateStr}-${student.id}`,
              studentId: student.id,
              sectionId: student.sectionId,
              date: dateStr,
              status: 'leave',
              notes: `Approved leave: ${app.reason}`,
              markedById: activeTeacherId,
              recordedAt: now,
            });
            cur.setDate(cur.getDate() + 1);
          }
        }
      }

      return {
        ...prev,
        leaveApplications: updatedApps,
        attendanceRecords: updatedAttendance,
      };
    });
  };

  const saveCalendarEvent = (event: Omit<SchoolCalendarEvent, 'id'> & { id?: string }) => {
    setDb(prev => {
      if (event.id) {
        return {
          ...prev,
          calendarEvents: prev.calendarEvents.map(e =>
            e.id === event.id ? ({ ...event, id: event.id } as SchoolCalendarEvent) : e
          ),
        };
      } else {
        const newEvent: SchoolCalendarEvent = {
          ...event,
          id: `cal-${Date.now()}`,
        };
        return {
          ...prev,
          calendarEvents: [...prev.calendarEvents, newEvent],
        };
      }
    });
  };

  const deleteCalendarEvent = (id: string) => {
    setDb(prev => ({
      ...prev,
      calendarEvents: prev.calendarEvents.filter(e => e.id !== id),
    }));
  };

  const createTest = (test: Omit<Test, 'id'>): Test => {
    const newTest: Test = {
      ...test,
      id: `tst-${Date.now()}`,
    };
    setDb(prev => ({
      ...prev,
      tests: [newTest, ...prev.tests],
    }));
    return newTest;
  };

  const saveTestResults = (testId: string, results: { studentId: string; obtainedMarks: number; remarks?: string }[]) => {
    setDb(prev => {
      const filtered = prev.testResults.filter(r => r.testId !== testId);
      const newResults: TestResult[] = results.map(r => ({
        id: `tr-${testId}-${r.studentId}`,
        testId,
        studentId: r.studentId,
        obtainedMarks: r.obtainedMarks,
        remarks: r.remarks,
      }));
      return {
        ...prev,
        testResults: [...filtered, ...newResults],
      };
    });
  };

  const createAnnouncement = (announcement: Omit<Announcement, 'id'>) => {
    const newAnc: Announcement = {
      ...announcement,
      id: `anc-${Date.now()}`,
    };
    setDb(prev => ({
      ...prev,
      announcements: [newAnc, ...prev.announcements],
    }));
  };

  // Student Admin Management
  const saveStudent = (student: Omit<Student, 'id'> & { id?: string }): { success: boolean; message?: string } => {
    // Validate unique admission number
    const dupAdmission = db.students.find(
      s => s.admissionNumber.trim().toLowerCase() === student.admissionNumber.trim().toLowerCase() && s.id !== student.id
    );
    if (dupAdmission) {
      return { success: false, message: `Admission Number "${student.admissionNumber}" is already in use by another student.` };
    }

    // Validate unique roll number in section
    const dupRoll = db.students.find(
      s => s.sectionId === student.sectionId && s.rollNumber === Number(student.rollNumber) && s.id !== student.id && s.isActive
    );
    if (dupRoll) {
      return { success: false, message: `Roll Number ${student.rollNumber} is already assigned in this section to ${dupRoll.fullName}.` };
    }

    setDb(prev => {
      if (student.id) {
        return {
          ...prev,
          students: prev.students.map(s => (s.id === student.id ? ({ ...student, id: student.id } as Student) : s)),
        };
      } else {
        const newStd: Student = {
          ...student,
          id: `std-${Date.now()}`,
        };
        return {
          ...prev,
          students: [...prev.students, newStd],
        };
      }
    });

    return { success: true };
  };

  const toggleStudentActive = (studentId: string) => {
    setDb(prev => ({
      ...prev,
      students: prev.students.map(s => (s.id === studentId ? { ...s, isActive: !s.isActive } : s)),
    }));
  };

  // Teacher Admin Management
  const saveTeacher = (teacher: Omit<Teacher, 'id'> & { id?: string }): { success: boolean; message?: string } => {
    setDb(prev => {
      if (teacher.id) {
        return {
          ...prev,
          teachers: prev.teachers.map(t => (t.id === teacher.id ? ({ ...teacher, id: teacher.id } as Teacher) : t)),
        };
      } else {
        const newTeacher: Teacher = {
          ...teacher,
          id: `tch-${Date.now()}`,
        };
        return {
          ...prev,
          teachers: [...prev.teachers, newTeacher],
        };
      }
    });
    return { success: true };
  };

  const toggleTeacherActive = (teacherId: string) => {
    setDb(prev => ({
      ...prev,
      teachers: prev.teachers.map(t => (t.id === teacherId ? { ...t, isActive: !t.isActive } : t)),
    }));
  };

  // Class Management (Conservative delete policy)
  const saveClass = (schoolClass: Omit<SchoolClass, 'id'> & { id?: string }) => {
    setDb(prev => {
      if (schoolClass.id) {
        return {
          ...prev,
          classes: prev.classes.map(c => (c.id === schoolClass.id ? ({ ...schoolClass, id: schoolClass.id } as SchoolClass) : c)),
        };
      } else {
        const newClass: SchoolClass = { ...schoolClass, id: `cls-${Date.now()}` };
        return { ...prev, classes: [...prev.classes, newClass] };
      }
    });
  };

  const deleteClass = (classId: string): { success: boolean; message?: string } => {
    const hasSections = db.sections.some(s => s.classId === classId);
    if (hasSections) {
      return { success: false, message: 'Cannot delete class while sections exist. Please remove or reassign sections first.' };
    }
    setDb(prev => ({
      ...prev,
      classes: prev.classes.filter(c => c.id !== classId),
    }));
    return { success: true };
  };

  // Section Management
  const saveSection = (section: Omit<Section, 'id'> & { id?: string }) => {
    setDb(prev => {
      if (section.id) {
        return {
          ...prev,
          sections: prev.sections.map(s => (s.id === section.id ? ({ ...section, id: section.id } as Section) : s)),
        };
      } else {
        const newSec: Section = { ...section, id: `sec-${Date.now()}` };
        return { ...prev, sections: [...prev.sections, newSec] };
      }
    });
  };

  const deleteSection = (sectionId: string): { success: boolean; message?: string } => {
    const hasStudents = db.students.some(s => s.sectionId === sectionId && s.isActive);
    if (hasStudents) {
      return { success: false, message: 'Cannot delete section while active students are enrolled.' };
    }
    setDb(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId),
    }));
    return { success: true };
  };

  // Subject Management
  const saveSubject = (subject: Omit<Subject, 'id'> & { id?: string }) => {
    setDb(prev => {
      if (subject.id) {
        return {
          ...prev,
          subjects: prev.subjects.map(s => (s.id === subject.id ? ({ ...subject, id: subject.id } as Subject) : s)),
        };
      } else {
        const newSub: Subject = { ...subject, id: `sub-${Date.now()}` };
        return { ...prev, subjects: [...prev.subjects, newSub] };
      }
    });
  };

  const deleteSubject = (subjectId: string): { success: boolean; message?: string } => {
    const hasAssignments = db.teacherAssignments.some(ta => ta.subjectId === subjectId);
    if (hasAssignments) {
      return { success: false, message: 'Cannot delete subject while teacher assignments exist for it.' };
    }
    setDb(prev => ({
      ...prev,
      subjects: prev.subjects.filter(s => s.id !== subjectId),
    }));
    return { success: true };
  };

  // Teacher Assignments
  const saveTeacherAssignment = (assignment: Omit<TeacherAssignment, 'id'> & { id?: string }): { success: boolean; message?: string } => {
    // Prevent duplicate assignment for same subject and section
    const exists = db.teacherAssignments.find(
      ta => ta.sectionId === assignment.sectionId && ta.subjectId === assignment.subjectId && ta.id !== assignment.id
    );
    if (exists) {
      return { success: false, message: 'A teacher is already assigned to this subject in this section.' };
    }

    setDb(prev => {
      if (assignment.id) {
        return {
          ...prev,
          teacherAssignments: prev.teacherAssignments.map(ta =>
            ta.id === assignment.id ? ({ ...assignment, id: assignment.id } as TeacherAssignment) : ta
          ),
        };
      } else {
        const newTa: TeacherAssignment = { ...assignment, id: `ta-${Date.now()}` };
        return { ...prev, teacherAssignments: [...prev.teacherAssignments, newTa] };
      }
    });
    return { success: true };
  };

  const deleteTeacherAssignment = (assignmentId: string) => {
    setDb(prev => ({
      ...prev,
      teacherAssignments: prev.teacherAssignments.filter(ta => ta.id !== assignmentId),
    }));
  };

  return (
    <SchoolContext.Provider
      value={{
        db,
        currentRole,
        setCurrentRole,
        theme,
        toggleTheme,
        authScreen,
        selectedAuthRole,
        authSession,
        setAuthScreen,
        login,
        signup,
        logout,
        activeChildId,
        setActiveChildId,
        activeTeacherId,
        setActiveTeacherId,
        activeStudentId,
        setActiveStudentId,
        activeChild,
        activeTeacher,
        activeStudent,
        parentChildren,
        resetToDemoData,
        updateSchoolProfile,
        saveSectionAttendance,
        createHomework,
        submitHomework,
        checkHomework,
        saveTimelineUpdate,
        saveEndOfDayReport,
        submitLeaveApplication,
        reviewLeaveApplication,
        saveCalendarEvent,
        deleteCalendarEvent,
        createTest,
        saveTestResults,
        createAnnouncement,
        saveStudent,
        toggleStudentActive,
        saveTeacher,
        toggleTeacherActive,
        saveClass,
        deleteClass,
        saveSection,
        deleteSection,
        saveSubject,
        deleteSubject,
        saveTeacherAssignment,
        deleteTeacherAssignment,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = () => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
