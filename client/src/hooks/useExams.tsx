import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { ExamWeek, Exam, InsertExam, InsertExamWeek } from "@shared/schema";

interface AddExamWeekData {
  weekTitle: string;
  weekId?: number;
  exam: {
    day: string;
    subject: string;
    date: string;
    topics: string[];
  };
}

export const useExams = () => {
  // Fetch exam weeks
  const {
    data: examWeeks,
    isLoading: isLoadingWeeks,
    error: weeksError,
  } = useQuery<ExamWeek[]>({
    queryKey: ["/api/exam-weeks"],
  });

  // Fetch exams
  const {
    data: exams,
    isLoading: isLoadingExams,
    error: examsError,
  } = useQuery<Exam[]>({
    queryKey: ["/api/exams"],
  });

  // Add exam week mutation
  const addExamWeekMutation = useMutation({
    mutationFn: async (data: AddExamWeekData) => {
      // Check if we have a weekId already (adding to existing week)
      let weekId = data.weekId;
      
      if (!weekId) {
        // Create a new exam week
        const examWeekResponse = await apiRequest("POST", "/api/exam-weeks", {
          title: data.weekTitle,
        });
        
        const examWeek: ExamWeek = await examWeekResponse.json();
        weekId = examWeek.id;
      }
      
      // Then add the exam to that week
      await apiRequest("POST", "/api/exams", {
        weekId,
        day: data.exam.day,
        subject: data.exam.subject,
        date: data.exam.date,
        topics: data.exam.topics,
      });
      
      return { id: weekId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exam-weeks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
    },
  });

  // Delete exam mutation
  const deleteExamMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/exams/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
    },
  });

  // Delete exam week mutation
  const deleteExamWeekMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/exam-weeks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/exam-weeks"] });
      queryClient.invalidateQueries({ queryKey: ["/api/exams"] });
    },
  });

  return {
    examWeeks: examWeeks || [],
    exams: exams || [],
    isLoading: isLoadingWeeks || isLoadingExams,
    error: weeksError || examsError,
    isAdding: addExamWeekMutation.isPending,
    addExamWeek: addExamWeekMutation.mutateAsync,
    deleteExam: deleteExamMutation.mutateAsync,
    deleteExamWeek: deleteExamWeekMutation.mutateAsync,
  };
};
