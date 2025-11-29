
'use client';

import React from 'react';
import Link from 'next/link';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/context/auth-context';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, LogOut, ChevronLeft, Loader2, Settings as SettingsIcon, Newspaper, HelpCircle, Info, Mail, Shield, FileText, Instagram, UserPlus, LogIn as LogInIcon, MessageSquare, Bookmark, Flag, PlusCircle } from 'lucide-react';
import { UserAvatar } from '@/components/user-avatar';
import { useToast } from '@/hooks/use-toast';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { ThemeToggleSwitch } from '@/components/theme-toggle';

const SettingItem = ({ icon: Icon, label, action, href }: { icon: React.ElementType, label: string, action?: React.ReactNode, href?: string }) => {
  const content = (
      <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors w-full">
          <div className="flex items-center gap-4">
              <Icon className="h-5 w-5 text-primary" />
              <span className="font-medium">{label}</span>
          </div>
          {action ? action : (href ? <ChevronLeft className="h-5 w-5 text-muted-foreground" /> : null)}
      </div>
  );
  return (
      <li className="flex items-center w-full">
          {href ? <Link href={href} target={href.startsWith('http') ? '_blank' : '_self'} rel={href.startsWith('http') ? 'noopener noreferrer' : ''} className="w-full">{content}</Link> : content}
      </li>
  )
};

const commonLinks = (
  <Card>
    <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            روابط ومعلومات
        </CardTitle>
    </CardHeader>
    <CardContent className="p-0">
      <ul className="divide-y divide-border">
         <SettingItem
            icon={Newspaper}
            label="مقالات"
            href="/articles"
        />
        <SettingItem
            icon={Info}
            label="من نحن"
            href="/about"
        />
        <SettingItem
            icon={Mail}
            label="اتصل بنا"
            href="/contact"
        />
        <SettingItem
            icon={Shield}
            label="سياسة الخصوصية"
            href="/privacy"
        />
        <SettingItem
            icon={FileText}
            label="شروط الاستخدام"
            href="/terms"
        />
        <SettingItem
            icon={Instagram}
            label="تابعنا على إنستغرام"
            href="https://www.instagram.com/tawzifak_officiel?igsh=N2MyajAwa3U3YmI2"
        />
      </ul>
    </CardContent>
  </Card>
);

function LoggedInView({ userData, onLogout }: { userData: any, onLogout: () => void }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardContent className="p-4 flex items-center gap-4">
                    <UserAvatar name={userData.name} color={userData.avatarColor} photoURL={userData.photoURL} className="h-16 w-16 text-2xl shadow-inner" />
                    <div>
                        <h2 className="text-xl font-bold">{userData.name || 'مستخدم'}</h2>
                        <p className="text-sm text-muted-foreground">{userData.email}</p>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5" />
                        إعدادات الحساب
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y divide-border">
                        <SettingItem icon={User} label="تعديل الملف الشخصي" href="/profile/edit" />
                        <SettingItem icon={Bookmark} label="الإعلانات المحفوظة" href="/profile/saved-ads" />
                        <SettingItem icon={PlusCircle} label="نشر إعلان جديد" href="/post-job/select-type" />
                        {!userData?.isAdmin && <SettingItem icon={FileText} label="إعلاناتي" href="/profile/my-ads" />}
                        <SettingItem icon={MessageSquare} label="أضف رأيك" href="/add-testimonial" />
                        <li className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <SettingsIcon className="h-5 w-5 text-primary" />
                                <span className="font-medium">الوضع الليلي</span>
                            </div>
                            <ThemeToggleSwitch id="dark-mode" />
                        </li>
                    </ul>
                </CardContent>
            </Card>
            
            {userData?.isAdmin && (
               <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <Shield className="h-5 w-5" />
                        لوحة التحكم (مشرف)
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y divide-border">
                        <SettingItem icon={FileText} label="إدارة الإعلانات" href="/profile/my-ads" />
                        <SettingItem icon={Newspaper} label="إدارة المقالات" href="/admin/articles" />
                        <SettingItem icon={User} label="إدارة المستخدمين" href="/admin/users" />
                        <SettingItem icon={MessageSquare} label="إدارة الآراء" href="/admin/testimonials" />
                        <SettingItem icon={Flag} label="إدارة البلاغات" href="/admin/reports" />
                        <SettingItem icon={Mail} label="رسائل التواصل" href="/admin/contacts" />
                    </ul>
                </CardContent>
            </Card>
            )}

            <div className="block md:hidden">
              {commonLinks}
            </div>
            
            <Card>
                <CardContent className="p-4">
                    <Button variant="destructive" className="w-full active:scale-95 transition-transform" onClick={onLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        تسجيل الخروج
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

function LoggedOutView() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="text-center">
                    <CardTitle>أهلاً بك في توظيفك!</CardTitle>
                    <CardDescription>سجّل دخولك أو أنشئ حسابًا جديدًا لإدارة إعلاناتك وملفك الشخصي.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col sm:flex-row gap-4 p-4">
                    <Button asChild size="lg" className="flex-1 py-6 active:scale-95 transition-transform">
                        <Link href="/login">
                            <LogInIcon className="mr-2 h-4 w-4" />
                            تسجيل الدخول
                        </Link>
                    </Button>
                    <Button asChild size="lg" variant="outline" className="flex-1 py-6 active:scale-95 transition-transform">
                        <Link href="/signup">
                            <UserPlus className="mr-2 h-4 w-4" />
                            إنشاء حساب
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <SettingsIcon className="h-5 w-5" />
                        إعدادات عامة
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <ul className="divide-y divide-border">
                        <li className="flex items-center justify-between p-4">
                            <div className="flex items-center gap-4">
                                <SettingsIcon className="h-5 w-5 text-primary" />
                                <span className="font-medium">الوضع الليلي</span>
                            </div>
                            <ThemeToggleSwitch id="dark-mode-guest" />
                        </li>
                    </ul>
                </CardContent>
            </Card>
            {commonLinks}
        </div>
    );
}

export default function SettingsPage() {
  const { toast } = useToast();
  const { user, userData, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'تم تسجيل الخروج بنجاح.' });
    } catch (error) {
      toast({ variant: 'destructive', title: 'حدث خطأ أثناء تسجيل الخروج.' });
    }
  };
  
  return (
    <>
      <MobilePageHeader title="الإعدادات">
        <SettingsIcon className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={SettingsIcon}
        title="الإعدادات والملف الشخصي"
        description="تحكم في حسابك، عدّل معلوماتك، واستكشف روابط ومعلومات مهمة."
      />
      <div className="flex-grow">
          <div className="container mx-auto max-w-3xl px-4 pb-8">
            {loading ? (
                <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : user && userData ? (
                <LoggedInView userData={userData} onLogout={handleLogout} />
            ) : (
                <LoggedOutView />
            )}
          </div>
      </div>
    </>
  );
}
