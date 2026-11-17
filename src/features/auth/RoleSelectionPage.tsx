/**
 * MERI SCHOOL DIARY — Role Selection Portal
 * Allows users to choose between Parent, Student, Teacher, and School Admin portals.
 */

import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Shield,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';

export const RoleSelectionPage: React.FC = () => {
  const { setAuthScreen, db } = useSchool();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const roles: {
    role: UserRole;
    title: string;
    subtitle: string;
    description: string;
    icon: React.ReactNode;
    badge: string;
  }[] = [
    {
      role: 'parent',
      title: 'Parent / Guardian',
      subtitle: 'والد / سرپرست',
      description: 'Track homework, daily period timeline, attendance status, and submit leaves for your children.',
      icon: <Users className="w-6 h-6" />,
      badge: 'Family Portal',
    },
    {
      role: 'student',
      title: 'Student',
      subtitle: 'شاگرد / طالب علم',
      description: 'View daily homework instructions, submit completion notes, check weekly routine, and inspect test scores.',
      icon: <BookOpen className="w-6 h-6" />,
      badge: 'Digital Diary',
    },
    {
      role: 'teacher',
      title: 'Teacher',
      subtitle: 'استاد / معلّم',
      description: 'Mark class attendance, publish period-by-period My School Day logs, assign homework, and review leaves.',
      icon: <GraduationCap className="w-6 h-6" />,
      badge: 'Academic Portal',
    },
    {
      role: 'admin',
      title: 'School Admin',
      subtitle: 'انتظاميه / پرنسپل',
      description: 'Manage class rosters, student admissions, teacher assignments, school calendar, and government circulars.',
      icon: <Shield className="w-6 h-6" />,
      badge: 'Executive Console',
    },
  ];

  const handleSelectRole = (role: UserRole) => {
    setAuthScreen(authMode, role);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
        <button
          onClick={() => setAuthScreen('home')}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-purple-700 dark:hover:text-purple-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-700 text-white flex items-center justify-center font-extrabold text-xs shadow-xs">
            MD
          </div>
          <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
            MERI SCHOOL DIARY
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-5xl mx-auto w-full my-auto">
        <div className="text-center space-y-3 max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Select Your Access Role</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            How will you use Meri School Diary?
          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Choose your profile below to proceed to the dedicated authentication screen.
          </p>

          {/* Login vs Signup Mode Toggle */}
          <div className="inline-flex items-center bg-slate-200/80 dark:bg-slate-800 p-1 rounded-xl border border-slate-300/50 dark:border-slate-700 mt-2">
            <button
              onClick={() => setAuthMode('login')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                authMode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Sign In to Existing Account
            </button>
            <button
              onClick={() => setAuthMode('signup')}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                authMode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Create New Account
            </button>
          </div>
        </div>

        {/* 4 Role Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {roles.map(r => (
            <div
              key={r.role}
              onClick={() => handleSelectRole(r.role)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-600 dark:hover:border-purple-500 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group space-y-5"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center group-hover:bg-purple-700 group-hover:text-white transition-colors shadow-xs">
                    {r.icon}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {r.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors">
                    {r.title}
                  </h3>
                  <div className="text-[11px] font-medium text-purple-600 dark:text-purple-400">{r.subtitle}</div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                    {r.description}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-bold text-purple-700 dark:text-purple-300">
                <span>{authMode === 'login' ? `Login as ${r.title}` : `Sign Up as ${r.title}`}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        {db.school.name}, {db.school.address} · SEMIS {db.school.sindhEmisCode}
      </footer>
    </div>
  );
};
