import React, { useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ExamWeek as ExamWeekType, Exam } from "@shared/schema";
import { SubjectIcon, getSubjectName } from "./SubjectIcons";
import { Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useExams } from "@/hooks/useExams";
import { useToast } from "@/hooks/use-toast";
import AddExamSubjectModal from "./AddExamSubjectModal";

interface ExamWeekProps {
  week: ExamWeekType;
  exams: Exam[];
}

const ExamWeek: React.FC<ExamWeekProps> = ({ week, exams }) => {
  const [isOpen, setIsOpen] = useState(week.id === 1); // Open first week by default
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const { isAdmin } = useAuth();
  const { deleteExam, deleteExamWeek } = useExams();
  const { toast } = useToast();

  const handleDeleteExam = async (id: number) => {
    try {
      await deleteExam(id);
      toast({
        title: "تم حذف الاختبار",
        description: "تم حذف الاختبار بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الاختبار",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWeek = async () => {
    try {
      await deleteExamWeek(week.id);
      toast({
        title: "تم حذف الأسبوع",
        description: "تم حذف أسبوع الاختبارات بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف أسبوع الاختبارات",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Accordion
        type="single"
        collapsible
        value={isOpen ? `week-${week.id}` : ""}
        onValueChange={(val) => setIsOpen(val === `week-${week.id}`)}
      >
        <AccordionItem value={`week-${week.id}`} className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden border-none">
          <div className="flex justify-between items-center px-6 py-4">
            <AccordionTrigger className="text-lg font-bold hover:no-underline flex-1 text-right">
              {week.title}
            </AccordionTrigger>
            
            {isAdmin && (
              <div className="flex items-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowAddSubjectModal(true);
                  }}
                  className="mr-2 text-primary hover:text-primary-dark flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" />
                  <span>إضافة مادة</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteWeek();
                  }}
                  className="mr-2 text-red-500 hover:text-red-700 hover:bg-red-100"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <AccordionContent>
            <div className="border-t border-gray-200 dark:border-gray-700">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">اليوم</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">المادة</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">التاريخ</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">الدروس المقررة</th>
                      {isAdmin && (
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">إجراءات</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {exams.length > 0 ? (
                      exams.map((exam) => (
                        <tr key={exam.id}>
                          <td className="px-6 py-4 whitespace-nowrap">{exam.day}</td>
                          <td className="px-6 py-4 whitespace-nowrap flex items-center">
                            <SubjectIcon subject={exam.subject as any} className="ml-2" />
                            {getSubjectName(exam.subject as any)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{exam.date}</td>
                          <td className="px-6 py-4">
                            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300">
                              {exam.topics.map((topic, index) => (
                                <li key={index}>{topic}</li>
                              ))}
                            </ul>
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteExam(exam.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          )}
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={isAdmin ? 5 : 4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                          لا توجد اختبارات لهذا الأسبوع
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      {showAddSubjectModal && (
        <AddExamSubjectModal
          isOpen={showAddSubjectModal}
          onClose={() => setShowAddSubjectModal(false)}
          weekId={week.id}
          weekTitle={week.title}
        />
      )}
    </>
  );
};

export default ExamWeek;