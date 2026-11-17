/**
 * MERI SCHOOL DIARY — Weekly Planned Timetable
 * Distinct from My School Day: Displays the planned routine schedule.
 */

import React, { useState } from 'react';
import { Calendar, Clock, BookOpen, Layers } from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';

export const TimetableView: React.FC = () => {
  const { db, currentRole, activeChild, activeStudent } = useSchool();

  const targetStudent = currentRole === 'parent' ? activeChild : activeStudent;
  const initialSectionId = targetStudent?.sectionId || 'sec-6a';
  const [selectedSectionId, setSelectedSectionId] = useState<string>(initialSectionId);

  const days = [
    { num: 1, name: 'Monday' },
    { num: 2, name: 'Tuesday' },
    { num: 3, name: 'Wednesday' },
    { num: 4, name: 'Thursday' },
    { num: 5, name: 'Friday' },
    { num: 6, name: 'Saturday' },
  ];

  const [activeDay, setActiveDay] = useState<number>(3); // Defaults to Wednesday (current demo day)

  const sectionSlots = db.timetableSlots.filter(
    t => t.sectionId === selectedSectionId && t.dayOfWeek === activeDay
  ).sort((a, b) => a.periodNumber - b.periodNumber);

  const currentSection = db.sections.find(s => s.id === selectedSectionId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Weekly Planned Timetable
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              Planned Schedule
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official class routine for Section {currentSection?.name} ({currentSection?.roomNumber}).
            To view what actually occurred, visit <span className="font-semibold text-purple-700 dark:text-purple-400">My School Day</span>.
          </p>
        </div>

        {/* Section Selector */}
        {(currentRole === 'teacher' || currentRole === 'admin') && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-500">Section:</label>
            <select
              value={selectedSectionId}
              onChange={e => setSelectedSectionId(e.target.value)}
              className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-white"
            >
              {db.sections.map(sec => (
                <option key={sec.id} value={sec.id}>
                  Section {sec.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Days Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {days.map(d => (
          <button
            key={d.num}
            onClick={() => setActiveDay(d.num)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeDay === d.num
                ? 'bg-purple-700 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Period Slots Grid / List */}
      <div className="space-y-3">
        {sectionSlots.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm">
            No specific timetable slots defined for this day.
          </div>
        ) : (
          sectionSlots.map(slot => {
            const subject = db.subjects.find(s => s.id === slot.subjectId);
            const teacher = db.teachers.find(t => t.id === slot.teacherId);

            return (
              <div
                key={slot.id}
                className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-purple-200 dark:hover:border-purple-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 flex items-center justify-center font-black text-sm">
                    {slot.periodNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {subject?.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {subject?.code}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Teacher: {teacher?.fullName} ({teacher?.designation})
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-700 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-3 py-1.5 rounded-xl self-start sm:self-auto">
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {slot.startTime} – {slot.endTime}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
