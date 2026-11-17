/**
 * MERI SCHOOL DIARY — PDF Generation System
 * Generates official Sindh Education Department documents with centralized school identity:
 * - Government Girls Higher Secondary School Gizri
 * - SEMIS Code: 408060247
 * - Address: Near Mubarak Masjid, Opposite Total Pump.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  School,
  Student,
  Section,
  Teacher,
  Subject,
  Announcement,
  SchoolCalendarEvent,
  TimelineUpdate,
  AttendanceRecord,
  Test,
  TestResult,
  HomeworkItem,
  HomeworkSubmission,
  Guardian,
} from '../types';

// Palette definitions matching the purple / lavender design system
const PRIMARY_COLOR: [number, number, number] = [103, 80, 164]; // #6750A4
const SECONDARY_COLOR: [number, number, number] = [79, 55, 139]; // #4F378B
const TEXT_DARK: [number, number, number] = [30, 41, 59]; // slate-800
const TEXT_MUTED: [number, number, number] = [100, 116, 139]; // slate-500
const BG_LIGHT: [number, number, number] = [245, 243, 255]; // lavender tint
const BORDER_COLOR: [number, number, number] = [226, 232, 240]; // slate-200

/**
 * Creates a base jsPDF instance with standard margins and metadata
 */
export function createBaseDoc(orientation: 'portrait' | 'landscape' = 'portrait'): jsPDF {
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });
  return doc;
}

/**
 * Standardized Header for Government Girls Higher Secondary School Gizri
 */
export function addSchoolHeader(
  doc: jsPDF,
  school: School,
  title: string,
  subtitle?: string,
  refNo?: string
): number {
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 14;

  // Top Sindh Govt banner
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text('GOVERNMENT OF SINDH — SCHOOL EDUCATION & LITERACY DEPARTMENT', pageWidth / 2, y, { align: 'center' });
  y += 5;

  // School Official Name
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  const schoolName = school.name || 'Government Girls Higher Secondary School Gizri';
  doc.text(schoolName.toUpperCase(), pageWidth / 2, y, { align: 'center' });
  y += 5;

  // SEMIS & Location
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  const emis = school.sindhEmisCode || '408060247';
  const district = school.district || 'District South, Karachi';
  const province = school.province || 'Sindh';
  doc.text(`SEMIS Code: ${emis}  |  District: ${district}  |  ${province}`, pageWidth / 2, y, { align: 'center' });
  y += 4;

  // Address
  const address = school.address || 'Near Mubarak Masjid, Opposite Total Pump.';
  doc.text(`Campus Address: ${address}`, pageWidth / 2, y, { align: 'center' });
  y += 4;

  // Decorative Rule Line
  doc.setDrawColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.setLineWidth(0.6);
  doc.line(14, y, pageWidth - 14, y);
  y += 5;

  // Document Title Banner
  doc.setFillColor(BG_LIGHT[0], BG_LIGHT[1], BG_LIGHT[2]);
  doc.roundedRect(14, y, pageWidth - 28, 9, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(title.toUpperCase(), pageWidth / 2, y + 6, { align: 'center' });

  // Subtitle / Date / Ref banner if provided
  y += 12;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);

  const leftMeta = refNo ? `Ref No: ${refNo}` : `Academic Session: ${school.academicYear || '2026–27'}`;
  const rightMeta = `Issued Date: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`;
  doc.text(leftMeta, 14, y);
  doc.text(rightMeta, pageWidth - 14, y, { align: 'right' });

  if (subtitle) {
    doc.text(subtitle, pageWidth / 2, y, { align: 'center' });
  }

  y += 4;
  return y;
}

/**
 * Standardized Signatures Block
 */
export function addSignatures(
  doc: jsPDF,
  titles: string[] = ['Class Teacher', 'Examination Incharge', 'Headmistress / Principal']
) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const y = pageHeight - 25;
  const colWidth = (pageWidth - 28) / titles.length;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.setDrawColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.setLineWidth(0.3);

  titles.forEach((title, idx) => {
    const startX = 14 + idx * colWidth + 8;
    const endX = startX + colWidth - 16;
    doc.line(startX, y, endX, y);
    doc.text(title, (startX + endX) / 2, y + 4.5, { align: 'center' });
    doc.text('Signature & Official Seal', (startX + endX) / 2, y + 8, { align: 'center' });
  });
}

/**
 * Page Footer with Page Numbers & Watermark
 */
export function addPageFooters(doc: jsPDF, school: School) {
  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);

    // Subtle bottom divider
    doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
    doc.setLineWidth(0.2);
    doc.line(14, pageHeight - 11, pageWidth - 14, pageHeight - 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);

    const emis = school.sindhEmisCode || '408060247';
    doc.text(
      `MERI SCHOOL DIARY — Official Record · SEMIS: ${emis}`,
      14,
      pageHeight - 6.5
    );

    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 14, pageHeight - 6.5, {
      align: 'right',
    });
  }
}

// -------------------------------------------------------------
// 1. Report Card (Term Progress Report) Generator
// -------------------------------------------------------------
export interface ReportCardPayload {
  school: School;
  student: Student;
  guardian?: Guardian;
  section: Section;
  className: string;
  examName: string;
  termDate: string;
  tests: Test[];
  results: TestResult[];
  subjects: Subject[];
  rank?: string;
  attendancePercent?: string;
  teacherRemarks?: string;
}

export function generateReportCardPdf(payload: ReportCardPayload): jsPDF {
  const doc = createBaseDoc('portrait');
  const { school, student, guardian, section, className, examName, termDate, tests, results, subjects } = payload;

  const startY = addSchoolHeader(
    doc,
    school,
    'STUDENT OFFICIAL PROGRESS REPORT CARD',
    `Term Examination: ${examName}`,
    `GGHSS/GZR/RC-${student.rollNumber}-${new Date().getFullYear()}`
  );

  let curY = startY + 2;

  // Student Profile Card in PDF
  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.roundedRect(14, curY, doc.internal.pageSize.getWidth() - 28, 26, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);

  const col1X = 18;
  const col2X = 75;
  const col3X = 135;

  doc.text(`Student Name:`, col1X, curY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(student.fullName, col1X + 22, curY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(`Father's Name:`, col1X, curY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(student.fatherName, col1X + 22, curY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text(`Admission No:`, col1X, curY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(student.admissionNumber, col1X + 22, curY + 18);

  // Col 2
  doc.setFont('helvetica', 'bold');
  doc.text(`Class & Section:`, col2X, curY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(`${className} (${section.name})`, col2X + 25, curY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(`Roll Number:`, col2X, curY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(`${student.rollNumber}`, col2X + 25, curY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text(`Guardian Contact:`, col2X, curY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(guardian?.phone || student.emergencyContact || 'Not provided', col2X + 25, curY + 18);

  // Col 3
  doc.setFont('helvetica', 'bold');
  doc.text(`Attendance:`, col3X, curY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(payload.attendancePercent || '94.2%', col3X + 22, curY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text(`Class Rank:`, col3X, curY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(payload.rank || 'Position: 1st', col3X + 22, curY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text(`Date of Issue:`, col3X, curY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(termDate || 'November 2026', col3X + 22, curY + 18);

  curY += 30;

  // Build Results Table
  let totalMaxMarks = 0;
  let totalObtainedMarks = 0;

  const tableBody = tests.map(test => {
    const res = results.find(r => r.testId === test.id && r.studentId === student.id);
    const sub = subjects.find(s => s.id === test.subjectId);
    const max = test.totalMarks || 100;
    const obtained = res && !res.isAbsent ? res.obtainedMarks : 0;
    const isAbsent = res?.isAbsent || false;

    totalMaxMarks += max;
    if (!isAbsent) totalObtainedMarks += obtained;

    const pct = isAbsent ? 0 : Math.round((obtained / max) * 100);
    let grade = 'F';
    if (pct >= 80) grade = 'A-1';
    else if (pct >= 70) grade = 'A';
    else if (pct >= 60) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else if (pct >= 40) grade = 'D';

    return [
      sub?.name || 'General',
      test.title,
      String(max),
      test.passingMarks ? String(test.passingMarks) : '40',
      isAbsent ? 'ABSENT' : String(obtained),
      isAbsent ? '-' : `${pct}%`,
      isAbsent ? 'F' : grade,
      res?.remarks || (pct >= 50 ? 'Passed' : 'Needs Support'),
    ];
  });

  const totalPct = totalMaxMarks > 0 ? Math.round((totalObtainedMarks / totalMaxMarks) * 100) : 0;
  let overallGrade = 'A';
  if (totalPct >= 80) overallGrade = 'A-1 (Outstanding)';
  else if (totalPct >= 70) overallGrade = 'A (Excellent)';
  else if (totalPct >= 60) overallGrade = 'B (Good)';
  else if (totalPct >= 50) overallGrade = 'C (Fair)';
  else overallGrade = 'D (Satisfactory)';

  autoTable(doc, {
    startY: curY,
    head: [['Subject', 'Paper / Assessment', 'Total', 'Passing', 'Obtained', 'Percentage', 'Grade', 'Remarks']],
    body: tableBody,
    foot: [
      [
        'OVERALL TOTAL',
        'Cumulative Performance',
        String(totalMaxMarks),
        '-',
        String(totalObtainedMarks),
        `${totalPct}%`,
        overallGrade,
        totalPct >= 40 ? 'PROMOTED / PASSED' : 'DETAINED',
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    footStyles: {
      fillColor: BG_LIGHT,
      textColor: PRIMARY_COLOR,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 32 },
      1: { cellWidth: 42 },
      2: { halign: 'center', cellWidth: 15 },
      3: { halign: 'center', cellWidth: 16 },
      4: { halign: 'center', fontStyle: 'bold', cellWidth: 16 },
      5: { halign: 'center', cellWidth: 20 },
      6: { halign: 'center', fontStyle: 'bold', cellWidth: 16 },
      7: { cellWidth: 25 },
    },
    margin: { left: 14, right: 14 },
  });

  // Remarks & Teacher Feedback
  // @ts-ignore
  const finalY = doc.lastAutoTable.finalY + 6;
  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.roundedRect(14, finalY, doc.internal.pageSize.getWidth() - 28, 18, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('CLASS TEACHER EVALUATION & DISCIPLINE ASSESSMENT:', 18, finalY + 5.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  const defaultRemarks =
    payload.teacherRemarks ||
    `${student.fullName} has shown commendable dedication in classroom lessons and assignments. Attendance is regular and homework registers are properly maintained. Commended for exemplary conduct.`;
  doc.text(doc.splitTextToSize(defaultRemarks, doc.internal.pageSize.getWidth() - 36), 18, finalY + 10);

  addSignatures(doc, ['Class Teacher', 'Examination Incharge', 'Headmistress / Principal']);
  addPageFooters(doc, school);

  return doc;
}

// -------------------------------------------------------------
// 2. Class Attendance Register Generator
// -------------------------------------------------------------
export interface AttendanceRegisterPayload {
  school: School;
  section: Section;
  className: string;
  monthName: string;
  workingDays: string[]; // YYYY-MM-DD
  students: Student[];
  records: AttendanceRecord[];
  teacherName?: string;
}

export function generateAttendanceRegisterPdf(payload: AttendanceRegisterPayload): jsPDF {
  const doc = createBaseDoc('landscape');
  const { school, section, className, monthName, workingDays, students, records } = payload;

  const startY = addSchoolHeader(
    doc,
    school,
    `MONTHLY CLASS ATTENDANCE REGISTER — ${monthName.toUpperCase()}`,
    `Class: ${className} (${section.name})  |  Room: ${section.roomNumber}  |  Class Teacher: ${payload.teacherName || 'Sir Abdul Qadir Brohi'}`,
    `GGHSS/GZR/ATT-${section.name}-${monthName}`
  );

  // Generate table columns: Roll, GR No, Name, Day 1..Day N, Present Count, %, Status
  const daysHeader = workingDays.map(d => d.slice(-2));
  const headRow = ['Roll', 'GR No', 'Student Name', ...daysHeader, 'P', 'A', 'L', '%'];

  const tableBody = students.map(std => {
    let pCount = 0;
    let aCount = 0;
    let lCount = 0;

    const dayCells = workingDays.map(dayStr => {
      const rec = records.find(r => r.studentId === std.id && r.date === dayStr);
      if (!rec) return '-';
      if (rec.status === 'present') {
        pCount++;
        return 'P';
      }
      if (rec.status === 'absent') {
        aCount++;
        return 'A';
      }
      if (rec.status === 'late') {
        lCount++;
        return 'L';
      }
      if (rec.status === 'leave') {
        return 'Lv';
      }
      return '-';
    });

    const totalMarked = pCount + aCount + lCount;
    const pct = totalMarked > 0 ? Math.round(((pCount + lCount * 0.5) / totalMarked) * 100) : 100;

    return [
      String(std.rollNumber),
      std.admissionNumber,
      std.fullName,
      ...dayCells,
      String(pCount),
      String(aCount),
      String(lCount),
      `${pct}%`,
    ];
  });

  autoTable(doc, {
    startY: startY + 2,
    head: [headRow],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 6.5,
      textColor: TEXT_DARK,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 42, halign: 'left', fontStyle: 'bold' },
      [headRow.length - 4]: { fontStyle: 'bold', textColor: [16, 185, 129] }, // P count green
      [headRow.length - 3]: { fontStyle: 'bold', textColor: [239, 68, 68] }, // A count red
      [headRow.length - 1]: { fontStyle: 'bold' }, // %
    },
    margin: { left: 12, right: 12 },
  });

  addSignatures(doc, ['Class Teacher Incharge', 'Headmistress / Principal']);
  addPageFooters(doc, school);

  return doc;
}

// -------------------------------------------------------------
// 3. Student Individual Attendance Certificate / Sheet
// -------------------------------------------------------------
export interface StudentAttendanceSheetPayload {
  school: School;
  student: Student;
  section: Section;
  className: string;
  month: string;
  records: AttendanceRecord[];
}

export function generateStudentAttendancePdf(payload: StudentAttendanceSheetPayload): jsPDF {
  const doc = createBaseDoc('portrait');
  const { school, student, section, className, month, records } = payload;

  const startY = addSchoolHeader(
    doc,
    school,
    'OFFICIAL STUDENT ATTENDANCE RECORD SHEET',
    `Month: ${month}  |  Class: ${className} (${section.name})`,
    `GGHSS/GZR/ATT-STD-${student.rollNumber}`
  );

  let curY = startY + 2;

  // Student summary pill
  doc.setFillColor(BG_LIGHT[0], BG_LIGHT[1], BG_LIGHT[2]);
  doc.roundedRect(14, curY, doc.internal.pageSize.getWidth() - 28, 20, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(`Student: ${student.fullName} (Roll #${student.rollNumber})`, 18, curY + 6);
  doc.text(`GR / Admission: ${student.admissionNumber}`, 18, curY + 12);

  const presentCount = records.filter(r => r.status === 'present').length;
  const lateCount = records.filter(r => r.status === 'late').length;
  const absentCount = records.filter(r => r.status === 'absent').length;
  const leaveCount = records.filter(r => r.status === 'leave').length;
  const totalDays = records.length;
  const percentage = totalDays > 0 ? Math.round(((presentCount + lateCount * 0.5) / totalDays) * 100) : 100;

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(`Working Days: ${totalDays}  |  Present: ${presentCount}  |  Absent: ${absentCount}  |  Late: ${lateCount}  |  Leave: ${leaveCount}`, 18, curY + 17);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(percentage >= 80 ? 16 : 220, percentage >= 80 ? 140 : 38, percentage >= 80 ? 80 : 38);
  doc.text(`Attendance Rate: ${percentage}%`, doc.internal.pageSize.getWidth() - 18, curY + 11, { align: 'right' });

  curY += 25;

  const rows = records.map(r => [
    new Date(r.date).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' }),
    r.status.toUpperCase(),
    r.notes || '-',
    r.recordedAt ? new Date(r.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '08:15 AM',
  ]);

  autoTable(doc, {
    startY: curY,
    head: [['Date', 'Attendance Status', 'Teacher Notes / Remarks', 'Time Marked']],
    body: rows,
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK,
    },
    columnStyles: {
      0: { cellWidth: 40, fontStyle: 'bold' },
      1: { cellWidth: 35, fontStyle: 'bold' },
      2: { cellWidth: 80 },
      3: { cellWidth: 25 },
    },
    margin: { left: 14, right: 14 },
  });

  addSignatures(doc, ['Class Teacher Incharge', 'Headmistress / Principal']);
  addPageFooters(doc, school);

  return doc;
}

// -------------------------------------------------------------
// 4. My School Day (Timeline & Syllabus Activity) Report
// -------------------------------------------------------------
export interface MySchoolDayPayload {
  school: School;
  date: string; // YYYY-MM-DD
  section: Section;
  className: string;
  timelineUpdates: TimelineUpdate[];
  teachers: Teacher[];
  subjects: Subject[];
}

export function generateMySchoolDayPdf(payload: MySchoolDayPayload): jsPDF {
  const doc = createBaseDoc('portrait');
  const { school, date, section, className, timelineUpdates, teachers, subjects } = payload;

  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const startY = addSchoolHeader(
    doc,
    school,
    'MY SCHOOL DAY — DAILY SYLLABUS & LESSON ACTIVITY LOG',
    `Date: ${formattedDate}  |  Class: ${className} (${section.name})  |  Room: ${section.roomNumber}`,
    `GGHSS/GZR/DIARY-${section.name}-${date}`
  );

  const rows = timelineUpdates
    .sort((a, b) => a.periodNumber - b.periodNumber)
    .map(up => {
      const sub = subjects.find(s => s.id === up.subjectId);
      const tch = teachers.find(t => t.id === up.teacherId);
      const subTch = up.substituteTeacherId ? teachers.find(t => t.id === up.substituteTeacherId) : null;
      const teacherDisplay = up.isSubstitute
        ? `${subTch?.fullName || 'Substitute'} (Sub for ${tch?.fullName})`
        : tch?.fullName || 'Teacher';

      return [
        `Period ${up.periodNumber}\n${up.startTime}–${up.endTime}`,
        sub?.name || 'Subject',
        teacherDisplay,
        up.whatWasTaught,
        up.teacherNotes || 'Completed during period.',
      ];
    });

  autoTable(doc, {
    startY: startY + 2,
    head: [['Period & Time', 'Subject', 'Teacher', 'Lesson Topic & Classwork Taught', 'Class Notes / Instructions']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK,
    },
    columnStyles: {
      0: { cellWidth: 26, fontStyle: 'bold', halign: 'center' },
      1: { cellWidth: 28, fontStyle: 'bold' },
      2: { cellWidth: 32 },
      3: { cellWidth: 55 },
      4: { cellWidth: 41 },
    },
    margin: { left: 14, right: 14 },
  });

  addSignatures(doc, ['Class Teacher', 'Headmistress / Principal']);
  addPageFooters(doc, school);

  return doc;
}

// -------------------------------------------------------------
// 5. Official Announcement / Circular PDF
// -------------------------------------------------------------
export interface CircularPayload {
  school: School;
  announcement: Announcement;
}

export function generateCircularPdf(payload: CircularPayload): jsPDF {
  const doc = createBaseDoc('portrait');
  const { school, announcement } = payload;

  const startY = addSchoolHeader(
    doc,
    school,
    'OFFICIAL SCHOOL NOTIFICATION / CIRCULAR',
    `Target Audience: ${announcement.targetRole ? announcement.targetRole.toUpperCase() : 'ALL STAKEHOLDERS'}`,
    `GGHSS/GZR/CIR-${announcement.id.slice(-4).toUpperCase()}/${new Date(announcement.publishDate).getFullYear()}`
  );

  let curY = startY + 6;

  // Title box
  doc.setFillColor(BG_LIGHT[0], BG_LIGHT[1], BG_LIGHT[2]);
  doc.roundedRect(14, curY, doc.internal.pageSize.getWidth() - 28, 14, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(announcement.title, 18, curY + 9);

  curY += 20;

  // Content body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);

  const splitBody = doc.splitTextToSize(announcement.content, doc.internal.pageSize.getWidth() - 36);
  doc.text(splitBody, 18, curY);

  curY += splitBody.length * 5.5 + 15;

  // Notification metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text(`Issued By: ${announcement.publishedBy}`, 18, curY);
  doc.text(`Publication Date: ${new Date(announcement.publishDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, 18, curY + 5);
  doc.text(`Official Stamp & Seal Affixed on Record`, 18, curY + 10);

  addSignatures(doc, ['Incharge Circulars', 'Headmistress / Principal']);
  addPageFooters(doc, school);

  return doc;
}

// -------------------------------------------------------------
// 6. Academic Calendar & Gazetted Holidays PDF
// -------------------------------------------------------------
export interface CalendarPdfPayload {
  school: School;
  events: SchoolCalendarEvent[];
  academicYear: string;
}

export function generateCalendarPdf(payload: CalendarPdfPayload): jsPDF {
  const doc = createBaseDoc('portrait');
  const { school, events, academicYear } = payload;

  const startY = addSchoolHeader(
    doc,
    school,
    'ACADEMIC CALENDAR & GAZETTED HOLIDAYS SCHEDULE',
    `Academic Session: ${academicYear || '2026–27'}  |  Sindh Education Department Schedule`,
    `GGHSS/GZR/CAL-${academicYear || '2026-27'}`
  );

  const rows = events
    .sort((a, b) => a.startDate.localeCompare(b.startDate))
    .map(ev => {
      const dateDisplay = ev.isMultiDay && ev.endDate !== ev.startDate
        ? `${new Date(ev.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })} – ${new Date(ev.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`
        : new Date(ev.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

      return [
        dateDisplay,
        ev.title,
        ev.type.replace('_', ' ').toUpperCase(),
        ev.description || 'Official Notification',
      ];
    });

  autoTable(doc, {
    startY: startY + 2,
    head: [['Scheduled Dates', 'Event / Holiday Title', 'Type', 'Description / Notification Details']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK,
    },
    columnStyles: {
      0: { cellWidth: 38, fontStyle: 'bold' },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 26, halign: 'center' },
      3: { cellWidth: 68 },
    },
    margin: { left: 14, right: 14 },
  });

  addSignatures(doc, ['Academic Coordinator', 'Headmistress / Principal']);
  addPageFooters(doc, school);

  return doc;
}

// -------------------------------------------------------------
// 7. Student Enrollment Directory PDF
// -------------------------------------------------------------
export interface StudentDirectoryPayload {
  school: School;
  section: Section;
  className: string;
  students: Student[];
  guardians: Guardian[];
}

export function generateStudentDirectoryPdf(payload: StudentDirectoryPayload): jsPDF {
  const doc = createBaseDoc('portrait');
  const { school, section, className, students, guardians } = payload;

  const startY = addSchoolHeader(
    doc,
    school,
    'STUDENT ENROLLMENT DIRECTORY & GENERAL REGISTER ROSTER',
    `Class: ${className} (${section.name})  |  Room: ${section.roomNumber}  |  Total Enrolled: ${students.length}`,
    `GGHSS/GZR/DIR-${section.name}`
  );

  const rows = students
    .sort((a, b) => a.rollNumber - b.rollNumber)
    .map(std => {
      const g = guardians.find(grd => grd.id === std.guardianId);
      return [
        String(std.rollNumber),
        std.admissionNumber,
        std.fullName,
        std.fatherName,
        std.gender,
        g?.phone || std.emergencyContact || 'Not provided',
        g?.address || 'Gizri, Karachi',
      ];
    });

  autoTable(doc, {
    startY: startY + 2,
    head: [['Roll', 'GR / Admission', 'Student Name', "Father's Name", 'Gender', 'Contact Phone', 'Residential Area']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: TEXT_DARK,
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 38, fontStyle: 'bold' },
      3: { cellWidth: 34 },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 26 },
      6: { cellWidth: 36 },
    },
    margin: { left: 14, right: 14 },
  });

  addSignatures(doc, ['Admission Incharge', 'Headmistress / Principal']);
  addPageFooters(doc, school);

  return doc;
}

// -------------------------------------------------------------
// 8. Faculty Roster / Staff Directory PDF
// -------------------------------------------------------------
export interface StaffDirectoryPayload {
  school: School;
  teachers: Teacher[];
}

export function generateStaffDirectoryPdf(payload: StaffDirectoryPayload): jsPDF {
  const doc = createBaseDoc('portrait');
  const { school, teachers } = payload;

  const startY = addSchoolHeader(
    doc,
    school,
    'FACULTY ROSTER & TEACHING STAFF DIRECTORY',
    `Total Sanctioned Posts & Appointed Faculty: ${teachers.length}`,
    `GGHSS/GZR/FACULTY-2026`
  );

  const rows = teachers.map((tch, idx) => [
    String(idx + 1),
    tch.fullName,
    tch.designation,
    tch.qualification,
    tch.phone,
    tch.email || 'Not provided',
    tch.joiningDate ? new Date(tch.joiningDate).toLocaleDateString('en-GB') : '2016-04-01',
    tch.isActive ? 'Active' : 'On Leave',
  ]);

  autoTable(doc, {
    startY: startY + 2,
    head: [['#', 'Faculty Full Name', 'Designation / Cadre', 'Qualification', 'Phone / Contact', 'Official Email', 'Govt Appointment', 'Status']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: TEXT_DARK,
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 36, fontStyle: 'bold' },
      2: { cellWidth: 34 },
      3: { cellWidth: 30 },
      4: { cellWidth: 24 },
      5: { cellWidth: 26 },
      6: { cellWidth: 16, halign: 'center' },
      7: { cellWidth: 12, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  addSignatures(doc, ['Establishment Incharge', 'Headmistress / Principal']);
  addPageFooters(doc, school);

  return doc;
}

// -------------------------------------------------------------
// 9. Official Institutional Profile Document PDF
// -------------------------------------------------------------
export interface SchoolProfilePayload {
  school: School;
  totalStudents: number;
  totalTeachers: number;
  totalSections: number;
}

export function generateSchoolProfilePdf(payload: SchoolProfilePayload): jsPDF {
  const doc = createBaseDoc('portrait');
  const { school, totalStudents, totalTeachers, totalSections } = payload;

  const startY = addSchoolHeader(
    doc,
    school,
    'OFFICIAL INSTITUTIONAL PROFILE & REGISTRATION RECORD',
    `School Education & Literacy Department, Sindh — EMIS Census Database`,
    `GGHSS/GZR/PROFILE-408060247`
  );

  let curY = startY + 6;

  // Detail Table
  const profileDetails = [
    ['Official Institution Name', school.name || 'Government Girls Higher Secondary School Gizri'],
    ['Sindh EMIS (SEMIS) Code', school.sindhEmisCode || '408060247'],
    ['Campus Physical Address', school.address || 'Near Mubarak Masjid, Opposite Total Pump.'],
    ['District & Region', school.district || 'District South, Karachi'],
    ['Province & Country', `${school.province || 'Sindh'}, Pakistan`],
    ['Academic Shift', school.shift || 'Morning'],
    ['Academic Level / Cadre', school.level || 'Higher Secondary (Classes 6-12)'],
    ['Academic Session', school.academicYear || '2026–27'],
    ['Telephone / Official Phone', school.telephone || 'Not provided'],
    ['Principal / Headmistress Name', school.principalName || 'Not provided'],
    ['Official Email Address', school.email || 'Not provided'],
    ['Total Enrolled Students', String(totalStudents)],
    ['Total Appointed Faculty', String(totalTeachers)],
    ['Active Class Sections', String(totalSections)],
  ];

  autoTable(doc, {
    startY: curY,
    head: [['Official Census Field', 'Verified Institution Record Details']],
    body: profileDetails,
    theme: 'striped',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: TEXT_DARK,
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 122 },
    },
    margin: { left: 14, right: 14 },
  });

  addSignatures(doc, ['Statistical Officer (SEMIS)', 'Headmistress / Principal']);
  addPageFooters(doc, school);

  return doc;
}

// -------------------------------------------------------------
// 10. Homework Assignment Brief / Worksheet PDF
// -------------------------------------------------------------
export interface HomeworkBriefPayload {
  school: School;
  homework: HomeworkItem;
  subject: Subject;
  teacher: Teacher;
  className: string;
  section: Section;
}

export function generateHomeworkBriefPdf(payload: HomeworkBriefPayload): jsPDF {
  const doc = createBaseDoc('portrait');
  const { school, homework, subject, teacher, className, section } = payload;

  const startY = addSchoolHeader(
    doc,
    school,
    'HOMEWORK & CLASSWORK ASSIGNMENT BRIEF',
    `Subject: ${subject.name}  |  Class: ${className} (${section.name})`,
    `GGHSS/GZR/HW-${homework.id}`
  );

  let curY = startY + 4;

  // Assignment Meta Card
  doc.setFillColor(BG_LIGHT[0], BG_LIGHT[1], BG_LIGHT[2]);
  doc.roundedRect(14, curY, doc.internal.pageSize.getWidth() - 28, 22, 2, 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text(`Assignment Title: ${homework.title}`, 18, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text(`Assigned Teacher: ${teacher.fullName} (${teacher.designation})`, 18, curY + 12);
  doc.text(
    `Assigned Date: ${new Date(homework.assignedDate).toLocaleDateString('en-GB')}  |  Submission Due Date: ${new Date(homework.dueDate).toLocaleDateString('en-GB')}`,
    18,
    curY + 18
  );

  curY += 28;

  // Instructions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(PRIMARY_COLOR[0], PRIMARY_COLOR[1], PRIMARY_COLOR[2]);
  doc.text('ASSIGNMENT INSTRUCTIONS & DETAILED QUESTIONS:', 14, curY);

  curY += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);

  const splitInstr = doc.splitTextToSize(homework.instructions, doc.internal.pageSize.getWidth() - 28);
  doc.text(splitInstr, 14, curY);

  curY += splitInstr.length * 5 + 10;

  // Submission Rules box
  doc.setFillColor(250, 250, 252);
  doc.setDrawColor(BORDER_COLOR[0], BORDER_COLOR[1], BORDER_COLOR[2]);
  doc.roundedRect(14, curY, doc.internal.pageSize.getWidth() - 28, 24, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(TEXT_DARK[0], TEXT_DARK[1], TEXT_DARK[2]);
  doc.text('STUDENT SUBMISSION GUIDELINES:', 18, curY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(TEXT_MUTED[0], TEXT_MUTED[1], TEXT_MUTED[2]);
  doc.text('1. Solve clearly in the designated subject fair notebook or upload a PDF scan.', 18, curY + 11);
  doc.text('2. Ensure margin lines are drawn and steps are written in legible handwriting.', 18, curY + 16);
  doc.text('3. Late submissions will be flagged for review during parent-teacher evaluation.', 18, curY + 21);

  addSignatures(doc, ['Subject Teacher', 'Headmistress / Principal']);
  addPageFooters(doc, school);

  return doc;
}

// -------------------------------------------------------------
// 11. Homework Student Submission Receipt / Slip PDF
// -------------------------------------------------------------
export interface SubmissionSlipPayload {
  school: School;
  homework: HomeworkItem;
  submission: HomeworkSubmission;
  student: Student;
  subject: Subject;
  teacher: Teacher;
  className: string;
  section: Section;
}

export function generateSubmissionSlipPdf(payload: SubmissionSlipPayload): jsPDF {
  const doc = createBaseDoc('portrait');
  const { school, homework, submission, student, subject, teacher, className, section } = payload;

  const startY = addSchoolHeader(
    doc,
    school,
    'STUDENT HOMEWORK SUBMISSION RECEIPT',
    `Status: ${submission.status.toUpperCase()}  |  Subject: ${subject.name}`,
    `GGHSS/GZR/SUB-${submission.id}`
  );

  let curY = startY + 4;

  const rows = [
    ['Student Full Name', `${student.fullName} (Roll #${student.rollNumber})`],
    ['Admission / GR Number', student.admissionNumber],
    ['Class & Section', `${className} (${section.name})`],
    ['Subject', subject.name],
    ['Assignment Title', homework.title],
    ['Teacher Incharge', teacher.fullName],
    ['Submitted At', submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('en-GB') : 'Submitted'],
    ['Submission Status', submission.status.toUpperCase()],
    ['Attached File', submission.pdfFileName ? `${submission.pdfFileName} (${submission.pdfFileSize || 'PDF'})` : 'Online Text Response'],
    ['Student Submission Notes', submission.studentNote || 'None provided.'],
    ['Teacher Checking Feedback', submission.teacherFeedback || 'Pending evaluation.'],
  ];

  autoTable(doc, {
    startY: curY,
    head: [['Submission Field', 'Details']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: TEXT_DARK,
    },
    columnStyles: {
      0: { cellWidth: 50, fontStyle: 'bold' },
      1: { cellWidth: 132 },
    },
    margin: { left: 14, right: 14 },
  });

  addSignatures(doc, ['Subject Teacher Evaluator', 'Student / Guardian Copy']);
  addPageFooters(doc, school);

  return doc;
}

// -------------------------------------------------------------
// 12. Class Broad Marksheet / Result Gazetteer PDF
// -------------------------------------------------------------
export interface ClassMarksheetPayload {
  school: School;
  section: Section;
  className: string;
  examTitle: string;
  students: Student[];
  tests: Test[];
  results: TestResult[];
  subjects: Subject[];
}

export function generateClassMarksheetPdf(payload: ClassMarksheetPayload): jsPDF {
  const doc = createBaseDoc('landscape');
  const { school, section, className, examTitle, students, tests, results, subjects } = payload;

  const startY = addSchoolHeader(
    doc,
    school,
    `CLASS BROAD MARKSHEET & RESULT GAZETTE — ${examTitle.toUpperCase()}`,
    `Class: ${className} (${section.name})  |  Room: ${section.roomNumber}  |  Total Enrolled: ${students.length}`,
    `GGHSS/GZR/GAZ-${section.name}`
  );

  const testColumns = tests.map(t => {
    const sub = subjects.find(s => s.id === t.subjectId);
    return `${sub?.name || t.title}\n(/${t.totalMarks})`;
  });

  const headRow = ['Roll', 'GR No', 'Student Name', ...testColumns, 'Obtained', 'Total', '%', 'Result'];

  const bodyRows = students
    .slice()
    .sort((a, b) => a.rollNumber - b.rollNumber)
    .map(std => {
      let totalObtained = 0;
      let totalMax = 0;

      const markCells = tests.map(t => {
        const res = results.find(r => r.testId === t.id && r.studentId === std.id);
        totalMax += t.totalMarks;
        if (!res) return '-';
        if (res.isAbsent) return 'ABS';
        totalObtained += res.obtainedMarks;
        return String(res.obtainedMarks);
      });

      const pct = totalMax > 0 ? Math.round((totalObtained / totalMax) * 100) : 0;
      return [
        String(std.rollNumber),
        std.admissionNumber,
        std.fullName,
        ...markCells,
        String(totalObtained),
        String(totalMax),
        `${pct}%`,
        pct >= 40 ? 'PASS' : 'FAIL',
      ];
    });

  autoTable(doc, {
    startY: startY + 2,
    head: [headRow],
    body: bodyRows,
    theme: 'grid',
    headStyles: {
      fillColor: PRIMARY_COLOR,
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 7,
      textColor: TEXT_DARK,
      halign: 'center',
    },
    columnStyles: {
      0: { cellWidth: 11, fontStyle: 'bold' },
      1: { cellWidth: 24 },
      2: { cellWidth: 42, halign: 'left', fontStyle: 'bold' },
      [headRow.length - 1]: { fontStyle: 'bold' },
    },
    margin: { left: 12, right: 12 },
  });

  addSignatures(doc, ['Class Teacher', 'Examination Incharge', 'Headmistress / Principal']);
  addPageFooters(doc, school);

  return doc;
}

