
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/auth-context";
import { Button } from "@/components/ui/button";
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
import {
  Loader2,
  Trash2,
  FileText,
  Frown,
  FileSignature,
} from "lucide-react";
import {
  getJobsByUserId,
  deleteAd,
  getJobOffers,
  getJobSeekers,
  getCompetitions,
  deleteCompetition,
  getImmigrationPosts,
  deleteImmigrationPost,
} from "@/lib/data";
import type { Job, Competition, ImmigrationPost } from "@/lib/types";
import { JobCard } from "@/components/job-card";
import { CompetitionCard } from "@/components/competition-card";
import { ImmigrationCard } from "@/components/immigration-card";
import { useToast } from "@/hooks/use-toast";
import { MobilePageHeader } from "@/components/layout/mobile-page-header";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { DesktopPageHeader } from "@/components/layout/desktop-page-header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

function AdGrid({
  ads,
  onAdDelete,
  showEditButton = false,
}: {
  ads: Job[];
  onAdDelete: (adId: string) => void;
  showEditButton?: boolean;
}) {
  if (ads.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
        <Frown className="w-16 h-16 text-muted-foreground/50" />
        <p>لا توجد إعلانات في هذا القسم.</p>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {ads.map((ad) => (
        <Card key={ad.id} className="flex flex-col">
          <div className="flex-grow">
            <JobCard job={ad} />
          </div>
          <CardFooter className="p-4 flex gap-2">
            {showEditButton && (
              <Button
                asChild
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                <Link href={`/edit-job/${ad.id}`}>
                  <FileSignature className="h-4 w-4" />
                  <span>تعديل</span>
                </Link>
              </Button>
            )}
            <Button
              variant="destructive"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              onClick={() => onAdDelete(ad.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span>حذف</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function ImmigrationGrid({
  posts,
  onAdDelete,
}: {
  posts: ImmigrationPost[];
  onAdDelete: (postId: string) => void;
}) {
  if (posts.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
        <Frown className="w-16 h-16 text-muted-foreground/50" />
        <p>لا توجد إعلانات هجرة في هذا القسم.</p>
      </div>
    );
  }
  return (
    <div
      dir="rtl"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {posts.map((post) => (
        <Card key={post.id} className="flex flex-col">
          <div className="flex-grow">
            <ImmigrationCard post={post} />
          </div>
          <CardFooter className="p-4 flex gap-2">
            <Button
              asChild
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Link href={`/edit-immigration/${post.id}`}>
                <FileSignature className="h-4 w-4" />
                <span>تعديل</span>
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              onClick={() => onAdDelete(post.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span>حذف</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

function CompetitionGrid({
  competitions,
  onAdDelete,
}: {
  competitions: Competition[];
  onAdDelete: (adId: string) => void;
}) {
  if (competitions.length === 0) {
    return (
      <div className="text-center text-muted-foreground p-8 flex flex-col items-center gap-4">
        <Frown className="w-16 h-16 text-muted-foreground/50" />
        <p>لا توجد مباريات في هذا القسم.</p>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
    >
      {competitions.map((comp) => (
        <Card key={comp.id} className="flex flex-col">
          <div className="flex-grow">
            <CompetitionCard competition={comp} />
          </div>
          <CardFooter className="p-4 flex gap-2">
            <Button
              asChild
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
            >
              <Link href={`/edit-competition/${comp.id}`}>
                <FileSignature className="h-4 w-4" />
                <span>تعديل</span>
              </Link>
            </Button>
            <Button
              variant="destructive"
              className="flex-1 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              onClick={() => onAdDelete(comp.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span>حذف</span>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function MyAdsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, userData, loading: authLoading } = useAuth();

  const [jobOffers, setJobOffers] = useState<Job[]>([]);
  const [jobRequests, setJobRequests] = useState<Job[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [immigrationPosts, setImmigrationPosts] = useState<ImmigrationPost[]>(
    []
  );

  const [adsLoading, setAdsLoading] = useState(true);
  const [adToDelete, setAdToDelete] = useState<{
    id: string;
    type: "ad" | "competition" | "immigration";
  } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && !authLoading) {
      const fetchAds = async () => {
        setAdsLoading(true);
        try {
          if (userData?.isAdmin) {
            const [jobsData, seekersData, comps, immigrations] = await Promise.all([
              getJobOffers(),
              getJobSeekers(),
              getCompetitions(),
              getImmigrationPosts(),
            ]);
            setJobOffers(jobsData.data);
            setJobRequests(seekersData.data);
            setCompetitions(comps.data);
            setImmigrationPosts(immigrations.data);
          } else {
            const userJobs = await getJobsByUserId(user.uid);
            setJobRequests(userJobs);
          }
        } catch (error) {
          console.error("Failed to fetch ads:", error);
          toast({ variant: "destructive", title: "فشل تحميل الإعلانات" });
        } finally {
          setAdsLoading(false);
        }
      };
      fetchAds();
    }
  }, [user, userData, authLoading, toast]);

  const handleDelete = async () => {
    if (!adToDelete) return;
    try {
      if (adToDelete.type === "ad") {
        await deleteAd(adToDelete.id);
        setJobOffers((prev) => prev.filter((ad) => ad.id !== adToDelete.id));
        setJobRequests((prev) => prev.filter((ad) => ad.id !== adToDelete.id));
      } else if (adToDelete.type === "competition") {
        await deleteCompetition(adToDelete.id);
        setCompetitions((prevComps) =>
          prevComps.filter((comp) => comp.id !== adToDelete.id)
        );
      } else if (adToDelete.type === "immigration") {
        await deleteImmigrationPost(adToDelete.id);
        setImmigrationPosts((prevPosts) =>
          prevPosts.filter((post) => post.id !== adToDelete.id)
        );
      }
      toast({ title: "تم حذف الإعلان بنجاح" });
    } catch (error) {
      toast({ variant: "destructive", title: "فشل حذف الإعلان" });
    } finally {
      setAdToDelete(null);
    }
  };

  const handleDeleteTrigger = (
    id: string,
    type: "ad" | "competition" | "immigration"
  ) => {
    setAdToDelete({ id, type });
  };

  return (
    <>
      <MobilePageHeader title="إعلاناتي">
        <FileText className="h-5 w-5 text-primary" />
      </MobilePageHeader>
      <DesktopPageHeader
        icon={FileText}
        title={userData?.isAdmin ? "لوحة تحكم الإعلانات" : "إعلاناتي"}
        description={
          userData?.isAdmin
            ? "إدارة جميع الإعلانات والمباريات المنشورة في المنصة."
            : "هنا يمكنك إدارة جميع إعلاناتك، تعديلها، أو حذفها."
        }
      />
      <div className="flex-grow container mx-auto max-w-7xl px-4 pb-8">
        {authLoading || adsLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            </CardContent>
          </Card>
        ) : userData?.isAdmin ? (
          <Tabs defaultValue="jobs" className="w-full space-y-4">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2 h-auto">
              <TabsTrigger value="migration" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-sm">
                هجرة ({immigrationPosts.length})
              </TabsTrigger>
              <TabsTrigger value="jobs" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-sm">وظائف ({jobOffers.length})</TabsTrigger>
              <TabsTrigger value="seekers" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-sm">
                باحثون ({jobRequests.length})
              </TabsTrigger>
              <TabsTrigger value="competitions" className="data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:font-bold data-[state=active]:shadow-sm">
                مباريات ({competitions.length})
              </TabsTrigger>
            </TabsList>
            <Card>
              <CardContent className="pt-6">
                <TabsContent value="jobs" className="mt-0">
                  <AdGrid
                    ads={jobOffers}
                    onAdDelete={(id) => handleDeleteTrigger(id, "ad")}
                    showEditButton={true}
                  />
                </TabsContent>
                <TabsContent value="migration" className="mt-0">
                  <ImmigrationGrid
                    posts={immigrationPosts}
                    onAdDelete={(id) => handleDeleteTrigger(id, "immigration")}
                  />
                </TabsContent>
                <TabsContent value="competitions" className="mt-0">
                  <CompetitionGrid
                    competitions={competitions}
                    onAdDelete={(id) => handleDeleteTrigger(id, "competition")}
                  />
                </TabsContent>
                <TabsContent value="seekers" className="mt-0">
                  <AdGrid
                    ads={jobRequests}
                    onAdDelete={(id) => handleDeleteTrigger(id, "ad")}
                    showEditButton={false}
                  />
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <AdGrid
                ads={jobRequests}
                onAdDelete={(id) => handleDeleteTrigger(id, "ad")}
                showEditButton={true}
              />
            </CardContent>
          </Card>
        )}
      </div>
      <AlertDialog
        open={!!adToDelete}
        onOpenChange={(open) => !open && setAdToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء سيقوم بحذف الإعلان بشكل نهائي. لا يمكن التراجع عن
              هذا القرار.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAdToDelete(null)}>
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              تأكيد الحذف
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
