/**
 * MERI SCHOOL DIARY — Admin Management Modules
 * Covers: Students, Teachers, Classes & Sections, Subjects & Assignments, Calendar & Holidays, Reports, Profile
 */

import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Layers,
  BookOpen,
  Calendar,
  BarChart3,
  School,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  UserCheck,
  UserX,
  X,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  FileText,
  Printer,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { NavTabId } from '../../components/layout/Sidebar';
import { Student, Teacher, SchoolClass, Section, Subject, SchoolCalendarEvent } from '../../types';
import { PdfViewerModal } from '../../components/common/PdfViewerModal';
import {
  generateStudentDirectoryPdf,
  generateStaffDirectoryPdf,
  generateCalendarPdf,
  generateSchoolProfilePdf,
  generateAttendanceRegisterPdf,
  generateClassMarksheetPdf,
} from '../../utils/pdfGenerator';

interface AdminManagementProps {
  tab: NavTabId;
}

export const AdminManagement: React.FC<AdminManagementProps> = ({ tab }) => {
  const {
    db,
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
    saveCalendarEvent,
    deleteCalendarEvent,
    updateSchoolProfile,
  } = useSchool();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [sectionFilter, setSectionFilter] = useState('all');
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [stdName, setStdName] = useState('');
  const [stdFather, setStdFather] = useState('');
  const [stdAdmission, setStdAdmission] = useState('');
  const [stdRoll, setStdRoll] = useState('1');
  const [stdSectionId, setStdSectionId] = useState('sec-6a');
  const [stdGuardianId, setStdGuardianId] = useState('grd-tariq-mehmood');
  const [stdEmergency, setStdEmergency] = useState('0300-9281726');

  // Teacher modal
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [tchName, setTchName] = useState('');
  const [tchDesignation, setTchDesignation] = useState('HST');
  const [tchPhone, setTchPhone] = useState('');
  const [tchQualification, setTchQualification] = useState('');

  // Class / Section modal
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [classOrder, setClassOrder] = useState('3');

  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [secName, setSecName] = useState('');
  const [secClassId, setSecClassId] = useState('cls-6');
  const [secRoom, setSecRoom] = useState('Room 103');
  const [secTeacherId, setSecTeacherId] = useState('tch-abdul-qadir');

  // Subject modal
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [subName, setSubName] = useState('');
  const [subCode, setSubCode] = useState('');

  // Assignment modal
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignTeacherId, setAssignTeacherId] = useState('tch-abdul-qadir');
  const [assignSubjectId, setAssignSubjectId] = useState('sub-math');
  const [assignSectionId, setAssignSectionId] = useState('sec-6a');

  // Calendar event modal
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calTitle, setCalTitle] = useState('');
  const [calDesc, setCalDesc] = useState('');
  const [calStart, setCalStart] = useState('2026-11-20');
  const [calEnd, setCalEnd] = useState('2026-11-20');
  const [calType, setCalType] = useState<'holiday' | 'half_day' | 'event'>('holiday');

  // School profile form
  const [schoolName, setSchoolName] = useState(db.school.name);
  const [schoolEmis, setSchoolEmis] = useState(db.school.sindhEmisCode);
  const [schoolAddress, setSchoolAddress] = useState(db.school.address);
  const [schoolPrincipal, setSchoolPrincipal] = useState(db.school.principalName);
  const [schoolPhone, setSchoolPhone] = useState(db.school.telephone);
  const [schoolEmail, setSchoolEmail] = useState(db.school.email || '');

  // PDF Preview Modal State
  const [activePdf, setActivePdf] = useState<{
    title: string;
    subtitle?: string;
    dataUrl: string;
    fileName: string;
  } | null>(null);

  const clearAlerts = () => {
    setActionError('');
    setActionSuccess('');
  };

  const renderTabContent = (): React.ReactNode => {

  /* ----------------------------------------------------
   * 1. STUDENTS DIRECTORY
   * ---------------------------------------------------- */
  if (tab === 'students') {
    const filteredStudents = db.students.filter(s => {
      const matchesSearch =
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.fatherName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSection = sectionFilter === 'all' || s.sectionId === sectionFilter;
      return matchesSearch && matchesSection;
    });

    const handleOpenAddStudent = () => {
      setEditingStudent(null);
      setStdName('');
      setStdFather('');
      setStdAdmission(`GR-2026-${Math.floor(100 + Math.random() * 900)}`);
      setStdRoll('11');
      setStdSectionId('sec-6a');
      setStdGuardianId('grd-tariq-mehmood');
      setStdEmergency('0300-9281726');
      clearAlerts();
      setIsStudentModalOpen(true);
    };

    const handleOpenEditStudent = (s: Student) => {
      setEditingStudent(s);
      setStdName(s.fullName);
      setStdFather(s.fatherName);
      setStdAdmission(s.admissionNumber);
      setStdRoll(String(s.rollNumber));
      setStdSectionId(s.sectionId);
      setStdGuardianId(s.guardianId);
      setStdEmergency(s.emergencyContact);
      clearAlerts();
      setIsStudentModalOpen(true);
    };

    const handleSaveStudentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      clearAlerts();
      const res = saveStudent({
        id: editingStudent?.id,
        fullName: stdName.trim(),
        fatherName: stdFather.trim(),
        admissionNumber: stdAdmission.trim(),
        rollNumber: Number(stdRoll),
        sectionId: stdSectionId,
        guardianId: stdGuardianId,
        gender: 'Male',
        dateOfBirth: '2014-01-01',
        isActive: editingStudent ? editingStudent.isActive : true,
        emergencyContact: stdEmergency.trim(),
      });

      if (!res.success) {
        setActionError(res.message || 'Validation error saving student.');
      } else {
        setActionSuccess(editingStudent ? 'Student details updated.' : 'Student admitted successfully.');
        setIsStudentModalOpen(false);
      }
    };

    const handleExportStudentsPdf = () => {
      const targetSec =
        sectionFilter === 'all'
          ? ({
              id: 'all',
              name: 'All Sections',
              classId: '',
              roomNumber: 'Main Campus',
              classTeacherId: '',
            } as Section)
          : db.sections.find(s => s.id === sectionFilter) || db.sections[0];
      const cls =
        sectionFilter === 'all'
          ? 'All Classes'
          : db.classes.find(c => c.id === targetSec?.classId)?.name || 'Class';
      const doc = generateStudentDirectoryPdf({
        school: db.school,
        section: targetSec,
        className: cls,
        students: filteredStudents,
        guardians: db.guardians,
      });
      setActivePdf({
        title: `Student Directory — ${targetSec.name}`,
        subtitle: `${db.school.name} (SEMIS: ${db.school.sindhEmisCode})`,
        dataUrl: doc.output('datauristring'),
        fileName: `GGHSS_Gizri_Student_Roster_${targetSec.name.replace(/\s+/g, '_')}.pdf`,
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Students Directory
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Manage enrollments, admission register, roll numbers, and active/deactivated statuses.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportStudentsPdf}
              className="px-3.5 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Roster (PDF)
            </button>
            <button
              onClick={handleOpenAddStudent}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Admit New Student
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {actionError}
          </div>
        )}

        {/* Search & Section Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by student name, father name, or GR admission number..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
            />
          </div>

          <select
            value={sectionFilter}
            onChange={e => setSectionFilter(e.target.value)}
            className="w-full sm:w-auto px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
          >
            <option value="all">All Sections ({db.students.length})</option>
            {db.sections.map(sec => (
              <option key={sec.id} value={sec.id}>
                Section {sec.name}
              </option>
            ))}
          </select>
        </div>

        {/* Students Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Roll #</th>
                  <th className="py-3 px-4">Student &amp; Admission #</th>
                  <th className="py-3 px-4">Father Name</th>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map(std => {
                  const sec = db.sections.find(s => s.id === std.sectionId);
                  return (
                    <tr key={std.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                        {String(std.rollNumber).padStart(2, '0')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{std.fullName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{std.admissionNumber}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{std.fatherName}</td>
                      <td className="py-3 px-4 font-bold text-purple-700 dark:text-purple-300">
                        {sec?.name}
                      </td>
                      <td className="py-3 px-4">
                        {std.isActive ? (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
                            Deactivated
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditStudent(std)}
                            className="p-1.5 text-slate-500 hover:text-purple-700 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                            title="Edit Student"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => toggleStudentActive(std.id)}
                            className={`p-1.5 rounded-lg ${
                              std.isActive
                                ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                            }`}
                            title={std.isActive ? 'Deactivate' : 'Reactivate'}
                          >
                            {std.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add/Edit Student */}
        {isStudentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setIsStudentModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {editingStudent ? 'Edit Student Details' : 'Admit New Student'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Record admission and assign roll number for class roster.
              </p>

              <form onSubmit={handleSaveStudentSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Student Full Name *
                    </label>
                    <input
                      type="text"
                      value={stdName}
                      onChange={e => setStdName(e.target.value)}
                      placeholder="e.g. Asadullah Junejo"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Father / Guardian Name *
                    </label>
                    <input
                      type="text"
                      value={stdFather}
                      onChange={e => setStdFather(e.target.value)}
                      placeholder="e.g. Rasheed Junejo"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Admission # (GR) *
                    </label>
                    <input
                      type="text"
                      value={stdAdmission}
                      onChange={e => setStdAdmission(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Roll Number *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={stdRoll}
                      onChange={e => setStdRoll(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Section *
                    </label>
                    <select
                      value={stdSectionId}
                      onChange={e => setStdSectionId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {db.sections.map(sec => (
                        <option key={sec.id} value={sec.id}>
                          Section {sec.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Emergency Phone Contact *
                  </label>
                  <input
                    type="text"
                    value={stdEmergency}
                    onChange={e => setStdEmergency(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsStudentModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-colors"
                  >
                    {editingStudent ? 'Save Changes' : 'Admit Student'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ----------------------------------------------------
   * 2. TEACHERS FACULTY
   * ---------------------------------------------------- */
  if (tab === 'teachers') {
    const handleOpenAddTeacher = () => {
      setEditingTeacher(null);
      setTchName('');
      setTchDesignation('High School Teacher (HST)');
      setTchPhone('0300-1234567');
      setTchQualification('M.A, B.Ed');
      clearAlerts();
      setIsTeacherModalOpen(true);
    };

    const handleOpenEditTeacher = (t: Teacher) => {
      setEditingTeacher(t);
      setTchName(t.fullName);
      setTchDesignation(t.designation);
      setTchPhone(t.phone);
      setTchQualification(t.qualification);
      clearAlerts();
      setIsTeacherModalOpen(true);
    };

    const handleSaveTeacherSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      clearAlerts();
      saveTeacher({
        id: editingTeacher?.id,
        fullName: tchName.trim(),
        designation: tchDesignation.trim(),
        phone: tchPhone.trim(),
        qualification: tchQualification.trim(),
        cnic: editingTeacher?.cnic || '41302-1234567-1',
        joiningDate: editingTeacher?.joiningDate || '2022-01-01',
        isActive: editingTeacher ? editingTeacher.isActive : true,
      });
      setActionSuccess(editingTeacher ? 'Teacher profile updated.' : 'Teacher faculty member added.');
      setIsTeacherModalOpen(false);
    };

    const handleExportFacultyPdf = () => {
      const doc = generateStaffDirectoryPdf({
        school: db.school,
        teachers: db.teachers,
      });
      setActivePdf({
        title: 'Faculty Roster & Teaching Staff Directory',
        subtitle: `${db.school.name} (SEMIS: ${db.school.sindhEmisCode})`,
        dataUrl: doc.output('datauristring'),
        fileName: 'GGHSS_Gizri_Faculty_Directory.pdf',
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Teacher Faculty
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sindh Government sanctioned teaching posts, designations, and contact directory.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleExportFacultyPdf}
              className="px-3.5 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export Faculty (PDF)
            </button>
            <button
              onClick={handleOpenAddTeacher}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Add Faculty Member
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {actionSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {db.teachers.map(teacher => {
            const assignments = db.teacherAssignments.filter(a => a.teacherId === teacher.id);
            const isClassTeacherFor = db.sections.find(s => s.classTeacherId === teacher.id);

            return (
              <div
                key={teacher.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {teacher.fullName}
                    </h3>
                    <div className="text-xs text-purple-700 dark:text-purple-300 font-bold">
                      {teacher.designation}
                    </div>
                  </div>

                  {teacher.isActive ? (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-50 text-emerald-700">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-500">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                  <div>Qualification: <span className="font-medium text-slate-700 dark:text-slate-300">{teacher.qualification}</span></div>
                  <div>Phone: <span className="font-mono text-slate-700 dark:text-slate-300">{teacher.phone}</span></div>
                  {isClassTeacherFor && (
                    <div className="text-purple-700 dark:text-purple-400 font-bold pt-1">
                      Class Teacher: Section {isClassTeacherFor.name}
                    </div>
                  )}
                </div>

                <div className="text-[11px] text-slate-400 pt-1">
                  Teaches: {assignments.length} assigned subject periods
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleOpenEditTeacher(teacher)}
                    className="px-3 py-1 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Edit Info
                  </button>
                  <button
                    onClick={() => toggleTeacherActive(teacher.id)}
                    className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                      teacher.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'
                    }`}
                  >
                    {teacher.isActive ? 'Deactivate' : 'Reactivate'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Add/Edit Teacher */}
        {isTeacherModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setIsTeacherModalOpen(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
                {editingTeacher ? 'Edit Teacher Details' : 'Add Faculty Member'}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Teacher faculty profile for timetable and attendance management.
              </p>

              <form onSubmit={handleSaveTeacherSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Teacher Full Name *
                  </label>
                  <input
                    type="text"
                    value={tchName}
                    onChange={e => setTchName(e.target.value)}
                    placeholder="e.g. Ms. Shaista Khan"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Designation *
                  </label>
                  <select
                    value={tchDesignation}
                    onChange={e => setTchDesignation(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Senior Subject Specialist (SSS)">Senior Subject Specialist (SSS) - BPS 18</option>
                    <option value="High School Teacher (HST)">High School Teacher (HST) - BPS 16</option>
                    <option value="Elementary School Teacher (EST)">Elementary School Teacher (EST) - BPS 15</option>
                    <option value="Junior Science Teacher (JST)">Junior Science Teacher (JST) - BPS 14</option>
                    <option value="Primary School Teacher (PST)">Primary School Teacher (PST) - BPS 14</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Contact *
                  </label>
                  <input
                    type="text"
                    value={tchPhone}
                    onChange={e => setTchPhone(e.target.value)}
                    placeholder="0300-1234567"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Academic Qualifications *
                  </label>
                  <input
                    type="text"
                    value={tchQualification}
                    onChange={e => setTchQualification(e.target.value)}
                    placeholder="e.g. M.Sc (Mathematics), B.Ed"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsTeacherModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl shadow-xs transition-colors"
                  >
                    Save Teacher
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ----------------------------------------------------
   * 3. CLASSES & SECTIONS
   * ---------------------------------------------------- */
  if (tab === 'classes') {
    const handleSaveClassSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      clearAlerts();
      saveClass({
        name: className.trim(),
        order: Number(classOrder),
      });
      setActionSuccess('Class added successfully.');
      setIsClassModalOpen(false);
      setClassName('');
    };

    const handleDeleteClass = (id: string) => {
      clearAlerts();
      const res = deleteClass(id);
      if (!res.success) {
        setActionError(res.message || 'Cannot delete class.');
      } else {
        setActionSuccess('Class removed.');
      }
    };

    const handleSaveSectionSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      clearAlerts();
      saveSection({
        name: secName.trim(),
        classId: secClassId,
        roomNumber: secRoom.trim(),
        classTeacherId: secTeacherId,
      });
      setActionSuccess('Section created successfully.');
      setIsSectionModalOpen(false);
      setSecName('');
    };

    const handleDeleteSection = (id: string) => {
      clearAlerts();
      const res = deleteSection(id);
      if (!res.success) {
        setActionError(res.message || 'Cannot delete section.');
      } else {
        setActionSuccess('Section removed.');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Classes &amp; Sections Management
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Class tiers, classroom rooms, and class teacher assignments. Conservative delete policies enforced.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setClassName('');
                setClassOrder('3');
                clearAlerts();
                setIsClassModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            >
              + Add Class
            </button>
            <button
              onClick={() => {
                setSecName('');
                setSecRoom('Room 103');
                clearAlerts();
                setIsSectionModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs"
            >
              + Add Section
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {actionError}
          </div>
        )}

        <div className="space-y-6">
          {db.classes.map(cls => {
            const sections = db.sections.filter(s => s.classId === cls.id);

            return (
              <div
                key={cls.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-black text-sm flex items-center justify-center">
                      {cls.order}
                    </span>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {cls.name}
                      </h3>
                      <div className="text-xs text-slate-400">{cls.description || 'Academic Grade'}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteClass(cls.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                    title="Delete Class (blocked if sections exist)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sections List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {sections.map(sec => {
                    const classTeacher = db.teachers.find(t => t.id === sec.classTeacherId);
                    const studentsCount = db.students.filter(s => s.sectionId === sec.id && s.isActive).length;

                    return (
                      <div
                        key={sec.id}
                        className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 relative"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-black text-purple-700 dark:text-purple-400">
                            Section {sec.name}
                          </span>
                          <button
                            onClick={() => handleDeleteSection(sec.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Delete Section (blocked if students exist)"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                          <div>Room: <span className="font-medium text-slate-800 dark:text-slate-200">{sec.roomNumber}</span></div>
                          <div>Class Teacher: <span className="font-bold text-slate-800 dark:text-slate-200">{classTeacher?.fullName || 'Unassigned'}</span></div>
                          <div>Enrolled: <span className="font-mono font-bold text-slate-900 dark:text-white">{studentsCount} Students</span></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal: Add Class */}
        {isClassModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
              <button onClick={() => setIsClassModalOpen(false)} className="absolute top-4 right-4 text-slate-400">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Add Academic Class</h3>
              <form onSubmit={handleSaveClassSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class Name *</label>
                  <input
                    type="text"
                    value={className}
                    onChange={e => setClassName(e.target.value)}
                    placeholder="e.g. Class 8"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={classOrder}
                    onChange={e => setClassOrder(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsClassModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 rounded-xl">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Section */}
        {isSectionModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
              <button onClick={() => setIsSectionModalOpen(false)} className="absolute top-4 right-4 text-slate-400">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Add Section</h3>
              <form onSubmit={handleSaveSectionSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class</label>
                  <select
                    value={secClassId}
                    onChange={e => setSecClassId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold"
                  >
                    {db.classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Section Name *</label>
                  <input
                    type="text"
                    value={secName}
                    onChange={e => setSecName(e.target.value)}
                    placeholder="e.g. 6-C or 7-B"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Room Number *</label>
                  <input
                    type="text"
                    value={secRoom}
                    onChange={e => setSecRoom(e.target.value)}
                    placeholder="e.g. Room 104"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Class Teacher</label>
                  <select
                    value={secTeacherId}
                    onChange={e => setSecTeacherId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {db.teachers.filter(t => t.isActive).map(t => (
                      <option key={t.id} value={t.id}>{t.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsSectionModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 rounded-xl">Save Section</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ----------------------------------------------------
   * 4. SUBJECTS & TEACHER ASSIGNMENTS
   * ---------------------------------------------------- */
  if (tab === 'subjects') {
    const handleSaveSubjectSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      clearAlerts();
      saveSubject({
        name: subName.trim(),
        code: subCode.trim() || 'SUB-01',
        isCore: true,
      });
      setActionSuccess('Subject added.');
      setIsSubjectModalOpen(false);
      setSubName('');
      setSubCode('');
    };

    const handleDeleteSubject = (id: string) => {
      clearAlerts();
      const res = deleteSubject(id);
      if (!res.success) {
        setActionError(res.message || 'Cannot delete subject.');
      } else {
        setActionSuccess('Subject deleted.');
      }
    };

    const handleSaveAssignmentSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      clearAlerts();
      const res = saveTeacherAssignment({
        teacherId: assignTeacherId,
        subjectId: assignSubjectId,
        sectionId: assignSectionId,
      });
      if (!res.success) {
        setActionError(res.message || 'Failed to assign teacher.');
      } else {
        setActionSuccess('Teacher assigned to section and subject successfully.');
        setIsAssignmentModalOpen(false);
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Subjects &amp; Teacher Assignments
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Sindh curriculum subject list and 24 teacher-section-subject assignments.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSubName('');
                setSubCode('');
                clearAlerts();
                setIsSubjectModalOpen(true);
              }}
              className="px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50"
            >
              + Add Subject
            </button>
            <button
              onClick={() => {
                clearAlerts();
                setIsAssignmentModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs"
            >
              + Assign Teacher
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {actionSuccess}
          </div>
        )}
        {actionError && (
          <div className="p-3 bg-rose-50 text-rose-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            {actionError}
          </div>
        )}

        {/* Subjects Grid */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Curriculum Subjects</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {db.subjects.map(s => (
              <div
                key={s.id}
                className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{s.code}</div>
                </div>
                <button
                  onClick={() => handleDeleteSubject(s.id)}
                  className="p-1 text-slate-400 hover:text-rose-600"
                  title="Delete subject (blocked if assigned)"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Teacher Assignments Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300">
            Active Teaching Assignments ({db.teacherAssignments.length} Assignments)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">Section</th>
                  <th className="py-3 px-4">Subject</th>
                  <th className="py-3 px-4">Assigned Teacher</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {db.teacherAssignments.map(ta => {
                  const sec = db.sections.find(s => s.id === ta.sectionId);
                  const sub = db.subjects.find(s => s.id === ta.subjectId);
                  const teacher = db.teachers.find(t => t.id === ta.teacherId);

                  return (
                    <tr key={ta.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-3 px-4 font-bold text-purple-700 dark:text-purple-300">
                        Section {sec?.name}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        {sub?.name}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                        {teacher?.fullName} ({teacher?.designation})
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => deleteTeacherAssignment(ta.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                          title="Remove Assignment"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add Subject */}
        {isSubjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
              <button onClick={() => setIsSubjectModalOpen(false)} className="absolute top-4 right-4 text-slate-400">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Add Subject</h3>
              <form onSubmit={handleSaveSubjectSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Name *</label>
                  <input
                    type="text"
                    value={subName}
                    onChange={e => setSubName(e.target.value)}
                    placeholder="e.g. Arabic or Drawing"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject Code</label>
                  <input
                    type="text"
                    value={subCode}
                    onChange={e => setSubCode(e.target.value)}
                    placeholder="e.g. ARB-06"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsSubjectModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 rounded-xl">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Assign Teacher */}
        {isAssignmentModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
              <button onClick={() => setIsAssignmentModalOpen(false)} className="absolute top-4 right-4 text-slate-400">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Assign Teacher to Section</h3>
              <form onSubmit={handleSaveAssignmentSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Section</label>
                  <select
                    value={assignSectionId}
                    onChange={e => setAssignSectionId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {db.sections.map(s => (
                      <option key={s.id} value={s.id}>Section {s.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject</label>
                  <select
                    value={assignSubjectId}
                    onChange={e => setAssignSubjectId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {db.subjects.map(sub => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Teacher</label>
                  <select
                    value={assignTeacherId}
                    onChange={e => setAssignTeacherId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    {db.teachers.filter(t => t.isActive).map(t => (
                      <option key={t.id} value={t.id}>{t.fullName}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsAssignmentModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 rounded-xl">Save Assignment</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ----------------------------------------------------
   * 5. SCHOOL CALENDAR & HOLIDAYS
   * ---------------------------------------------------- */
  if (tab === 'calendar') {
    const handleSaveCalendarSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      clearAlerts();
      saveCalendarEvent({
        title: calTitle.trim(),
        description: calDesc.trim(),
        startDate: calStart,
        endDate: calEnd,
        type: calType,
        isMultiDay: calStart !== calEnd,
      });
      setActionSuccess('Calendar event added.');
      setIsCalendarModalOpen(false);
      setCalTitle('');
      setCalDesc('');
    };

    const handleDownloadCalendarPdf = () => {
      const doc = generateCalendarPdf({
        school: db.school,
        events: db.calendarEvents,
        academicYear: db.school.academicYear || '2026–27',
      });
      setActivePdf({
        title: 'Academic Calendar & Gazetted Holidays',
        subtitle: `${db.school.name} (SEMIS: ${db.school.sindhEmisCode})`,
        dataUrl: doc.output('datauristring'),
        fileName: 'GGHSS_Gizri_Academic_Calendar.pdf',
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              School Calendar &amp; Holidays
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Public holidays, half-days, examinations, and official Sindh government events.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={handleDownloadCalendarPdf}
              className="px-3.5 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download Calendar (PDF)
            </button>
            <button
              onClick={() => {
                clearAlerts();
                setIsCalendarModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              Add Calendar Event
            </button>
          </div>
        </div>

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {actionSuccess}
          </div>
        )}

        <div className="space-y-3">
          {db.calendarEvents.map(event => {
            const typeConfig = {
              holiday: { label: 'Public Holiday', bg: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300' },
              half_day: { label: 'Half-Day Event', bg: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300' },
              event: { label: 'School Celebration', bg: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300' },
              examination: { label: 'Examinations', bg: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300' },
            }[event.type];

            return (
              <div
                key={event.id}
                className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${typeConfig.bg}`}>
                      {typeConfig.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400">
                      {event.startDate} {event.startDate !== event.endDate && `to ${event.endDate}`}
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{event.title}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{event.description}</p>
                </div>

                <button
                  onClick={() => deleteCalendarEvent(event.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-lg self-end sm:self-auto"
                  title="Delete event"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Modal: Add Calendar Event */}
        {isCalendarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
              <button onClick={() => setIsCalendarModalOpen(false)} className="absolute top-4 right-4 text-slate-400">
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">Add Calendar Event / Holiday</h3>
              <form onSubmit={handleSaveCalendarSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Event Title *</label>
                  <input
                    type="text"
                    value={calTitle}
                    onChange={e => setCalTitle(e.target.value)}
                    placeholder="e.g. Kashmir Solidarity Day"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={calType}
                    onChange={e => setCalType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="holiday">Official Holiday</option>
                    <option value="half_day">Half-Day Session</option>
                    <option value="event">Celebration / Sports Event</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Start Date *</label>
                    <input
                      type="date"
                      value={calStart}
                      onChange={e => setCalStart(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">End Date *</label>
                    <input
                      type="date"
                      value={calEnd}
                      onChange={e => setCalEnd(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description</label>
                  <textarea
                    value={calDesc}
                    onChange={e => setCalDesc(e.target.value)}
                    placeholder="Details or official notification reference..."
                    rows={2}
                    className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsCalendarModalOpen(false)} className="px-3 py-1.5 text-xs text-slate-600">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 text-xs font-bold text-white bg-purple-700 rounded-xl">Save Event</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  /* ----------------------------------------------------
   * 6. REPORTS & ANALYTICS
   * ---------------------------------------------------- */
  if (tab === 'reports') {
    const handleExportSectionAttendance = (sec: Section) => {
      const students = db.students.filter(s => s.sectionId === sec.id && s.isActive);
      const recs = db.attendanceRecords.filter(r => r.sectionId === sec.id);
      const uniqueDays = Array.from(new Set(recs.map(r => r.date))).sort();
      const workingDays =
        uniqueDays.length > 0
          ? uniqueDays
          : ['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06', '2026-11-09', '2026-11-10', '2026-11-11'];
      const cls = db.classes.find(c => c.id === sec.classId)?.name || 'Class';
      const classTeacher = db.teachers.find(t => t.id === sec.classTeacherId)?.fullName;
      const doc = generateAttendanceRegisterPdf({
        school: db.school,
        section: sec,
        className: cls,
        monthName: 'November 2026',
        workingDays,
        students,
        records: recs,
        teacherName: classTeacher,
      });
      setActivePdf({
        title: `Attendance Register — Section ${sec.name}`,
        subtitle: `${db.school.name} (SEMIS: ${db.school.sindhEmisCode})`,
        dataUrl: doc.output('datauristring'),
        fileName: `GGHSS_Gizri_Attendance_${sec.name}.pdf`,
      });
    };

    const handleExportSectionMarksheet = (sec: Section, examTitle: string) => {
      const students = db.students.filter(s => s.sectionId === sec.id && s.isActive);
      const sectionTests = db.tests.filter(t => t.sectionId === sec.id);
      const cls = db.classes.find(c => c.id === sec.classId)?.name || 'Class';
      const doc = generateClassMarksheetPdf({
        school: db.school,
        section: sec,
        className: cls,
        examTitle,
        students,
        tests: sectionTests,
        results: db.testResults,
        subjects: db.subjects,
      });
      setActivePdf({
        title: `Class Broad Marksheet — Section ${sec.name}`,
        subtitle: `${db.school.name} · ${examTitle}`,
        dataUrl: doc.output('datauristring'),
        fileName: `GGHSS_Gizri_Marksheet_${sec.name}.pdf`,
      });
    };

    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Reports &amp; Academic Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Class-wise attendance summaries, examination mark averages, and official PDF exports.
            </p>
          </div>
        </div>

        {/* Section-wise Attendance Breakdown */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Section-Wise Attendance Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {db.sections.map(sec => {
              const students = db.students.filter(s => s.sectionId === sec.id && s.isActive);
              const recs = db.attendanceRecords.filter(r => r.sectionId === sec.id);
              const present = recs.filter(r => r.status === 'present').length;
              const late = recs.filter(r => r.status === 'late').length;
              const leave = recs.filter(r => r.status === 'leave').length;
              const rate = recs.length > 0 ? Math.round(((present + late * 0.5 + leave) / recs.length) * 100) : 95;

              return (
                <div
                  key={sec.id}
                  className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                      Section {sec.name}
                    </span>
                    <span className="text-lg font-black text-slate-900 dark:text-white tabular-nums">
                      {rate}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-700 h-full rounded-full" style={{ width: `${rate}%` }} />
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>{students.length} Students</span>
                    <span>{recs.length} Total Logs</span>
                  </div>
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => handleExportSectionAttendance(sec)}
                      className="flex-1 px-2.5 py-1.5 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-white dark:bg-slate-900 border border-purple-200 dark:border-purple-800 hover:bg-purple-50 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      Attendance PDF
                    </button>
                    <button
                      onClick={() => handleExportSectionMarksheet(sec, 'Term Assessment Gazette')}
                      className="flex-1 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 rounded-lg flex items-center justify-center gap-1 transition-colors"
                    >
                      <Printer className="w-3 h-3" />
                      Marksheet PDF
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Academic Assessment Comparison */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
            Assessment Results Summary
          </h3>
          <div className="space-y-3">
            {db.tests.map(test => {
              const sec = db.sections.find(s => s.id === test.sectionId);
              const sub = db.subjects.find(s => s.id === test.subjectId);
              const results = db.testResults.filter(r => r.testId === test.id);
              const avgMarks =
                results.length > 0
                  ? Math.round(results.reduce((acc, r) => acc + r.obtainedMarks, 0) / results.length)
                  : 0;

              return (
                <div
                  key={test.id}
                  className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{test.title}</div>
                    <div className="text-slate-400 text-[11px]">
                      Section {sec?.name} · {sub?.name} · Max: {test.totalMarks} Marks
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-right">
                      <div className="font-extrabold text-purple-700 dark:text-purple-400 text-sm">
                        Avg: {avgMarks} / {test.totalMarks}
                      </div>
                      <div className="text-[10px] text-slate-400">{results.length} Students Graded</div>
                    </div>
                    {sec && (
                      <button
                        onClick={() => handleExportSectionMarksheet(sec, test.title)}
                        className="px-3 py-1.5 text-[11px] font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 rounded-lg flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Gazette PDF
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  /* ----------------------------------------------------
   * 7. SCHOOL PROFILE (Edit only)
   * ---------------------------------------------------- */
  if (tab === 'profile') {
    const handleProfileSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      clearAlerts();
      updateSchoolProfile({
        name: schoolName.trim(),
        sindhEmisCode: schoolEmis.trim(),
        address: schoolAddress.trim(),
        principalName: schoolPrincipal.trim() || 'Not provided',
        telephone: schoolPhone.trim() || 'Not provided',
        email: schoolEmail.trim() || 'Not provided',
      });
      setActionSuccess('School profile updated successfully.');
    };

    const handleDownloadProfilePdf = () => {
      const doc = generateSchoolProfilePdf({
        school: db.school,
        totalStudents: db.students.filter(s => s.isActive).length,
        totalTeachers: db.teachers.filter(t => t.isActive).length,
        totalSections: db.sections.length,
      });
      setActivePdf({
        title: 'Official Institutional Profile',
        subtitle: `${db.school.name} (SEMIS: ${db.school.sindhEmisCode})`,
        dataUrl: doc.output('datauristring'),
        fileName: `GGHSS_Gizri_Profile_${db.school.sindhEmisCode}.pdf`,
      });
    };

    return (
      <div className="space-y-6 max-w-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              School Profile &amp; Information
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Official government school credentials and administrative record.
            </p>
          </div>
          <button
            onClick={handleDownloadProfilePdf}
            className="px-4 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 border border-purple-200 dark:border-purple-800 rounded-xl transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Download className="w-4 h-4" />
            Download Profile (PDF)
          </button>
        </div>

        {actionSuccess && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {actionSuccess}
          </div>
        )}

        <form onSubmit={handleProfileSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Official School Name *
            </label>
            <input
              type="text"
              value={schoolName}
              onChange={e => setSchoolName(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                SEMIS Code *
              </label>
              <input
                type="text"
                value={schoolEmis}
                onChange={e => setSchoolEmis(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Telephone (Optional)
              </label>
              <input
                type="text"
                value={schoolPhone}
                onChange={e => setSchoolPhone(e.target.value)}
                placeholder="Not provided"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Principal Name (Optional)
              </label>
              <input
                type="text"
                value={schoolPrincipal}
                onChange={e => setSchoolPrincipal(e.target.value)}
                placeholder="Not provided"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Official Email (Optional)
              </label>
              <input
                type="text"
                value={schoolEmail}
                onChange={e => setSchoolEmail(e.target.value)}
                placeholder="Not provided"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Address *
            </label>
            <input
              type="text"
              value={schoolAddress}
              onChange={e => setSchoolAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              required
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs"
            >
              Update School Profile
            </button>
          </div>
        </form>
      </div>
    );
  }

  return <div>Select an administration section from the sidebar.</div>;
  };

  return (
    <>
      {renderTabContent()}
      <PdfViewerModal
        isOpen={!!activePdf}
        onClose={() => setActivePdf(null)}
        title={activePdf?.title || 'Official Document'}
        subtitle={activePdf?.subtitle}
        pdfDataUrl={activePdf?.dataUrl}
        filename={activePdf?.fileName || 'GGHSS_Gizri_Document.pdf'}
      />
    </>
  );
};
