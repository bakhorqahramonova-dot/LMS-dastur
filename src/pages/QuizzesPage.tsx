import React, { useState } from 'react';
import {
  FileCheck2,
  Clock,
  HelpCircle,
  Play,
  Award,
  Search,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { useLms } from '../context/LmsContext';

export const QuizzesPage: React.FC = () => {
  const { quizzes, navigateToQuiz, quizResults } = useLms();
  const [selectedSubject, setSelectedSubject] = useState<string>('Barchasi');
  const [searchQuery, setSearchQuery] = useState('');

  const subjects = ['Barchasi', 'Web Dasturlash', 'Sun\'iy Intellekt', 'Kiberxavfsizlik'];

  const filteredQuizzes = quizzes.filter((q) => {
    const matchesSubject = selectedSubject === 'Barchasi' || q.subject === selectedSubject;
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesSearch;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            📝 Bilimni Sinash Testlari
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Mavzular bo'yicha mustaqil nazorat testlarini topshiring va o'zlashtirish darajangizni aniqlang
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
            Topshirilgan: {quizResults.length} marta
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setSelectedSubject(sub)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                selectedSubject === sub
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/25'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {sub}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Test nomini qidirish..."
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white outline-hidden focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Quizzes List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => (
          <div
            key={quiz.id}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between p-6 space-y-5"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  {quiz.subject}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  {quiz.difficulty}
                </span>
              </div>

              {/* Test Nomi */}
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                {quiz.title}
              </h3>

              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                {quiz.description}
              </p>
            </div>

            <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Savollar soni */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Savollar:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {quiz.questionsCount} ta
                    </span>
                  </div>
                </div>

                {/* Vaqt */}
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="text-[10px] text-slate-400 block">Vaqt:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {quiz.timeLimitMinutes} daqiqa
                    </span>
                  </div>
                </div>
              </div>

              {/* Boshlash tugmasi */}
              <button
                onClick={() => navigateToQuiz(quiz.id)}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Testni boshlash</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
