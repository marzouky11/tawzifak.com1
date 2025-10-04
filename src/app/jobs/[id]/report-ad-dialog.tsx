'use client';

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Flag, Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { addReport } from '@/lib/data';

const reportReasons = [
  'إعلان احتيالي أو مضلل',
  'محتوى غير لائق',
  'إعلان مكرر',
  'معلومات اتصال خاطئة',
  'سبب آخر',
] as const;

const reportSchema = z.object({
  reason: z.enum(reportReasons, { 
    required_error: 'الرجاء اختيار سبب الإبلاغ.' 
  }),
  details: z.string().optional(),
});

interface ReportAdDialogProps {
  adId: string;
}

export function ReportAdDialog({ adId }: ReportAdDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<z.infer<typeof reportSchema>>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      details: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof reportSchema>) => {
    setIsSubmitting(true);
    try {
      await addReport({
        adId,
        adUrl: window.location.href,
        reason: data.reason,
        details: data.details,
      });

      toast({
        title: 'تم إرسال البلاغ بنجاح',
        description: 'شكرًا لك. سيقوم فريقنا بمراجعة البلاغ واتخاذ الإجراء المناسب.',
      });

      setIsOpen(false);
      form.reset();

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'فشل إرسال البلاغ',
        description: 'حدث خطأ ما. يرجى المحاولة مرة أخرى.',
      });
    } finally {
      setIsSubmitting(false);
      formRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.blur();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        form.reset();
      }
    }}>
      <AlertDialogTrigger asChild>
        <Button variant="link" className="text-destructive hover:text-destructive/80 w-fit mx-auto p-0 h-auto">
          <Flag className="ml-2 h-4 w-4" />
          الإبلاغ عن هذا الإعلان
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <Form {...form}>
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
            {/* عنوان ووصف في الوسط */}
            <AlertDialogHeader>
              <AlertDialogTitle className="text-center">الإبلاغ عن إعلان</AlertDialogTitle>
              <AlertDialogDescription className="text-center">
                سبب إبلاغك يساعدنا في الحفاظ على بيئة آمنة وموثوقة للجميع. لن تتم مشاركة معلوماتك مع المعلن.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* خانات الاختيار */}
            <div className="py-4 space-y-4">
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel className="text-right">سبب الإبلاغ</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-2"
                      >
                        {reportReasons.map((reason) => (
                          <FormItem key={reason} className="flex flex-row-reverse items-center gap-2">
                            <FormControl>
                              <RadioGroupItem value={reason} id={reason} />
                            </FormControl>
                            <Label htmlFor={reason} className="font-normal">{reason}</Label>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* تفاصيل إضافية */}
              <FormField
                control={form.control}
                name="details"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-right">تفاصيل إضافية (اختياري)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="اكتب تفاصيل إضافية هنا..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* أزرار الإلغاء والإرسال */}
            <AlertDialogFooter className="justify-end">
              <AlertDialogCancel type="button" onClick={() => { setIsOpen(false); form.reset(); }} className="active:scale-95 transition-transform">إلغاء</AlertDialogCancel>
              <Button type="submit" disabled={isSubmitting} className="active:scale-95 transition-transform">
                {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                إرسال البلاغ
              </Button>
            </AlertDialogFooter>
          </form>
        </Form>
      </AlertDialogContent>
    </AlertDialog>
  );
      }
