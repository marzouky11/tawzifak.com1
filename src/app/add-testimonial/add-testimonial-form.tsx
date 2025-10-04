
'use client';

import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { addTestimonial } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import { Loader2, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  rating: z.number().min(1, { message: 'الرجاء اختيار تقييم.' }).max(5),
  content: z.string().min(10, { message: 'يجب أن يكون الرأي 10 أحرف على الأقل.' }).max(500, { message: 'يجب ألا يتجاوز الرأي 500 حرف.' }),
});

export function AddTestimonialForm() {
  const { toast } = useToast();
  const { user, userData } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rating: 0,
      content: '',
    },
  });

  const ratingValue = form.watch('rating');

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !userData) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب عليك تسجيل الدخول أولاً.",
      });
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTestimonial({
        userId: user.uid,
        userName: userData.name,
        userAvatarColor: userData.avatarColor || '#3b82f6',
        content: values.content,
        rating: values.rating,
      });

      toast({
        title: "شكرًا لك!",
        description: "تم إرسال رأيك بنجاح. نحن نقدر مساهمتك.",
      });
      router.push('/testimonials');
    } catch (error) {
      console.error("Failed to add testimonial:", error);
      toast({
        variant: "destructive",
        title: "خطأ في الإرسال",
        description: "حدث خطأ غير متوقع أثناء إرسال رأيك. يرجى المحاولة مرة أخرى لاحقًا.",
      });
    } finally {
      setIsSubmitting(false);
      formRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.blur();
    }
  }

  return (
    <Form {...form}>
      <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="rating"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تقييمك للمنصة</FormLabel>
              <FormControl>
                 <div 
                    className="flex flex-row-reverse justify-center items-center gap-2" 
                    onMouseLeave={() => setHoveredRating(0)}
                  >
                    {[5, 4, 3, 2, 1].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "h-8 w-8 cursor-pointer transition-colors",
                          (hoveredRating >= star || ratingValue >= star) 
                            ? "text-yellow-500 fill-yellow-400"
                            : "text-muted-foreground/50"
                        )}
                        onClick={() => form.setValue('rating', star, { shouldValidate: true })}
                        onMouseEnter={() => setHoveredRating(star)}
                      />
                    ))}
                  </div>
              </FormControl>
              <FormMessage className="text-center" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رأيك يهمنا</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="اكتب هنا رأيك حول تجربتك مع منصة توظيفك..."
                  rows={6}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="lg" className="w-full active:scale-95 transition-transform" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          إرسال الرأي
        </Button>
      </form>
    </Form>
  );
}
