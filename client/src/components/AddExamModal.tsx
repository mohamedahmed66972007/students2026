import React, { useState } from "react";
import { useExams } from "@/hooks/useExams";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { X, Plus, Trash2 } from "lucide-react";
import { subjectOptions, dayOptions } from "./SubjectIcons";
import { Card, CardContent } from "@/components/ui/card";

interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ExamItem {
  day: string;
  subject: string;
  date: string;
  topics: string[];
}

const AddExamModal: React.FC<AddExamModalProps> = ({ isOpen, onClose }) => {
  const [weekTitle, setWeekTitle] = useState("");
  const [day, setDay] = useState("");
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState("");
  const [topics, setTopics] = useState("");
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [weekExists, setWeekExists] = useState(false);
  
  const { addExamWeek, isAdding } = useExams();
  const { toast } = useToast();

  // Add the current exam to the list
  const handleAddExam = () => {
    if (!day || !subject || !date || !topics) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع حقول الاختبار",
        variant: "destructive",
      });
      return;
    }
    
    // Split topics by new lines
    const topicsArray = topics.split("\n").filter(topic => topic.trim());
    
    if (topicsArray.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الدروس المقررة",
        variant: "destructive",
      });
      return;
    }
    
    const newExam = {
      day,
      subject,
      date,
      topics: topicsArray,
    };
    
    setExams([...exams, newExam]);
    
    // Reset exam form fields
    setDay("");
    setSubject("");
    setDate("");
    setTopics("");
    
    toast({
      title: "تم إضافة المادة إلى الأسبوع",
    });
    
    setWeekExists(true);
  };
  
  // Remove an exam from the list
  const handleRemoveExam = (index: number) => {
    const updatedExams = [...exams];
    updatedExams.splice(index, 1);
    setExams(updatedExams);
    
    if (updatedExams.length === 0) {
      setWeekExists(false);
    }
  };
  
  // Submit the new week with all exams
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!weekTitle) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال عنوان الأسبوع",
        variant: "destructive",
      });
      return;
    }
    
    if (exams.length === 0 && (!day || !subject || !date || !topics)) {
      toast({
        title: "خطأ",
        description: "يرجى إضافة اختبار واحد على الأقل",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // If we have current exam data, add it first
      if (day && subject && date && topics) {
        const topicsArray = topics.split("\n").filter(topic => topic.trim());
        
        if (topicsArray.length > 0) {
          const currentExam = {
            day,
            subject,
            date,
            topics: topicsArray,
          };
          setExams([...exams, currentExam]);
        }
      }
      
      // If we have exams in the list after potential addition
      if (exams.length > 0) {
        // Submit the first exam with the week to create the week
        const firstExam = exams[0];
        await addExamWeek({
          weekTitle,
          exam: firstExam,
        });
        
        // Submit all other exams if there are more than one
        for (let i = 1; i < exams.length; i++) {
          await addExamWeek({
            weekTitle,
            exam: exams[i],
          });
        }
        
        toast({
          title: "تم إضافة الاختبارات بنجاح",
        });
        
        // Reset form and close modal
        setWeekTitle("");
        setDay("");
        setSubject("");
        setDate("");
        setTopics("");
        setExams([]);
        setWeekExists(false);
        onClose();
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة الاختبارات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-right">إضافة اختبار للجدول</DialogTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="absolute left-2 top-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="weekTitle">عنوان الأسبوع</Label>
            <Input
              id="weekTitle"
              value={weekTitle}
              onChange={(e) => setWeekTitle(e.target.value)}
              placeholder="مثال: الأسبوع الأول (10 - 14 أكتوبر 2023)"
              required
            />
          </div>
          
          {/* Display already added exams */}
          {exams.length > 0 && (
            <div className="space-y-3 my-4">
              <h4 className="font-semibold text-primary">المواد المضافة للأسبوع</h4>
              {exams.map((exam, index) => (
                <Card key={index} className="relative overflow-hidden border">
                  <Button 
                    variant="destructive" 
                    size="icon" 
                    className="absolute h-6 w-6 top-2 left-2 z-10"
                    onClick={() => handleRemoveExam(index)}
                    type="button"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <CardContent className="p-3 pt-4">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <span className="font-semibold">اليوم:</span> {exam.day}
                      </div>
                      <div>
                        <span className="font-semibold">المادة:</span> {exam.subject}
                      </div>
                      <div>
                        <span className="font-semibold">التاريخ:</span> {exam.date}
                      </div>
                    </div>
                    <div className="mt-2 text-sm">
                      <span className="font-semibold">الدروس:</span>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground">
                        {exam.topics.map((topic, i) => (
                          <li key={i}>{topic}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <Separator className="my-4" />
          
          <h4 className="font-bold">إضافة مادة للأسبوع</h4>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="day">اليوم</Label>
              <Select value={day} onValueChange={setDay}>
                <SelectTrigger id="day">
                  <SelectValue placeholder="اختر اليوم" />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="subject">المادة</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger id="subject">
                  <SelectValue placeholder="اختر المادة" />
                </SelectTrigger>
                <SelectContent>
                  {subjectOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="date">التاريخ</Label>
            <Input
              id="date"
              type="text"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              placeholder="مثال: 10 أكتوبر 2023"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="topics">الدروس المقررة</Label>
            <Textarea
              id="topics"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              rows={3}
              placeholder="أدخل الدروس المقررة (درس واحد في كل سطر)"
            />
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleAddExam}
              className="gap-1"
              disabled={!day || !subject || !date || !topics}
            >
              <Plus className="h-4 w-4" />
              إضافة مادة للأسبوع
            </Button>
          </div>
          
          <DialogFooter className="flex justify-end gap-2 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              إلغاء
            </Button>
            <Button 
              type="submit" 
              disabled={isAdding || (exams.length === 0 && (!day || !subject || !date || !topics))}
            >
              {isAdding ? (
                <>
                  <span className="animate-spin ml-2">◌</span>
                  جاري الإضافة...
                </>
              ) : (
                "حفظ الأسبوع"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddExamModal;