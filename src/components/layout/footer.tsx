'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  Instagram,
  LogIn,
  UserPlus,
  Briefcase,
  Users,
  PlusCircle,
  Settings,
  Newspaper,
  Info,
  Mail,
  Shield,
  FileText,
  HelpCircle,
  ArrowLeft,
  Landmark,
  Plane,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Footer() {
  const pathname = usePathname();
  const [showMenu, setShowMenu] = useState(false);

  const isAdmin = pathname.startsWith('/admin');
  const isAuth = pathname === '/login' || pathname === '/register';
  const hideFooter = isAdmin || isAuth;

  if (hideFooter) return null;

  return (
    <footer className="border-t bg-background text-muted-foreground mt-10">
      <div className="md:hidden">
        <div className="grid grid-cols-2 gap-4 p-6 text-center text-sm">
          <Link href="/about" className="hover:text-primary">
            <Info className="h-5 w-5 mx-auto mb-1 text-primary" />
            من نحن
          </Link>
          <Link href="/privacy" className="hover:text-primary">
            <Shield className="h-5 w-5 mx-auto mb-1 text-primary" />
            سياسة الخصوصية
          </Link>
          <Link href="/terms" className="hover:text-primary">
            <FileText className="h-5 w-5 mx-auto mb-1 text-primary" />
            الشروط والأحكام
          </Link>
          <Link href="/contact" className="hover:text-primary">
            <Mail className="h-5 w-5 mx-auto mb-1 text-primary" />
            اتصل بنا
          </Link>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">
            <Instagram className="h-5 w-5 mx-auto mb-1 text-primary" />
            تابعنا على إنستغرام
          </a>
        </div>
        <div className="text-center text-xs pb-4 text-muted-foreground">
          © {new Date().getFullYear()} جميع الحقوق محفوظة لمنصة توظيفك
        </div>
      </div>

      <div className="hidden md:block">
        <div className="max-w-6xl mx-auto grid grid-cols-4 gap-8 p-8 text-sm">
          <div>
            <h3 className="font-semibold mb-3 text-foreground">منصة توظيفك</h3>
            <ul className="space-y-2">
              <li><Link href="/about" className="hover:text-primary">من نحن</Link></li>
              <li><Link href="/privacy" className="hover:text-primary">سياسة الخصوصية</Link></li>
              <li><Link href="/terms" className="hover:text-primary">الشروط والأحكام</Link></li>
              <li><Link href="/contact" className="hover:text-primary">اتصل بنا</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-foreground">الأقسام</h3>
            <ul className="space-y-2">
              <li><Link href="/jobs" className="hover:text-primary">جميع الوظائف</Link></li>
              <li><Link href="/category/remote" className="hover:text-primary">عمل عن بُعد</Link></li>
              <li><Link href="/category/international" className="hover:text-primary">فرص بالخارج</Link></li>
              <li><Link href="/category/local" className="hover:text-primary">وظائف محلية</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-foreground">خدمات</h3>
            <ul className="space-y-2">
              <li><Link href="/cv" className="hover:text-primary">إنشاء سيرة ذاتية</Link></li>
              <li><Link href="/blog" className="hover:text-primary">نصائح ومقالات</Link></li>
              <li><Link href="/help" className="hover:text-primary">مركز المساعدة</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3 text-foreground">تابعنا</h3>
            <ul className="space-y-2">
              <li><a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary">تابعنا على إنستغرام</a></li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs pb-6 text-muted-foreground">
          © {new Date().getFullYear()} جميع الحقوق محفوظة لمنصة توظيفك
        </div>
      </div>
    </footer>
  );
}
