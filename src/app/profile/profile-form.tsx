'use client';

import React, { useState, useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from "@/hooks/use-toast"
import type { User } from '@/lib/types';
import { updateUserProfile } from '@/lib/data';
import { useAuth } from '@/context/auth-context';
import { Loader2, Lock, Image as ImageIcon, Crop, X, Square } from 'lucide-react';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';
import { Separator } from '@/components/ui/separator';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { UserAvatar } from '@/components/user-avatar';

const profileSchema = z.object({
  name: z.string().min(3, { message: 'الاسم يجب أن يكون 3 أحرف على الأقل.' }),
  email: z.string().email(),
  phone: z.string().optional(),
  photoURL: z.string().optional().nullable(),
});

const passwordSchema = z.object({
    currentPassword: z.string().min(1, { message: 'كلمة المرور الحالية مطلوبة.'}),
    newPassword: z.string().min(6, { message: 'يجب أن تتكون كلمة المرور الجديدة من 6 أحرف على الأقل.' }),
    confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "كلمتا المرور غير متطابقتين.",
    path: ["confirmPassword"],
});

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast();
  const { user: authUser, userData } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [cropSize, setCropSize] = useState(150);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  
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
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setSelectedImage(reader.result as string);
        setShowCropModal(true);
        setCrop({ x: 0, y: 0, width: 100, height: 100 });
      });
      reader.readAsDataURL(file);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setIsDragging(true);
    setDragStart({ x, y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    
    setCrop(prev => ({
      ...prev,
      x: Math.max(0, Math.min(prev.x + dx, 200 - cropSize)),
      y: Math.max(0, Math.min(prev.y + dy, 200 - cropSize))
    }));
    
    setDragStart({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCropImage = () => {
    if (!selectedImage || !imageRef.current) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = imageRef.current;
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;

    canvas.width = cropSize;
    canvas.height = cropSize;

    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      cropSize * scaleX,
      cropSize * scaleY,
      0,
      0,
      cropSize,
      cropSize
    );

    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    profileForm.setValue('photoURL', croppedImageUrl, { shouldValidate: true, shouldDirty: true });
    setShowCropModal(false);
    setSelectedImage(null);
  };

  const handleSizeChange = (newSize: number) => {
    setCropSize(newSize);
    setCrop(prev => ({
      ...prev,
      x: Math.max(0, Math.min(prev.x, 200 - newSize)),
      y: Math.max(0, Math.min(prev.y, 200 - newSize))
    }));
  };

  async function onProfileSubmit(values: z.infer<typeof profileSchema>) {
    if (!authUser) return;
    setIsSubmitting(true);
    try {
        const updatedData = { 
            name: values.name, 
            phone: values.phone || '',
            photoURL: values.photoURL,
        };
        const result = await updateUserProfile(authUser.uid, updatedData);
        
        profileForm.reset({ ...values, photoURL: updatedData.photoURL });

        toast({
            title: "تم تحديث الملف الشخصي",
            description: result.message,
        });
    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "خطأ",
            description: error.message || "فشل تحديث الملف الشخصي.",
        });
    } finally {
        setIsSubmitting(false);
        profileFormRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.blur();
    }
  }

  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
      if (!authUser || !authUser.email) return;
      setIsPasswordSubmitting(true);
      try {
          const credential = EmailAuthProvider.credential(authUser.email, values.currentPassword);
          await reauthenticateWithCredential(authUser, credential);
          await updatePassword(authUser, values.newPassword);
          toast({
              title: "تم تغيير كلمة المرور بنجاح",
          });
          passwordForm.reset();
      } catch (error: any) {
          let errorMessage = "فشل تغيير كلمة المرور. يرجى المحاولة مرة أخرى.";
          if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
              errorMessage = "كلمة المرور الحالية غير صحيحة.";
          }
          toast({
              variant: "destructive",
              title: "خطأ",
              description: errorMessage,
          });
      } finally {
          setIsPasswordSubmitting(false);
          passwordFormRef.current?.querySelector<HTMLButtonElement>('button[type="submit"]')?.blur();
      }
  }
  
  const photoURL = profileForm.watch('photoURL');

  return (
    <div className="space-y-8">
      {showCropModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">قص الصورة</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowCropModal(false);
                  setSelectedImage(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-4">
              <div className="text-sm text-gray-600 mb-4">
                اسحب المربع لاختيار الجزء المراد قصه من الصورة
              </div>
              
              <div 
                ref={containerRef}
                className="relative w-[200px] h-[200px] mx-auto border-2 border-gray-300 rounded-lg overflow-hidden cursor-move"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {selectedImage && (
                  <img
                    ref={imageRef}
                    src={selectedImage}
                    alt="للقص"
                    className="w-full h-full object-cover"
                    onLoad={() => {
                      setCrop({ x: 25, y: 25, width: cropSize, height: cropSize });
                    }}
                  />
                )}
                
                <div 
                  className="absolute border-2 border-white shadow-lg bg-transparent"
                  style={{
                    left: `${crop.x}px`,
                    top: `${crop.y}px`,
                    width: `${cropSize}px`,
                    height: `${cropSize}px`,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                >
                  <div className="absolute -top-1 -left-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-blue-500 rounded-sm"></div>
                </div>
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">حجم القص:</label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={cropSize === 120 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSizeChange(120)}
                  >
                    صغير
                  </Button>
                  <Button
                    type="button"
                    variant={cropSize === 150 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSizeChange(150)}
                  >
                    متوسط
                  </Button>
                  <Button
                    type="button"
                    variant={cropSize === 180 ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSizeChange(180)}
                  >
                    كبير
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex gap-2 p-4 border-t">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowCropModal(false);
                  setSelectedImage(null);
                }}
              >
                إلغاء
              </Button>
              <Button
                onClick={handleCropImage}
                className="flex-1"
              >
                <Crop className="ml-2 h-4 w-4" />
                قص الصورة
              </Button>
            </div>
          </div>
        </div>
      )}

      <Form {...profileForm}>
        <form ref={profileFormRef} onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
          <h2 className="text-xl font-bold">المعلومات الشخصية</h2>
          <FormField
              control={profileForm.control}
              name="photoURL"
              render={({ field }) => (
                  <FormItem>
                      <FormLabel>الصورة الشخصية (اختياري)</FormLabel>
                      <FormControl>
                          <div className="flex items-center gap-4">
                              <UserAvatar 
                                  name={userData?.name} 
                                  color={userData?.avatarColor} 
                                  photoURL={photoURL}
                                  className="h-20 w-20 text-3xl"
                              />
                              <Input id="picture" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                              <div className="flex flex-col gap-2">
                                  <Button type="button" variant="outline" className="active:scale-95 transition-transform" onClick={() => document.getElementById('picture')?.click()}>
                                      <ImageIcon className="ml-2 h-4 w-4" />
                                      تغيير الصورة
                                  </Button>
                                 {photoURL && (
                                  <Button type="button" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 active:scale-95 transition-transform" onClick={() => profileForm.setValue('photoURL', null, { shouldDirty: true })}>
                                      إزالة الصورة
                                  </Button>
                                 )}
                              </div>
                          </div>
                      </FormControl>
                      <FormMessage />
                  </FormItem>
              )}
          />
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
            <FormItem><FormLabel>رقم الهاتف (اختياري)</FormLabel><FormControl><Input placeholder="+xxxxxxxxxx" {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>
          )} />
          <Button type="submit" size="lg" className="w-full active:scale-95 transition-transform" disabled={isSubmitting || !profileForm.formState.isDirty}>
              {isSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
              حفظ التغييرات
          </Button>
        </form>
      </Form>

      <Separator />
        
      <Collapsible>
        <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full active:scale-95 transition-transform">
                <Lock className="ml-2 h-4 w-4" />
                تغيير كلمة المرور
            </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
            <Form {...passwordForm}>
                <form ref={passwordFormRef} onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6 mt-6 border p-6 rounded-lg">
                     <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                        <FormItem>
                            <FormLabel>كلمة المرور الحالية</FormLabel>
                            <FormControl><Input type="password" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                        <FormItem>
                            <FormLabel>كلمة المرور الجديدة</FormLabel>
                            <FormControl><Input type="password" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                        <FormItem>
                            <FormLabel>تأكيد كلمة المرور الجديدة</FormLabel>
                            <FormControl><Input type="password" {...field} /></FormControl>
                            <FormMessage />
                        </FormItem>
                    )} />
                    <Button type="submit" size="lg" className="w-full active:scale-95 transition-transform" variant="secondary" disabled={isPasswordSubmitting}>
                        {isPasswordSubmitting && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                        تحديث كلمة المرور
                    </Button>
                </form>
            </Form>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
  }
