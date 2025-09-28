'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { updateImmigrationPost } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { 
    Loader2, Plane, FileText, Globe, MapPin, Users, Calendar, Award, Wallet, Link as LinkIcon, 
    GraduationCap, ClipboardList, Info, Briefcase, Mail, MessageSquare, Instagram,
    Phone, HelpCircle, Target, CheckSquare, LayoutGrid,
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ImmigrationPost, ImmigrationProgramType } from '@/lib/types';
import { slugify, getProgramTypeDetails, programTypes } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { CategoryIcon } from '@/components/icons';

const programTypeValues = programTypes.map(p => p.value) as [string, ...string[]];

const formSchema = z.object({
  title: z.string().min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل.'),
  targetCountry: z.string().min(2, 'الدولة المستهدفة مطلوبة.'),
  city: z.string().optional(),
  programType: z.enum(programTypeValues, { required_error: "نوع البرنامج مطلوب." }),
  
  salary: z.string().optional(),
  targetAudience: z.string().min(2, "الفئة المستهدفة مطلوبة."),
  deadline: z.string().optional(),
  description: z.string().optional(),
  availablePositions: z.string().optional(),
  requirements: z.string().optional(),
  qualifications: z.string().optional(),
  experience: z.string().optional(),
  tasks: z.string().optional(),
  featuresAndOpportunities: z.string().optional(),
  applyUrl: z.string().url('رابط التقديم يجب أن يكون رابطًا صحيحًا.'),
  howToApply: z.string().optional(),
  
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صحيح." }).optional().or(z.literal('')),
  instagram: z.string().optional(),
}).refine(data => !!data.phone || !!data.whatsapp || !!data.email || !!data.instagram || !!data.applyUrl, {
  message: 'يجب توفير وسيلة تواصل واحدة على الأقل أو رابط للتقديم.',
  path: ['phone'],
});


interface EditImmigrationFormProps {
  post: ImmigrationPost;
}

const sectionColor = '#0ea5e9';

const FormLabelIcon = ({icon: Icon, label}: {icon: React.ElementType, label: string}) => (
    <FormLabel className="flex items-center gap-2 text-base md:text-lg">
      <Icon className='h-4 w-4' style={{color: sectionColor}} />
      {label}
    </FormLabel>
  );


export function EditImmigrationForm({ post }: EditImmigrationFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: post?.title || '',
      targetCountry: post?.targetCountry || '',
      city: post?.city || '',
      programType: post?.programType || undefined,
      targetAudience: post?.targetAudience || '',
      deadline: post?.deadline || '',
      description: post?.description || '',
      availablePositions: post?.availablePositions || '',
      requirements: post?.requirements || '',
      qualifications: post?.qualifications || '',
      experience: post?.experience || '',
      tasks: post?.tasks || '',
      salary: post?.salary || '',
      featuresAndOpportunities: post?.featuresAndOpportunities || '',
      applyUrl: post?.applyUrl || '',
      howToApply: post?.howToApply || '',
      phone: post?.phone || '',
      whatsapp: post?.whatsapp || '',
      email: post?.email || '',
      instagram: post?.instagram || '',
    },
  });


  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const dataToSave: Partial<ImmigrationPost> = { 
        ...values, 
        slug: slugify(values.title),
        programType: values.programType as ImmigrationProgramType,
      };

      await updateImmigrationPost(post.id, dataToSave);
      toast({ title: "تم تحديث الإعلان بنجاح!" });
      router.push(`/immigration/${post.id}`);
      router.refresh();

    } catch (error) {
      console.error("Failed to process immigration post:", error);
      toast({ variant: "destructive", title: "خطأ في العملية", description: `حدث خطأ غير متوقع.` });
    } finally {
      setIsSubmitting(false);
    }
  }

  const step1Content = (
    <div className="space-y-6">
        <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabelIcon icon={FileText} label="عنوان الفرصة" /><FormControl><Input placeholder="مثال: مطلوب عمال موسميون في كندا" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField control={form.control} name="targetCountry" render={({ field }) => (<FormItem><FormLabelIcon icon={Globe} label="الدولة المستهدفة" /><FormControl><Input placeholder="مثال: كندا" {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="city" render={({ field }) => (<FormItem><FormLabelIcon icon={MapPin} label="المدينة (اختياري)" /><FormControl><Input placeholder="مثال: مونتريال" {...field} /></FormControl><FormMessage /></FormItem>)} />
        </div>
        <FormField control={form.control} name="programType" render={({ field }) => (<FormItem><FormLabelIcon icon={LayoutGrid} label="نوع البرنامج" /><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue placeholder="اختر نوع البرنامج" /></SelectTrigger></FormControl><SelectContent>{programTypes.map(p => (<SelectItem key={p.value} value={p.value}><div className="flex items-center gap-2"><CategoryIcon name={p.icon} className="w-5 h-5" style={{ color: p.color }} /> {p.label}</div></SelectItem>))}</SelectContent></Select><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="salary" render={({ field }) => (<FormItem><FormLabelIcon icon={Wallet} label="الأجر (اختياري)" /><FormControl><Input placeholder="مثال: 3000 دولار شهريا" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField control={form.control} name="targetAudience" render={({ field }) => (<FormItem><FormLabelIcon icon={Users} label="الفئة المستهدفة" /><FormControl><Input placeholder="طلاب، عمال، مهنيين..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                <FormField control={form.control} name="deadline" render={({ field }) => (<FormItem><FormLabelIcon icon={Calendar} label="آخر أجل للتقديم (اختياري)" /><FormControl><Input placeholder="YYYY-MM-DD" {...field} /></FormControl><FormMessage /></FormItem>)} />
            </div>
    </div>
  );

  const step2Content = (
     <div className="space-y-6">
        <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabelIcon icon={Info} label="وصف تفصيلي للبرنامج" /><FormControl><Textarea placeholder="تفاصيل حول فرصة الهجرة، مهام العمل، مدة البرنامج..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="availablePositions" render={({ field }) => (<FormItem><FormLabelIcon icon={Briefcase} label="الوظائف المتاحة (اختياري)" /><FormControl><Textarea placeholder="قائمة بالوظائف أو المناصب المتاحة..." rows={3} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="requirements" render={({ field }) => (<FormItem><FormLabelIcon icon={ClipboardList} label="الشروط العامة" /><FormControl><Textarea placeholder="شروط العمر، اللغة، الحالة الصحية..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="qualifications" render={({ field }) => (<FormItem><FormLabelIcon icon={GraduationCap} label="المؤهلات المطلوبة" /><FormControl><Textarea placeholder="الشهادات التعليمية المطلوبة..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="experience" render={({ field }) => (<FormItem><FormLabelIcon icon={Award} label="الخبرة المطلوبة" /><FormControl><Textarea placeholder="سنوات الخبرة أو نوعها..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="tasks" render={({ field }) => (<FormItem><FormLabelIcon icon={CheckSquare} label="المهام المطلوبة (اختياري)" /><FormControl><Textarea placeholder="اكتب قائمة بالمهام والمسؤوليات للوظيفة..." rows={3} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="featuresAndOpportunities" render={({ field }) => (<FormItem><FormLabelIcon icon={Target} label="المميزات والفرص" /><FormControl><Textarea placeholder="معلومات عن السكن، التأمين، فرص التدريب أو التوظيف بعد البرنامج..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="howToApply" render={({ field }) => (<FormItem><FormLabelIcon icon={HelpCircle} label="كيفية التقديم (اختياري)" /><FormControl><Textarea placeholder="اشرح هنا خطوات التقديم. مثلاً: أرسل سيرتك الذاتية إلى البريد الإلكتروني المذكور أعلاه." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
    </div>
  );

  const step3Content = (
     <div className="space-y-6">
        <FormField control={form.control} name="applyUrl" render={({ field }) => (<FormItem><FormLabelIcon icon={LinkIcon} label="رابط التقديم الرسمي" /><FormControl><Input type="url" placeholder="https://example.com/apply" {...field} /></FormControl><FormMessage /></FormItem>)} />
        <Separator />
        <h3 className="font-semibold flex items-center gap-2 text-base md:text-lg"><Info className="h-5 w-5" style={{color: sectionColor}} />معلومات التواصل (اختياري)</h3>
        <FormField control={form.control} name="phone" render={({ field }) => (<FormItem><FormLabelIcon icon={Phone} label="رقم الهاتف" /><FormControl><Input placeholder="+xxxxxxxxxx" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="whatsapp" render={({ field }) => (<FormItem><FormLabelIcon icon={MessageSquare} label="رقم واتساب" /><FormControl><Input placeholder="+xxxxxxxxxx" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabelIcon icon={Mail} label="البريد الإلكتروني" /><FormControl><Input type="email" placeholder="example@mail.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="instagram" render={({ field }) => (<FormItem><FormLabelIcon icon={Instagram} label="حساب إنستغرام" /><FormControl><Input placeholder="username" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
        <FormMessage>{form.formState.errors.phone?.message}</FormMessage>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <h2 className="text-xl font-bold border-b pb-2">المعلومات الأساسية</h2>
        {step1Content}
        <Separator />
        <h2 className="text-xl font-bold border-b pb-2">الوصف والمتطلبات</h2>
        {step2Content}
        <Separator />
        <h2 className="text-xl font-bold border-b pb-2">التواصل والتقديم</h2>
        {step3Content}

        <Button type="submit" disabled={isSubmitting} className="w-full mt-8 active:scale-95 transition-transform" size="lg" style={{backgroundColor: sectionColor}}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          تحديث الإعلان
        </Button>
      </form>
    </Form>
  );
}
