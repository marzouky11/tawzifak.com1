"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

interface Slide {
  title: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  buttonClass: string;
}

const slidesData: Slide[] = [
  {
    title: "منصتك الأولى للتوظيف",
    description: "ابحث عن وظائف وفرص عمل تناسب مهاراتك في أي وقت ومكان.",
    image: "/images/slide1.jpg",
    buttonText: "استكشف الآن",
    buttonLink: "/jobs",
    buttonClass: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    title: "اكتشف فرصًا جديدة كل يوم",
    description: "نوفر لك أحدث العروض في كل المجالات داخل وخارج الوطن.",
    image: "/images/slide2.jpg",
    buttonText: "عرض العروض",
    buttonLink: "/offers",
    buttonClass: "bg-green-600 hover:bg-green-700 text-white",
  },
  {
    title: "ابدأ مسيرتك المهنية الآن",
    description: "قم بإنشاء حساب لتبدأ التقديم على آلاف الوظائف المتاحة.",
    image: "/images/slide3.jpg",
    buttonText: "إنشاء حساب",
    buttonLink: "/register",
    buttonClass: "bg-purple-600 hover:bg-purple-700 text-white",
  },
];

export default function HomeCarousel() {
  const [current, setCurrent] = React.useState(0);
  const [paused, setPaused] = React.useState(false);
  const { user } = useAuth();

  // 🧠 تحميل آخر سلايد من التخزين المحلي
  React.useEffect(() => {
    const savedSlide = localStorage.getItem("currentSlide");
    if (savedSlide) setCurrent(Number(savedSlide));
  }, []);

  // 💾 حفظ السلايد الحالي عند تغييره
  React.useEffect(() => {
    localStorage.setItem("currentSlide", current.toString());
  }, [current]);

  // 🔁 تحريك تلقائي يتوقف عند التفاعل ويستأنف بعد 8 ثوانٍ
  React.useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slidesData.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [paused]);

  // ⏸️ وظيفة توقف مؤقت مع استئناف لاحق
  const handleUserInteraction = (index?: number) => {
    if (typeof index === "number") setCurrent(index);
    setPaused(true);
    setTimeout(() => setPaused(false), 6000); // استئناف بعد 8 ثواني
  };

  return (
    <div
      className="relative w-full h-[80vh] overflow-hidden rounded-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {slidesData.map((slide, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-in-out",
            index === current ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <Image
            src={slide.image}
            alt={slide.title}
            fill
            className="object-cover"
            // ✅ الصورة الأولى فقط تُحمّل فوراً، والباقي Lazy
            priority={index === 0}
            loading={index === 0 ? "eager" : "lazy"}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center text-white p-6">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 drop-shadow-md">
              {slide.title}
            </h2>
            <p className="text-lg md:text-xl mb-6 text-white/90">
              {slide.description}
            </p>
            <Link href={slide.buttonLink}>
              <Button
                className={cn(
                  "px-6 py-3 text-lg rounded-full shadow-lg transition-transform hover:scale-105",
                  slide.buttonClass
                )}
              >
                {slide.buttonText}
              </Button>
            </Link>
          </div>
        </div>
      ))}

      {/* 🔘 مؤشرات التنقل */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
        {slidesData.map((_, index) => (
          <button
            key={index}
            onClick={() => handleUserInteraction(index)}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-300",
              index === current ? "bg-white w-6" : "bg-white/50"
            )}
          />
        ))}
      </div>
    </div>
  );
            }
