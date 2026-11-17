import React, { useState } from 'react';
import {
  Sun,
  Moon,
  RotateCcw,
  Users,
  GraduationCap,
  BookOpen,
  Shield,
  Menu,
  ChevronDown,
  LogOut,
  User,
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { ResetDemoModal } from '../common/ResetDemoModal';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    currentRole,
    theme,
    toggleTheme,
    parentChildren,
    activeChildId,
    setActiveChildId,
    db,
    authSession,
    logout,
  } = useSchool();

  const [isResetOpen, setIsResetOpen] = useState(false);
  const [isIdentityDropdownOpen, setIsIdentityDropdownOpen] = useState(false);

  const roleMeta = {
    parent: {
      label: 'Parent Portal',
      icon: <Users className="w-3.5 h-3.5" />,
      color: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
    },
    teacher: {
      label: 'Teacher Portal',
      icon: <GraduationCap className="w-3.5 h-3.5" />,
      color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300',
    },
    student: {
      label: 'Student Diary',
      icon: <BookOpen className="w-3.5 h-3.5" />,
      color: 'bg-violet-100 text-violet-800 dark:bg-violet-950/60 dark:text-violet-300',
    },
    admin: {
      label: 'Admin Console',
      icon: <Shield className="w-3.5 h-3.5" />,
      color: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    },
  }[currentRole];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                aria-label="Toggle navigation"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center gap-2.5">
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
          </div>

          {/* Zone 2: Role Identity & Contextual Child Switcher */}
          <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
            {/* Active Role Tag */}
            <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${roleMeta.color} border border-purple-200/50 dark:border-purple-800/50 whitespace-nowrap`}>
              {roleMeta.icon}
              <span>{roleMeta.label}</span>
              {authSession?.userName && (
                <span className="font-normal text-slate-600 dark:text-slate-300">
                  · {authSession.userName.split(' ')[0]}
                </span>
              )}
            </div>

            {/* Child Switcher for Parents */}
            {currentRole === 'parent' && parentChildren.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsIdentityDropdownOpen(!isIdentityDropdownOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-200 hover:bg-purple-100 transition-colors whitespace-nowrap"
                  title="Switch Child Profile"
                >
                  <span className="text-slate-500 dark:text-purple-300 text-[11px]">Child:</span>
                  <span className="font-semibold">
                    {db.students.find(s => s.id === activeChildId)?.fullName || 'Select Child'}
                  </span>
                  <span className="text-purple-600 dark:text-purple-400 font-mono text-[10px]">
                    ({db.sections.find(sec => sec.id === db.students.find(s => s.id === activeChildId)?.sectionId)?.name})
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </button>

                {isIdentityDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg py-1.5 z-50">
                    <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Active Child
                    </div>
                    {parentChildren.map(child => {
                      const section = db.sections.find(s => s.id === child.sectionId);
                      return (
                        <button
                          key={child.id}
                          onClick={() => {
                            setActiveChildId(child.id);
                            setIsIdentityDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800 ${
                            child.id === activeChildId
                              ? 'bg-purple-50/70 dark:bg-purple-950/40 font-semibold text-purple-700 dark:text-purple-300'
                              : 'text-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <div>
                            <div>{child.fullName}</div>
                            <div className="text-[10px] text-slate-400">Roll #{child.rollNumber} · {child.admissionNumber}</div>
                          </div>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                            {section?.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Zone 3: Actions (Theme Toggle, Reset Demo Data, and Logout) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsResetOpen(true)}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title="Reset Demo Data"
              aria-label="Reset Demo Data"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Prominent Logout Button */}
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors"
              title="Logout to Home Screen"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <ResetDemoModal isOpen={isResetOpen} onClose={() => setIsResetOpen(false)} />
    </>
  );
};
