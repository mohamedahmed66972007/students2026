
import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import dayjs from 'dayjs';

export interface FirebaseExam {
  id: string;
  subject: string;
  date: string;
  day: string;
  topics: string[];
  createdAt: any;
}

export const useFirebaseExams = () => {
  const [exams, setExams] = useState<FirebaseExam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const examsRef = collection(db, 'exams');
    const q = query(examsRef, orderBy('date', 'asc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const examsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirebaseExam[];
        setExams(examsData);
        setIsLoading(false);
        setError(null);
      },
      (error) => {
        console.error('Error fetching exams:', error);
        setError('حدث خطأ في تحميل البيانات');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const addExam = async (examData: {
    subject: string;
    date: string;
    topics: string[];
  }) => {
    try {
      const examDate = dayjs(examData.date);
      await addDoc(collection(db, 'exams'), {
        subject: examData.subject,
        date: examData.date,
        day: examDate.format('dddd'),
        topics: examData.topics,
        createdAt: new Date()
      });

      toast({
        title: "تم إضافة الامتحان",
        description: "تم إضافة الامتحان بنجاح",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error adding exam:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الامتحان",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    }
  };

  const deleteExam = async (examId: string) => {
    try {
      await deleteDoc(doc(db, 'exams', examId));
      toast({
        title: "تم حذف الامتحان",
        description: "تم حذف الامتحان بنجاح",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الامتحان",
        variant: "destructive",
        duration: 3000,
      });
      throw error;
    }
  };

  return {
    exams,
    isLoading,
    error,
    addExam,
    deleteExam
  };
};
