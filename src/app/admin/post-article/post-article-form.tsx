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
import { addArticle, updateArticle } from '@/lib/data';
import { useRouter } from 'next/navigation';
import { Loader2, FileText, Image as ImageIcon, AlignLeft, Link2 } from 'lucide-react';
import type { Article } from '@/lib/types';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const formSchema = z.object({
  title: z.string().min(10, 'العنوان يجب أن يكون 10 أحرف على الأقل.'),
  slug: z.string().min(3, 'رابط المقال يجب أن يكون 3 أحرف على الأقل.')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'الرابط يمكن أن يحتوي فقط على حروف إنجليزية صغيرة، أرقام، وشرطات.'),
  imageUrl: z.string().url('الرجاء إدخال رابط صورة صحيح.'),
  content: z.string().min(50, 'المحتوى يجب أن يكون 50 حرفًا على الأقل.'),
});

const sectionColor = '#00897B';

const FormLabelIcon = ({icon: Icon, label}: {icon: React.ElementType, label: string}) => (
    <FormLabel className="flex items-center gap-2 text-base md:text-lg">
      <Icon className='h-4 w-4' style={{color: sectionColor}} />
      {label}
    </FormLabel>
);

interface PostArticleFormProps {
  article?: Article;
}

export function PostArticleForm({ article }: PostArticleFormProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!article;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: article?.title || '',
      slug: article?.slug || '',
      imageUrl: article?.imageUrl || '',
      content: article?.content || '',
    },
  });
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    form.setValue('title', newTitle);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const slug = values.slug.trim();

    if (!slug) {
      form.setError('slug', {
        type: 'manual',
        message: "الرجاء كتابة رابط المقال (slug) قبل النشر."
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // تحقق من Firestore إذا الرابط موجود مسبقًا
      const articlesRef = collection(db, 'articles');
      const q = query(articlesRef, where('slug', '==', slug));
      const querySnapshot = await getDocs(q);

      if (!isEditing && !querySnapshot.empty) {
        form.setError('slug', {
          type: 'manual',
          message: 'هذا الرابط مستخدم بالفعل. الرجاء اختيار رابط آخر.'
        });
        setIsSubmitting(false);
        return;
      }

      const firstParagraph = values.content
        .split('\n')
        .find(line => line.trim() && !line.trim().startsWith('#'));

      const summary = firstParagraph
        ? firstParagraph.substring(0, 150) + '...'
        : values.content.substring(0, 150) + '...';

      const articleData = {
        title: values.title,
        slug,
        imageUrl: values.imageUrl,
        content: values.content,
        summary,
      };

      if (isEditing && article) {
        await updateArticle(article.id, articleData);
        toast({ title: "تم تحديث المقال بنجاح!" });
        router.push(`/articles/${articleData.slug}`);
      } else {
        await addArticle({ ...articleData, author: 'فريق التحرير' });
        toast({ title: "تم نشر المقال بنجاح!" });
        router.push(`/articles`);
      }
      router.refresh();

    } catch (error) {
      console.error("Failed to process article:", error);
      toast({
        variant: "destructive",
        title: "خطأ في العملية",
        description: `حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.`,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabelIcon icon={FileText} label="عنوان المقال" />
            <FormControl>
              <Input placeholder="اكتب عنوانًا جذابًا للمقال..." {...field} onChange={handleTitleChange} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem>
            <FormLabelIcon icon={Link2} label="رابط المقال (Slug)" />
            <FormControl>
              <Input
                placeholder="اكتب رابط المقال بالأحرف الصغيرة والأرقام وشرطات (-) فقط"
                {...field}
                onBlur={async () => {
                  const slug = field.value.trim();
                  if (!slug) return;

                  const articlesRef = collection(db, 'articles');
                  const q = query(articlesRef, where('slug', '==', slug));
                  const querySnapshot = await getDocs(q);

                  if (!isEditing && !querySnapshot.empty) {
                    form.setError('slug', {
                      type: 'manual',
                      message: 'هذا الرابط مستخدم بالفعل. الرجاء اختيار رابط آخر.'
                    });
                  } else {
                    form.clearErrors('slug');
                  }
                }}
              />
            </FormControl>
            <FormMessage className="text-red-600" />
          </FormItem>
        )} />

        <FormField control={form.control} name="imageUrl" render={({ field }) => (
          <FormItem>
            <FormLabelIcon icon={ImageIcon} label="رابط الصورة الرئيسية" />
            <FormControl>
              <Input type="url" placeholder="https://example.com/image.jpg" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem>
            <FormLabelIcon icon={AlignLeft} label="المحتوى الكامل للمقال" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p> - لإنشاء **عنوان رئيسي (أخضر)**، استخدم `###` قبل النص.</p>
              <p> - لإنشاء **عنوان فرعي (أسود)**، استخدم `####` قبل النص.</p>
            </div>
            <FormControl>
              <Textarea placeholder="اكتب محتوى المقال هنا..." rows={15} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />
        
        <Button type="submit" disabled={isSubmitting} className="w-full mt-8 active:scale-95 transition-transform" size="lg" style={{backgroundColor: sectionColor}}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'تحديث المقال' : 'نشر المقال'}
        </Button>
      </form>
    </Form>
  );
                          }
