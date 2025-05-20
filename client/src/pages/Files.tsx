import React, { useState } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useAuth } from "@/hooks/useAuth";
import FileCard from "@/components/FileCard";
import AddFileModal from "@/components/AddFileModal";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusIcon } from "lucide-react";
import { Subject } from "@/components/SubjectIcons";
import { subjectOptions, semesterOptions } from "@/components/SubjectIcons";

const Files: React.FC = () => {
  const { isAdmin } = useAuth();
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [subjectFilter, setSubjectFilter] = useState<string>("");
  const [semesterFilter, setSemesterFilter] = useState<string>("");
  
  const { files, isLoading, error } = useFiles({
    subject: subjectFilter as Subject,
    semester: semesterFilter
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">الملفات الدراسية</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filter Controls */}
          <div className="flex flex-wrap gap-2">
            <Select value={subjectFilter} onValueChange={setSubjectFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="جميع المواد" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المواد</SelectItem>
                {subjectOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="جميع الفصول" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفصول</SelectItem>
                {semesterOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Add File Button */}
          {isAdmin && (
            <Button onClick={() => setShowAddFileModal(true)} className="flex items-center space-x-1 space-x-reverse">
              <PlusIcon className="h-4 w-4 ml-2" />
              <span>إضافة ملف جديد</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Files Grid */}
      {isLoading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-r-transparent"></div>
          <p className="mt-4">جاري تحميل الملفات...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-destructive">
          <p>حدث خطأ أثناء تحميل الملفات. يرجى المحاولة مرة أخرى.</p>
        </div>
      ) : files && files.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {files.map((file) => (
            <FileCard key={file.id} file={file} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-gray-500 dark:text-gray-400">لا توجد ملفات متاحة حالياً</p>
          {isAdmin && (
            <Button onClick={() => setShowAddFileModal(true)} variant="outline" className="mt-4">
              إضافة ملف جديد
            </Button>
          )}
        </div>
      )}
      
      {/* Add File Modal */}
      <AddFileModal 
        isOpen={showAddFileModal} 
        onClose={() => setShowAddFileModal(false)} 
      />
    </div>
  );
};

export default Files;
