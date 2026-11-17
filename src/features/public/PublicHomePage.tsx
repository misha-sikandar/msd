/**
 * MERI SCHOOL DIARY — Public Landing Page
 * Professional initial screen for parents, students, teachers, and school administrators in Sindh.
 */

import React from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Shield,
  Clock,
  CalendarCheck,
  BookMarked,
  Award,
  Bell,
  CheckCircle2,
  ArrowRight,
  Sun,
  Moon,
  School,
  MapPin,
  Phone,
  Mail,
  Sparkles,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';

export const PublicHomePage: React.FC = () => {
  const { setAuthScreen, theme, toggleTheme, db } = useSchool();

  const handleRoleSelect = (role: UserRole, mode: 'login' | 'signup') => {
    setAuthScreen(mode, role);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* 1. Public Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-purple-700 text-white flex items-center justify-center font-extrabold text-base shadow-sm">
              MD
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
                MERI SCHOOL DIARY
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-purple-700 dark:text-purple-400 font-medium whitespace-nowrap">
                سنڌ اسڪول ڊائري
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-600 dark:text-slate-300">
            <a href="#home" className="hover:text-purple-700 dark:hover:text-purple-400 transition-colors">
              Home
            </a>
            <a href="#roles" className="hover:text-purple-700 dark:hover:text-purple-400 transition-colors">
              Portals &amp; Roles
            </a>
            <a href="#features" className="hover:text-purple-700 dark:hover:text-purple-400 transition-colors">
              Features
            </a>
            <a href="#about" className="hover:text-purple-700 dark:hover:text-purple-400 transition-colors">
              About
            </a>
            <a href="#contact" className="hover:text-purple-700 dark:hover:text-purple-400 transition-colors">
              Contact
            </a>
          </nav>

          {/* Actions: Theme Toggle + Login / Get Started */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setAuthScreen('role_select')}
              className="px-3.5 py-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 rounded-xl transition-colors whitespace-nowrap"
            >
              Login
            </button>

            <button
              onClick={() => setAuthScreen('role_select')}
              className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs whitespace-nowrap flex items-center gap-1.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section id="home" className="relative pt-12 pb-20 sm:pt-20 sm:pb-28 overflow-hidden">
        {/* Subtle background radial glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-300/20 dark:bg-purple-900/20 blur-3xl pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-100 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/60 text-purple-800 dark:text-purple-300 text-xs font-bold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Sindh Digital Education &amp; School Diary Initiative</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight">
            Centralized Digital Diary for Sindh Schools &amp; Colleges
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Replacing lost paper diaries and scattered registers with one unified, offline-friendly platform.
            Parents track daily classroom progress, students submit homework, teachers log period activities,
            and school administrators manage official records.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setAuthScreen('role_select')}
              className="px-6 py-3 text-sm font-extrabold text-white bg-purple-700 hover:bg-purple-800 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center gap-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => setAuthScreen('role_select')}
              className="px-6 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl transition-all shadow-xs"
            >
              Login to Diary
            </button>
          </div>

          {/* Trust points */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
              <span className="text-xl font-black text-purple-700 dark:text-purple-400 tabular-nums">4</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Dedicated Roles</span>
              <span className="text-[11px] text-slate-400">Parent, Student, Teacher, Admin</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400">100%</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Offline First</span>
              <span className="text-[11px] text-slate-400">Local persistent storage</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
              <span className="text-xl font-black text-purple-700 dark:text-purple-400">Flagship</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">My School Day</span>
              <span className="text-[11px] text-slate-400">Period-by-period daily log</span>
            </div>

            <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
              <span className="text-xl font-black text-slate-900 dark:text-white">Gizri</span>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">Official School</span>
              <span className="text-[11px] text-slate-400">SEMIS {db.school.sindhEmisCode}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. User Roles Section */}
      <section id="roles" className="py-16 bg-white dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              Role-Specific Experiences
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Four Connected Portals, One Common Goal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Each user enters a strictly scoped dashboard equipped with tools tailored to their educational responsibilities.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Role 1: Parent */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shadow-xs">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Parent / Guardian
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Monitor multiple children with 1-click switching. View daily attendance, assigned homework,
                    teacher feedback, and submit online leave applications.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <button
                  onClick={() => handleRoleSelect('parent', 'login')}
                  className="w-full py-2 px-3 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs"
                >
                  Login as Parent
                </button>
                <button
                  onClick={() => handleRoleSelect('parent', 'signup')}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Create Parent Account
                </button>
              </div>
            </div>

            {/* Role 2: Student */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shadow-xs">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Student Diary
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Personalized digital notebook. Check daily homework tasks, submit completion notes, review
                    actual syllabus coverage, and inspect published test marks.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <button
                  onClick={() => handleRoleSelect('student', 'login')}
                  className="w-full py-2 px-3 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs"
                >
                  Login as Student
                </button>
                <button
                  onClick={() => handleRoleSelect('student', 'signup')}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Register as Student
                </button>
              </div>
            </div>

            {/* Role 3: Teacher */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shadow-xs">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Teacher Academic
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Mark class attendance in seconds, publish My School Day period updates with substitute tags,
                    assign homework, evaluate submissions, and review leave requests.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <button
                  onClick={() => handleRoleSelect('teacher', 'login')}
                  className="w-full py-2 px-3 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs"
                >
                  Login as Teacher
                </button>
                <button
                  onClick={() => handleRoleSelect('teacher', 'signup')}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Join Faculty Portal
                </button>
              </div>
            </div>

            {/* Role 4: Admin */}
            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-5 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shadow-xs">
                  <Shield className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    School Admin
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    Total school control: manage students directory, teacher postings, curriculum subjects,
                    school calendar holidays, official circulars, and analytics reports.
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <button
                  onClick={() => handleRoleSelect('admin', 'login')}
                  className="w-full py-2 px-3 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-colors shadow-xs"
                >
                  Login as Admin
                </button>
                <button
                  onClick={() => handleRoleSelect('admin', 'signup')}
                  className="w-full py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Register Administrator
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Flagship & Core Features */}
      <section id="features" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
            System Highlights
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Built for Real-World Classrooms
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Engineered specifically to solve communication gaps and record management challenges in Sindh.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              My School Day — Actual Timeline
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Unlike a static timetable, My School Day captures what actually took place period-by-period:
              chapters covered, teacher notes, substitute teacher tags, and End-of-Day reports.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Instant Attendance Register
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Teachers mark daily attendance with Present, Absent, Late, and Leave statuses. Approved leaves
              automatically sync into daily attendance records, eliminating register discrepancies.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <BookMarked className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Homework &amp; Classwork Diary
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Teachers assign exercises with due dates. Students submit notes upon completion, and teachers
              check and return qualitative feedback and evaluation remarks.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Assessments &amp; Report Cards
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Schedule chapter tests and term assessments. Enter student marks with validation, calculate
              percentages, and provide parents with subject-wise progress tracking.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <Bell className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Official Circulars &amp; Holidays
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Broadcast urgent notifications, winter timing changes, and government holiday circulars (such as
              Iqbal Day and Sindh Culture Day) instantly to all parents and teachers.
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Low-Bandwidth &amp; Offline First
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
              Engineered with lightweight web performance and zero data loss. All school records survive
              page reloads and local interruptions without requiring external cloud accounts.
            </p>
          </div>
        </div>
      </section>

      {/* 5. About Section */}
      <section id="about" className="py-16 bg-white dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
              About Meri School Diary
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Designed for Sindh's Public Education Network
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
              In many schools across Sindh, physical paper registers and handwritten diaries get misplaced,
              damaged, or left behind by students. Parents often have no window into what occurred in the classroom
              until end-of-term parent-teacher meetings. MERI SCHOOL DIARY creates transparency, fosters accountability,
              and connects teachers directly with families.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Standardized Curriculum</div>
              <p className="text-[11px] text-slate-500">Supports Sindhi, Urdu, English, Mathematics, Science, Islamiat, Social Studies &amp; Computer Education.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Multi-Child Family Scope</div>
              <p className="text-[11px] text-slate-500">Parents with children across different grades switch between profiles with 1 tap.</p>
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1">
              <div className="text-xs font-bold text-slate-900 dark:text-white">Government Post Alignment</div>
              <p className="text-[11px] text-slate-500">Built to mirror Sindh Education designations: SSS, HST, EST, JST, and PST faculty assignments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Contact & School Information Section */}
      <section id="contact" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
            Official Sindh Institution
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            {db.school.name}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Official operational deployment for {db.school.district || 'District South, Karachi'}, {db.school.province || 'Sindh'}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 mx-auto flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Campus Location</div>
            <p className="text-xs text-slate-500 leading-relaxed">
              {db.school.address}
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 mx-auto flex items-center justify-center">
              <Phone className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">Administration Telephone</div>
            <p className="text-xs text-slate-500 font-mono">
              {db.school.telephone && db.school.telephone !== 'Not provided' ? db.school.telephone : 'Not provided'}
            </p>
          </div>

          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-center space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 mx-auto flex items-center justify-center">
              <School className="w-5 h-5" />
            </div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">SEMIS Code</div>
            <p className="text-xs text-slate-500 font-mono">
              {db.school.sindhEmisCode} · Karachi
            </p>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900 dark:text-white">MERI SCHOOL DIARY</span>
            <span>·</span>
            <span>سنڌ اسڪول ڊائري</span>
            <span>·</span>
            <span>© 2026 Government of Sindh Pilot</span>
          </div>

          <div className="flex items-center gap-4 font-medium">
            <button
              onClick={() => setAuthScreen('role_select')}
              className="hover:text-purple-700 dark:hover:text-purple-400"
            >
              Role Selection
            </button>
            <a href="#about" className="hover:text-purple-700 dark:hover:text-purple-400">
              About Model
            </a>
            <a href="#contact" className="hover:text-purple-700 dark:hover:text-purple-400">
              Contact School
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};
