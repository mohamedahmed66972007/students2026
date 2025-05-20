import React from "react";
import { Mail, Phone } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow-inner mt-auto py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-gray-600 dark:text-gray-300">
              جميع الحقوق محفوظة لصالح محمد أحمد 🙂
            </p>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center text-gray-600 dark:text-gray-300 mb-1">
              <span className="ml-2">للتواصل:</span>
              <Phone className="h-4 w-4 ml-1" />
              <span dir="ltr">+96566162173</span>
            </div>
            <div className="flex items-center text-gray-600 dark:text-gray-300">
              <span className="ml-2">البريد الإلكتروني:</span>
              <Mail className="h-4 w-4 ml-1" />
              <span>mohamedahmed66972007@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
