
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useFirebaseExams } from "@/hooks/useFirebaseExams";
import ExamList from "@/components/ExamWeek";
import AddExamModal from "@/components/AddExamModal";
import { Button } from "@/components/ui/button";
import { PlusIcon, Download, Grid3X3, Table } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SubjectIcon, getSubjectLightColor, getSubjectName } from "@/components/SubjectIcons";
import dayjs from "dayjs";
import html2pdf from "html2pdf.js";

const Exams: React.FC = () => {
  const { isAdmin } = useAuth();
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const { exams, isLoading, error, deleteExam } = useFirebaseExams();
  const { toast } = useToast();
  const [tableUpdateTrigger, setTableUpdateTrigger] = useState(0);

  // حذف الاختبارات المنتهية تلقائياً
  useEffect(() => {
    if (exams && exams.length > 0) {
      const now = dayjs();
      const expiredExams = exams.filter(exam => {
        const examDate = dayjs(exam.date).hour(3).minute(0);
        return examDate.isBefore(now);
      });
      
      expiredExams.forEach(exam => {
        deleteExam(exam.id);
      });
    }
  }, [exams, deleteExam]);

  // تحديث الوقت المتبقي كل ثانية في عرض الجدول
  useEffect(() => {
    if (viewMode === 'table') {
      const interval = setInterval(() => {
        setTableUpdateTrigger(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [viewMode]);

  const getSubjectNameLocal = (subject: string) => {
    const subjects: Record<string, string> = {
      arabic: "اللغة العربية",
      english: "اللغة الإنجليزية", 
      math: "الرياضيات",
      chemistry: "الكيمياء",
      physics: "الفيزياء",
      biology: "الأحياء",
      geology: "الجيولوجيا",
      constitution: "الدستور",
      islamic: "التربية الإسلامية"
    };
    return subjects[subject] || subject;
  };

  const exportToPDF = async () => {
    if (!exams || exams.length === 0) {
      toast({
        title: "لا يوجد جدول",
        description: "لا توجد امتحانات لتصديرها",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      const container = document.createElement("div");
      container.style.direction = "rtl";
      container.style.fontFamily = "'Cairo', 'Arial', sans-serif";
      container.style.padding = "20px";
      container.style.backgroundColor = "#ffffff";
      container.style.color = "#000000";

      const themeStyles = `
        <style>
          * {
            font-family: 'Cairo', 'Arial', sans-serif;
            line-height: 1.4;
          }
          .main-table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0 30px 0;
            border: 1px solid #e5e7eb;
          }
          .table-header {
            background-color: #f9fafb;
            font-weight: 500;
            padding: 8px 6px;
            border: 1px solid #e5e7eb;
            text-align: center;
            font-size: 14px;
          }
          .table-cell {
            padding: 8px 6px;
            border: 1px solid #e5e7eb;
            vertical-align: top;
            text-align: center;
          }
          .subject-name {
            font-size: 14px;
            margin-bottom: 5px;
          }
          .lessons-list {
            font-size: 13px;
          }
          .lesson-item {
            margin: 2px 0;
            padding: 2px 0;
          }
        </style>
      `;

      let htmlContent = themeStyles;

      const sortedExams = [...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      if (sortedExams.length > 0) {
        htmlContent += `
          <table class="main-table">
            <thead>
              <tr>
                <th class="table-header" style="width: 15%;">اليوم</th>
                <th class="table-header" style="width: 20%;">التاريخ</th>
                <th class="table-header" style="width: 25%;">المادة</th>
                <th class="table-header" style="width: 40%;">الدروس المقررة</th>
              </tr>
            </thead>
            <tbody>
        `;
        
        sortedExams.forEach(exam => {
          htmlContent += `
            <tr>
              <td class="table-cell">
                ${exam.day}
              </td>
              <td class="table-cell">
                ${dayjs(exam.date).format("DD/MM/YYYY")}
              </td>
              <td class="table-cell">
                <div class="subject-name">
                  ${getSubjectNameLocal(exam.subject)}
                </div>
              </td>
              <td class="table-cell">
                <div class="lessons-list">
                  ${exam.topics.map(topic => `
                    <div class="lesson-item">
                      <span style="color: #000000;">●</span> ${topic}
                    </div>
                  `).join('')}
                </div>
              </td>
            </tr>
          `;
        });
        
        htmlContent += `
            </tbody>
          </table>
        `;
      }

      container.innerHTML = htmlContent;

      const options = {
        margin: [15, 15, 15, 15],
        filename: `جدول_الامتحانات_${dayjs().format("YYYY-MM-DD")}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff"
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait'
        }
      };

      await html2pdf().from(container).set(options).save();
      
      toast({
        title: "تم تصدير الجدول",
        description: "تم تصدير جدول الامتحانات بصيغة PDF بنجاح",
        duration: 3000,
      });

    } catch (error) {
      console.error("PDF generation error:", error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير جدول الامتحانات",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const TableView = () => (
    <div className="w-full" style={{ direction: 'rtl' }}>
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm min-w-[800px]">
          <thead>
            <tr className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 border-b-2 border-blue-200 dark:border-gray-600">
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-800 dark:text-gray-100 min-w-[120px] uppercase tracking-wider">التاريخ</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-800 dark:text-gray-100 min-w-[140px] uppercase tracking-wider">المادة</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-800 dark:text-gray-100 min-w-[130px] uppercase tracking-wider">الوقت المتبقي</th>
              <th className="px-4 py-3 text-right text-xs font-bold text-gray-800 dark:text-gray-100 min-w-[200px] uppercase tracking-wider">الدروس المقررة</th>
              {isAdmin && <th className="px-4 py-3 text-center text-xs font-bold text-gray-800 dark:text-gray-100 min-w-[80px] uppercase tracking-wider">الإجراءات</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-600">
            {[...exams].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((exam, index) => {
              // إضافة trigger للتحديث
              tableUpdateTrigger;
              const examDate = dayjs(exam.date).hour(3).minute(0);
              const now = dayjs();
              const diffDays = examDate.diff(now, 'day');
              const diffHours = examDate.diff(now, 'hour') % 24;
              const diffMinutes = examDate.diff(now, 'minute') % 60;
              
              let remainingTime = '';
              let remainingTimeColor = '';
              
              const diffSeconds = examDate.diff(now, 'second') % 60;
              
              if (examDate.isBefore(now)) {
                remainingTime = "انتهى";
                remainingTimeColor = "text-red-600 dark:text-red-400 font-bold";
              } else if (diffDays > 7) {
                remainingTime = `${diffDays} يوماً`;
                remainingTimeColor = "text-green-600 dark:text-green-400 font-medium";
              } else if (diffDays > 3) {
                remainingTime = `${diffDays} أيام`;
                remainingTimeColor = "text-yellow-600 dark:text-yellow-400 font-medium";
              } else if (diffDays >= 1) {
                remainingTime = `${diffDays} يوم ${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
                remainingTimeColor = "text-orange-600 dark:text-orange-400 font-semibold";
              } else {
                remainingTime = `${diffHours.toString().padStart(2, '0')}:${diffMinutes.toString().padStart(2, '0')}:${diffSeconds.toString().padStart(2, '0')}`;
                if (diffHours > 0) {
                  remainingTimeColor = "text-red-600 dark:text-red-400 font-bold";
                } else if (diffMinutes > 0) {
                  remainingTimeColor = "text-red-700 dark:text-red-300 font-bold animate-pulse";
                } else {
                  remainingTimeColor = "text-red-800 dark:text-red-200 font-bold animate-pulse";
                }
              }

              return (
                <tr key={exam.id || `exam-${exam.subject}-${exam.date}-${index}`} className="hover:bg-blue-50 dark:hover:bg-gray-800 transition-all duration-200 border-b border-gray-100 dark:border-gray-700">
                  <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <div className="font-medium">{examDate.format("DD/MM/YYYY")}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{examDate.format("dddd")}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${getSubjectLightColor(exam.subject as any)}`}>
                        <SubjectIcon subject={exam.subject as any} size={18} />
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {getSubjectNameLocal(exam.subject)}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-semibold ${remainingTimeColor}`}>
                      {remainingTime}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      {exam.topics.map((topic, topicIndex) => (
                        <div key={topicIndex} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{topic}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deleteExam(exam.id)}
                        className="text-xs px-2 py-1"
                      >
                        حذف
                      </Button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">جدول الاختبارات</h2>

        <div className="flex gap-2">
          <Button onClick={exportToPDF} variant="outline">
            <Download className="h-4 w-4 ml-2" />
            تصدير PDF
          </Button>
          
          <div className="flex border rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="rounded-none border-none"
            >
              <Grid3X3 className="h-4 w-4 ml-2" />
              <span className="hidden sm:inline">بطاقات</span>
            </Button>
            <Button
              variant={viewMode === 'table' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="rounded-none border-none"
            >
              <Table className="h-4 w-4 ml-2" />
              <span className="hidden sm:inline">جدول</span>
            </Button>
          </div>

          {isAdmin && (
            <Button 
              onClick={() => setShowAddExamModal(true)} 
              className="flex items-center space-x-1 space-x-reverse"
            >
              <PlusIcon className="h-4 w-4 ml-2" />
              <span>إضافة اختبار</span>
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-4">جاري تحميل جدول الاختبارات...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-destructive">
          <p>حدث خطأ أثناء تحميل جدول الاختبارات. يرجى المحاولة مرة أخرى.</p>
        </div>
      ) : exams && exams.length > 0 ? (
        viewMode === 'table' ? (
          <TableView />
        ) : (
          <ExamList 
            exams={exams.map(exam => ({
              id: exam.id,
              subject: exam.subject,
              date: exam.date,
              day: exam.day,
              topics: exam.topics,
              weekId: 1
            }))}
            onDelete={(id: number | string) => {
              const examToDelete = exams.find(e => e.id === id || e.id === id.toString());
              if (examToDelete) {
                deleteExam(examToDelete.id);
              }
            }}
          />
        )
      ) : (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">لا توجد اختبارات متاحة حالياً</p>
          {isAdmin && (
            <Button onClick={() => setShowAddExamModal(true)} variant="outline" className="mt-4">
              إضافة اختبار
            </Button>
          )}
        </div>
      )}

      <AddExamModal 
        isOpen={showAddExamModal} 
        onClose={() => setShowAddExamModal(false)} 
      />
    </div>
  );
};

export default Exams;
