import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  NavigationTab,
  UserProfile,
  Course,
  GameType,
  GameResultRecord,
  QuizResultRecord,
  ScheduleItem,
  Student,
  Teacher,
  Announcement,
  Quiz,
} from '../types';
import {
  initialUserProfile,
  initialCourses,
  initialQuizzes,
  weeklySchedule,
  initialStudents,
  initialTeachers,
  initialAnnouncements,
} from '../data/initialData';
import {
  generateSecurePassword,
  calculatePasswordStrength,
  generateStudentUsername,
  generateStudentIdCode,
} from '../utils/security';

interface SettingsState {
  theme: 'light' | 'dark';
  language: 'uz' | 'ru' | 'en';
  emailNotifications: boolean;
  pushNotifications: boolean;
  lessonReminders: boolean;
}

interface LmsContextType {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  selectedCourseId: string | null;
  selectedGameId: GameType | null;
  selectedQuizId: string | null;
  
  // Navigation helpers
  navigateToCourse: (courseId: string) => void;
  navigateToGame: (gameId: GameType) => void;
  navigateToQuiz: (quizId: string) => void;
  navigateBack: () => void;
  
  // Data State
  userProfile: UserProfile;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  courses: Course[];
  toggleLessonCompletion: (courseId: string, lessonId: string) => void;
  submitCourseAssignment: (courseId: string, assignmentId: string) => void;
  
  quizzes: Quiz[];
  schedule: ScheduleItem[];
  addScheduleItem: (item: Omit<ScheduleItem, 'id'>) => void;
  
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'points' | 'averageScore' | 'enrolledCourses' | 'username' | 'studentIdCode'> & { username?: string; password?: string }) => void;
  resetStudentPassword: (studentId: string, customPass?: string) => string;
  updateStudentCredentials: (studentId: string, updates: Partial<Student>) => void;
  toggleStudentAccountLock: (studentId: string) => void;
  toggleStudent2FA: (studentId: string) => void;
  loginAsStudent: (student: Student) => void;
  teachers: Teacher[];
  
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  
  // Results
  gameResults: GameResultRecord[];
  addGameResult: (result: GameResultRecord) => void;
  quizResults: QuizResultRecord[];
  addQuizResult: (result: QuizResultRecord) => void;
  
  // Settings
  settings: SettingsState;
  updateSettings: (updates: Partial<SettingsState>) => void;
  toggleTheme: () => void;

  // Notification Toast
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const LmsContext = createContext<LmsContextType | undefined>(undefined);

export const LmsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [historyStack, setHistoryStack] = useState<NavigationTab[]>(['dashboard']);
  
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>('course-1');
  const [selectedGameId, setSelectedGameId] = useState<GameType | null>('quiz_battle');
  const [selectedQuizId, setSelectedQuizId] = useState<string | null>('quiz-1');

  // User profile
  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('ziyo_user_profile');
    return saved ? JSON.parse(saved) : initialUserProfile;
  });

  // Courses
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('ziyo_courses');
    return saved ? JSON.parse(saved) : initialCourses;
  });

  // Quizzes
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('ziyo_quizzes');
    return saved ? JSON.parse(saved) : initialQuizzes;
  });

  // Schedule
  const [schedule, setSchedule] = useState<ScheduleItem[]>(() => {
    const saved = localStorage.getItem('ziyo_schedule');
    return saved ? JSON.parse(saved) : weeklySchedule;
  });

  // Students & Teachers
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('ziyo_students');
    return saved ? JSON.parse(saved) : initialStudents;
  });
  const [teachers] = useState<Teacher[]>(initialTeachers);

  // Announcements
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('ziyo_announcements');
    return saved ? JSON.parse(saved) : initialAnnouncements;
  });

  // Game Results History
  const [gameResults, setGameResults] = useState<GameResultRecord[]>(() => {
    const saved = localStorage.getItem('ziyo_game_results');
    return saved
      ? JSON.parse(saved)
      : [
          {
            gameId: 'quiz_battle',
            gameTitle: 'Bilimlar bellashuvi',
            score: 90,
            correctAnswers: 9,
            wrongAnswers: 1,
            percent: 90,
            date: 'Kecha, 18:20',
            timeSpentSeconds: 120,
          },
          {
            gameId: 'math_challenge',
            gameTitle: 'Matematik o‘yin',
            score: 100,
            correctAnswers: 10,
            wrongAnswers: 0,
            percent: 100,
            date: '2 kun oldin',
            timeSpentSeconds: 95,
          },
        ];
  });

  // Quiz Results History
  const [quizResults, setQuizResults] = useState<QuizResultRecord[]>(() => {
    const saved = localStorage.getItem('ziyo_quiz_results');
    return saved
      ? JSON.parse(saved)
      : [
          {
            quizId: 'quiz-1',
            quizTitle: 'React 19 va Zamonaviy Frontend Standartlari',
            subject: 'Web Dasturlash',
            score: 80,
            total: 100,
            percent: 80,
            passed: true,
            date: '3 kun oldin',
            timeSpentSeconds: 480,
          },
        ];
  });

  // Settings
  const [settings, setSettings] = useState<SettingsState>(() => {
    const saved = localStorage.getItem('ziyo_settings');
    return saved
      ? JSON.parse(saved)
      : {
          theme: 'light',
          language: 'uz',
          emailNotifications: true,
          pushNotifications: true,
          lessonReminders: true,
        };
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('ziyo_user_profile', JSON.stringify(userProfile));
  }, [userProfile]);

  useEffect(() => {
    localStorage.setItem('ziyo_courses', JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem('ziyo_quizzes', JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem('ziyo_schedule', JSON.stringify(schedule));
  }, [schedule]);

  useEffect(() => {
    localStorage.setItem('ziyo_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('ziyo_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('ziyo_game_results', JSON.stringify(gameResults));
  }, [gameResults]);

  useEffect(() => {
    localStorage.setItem('ziyo_quiz_results', JSON.stringify(quizResults));
  }, [quizResults]);

  useEffect(() => {
    localStorage.setItem('ziyo_settings', JSON.stringify(settings));
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSetActiveTab = (tab: NavigationTab) => {
    setHistoryStack((prev) => [...prev, tab]);
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToCourse = (courseId: string) => {
    setSelectedCourseId(courseId);
    handleSetActiveTab('course-detail');
  };

  const navigateToGame = (gameId: GameType) => {
    setSelectedGameId(gameId);
    handleSetActiveTab('game-play');
  };

  const navigateToQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    handleSetActiveTab('quiz-play');
  };

  const navigateBack = () => {
    if (historyStack.length > 1) {
      const newStack = [...historyStack];
      newStack.pop();
      const prevTab = newStack[newStack.length - 1];
      setHistoryStack(newStack);
      setActiveTab(prevTab);
    } else {
      setActiveTab('dashboard');
    }
  };

  const updateUserProfile = (updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
    showToast('Profil ma\'lumotlari muvaffaqiyatli yangilandi!');
  };

  const toggleLessonCompletion = (courseId: string, lessonId: string) => {
    setCourses((prevCourses) =>
      prevCourses.map((c) => {
        if (c.id !== courseId) return c;
        const updatedLessons = c.lessons.map((l) =>
          l.id === lessonId ? { ...l, isCompleted: !l.isCompleted } : l
        );
        const completedCount = updatedLessons.filter((l) => l.isCompleted).length;
        const newProgress = Math.round((completedCount / updatedLessons.length) * 100);
        return {
          ...c,
          lessons: updatedLessons,
          progressPercent: newProgress,
          isCompleted: newProgress === 100,
        };
      })
    );
    showToast('Dars holati yangilandi!');
  };

  const submitCourseAssignment = (courseId: string, assignmentId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id !== courseId) return c;
        return {
          ...c,
          assignments: c.assignments.map((a) =>
            a.id === assignmentId
              ? {
                  ...a,
                  submitted: true,
                  grade: 'Kutilmoqda (Tekshiruvda)',
                  feedback: 'Topshirig\'ingiz o\'qituvchiga muvaffaqiyatli yuborildi.',
                }
              : a
          ),
        };
      })
    );
    showToast('Topshiriq tekshiruv uchun muvaffaqiyatli yuborildi!');
  };

  const addScheduleItem = (item: Omit<ScheduleItem, 'id'>) => {
    const newItem: ScheduleItem = {
      ...item,
      id: `sch-${Date.now()}`,
    };
    setSchedule((prev) => [...prev, newItem]);
    showToast('Yangi dars jadvalga kiritildi!');
  };

  const addStudent = (
    studentData: Omit<Student, 'id' | 'points' | 'averageScore' | 'enrolledCourses' | 'username' | 'studentIdCode'> & {
      username?: string;
      password?: string;
    }
  ) => {
    const generatedUsername = studentData.username?.trim() || generateStudentUsername(studentData.fullName, students.length + 1);
    const generatedPassword = studentData.password?.trim() || generateSecurePassword(12);
    const strength = calculatePasswordStrength(generatedPassword).label;

    const newStudent: Student = {
      ...studentData,
      id: `st-${Date.now()}`,
      username: generatedUsername,
      studentIdCode: generateStudentIdCode(students.length + 1),
      password: generatedPassword,
      passwordStrength: strength,
      points: 1000,
      averageScore: 85,
      enrolledCourses: 3,
      status: 'Faol',
      lastLogin: 'Hozirgina qo\'shildi',
      twoFactorEnabled: true,
      isAccountLocked: false,
    };
    setStudents((prev) => [newStudent, ...prev]);
    showToast(`O'quvchi qo'shildi! Login: ${generatedUsername}`);
  };

  const resetStudentPassword = (studentId: string, customPass?: string): string => {
    const newPass = customPass?.trim() || generateSecurePassword(12);
    const strength = calculatePasswordStrength(newPass).label;

    setStudents((prev) =>
      prev.map((st) =>
        st.id === studentId
          ? {
              ...st,
              password: newPass,
              passwordStrength: strength,
            }
          : st
      )
    );
    showToast(`Yangi xavfsiz parol o'rnatildi: ${newPass}`);
    return newPass;
  };

  const updateStudentCredentials = (studentId: string, updates: Partial<Student>) => {
    setStudents((prev) =>
      prev.map((st) => (st.id === studentId ? { ...st, ...updates } : st))
    );
    showToast('O‘quvchi ma\'lumotlari yangilandi!');
  };

  const toggleStudentAccountLock = (studentId: string) => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id === studentId) {
          const nextState = !st.isAccountLocked;
          showToast(nextState ? 'O‘quvchi hisobi vaqtincha bloklandi!' : 'O‘quvchi hisobi faollashtirildi!');
          return { ...st, isAccountLocked: nextState };
        }
        return st;
      })
    );
  };

  const toggleStudent2FA = (studentId: string) => {
    setStudents((prev) =>
      prev.map((st) => {
        if (st.id === studentId) {
          const nextState = !st.twoFactorEnabled;
          showToast(nextState ? '2FA (Ikki bosqichli himoya) yoqildi!' : '2FA o‘chirildi!');
          return { ...st, twoFactorEnabled: nextState };
        }
        return st;
      })
    );
  };

  const loginAsStudent = (student: Student) => {
    const now = new Date();
    const timeStr = `Bugun, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Update student's last login
    setStudents((prev) =>
      prev.map((st) => (st.id === student.id ? { ...st, lastLogin: timeStr } : st))
    );

    const parts = student.fullName.split(' ');
    setUserProfile({
      id: student.id,
      firstName: parts[0] || student.fullName,
      lastName: parts.slice(1).join(' ') || '',
      email: student.email,
      phone: student.phone,
      role: `O'quvchi / ${student.group}`,
      avatar: student.avatar,
      grade: `${student.group} guruhi talabasi`,
      school: 'Raqamli Texnologiyalar Akademiyasi',
      bio: `${student.fullName} — ZiyoLMS platformasining faol o'quvchisi.`,
      totalPoints: student.points,
      completedCoursesCount: 2,
      inProgressCoursesCount: student.enrolledCourses,
      level: 'Faol O\'quvchi',
      rank: 4,
    });

    handleSetActiveTab('dashboard');
    showToast(`${student.fullName} hisobiga muvaffaqiyatli kirildi!`);
  };

  const addAnnouncement = (item: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      ...item,
      id: `ann-${Date.now()}`,
      date: 'Hozirgina',
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
    showToast('Yangi e\'lon chop etildi!');
  };

  const addGameResult = (result: GameResultRecord) => {
    setGameResults((prev) => [result, ...prev]);
    // update user score
    setUserProfile((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + result.score,
    }));
  };

  const addQuizResult = (result: QuizResultRecord) => {
    setQuizResults((prev) => [result, ...prev]);
    setUserProfile((prev) => ({
      ...prev,
      totalPoints: prev.totalPoints + result.score,
    }));
  };

  const updateSettings = (updates: Partial<SettingsState>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
    showToast('Sozlamalar saqlandi!');
  };

  const toggleTheme = () => {
    setSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light',
    }));
  };

  return (
    <LmsContext.Provider
      value={{
        activeTab,
        setActiveTab: handleSetActiveTab,
        selectedCourseId,
        selectedGameId,
        selectedQuizId,
        navigateToCourse,
        navigateToGame,
        navigateToQuiz,
        navigateBack,
        userProfile,
        updateUserProfile,
        courses,
        toggleLessonCompletion,
        submitCourseAssignment,
        quizzes,
        schedule,
        addScheduleItem,
        students,
        addStudent,
        resetStudentPassword,
        updateStudentCredentials,
        toggleStudentAccountLock,
        toggleStudent2FA,
        loginAsStudent,
        teachers,
        announcements,
        addAnnouncement,
        gameResults,
        addGameResult,
        quizResults,
        addQuizResult,
        settings,
        updateSettings,
        toggleTheme,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </LmsContext.Provider>
  );
};

export const useLms = () => {
  const context = useContext(LmsContext);
  if (!context) {
    throw new Error('useLms must be used within an LmsProvider');
  }
  return context;
};
