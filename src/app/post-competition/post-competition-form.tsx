'use client';

import React, { useState } from 'react';
import { useForm, type FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { postCompetition } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { 
    Loader2, Calendar as CalendarIcon, FileText, FileSignature, Info, Check, 
    ArrowLeft, ArrowRight, Building, Target, ListOrdered, FileUp, LogIn, Users2, MapPin, Briefcase, Award, Mail, HelpCircle, X
} from 'lucide-react';
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoryIcon } from '@/components/icons';
import type { Competition } from '@/lib/types';
import { getOrganizers } from '@/lib/data';

const formSchema = z.object({
  title: z.string().min(5, 'العنوان يجب أن يكون 5 أحرف على الأقل.'),
  organizer: z.string().optional(),
  customOrganizer: z.string().optional(),
  positionsAvailable: z.union([z.string(), z.number()]).optional().nullable(),
  competitionType: z.string().optional(),
  location: z.string().optional(),
  
  description: z.string().optional(),
  availablePositions: z.string().optional(),
  requirements: z.string().min(10, 'الشروط مطلوبة.'),
  competitionStages: z.string().optional(),
  documentsNeeded: z.string().min(10, 'الوثائق المطلوبة.'),
  trainingFeatures: z.string().optional(),
  jobProspects: z.string().optional(),
  howToApply: z.string().optional(),

  registrationStartDate: z.string().optional(),
  deadline: z.string({ required_error: "آخر أجل للتسجيل مطلوب." }).min(1, "آخر أجل للتسجيل مطلوب."),
  competitionDate: z.string().optional(),
  
  officialLink: z.string().url('الرابط الرسمي يجب أن يكون رابطًا صحيحًا.'),
  fileUrl: z.string().url('رابط الملف يجب أن يكون رابطًا صحيحًا.').optional().or(z.literal('')),
  email: z.string().email({ message: "الرجاء إدخال بريد إلكتروني صحيح." }).optional().or(z.literal('')),
}).refine(data => data.organizer || data.customOrganizer, {
    message: "يجب اختيار الجهة المنظمة أو إدخال جهة مخصصة.",
    path: ["organizer"],
});

const stepFields: FieldPath<z.infer<typeof formSchema>>[][] = [
  ['title', 'organizer', 'customOrganizer', 'positionsAvailable', 'competitionType', 'location'],
  ['description', 'availablePositions', 'requirements', 'competitionStages', 'documentsNeeded', 'trainingFeatures', 'jobProspects', 'howToApply'],
  ['registrationStartDate', 'deadline', 'competitionDate', 'officialLink', 'fileUrl', 'email'],
];

const steps = [
    { id: 1, name: "المعلومات الأساسية", description: "تفاصيل المباراة الرئيسية.", icon: Info },
    { id: 2, name: "الوصف والمتطلبات", description: "شروط وتفاصيل المباراة.", icon: FileSignature },
    { id: 3, name: "التواريخ والروابط", description: "مواعيد التسجيل والتقديم.", icon: CalendarIcon },
];

const sectionColor = '#14532d';

const StepsIndicator = ({ currentStep, onStepClick }: { currentStep: number; onStepClick: (step: number) => void; }) => {
  return (
    <div className="relative">
      <div className="absolute right-0 top-1/2 w-full -translate-y-1/2" aria-hidden="true">
        <div className="h-0.5 w-full bg-border" />
      </div>
      <div
        className="absolute right-0 top-1/2 h-0.5 -translate-y-1/2 transition-all duration-300"
        style={{ width: `calc(${currentStep} / ${steps.length - 1} * 100%)`, backgroundColor: sectionColor }}
      />
      <div className="relative flex justify-between">
        {steps.map((step, stepIdx) => {
          const isCompleted = stepIdx < currentStep;
          const isCurrent = stepIdx === currentStep;
          
          return (
            <div key={step.name} className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => stepIdx <= currentStep && onStepClick(stepIdx)}
                className={cn(
                  "relative z-10 w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg transition-all duration-300 border-2",
                  isCurrent ? "scale-110" : "bg-muted text-muted-foreground border-border",
                  "hover:scale-105"
                )}
                style={{
                    backgroundColor: isCurrent || isCompleted ? sectionColor : undefined,
                    borderColor: isCurrent || isCompleted ? sectionColor : undefined,
                    color: isCurrent || isCompleted ? 'white' : undefined,
                }}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? <Check className="w-6 h-6" /> : <step.icon className="w-5 h-5" />}
              </button>
              <div className="hidden md:block text-center mt-2">
                <p className={cn("font-bold", isCurrent ? "text-primary" : "text-foreground")} style={{color: isCurrent ? sectionColor : undefined}}>
                  {step.name}
                </p>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const FormLabelIcon = ({icon: Icon, label}: {icon: React.ElementType, label: string}) => (
    <FormLabel className="flex items-center gap-2 text-base md:text-lg">
      <Icon className='h-4 w-4' style={{color: sectionColor}} />
      {label}
    </FormLabel>
  );

export function PostCompetitionForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const organizers = getOrganizers();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      organizer: '',
      customOrganizer: '',
      competitionType: '',
      positionsAvailable: '',
      requirements: '',
      documentsNeeded: '',
      officialLink: '',
      description: '',
      availablePositions: '',
      trainingFeatures: '',
      fileUrl: '',
      location: '',
      jobProspects: '',
      competitionStages: '',
      deadline: '',
      registrationStartDate: '',
      competitionDate: '',
      email: '',
      howToApply: '',
    },
  });
  
  const organizer = form.watch('organizer');
  const customOrganizer = form.watch('customOrganizer');

  const nextStep = async () => {
    const fields = stepFields[currentStep];
    const output = await form.trigger(fields, { shouldFocus: true });

    if (!output) {
         toast({
            variant: "destructive",
            title: "حقول ناقصة",
            description: "الرجاء تعبئة جميع الحقول المطلوبة للمتابعة.",
        });
        return;
    }

    if (currentStep < steps.length - 1) {
      setCurrentStep(step => step + 1);
    } else {
      // فقط في الخطوة الأخيرة نقوم بالإرسال
      form.handleSubmit(onSubmit)();
    }
  };

  const handleStepClick = async (stepIndex: number) => {
    if (stepIndex >= currentStep) return;
    setCurrentStep(stepIndex);
  }

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const { customOrganizer, ...restOfValues } = values;

      const dataToSave: { [key: string]: any } = { 
        ...restOfValues,
        positionsAvailable: values.positionsAvailable === undefined || values.positionsAvailable === '' ? null : values.positionsAvailable,
      };

      if (customOrganizer) {
          dataToSave.organizer = customOrganizer;
      }

      const { id } = await postCompetition(dataToSave);
      toast({
        title: "تم النشر بنجاح!",
        description: "تم نشر المباراة العمومية وسيتم عرضها في القسم المخصص.",
      });
      form.reset();
      router.push(`/competitions/${id}`);
      
    } catch (error) {
      console.error("Failed to process competition:", error);
      toast({
        variant: "destructive",
        title: "خطأ في العملية",
        description: `حدث خطأ غير متوقع أثناء نشر المباراة. يرجى المحاولة مرة أخرى.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepsContent = [
    <div className="space-y-6" key="step1">
      <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabelIcon icon={FileText} label="عنوان المباراة" /><FormControl><Input placeholder="اسم المباراة أو الإعلان الرسمي" {...field} /></FormControl><FormMessage /></FormItem>)} />
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <FormLabelIcon icon={Building} label="الجهة المنظمة" />
            {(organizer || customOrganizer) && (
                <Button type="button" variant="ghost" size="sm" className="h-auto p-1 text-xs text-destructive hover:bg-destructive/10" onClick={() => { form.setValue('organizer', ''); form.setValue('customOrganizer', ''); }}>
                    <X className="ml-1 h-3 w-3" />
                    مسح
                </Button>
            )}
        </div>
        <p className="text-sm text-muted-foreground -mt-2">اختر من القائمة أو أدخل جهة مخصصة. لا يمكن اختيار الاثنين معاً.</p>
        <FormField control={form.control} name="organizer" render={({ field }) => (
            <FormItem>
                <Select onValueChange={(value) => { field.onChange(value); if (value) form.setValue('customOrganizer', ''); }} value={field.value} disabled={!!customOrganizer}>
                    <FormControl><SelectTrigger><SelectValue placeholder="اختر الجهة المنظمة من القائمة" /></SelectTrigger></FormControl>
                    <SelectContent><ScrollArea className="h-[250px]">{organizers.map(org => (<SelectItem key={org.name} value={org.name}><div className="flex items-center gap-2"><CategoryIcon name={org.icon} className="h-5 w-5" style={{ color: org.color }} /> {org.name}</div></SelectItem>))}</ScrollArea></SelectContent>
                </Select>
                <FormMessage />
            </FormItem>
        )} />
        <div className="relative flex items-center"><div className="flex-grow border-t border-border"></div><span className="flex-shrink mx-4 text-xs text-muted-foreground">أو</span><div className="flex-grow border-t border-border"></div></div>
        <FormField control={form.control} name="customOrganizer" render={({ field }) => (
            <FormItem>
                <FormControl><Input placeholder="أدخل جهة منظمة مخصصة" {...field} onChange={(e) => { field.onChange(e); if (e.target.value) form.setValue('organizer', ''); }} disabled={!!organizer} /></FormControl>
                <FormMessage />
            </FormItem>
        )} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FormField control={form.control} name="positionsAvailable" render={({ field }) => (<FormItem><FormLabelIcon icon={Users2} label="عدد المناصب (اختياري)" /><FormControl><Input
            type="text"
            {...field}
            value={field.value ?? ''}
            onChange={e => field.onChange(e.target.value === '' ? null : e.target.value)}
        /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="competitionType" render={({ field }) => (<FormItem><FormLabelIcon icon={Briefcase} label="نوع المباراة (اختياري)" /><FormControl><Input placeholder="مفتوحة للجميع، لفئة معينة..." {...field} /></FormControl><FormMessage /></FormItem>)} />
        <FormField control={form.control} name="location" render={({ field }) => (<FormItem><FormLabelIcon icon={MapPin} label="الموقع (اختياري)" /><FormControl><Input placeholder="مكان إجراء التكوين أو المباراة" {...field} /></FormControl><FormMessage /></FormItem>)} />
      </div>
    </div>,
    <div className="space-y-6" key="step2">
       <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabelIcon icon={Info} label="وصف تفصيلي (اختياري)" /><FormControl><Textarea placeholder="معلومات إضافية حول المباراة..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
       <FormField control={form.control} name="availablePositions" render={({ field }) => (<FormItem><FormLabelIcon icon={Briefcase} label="الوظائف المتاحة (اختياري)" /><FormControl><Textarea placeholder="قائمة بالوظائف أو المناصب المتاحة..." rows={3} {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
       <FormField control={form.control} name="requirements" render={({ field }) => (<FormItem><FormLabelIcon icon={FileSignature} label="الشروط المطلوبة" /><FormControl><Textarea placeholder="المؤهلات، السن، الطول، حدة البصر..." rows={4} {...field} /></FormControl><FormMessage /></FormItem>)} />
       <FormField control={form.control} name="competitionStages" render={({ field }) => (<FormItem><FormLabelIcon icon={ListOrdered} label="مراحل المباراة (اختياري)" /><FormControl><Textarea placeholder="الاختبارات الأولية، البدنية، الكتابية، المقابلة..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
       <FormField control={form.control} name="documentsNeeded" render={({ field }) => (<FormItem><FormLabelIcon icon={FileText} label="الوثائق المطلوبة" /><FormControl><Textarea placeholder="قائمة بالوثائق المطلوبة من المترشحين" rows={4} {...field} /></FormControl><FormMessage /></FormItem>)} />
       <FormField control={form.control} name="trainingFeatures" render={({ field }) => (<FormItem><FormLabelIcon icon={Award} label="مميزات التكوين والفرص المقدمة (اختياري)" /><FormControl><Textarea placeholder="اكتب هنا عن مميزات التكوين، مثل: منحة شهرية، سكن مجاني، توظيف مضمون..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
       <FormField control={form.control} name="jobProspects" render={({ field }) => (<FormItem><FormLabelIcon icon={Target} label="أفق العمل بعد المباراة (اختياري)" /><FormControl><Textarea placeholder="المهام والوظائف المتاحة بعد التخرج أو النجاح" rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
       <FormField control={form.control} name="howToApply" render={({ field }) => (<FormItem><FormLabelIcon icon={HelpCircle} label="طريقة التسجيل (اختياري)" /><FormControl><Textarea placeholder="اشرح هنا خطوات التسجيل والتقديم على المباراة..." rows={3} {...field} /></FormControl><FormMessage /></FormItem>)} />
    </div>,
    <div className="space-y-6" key="step3">
      <FormField control={form.control} name="deadline" render={({ field }) => (<FormItem><FormLabelIcon icon={CalendarIcon} label="آخر أجل للتسجيل" /><FormControl><Input placeholder="مثال: 2024-09-15" {...field} /></FormControl><FormMessage /></FormItem>)} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField control={form.control} name="registrationStartDate" render={({ field }) => (<FormItem><FormLabelIcon icon={CalendarIcon} label="تاريخ فتح التسجيل (اختياري)" /><FormControl><Input placeholder="مثال: 2024-08-01" {...field} /></FormControl><FormMessage /></FormItem>)} />
          <FormField control={form.control} name="competitionDate" render={({ field }) => (<FormItem><FormLabelIcon icon={CalendarIcon} label="تاريخ إجراء المباراة (اختياري)" /><FormControl><Input placeholder="مثال: 2024-10-10" {...field} /></FormControl><FormMessage /></FormItem>)} />
      </div>
      <FormField control={form.control} name="fileUrl" render={({ field }) => (<FormItem><FormLabelIcon icon={FileUp} label="رابط ملف إضافي (PDF اختياري)" /><FormControl><Input type="url" placeholder="رابط مباشر لملف PDF رسمي" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
      <FormField control={form.control} name="officialLink" render={({ field }) => (<FormItem><FormLabelIcon icon={LogIn} label="رابط التسجيل الإلكتروني" /><FormControl><Input type="url" placeholder="https://example.com/register" {...field} /></FormControl><FormMessage /></FormItem>)} />
      <FormField control={form.control} name="email" render={({ field }) => (<FormItem><FormLabelIcon icon={Mail} label="البريد الإلكتروني للتواصل (اختياري)" /><FormControl><Input type="email" placeholder="contact@example.com" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
    </div>
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-full">
        <div className="p-6 md:p-8">
          <StepsIndicator currentStep={currentStep} onStepClick={handleStepClick} />
        </div>
        <Separator className="mx-auto w-[calc(100%-3rem)]" />
        <div className="p-6 flex-grow">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -10, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {stepsContent[currentStep]}
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="flex gap-4 items-center justify-between p-6 border-t bg-muted/50 rounded-b-lg mt-auto">
          {currentStep > 0 ? (<Button type="button" variant="outline" onClick={prevStep}><ArrowRight className="ml-2 h-4 w-4" />السابق</Button>) : <div />}
          
          {currentStep < steps.length - 1 ? (
            <Button type="button" onClick={nextStep} className="text-primary-foreground" style={{backgroundColor: sectionColor}}>التالي<ArrowLeft className="mr-2 h-4 w-4" /></Button>
          ) : (
            <Button type="button" onClick={nextStep} disabled={isSubmitting} className="text-primary-foreground" style={{backgroundColor: sectionColor}}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              نشر المباراة
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
                               }
    