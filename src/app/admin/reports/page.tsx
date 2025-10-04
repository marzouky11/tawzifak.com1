
'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { MobilePageHeader } from '@/components/layout/mobile-page-header';
import { DesktopPageHeader } from '@/components/layout/desktop-page-header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Loader2, Flag, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { getReports, deleteReport } from '@/lib/data';
import type { Report } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { format } from 'date-fns';

export default function AdminReportsPage() {
  const { userData, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  useEffect(() => {
    if (!authLoading && !userData?.isAdmin) {
      router.push('/');
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    if (userData?.isAdmin) {
      const fetchReports = async () => {
        setLoading(true);
        try {
          const allReports = await getReports();
          setReports(allReports);
        } catch (error) {
          toast({ variant: 'destructive', title: 'فشل تحميل البلاغات' });
        } finally {
          setLoading(false);
        }
      };
      fetchReports();
    }
  }, [userData, toast]);

  const handleDelete = async () => {
    if (!reportToDelete) return;
    try {
        await deleteReport(reportToDelete.id);
        setReports(prev => prev.filter(r => r.id !== reportToDelete.id));
        toast({ title: "تم حذف البلاغ بنجاح" });
    } catch (error) {
        toast({ variant: 'destructive', title: 'فشل حذف البلاغ' });
    } finally {
        setReportToDelete(null);
    }
  };
  
  const formatDate = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return 'غير معروف';
    return format(timestamp.toDate(), 'yyyy/MM/dd, h:mm a');
  };

  if (authLoading || loading) {
    return (
        <div className="flex h-full items-center justify-center p-8 min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  return (
    <>
      <MobilePageHeader title="إدارة البلاغات">
        <Flag className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={Flag}
        title="إدارة البلاغات"
        description="مراجعة وحذف بلاغات المستخدمين حول الإعلانات المخالفة."
      />
      <div className="container mx-auto max-w-4xl px-4 pb-8 space-y-8">
         {reports.length > 0 ? (
            reports.map((report) => (
              <Card key={report.id}>
                  <CardHeader>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                          <div>
                              <CardTitle>بلاغ حول إعلان</CardTitle>
                              <CardDescription className="pt-1">
                                  <Link href={report.adUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                     {`عرض الإعلان (ID: ${report.adId})`}
                                  </Link>
                              </CardDescription>
                          </div>
                          <Badge variant="secondary" className="shrink-0">{formatDate(report.createdAt)}</Badge>
                      </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                      <p><strong>السبب:</strong> {report.reason}</p>
                      {report.details && <p className="whitespace-pre-wrap"><strong>التفاصيل:</strong> {report.details}</p>}
                  </CardContent>
                   <CardFooter className="border-t pt-4">
                      <Button
                          variant="destructive"
                          className="w-full active:scale-95 transition-transform"
                          onClick={() => setReportToDelete(report)}
                      >
                          <Trash2 className="ml-2 h-4 w-4" />
                          حذف البلاغ
                      </Button>
                   </CardFooter>
              </Card>
            ))
         ) : (
            <div className="text-center text-muted-foreground py-10">
                <p>لا توجد بلاغات لعرضها.</p>
            </div>
         )}
      </div>

       <AlertDialog open={!!reportToDelete} onOpenChange={(open) => !open && setReportToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا البلاغ؟</AlertDialogTitle>
            <AlertDialogDescription>
                هذا الإجراء سيقوم بحذف البلاغ بشكل نهائي. لا يمكن التراجع عن هذا القرار.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setReportToDelete(null)} className="active:scale-95 transition-transform">إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground active:scale-95 transition-transform">تأكيد الحذف</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
