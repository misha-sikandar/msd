/**
 * MERI SCHOOL DIARY — Role-Specific Login Page
 * Individual login interfaces for Parent, Student, Teacher, and School Admin.
 */

import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  BookOpen,
  Shield,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { UserRole } from '../../types';

export const RoleLoginPage: React.FC = () => {
  const { selectedAuthRole, setAuthScreen, login, db } = useSchool();
  const role: UserRole = selectedAuthRole || 'parent';

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('demo123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotSubmitted, setForgotSubmitted] = useState(false);

  // Role metadata configurations
  const roleConfig = {
    parent: {
      title: 'Parent / Guardian Portal',
      subtitle: 'والد / سرپرست لاگ ان',
      idLabel: 'Registered Mobile Number or Email',
      idPlaceholder: '0300-9281726 or tariq@example.com',
      icon: <Users className="w-6 h-6" />,
      demoId: '0300-9281726',
      demoName: 'Tariq Mehmood (Father of Bilal & Hamza)',
      badge: 'Parent Access',
    },
    student: {
      title: 'Student Digital Diary',
      subtitle: 'شاگرد لاگ ان',
      idLabel: 'Student Admission Number (GR) or Student ID',
      idPlaceholder: 'e.g. GR-2026-601 or Bilal Tariq',
      icon: <BookOpen className="w-6 h-6" />,
      demoId: 'GR-2026-601',
      demoName: 'Bilal Tariq (Class 6-A, Roll #1)',
      badge: 'Student Diary',
    },
    teacher: {
      title: 'Teacher Academic Console',
      subtitle: 'استاد لاگ ان',
      idLabel: 'Teacher ID, Mobile or Official Email',
      idPlaceholder: '0301-3829104 or abdulqadir.brohi@sindhedu.gov.pk',
      icon: <GraduationCap className="w-6 h-6" />,
      demoId: '0301-3829104',
      demoName: 'Sir Abdul Qadir Brohi (SSS Mathematics)',
      badge: 'Faculty Portal',
    },
    admin: {
      title: 'School Administration Portal',
      subtitle: 'انتظاميه لاگ ان',
      idLabel: 'Admin ID or Official Email',
      idPlaceholder: 'admin@gghss-gizri.edu.pk or admin',
      icon: <Shield className="w-6 h-6" />,
      demoId: 'admin',
      demoName: 'School Administrator (Incharge)',
      badge: 'Executive Admin',
    },
  }[role];

  const handleFillDemo = () => {
    setIdentifier(roleConfig.demoId);
    setPassword('demo123');
    setError('');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(`Please enter your ${roleConfig.idLabel}.`);
      return;
    }
    if (!password.trim()) {
      setError('Please enter your password.');
      return;
    }

    // Authenticate demo session and route directly into role dashboard
    login(role, identifier.trim(), password);
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
          onClick={() => setAuthScreen('home')}
          className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline"
        >
          Return to Home Page
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-md mx-auto w-full my-auto">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm w-full space-y-6">
          {/* Role Header */}
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

          {/* Quick Demo Helper Pill */}
          <div className="p-3 bg-purple-50/70 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/60 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-purple-900 dark:text-purple-300 block text-[11px]">
                Demo Preset Available:
              </span>
              <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                {roleConfig.demoName}
              </span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="px-2.5 py-1 text-xs font-bold bg-purple-700 hover:bg-purple-800 text-white rounded-lg transition-colors shadow-2xs whitespace-nowrap"
            >
              1-Click Fill
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {roleConfig.idLabel} *
              </label>
              <input
                type="text"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder={roleConfig.idPlaceholder}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-600"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  Password *
                </label>
                <button
                  type="button"
                  onClick={() => setIsForgotOpen(true)}
                  className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-purple-600 pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-extrabold text-white bg-purple-700 hover:bg-purple-800 rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 mt-2"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In to {roleConfig.badge}</span>
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center pt-2 text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800">
            <span>New to Meri School Diary? </span>
            <button
              onClick={() => setAuthScreen('signup', role)}
              className="font-bold text-purple-700 dark:text-purple-400 hover:underline"
            >
              Create an account
            </button>
          </div>
        </div>
      </main>

      {/* Forgot Password Demo Modal */}
      {isForgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <button
              onClick={() => {
                setIsForgotOpen(false);
                setForgotSubmitted(false);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Password Recovery (Demo)
            </h3>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              In production, password reset SMS/verification codes are dispatched to registered mobile numbers
              verified by the school administration.
            </p>

            {forgotSubmitted ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-200 text-xs rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Reset instructions dispatched! Use demo password: "demo123".</span>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter registered mobile or ID..."
                  defaultValue={identifier || roleConfig.demoId}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setForgotSubmitted(true)}
                  className="w-full py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 rounded-xl"
                >
                  Send Recovery Verification
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
