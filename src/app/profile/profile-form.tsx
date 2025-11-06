'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast";
import type { User } from '@/lib/types';
import { updateUserProfile } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { UserAvatar } from '@/components/user-avatar';

const profileSchema = z.object({
  name: z.string().min(3, { message: 'الاسم يجب أن يكون 3 أحرف على الأقل.' }),
  email: z.string().email(),
  phone: z.string().optional(),
  photoURL: z.string().optional().nullable(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, { message: 'كلمة المرور الحالية مطلوبة.' }),
  newPassword: z.string().min(6, { message: 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.' }),
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "كلمتا المرور غير متطابقتين.",
  path: ["confirmPassword"],
});

interface ProfileFormProps { user: User; }

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const { user: authUser, userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [showCrop, setShowCrop] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [cropData, setCropData] = useState<string | null>(null);
  const cropRef = useRef<HTMLCanvasElement>(null);

  const profileFormRef = useRef<HTMLFormElement>(null);
  const passwordFormRef = useRef<HTMLFormElement>(null);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      photoURL: user?.photoURL || null,
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
        setShowCrop(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const cropImage = () => {
    if (!cropRef.current || !imageSrc) return;
    const canvas = cropRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      const size = Math.min(img.width, img.height);
      const sx = (img.width - size) / 2;
      const sy = (img.height - size) / 2;
      canvas.width = 200;
      canvas.height = 200;
      ctx.drawImage(img, sx, sy, size, size, 0, 0, 200, 200);
      const cropped = canvas.toDataURL('image/jpeg');
      setCropData(cropped);
      profileForm.setValue('photoURL', cropped, { shouldValidate: true, shouldDirty: true });
      setShowCrop(false);
    };
  };

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!authUser) return;
    setIsSubmitting(true);
    try {
      const updatedData = { name: values.name, phone: values.phone || '', photoURL: values.photoURL };
      await updateUserProfile(authUser.uid, updatedData);
      toast({ title: "تم حفظ التغييرات بنجاح" });
      profileForm.reset(values);
    } catch {
      toast({ variant: "destructive", title: "حدث خطأ أثناء التحديث" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    if (!authUser || !authUser.email) return;
    setIsPasswordSubmitting(true);
    try {
      const credential = EmailAuthProvider.credential(authUser.email, values.currentPassword);
      await reauthenticateWithCredential(authUser, credential);
      await updatePassword(authUser, values.newPassword);
      toast({ title: "تم تغيير كلمة المرور بنجاح" });
      passwordForm.reset();
    } catch (error: any) {
      let errorMessage = "فشل تغيير كلمة المرور.";
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') errorMessage = "كلمة المرور الحالية غير صحيحة.";
      toast({ variant: "destructive", title: "خطأ", description: errorMessage });
    } finally {
      setIsPasswordSubmitting(false);
      passwordFormRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.blur();
    }
  }

  const photoURL = cropData || profileForm.watch('photoURL');

  return (
    <div className="space-y-8">
      <Form {...profileForm}>
        <form ref={profileFormRef} onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
          <h2 className="text-xl font-bold">المعلومات الشخصية</h2>
          <FormField control={profileForm.control} name="photoURL" render={() => (
            <FormItem>
              <FormLabel>الصورة الشخصية</FormLabel>
              <FormControl>
                <div className="flex items-center gap-4">
                  <UserAvatar name={userData?.name} color={userData?.avatarColor} photoURL={photoURL} className="h-20 w-20 text-3xl" />
                  <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <div className="flex flex-col gap-2">
                    <Button type="button" variant="outline" onClick={() => document.getElementById('picture')?.click()}>تغيير الصورة</Button>
                    {photoURL && (
                      <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={() => profileForm.setValue('photoURL', null, { shouldDirty: true })}>إزالة الصورة</Button>
                    )}
                  </div>
                </div>
              </FormControl>
            </FormItem>
          )} />
          <FormField control={profileForm.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel>الاسم الكامل</FormLabel>
              <FormControl><Input placeholder="اسمك الكامل" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={profileForm.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>البريد الإلكتروني</FormLabel>
              <FormControl><Input disabled {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={profileForm.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>رقم الهاتف</FormLabel>
              <FormControl><Input placeholder="+xxxxxxxxxx" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || !profileForm.formState.isDirty}>
            {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            حفظ التغييرات
          </Button>
        </form>
      </Form>

      {showCrop && imageSrc && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg space-y-4">
            <canvas ref={cropRef} className="hidden" />
            <img src={imageSrc} alt="To crop" className="max-w-xs max-h-xs object-contain" />
            <div className="flex justify-center gap-4">
              <Button onClick={cropImage}>قص الصورة</Button>
              <Button variant="ghost" onClick={() => setShowCrop(false)}>إلغاء</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  }
