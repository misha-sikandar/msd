/**
 * MERI SCHOOL DIARY — Role-Specific Registration Page
 * Individual sign-up interfaces for Parent, Student, Teacher, and School Admin.
 */

import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Shield,
  ArrowLeft,
  UserPlus,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';

export const RoleSignUpPage: React.FC = () => {
  const { selectedAuthRole, setAuthScreen, signup, db } = useSchool();
  const role: UserRole = selectedAuthRole || 'parent';

  // Common fields
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  // Parent specific
  const [parentContact, setParentContact] = useState('');
  const [childAdmissionId, setChildAdmissionId] = useState('GR-2026-601');

  // Student specific
  const [studentId, setStudentId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('cls-6');
  const [selectedSectionId, setSelectedSectionId] = useState('sec-6a');
  const [rollNumber, setRollNumber] = useState('11');
  const [fatherName, setFatherName] = useState('');

  // Teacher specific
  const [teacherId, setTeacherId] = useState('');
  const [teacherContact, setTeacherContact] = useState('');
  const [designation, setDesignation] = useState('High School Teacher (HST)');

  // Admin specific
  const [adminId, setAdminId] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [schoolName, setSchoolName] = useState(db.school.name);

  // Role metadata configurations
  const roleConfig = {
    parent: {
      title: 'Register as Parent / Guardian',
      subtitle: 'والد / سرپرست کاتو ٺاهيو',
      icon: <Users className="w-6 h-6" />,
      badge: 'Parent Registration',
    },
    student: {
      title: 'Student Enrollment Sign-Up',
      subtitle: 'شاگرد رجسٽريشن',
      icon: <BookOpen className="w-6 h-6" />,
      badge: 'Student Registration',
    },
    teacher: {
      title: 'Faculty Portal Onboarding',
      subtitle: 'استاد کاتو ٺاهيو',
      icon: <GraduationCap className="w-6 h-6" />,
      badge: 'Teacher Registration',
    },
    admin: {
      title: 'Administrator Onboarding',
      subtitle: 'انتظاميه رجسٽريشن',
      icon: <Shield className="w-6 h-6" />,
      badge: 'Admin Registration',
    },
  }[role];

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!fullName.trim()) {
      setError('Please provide your full legal name.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      return;
    }

    // Role-specific payload assembly
    let payload: any = { fullName: fullName.trim(), password };

    if (role === 'parent') {
      if (!parentContact.trim()) {
        setError('Please enter your mobile phone or email.');
        return;
      }
      payload = {
        ...payload,
        phone: parentContact.trim(),
        childAdmissionId: childAdmissionId.trim(),
      };
    } else if (role === 'student') {
      if (!studentId.trim()) {
        setError('Please enter your student ID or GR Number.');
        return;
      }
      payload = {
        ...payload,
        studentId: studentId.trim(),
        classId: selectedClassId,
        sectionId: selectedSectionId,
        rollNumber: Number(rollNumber) || 12,
        fatherName: fatherName.trim() || 'Parent',
      };
    } else if (role === 'teacher') {
      if (!teacherId.trim() || !teacherContact.trim()) {
        setError('Please enter your Teacher ID and contact phone/email.');
        return;
      }
      payload = {
        ...payload,
        teacherId: teacherId.trim(),
        phone: teacherContact.trim(),
        designation,
      };
    } else if (role === 'admin') {
      if (!adminId.trim() || !adminEmail.trim()) {
        setError('Please enter your Admin ID and official email address.');
        return;
      }
      payload = {
        ...payload,
        adminId: adminId.trim(),
        email: adminEmail.trim(),
        schoolName: schoolName.trim(),
      };
    }

    // Register demo profile and onboard directly into dashboard
    signup(role, payload);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
        <button
          onClick={() => setAuthScreen('role_select')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Change Role</span>
        </button>

        <button
          onClick={() => setAuthScreen('login', role)}
          className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline"
        >
          Already have an account? Sign In
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-lg mx-auto w-full my-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm w-full space-y-6">
          {/* Header */}
          <div className="space-y-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center mx-auto shadow-xs">
              {roleConfig.icon}
            </div>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                {roleConfig.badge}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
                {roleConfig.title}
              </h1>
              <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                {roleConfig.subtitle}
              </p>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Registration Form */}
          <form onSubmit={handleSignUpSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Full Legal Name *
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="e.g. Tariq Mehmood"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            {/* PARENT SPECIFIC FIELDS */}
            {role === 'parent' && (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Phone or Email *
                  </label>
                  <input
                    type="text"
                    value={parentContact}
                    onChange={e => setParentContact(e.target.value)}
                    placeholder="0300-9281726 or tariq@example.com"
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Student Admission ID / Linked Child *
                  </label>
                  <select
                    value={childAdmissionId}
                    onChange={e => setChildAdmissionId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="GR-2026-601">Bilal Tariq (Section 6-A, GR-2026-601)</option>
                    <option value="GR-2025-701">Hamza Tariq (Section 7-A, GR-2025-701)</option>
                    <option value="new_child">+ Link other enrolled student admission</option>
                  </select>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Connects your parent account to your child's digital school records.
                  </p>
                </div>
              </>
            )}

            {/* STUDENT SPECIFIC FIELDS */}
            {role === 'student' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Student ID (GR #) *
                    </label>
                    <input
                      type="text"
                      value={studentId}
                      onChange={e => setStudentId(e.target.value)}
                      placeholder="e.g. GR-2026-612"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Father / Guardian Name
                    </label>
                    <input
                      type="text"
                      value={fatherName}
                      onChange={e => setFatherName(e.target.value)}
                      placeholder="e.g. Tariq Mehmood"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Class *
                    </label>
                    <select
                      value={selectedClassId}
                      onChange={e => setSelectedClassId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {db.classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Section *
                    </label>
                    <select
                      value={selectedSectionId}
                      onChange={e => setSelectedSectionId(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      {db.sections.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Roll # *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={rollNumber}
                      onChange={e => setRollNumber(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* TEACHER SPECIFIC FIELDS */}
            {role === 'teacher' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Teacher ID / Employee # *
                    </label>
                    <input
                      type="text"
                      value={teacherId}
                      onChange={e => setTeacherId(e.target.value)}
                      placeholder="e.g. TCH-4080-07"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Phone Contact or Email *
                    </label>
                    <input
                      type="text"
                      value={teacherContact}
                      onChange={e => setTeacherContact(e.target.value)}
                      placeholder="0301-3829104"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Designation Post *
                  </label>
                  <select
                    value={designation}
                    onChange={e => setDesignation(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="Senior Subject Specialist (SSS)">Senior Subject Specialist (SSS) - BPS 18</option>
                    <option value="High School Teacher (HST)">High School Teacher (HST) - BPS 16</option>
                    <option value="Elementary School Teacher (EST)">Elementary School Teacher (EST) - BPS 15</option>
                    <option value="Junior Science Teacher (JST)">Junior Science Teacher (JST) - BPS 14</option>
                  </select>
                </div>
              </>
            )}

            {/* ADMIN SPECIFIC FIELDS */}
            {role === 'admin' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Admin ID *
                    </label>
                    <input
                      type="text"
                      value={adminId}
                      onChange={e => setAdminId(e.target.value)}
                      placeholder="e.g. ADM-GZR-01"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={e => setAdminEmail(e.target.value)}
                      placeholder="principal@school.edu.pk"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    School Name *
                  </label>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={e => setSchoolName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white pr-9"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-type password"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-extrabold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Create Account &amp; Access Dashboard</span>
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
            <span>Already have an account? </span>
            <button
              onClick={() => setAuthScreen('login', role)}
              className="font-bold text-purple-700 dark:text-purple-400 hover:underline"
            >
              Sign In
            </button>
          </div>
        </div>
      </main>

      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        {db.school.name} · SEMIS {db.school.sindhEmisCode} · Demo Registration · MERI SCHOOL DIARY V1
      </footer>
    </div>
  );
};
