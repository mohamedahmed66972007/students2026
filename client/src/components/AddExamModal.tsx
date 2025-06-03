import React, { useState } from "react";
import { useFirebaseExams } from "@/hooks/useFirebaseExams";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import dayjs from "dayjs";
import "dayjs/locale/ar";
dayjs.locale("ar");
interface AddExamModalProps {
  isOpen: boolean;
  onClose: () => void;
}
const AddExamModal: React.FC<AddExamModalProps> = ({ isOpen, onClose }) => {
  const [subject, setSubject] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [topics, setTopics] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addExam } = useFirebaseExams();
  const { toast } = useToast();
  const subjects = [
    { value: "arabic", label: "اللغة العربية" },
    { value: "english", label: "اللغة الإنجليزية" },
    { value: "math", label: "الرياضيات" },
    { value: "chemistry", label: "الكيمياء" },
    { value: "physics", label: "الفيزياء" },
    { value: "biology", label: "الأحياء" },
    { value: "geology", label: "الجيولوجيا" },
    { value: "constitution", label: "الدستور" },
    { value: "islamic", label: "التربية الإسلامية" },
  ];
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !date || !topics) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول",
        variant: "destructive",
      });
      return;
    }
    const topicsArray = topics.split("\n").filter(topic => topic.trim());
    if (topicsArray.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال الدروس المقررة",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);
    try {
      await addExam({
        subject,
        date: dayjs(date).format("YYYY-MM-DD"),
        topics: topicsArray,
      });
      setSubject("");
      setDate(undefined);
      setTopics("");
      onClose();
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>إضافة امتحان جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">المادة</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="اختر المادة" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj.value} value={subj.value}>
                    {subj.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>تاريخ الامتحان</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? dayjs(date).format("DD/MM/YYYY") : "اختر التاريخ"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topics">الدروس المقررة</Label>
            <Textarea
              id="topics"
              placeholder="اكتب كل درس في سطر منفصل"
              value={topics}
              onChange={(e) => setTopics(e.target.value)}
              rows={5}
            />
          </div>
          <div className="flex justify-end space-x-2 space-x-reverse">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "جاري الحفظ..." : "حفظ"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
export default AddExamModal;
