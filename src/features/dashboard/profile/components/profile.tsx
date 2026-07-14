"use client";

import React from "react";
import { ErrorView } from "@/components/layout/shared/entityComponents";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSuspenseMyProfile } from "../hooks/useProfile";
import { ActivityCalendar } from "./activityCalendar";
import { ProfileAvatar } from "./profileAvatar";
import { ProfileDetails } from "./profileDetails";

const ProfileData = () => {
  const { data: profile } = useSuspenseMyProfile();

  return (
    <Card>
      <CardContent className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <ProfileAvatar name={profile.name} image={profile.image} />
          <ProfileDetails name={profile.name} bio={profile.bio} />
        </div>

        <Separator />

        <ActivityCalendar />
      </CardContent>
    </Card>
  );
};

export const ProfileHeader = () => (
  <div className="flex flex-col">
    <h1 className="text-lg md:text-xl font-semibold">Profile</h1>
    <p className="text-sm text-muted-foreground">
      Manage your public profile and track your practice & interview activity.
    </p>
  </div>
);

const ProfilePage = () => (
  <div className="p-4 md:px-10 md:py-6 h-full">
    <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8 h-full">
      <ProfileHeader />
      <ProfileData />
    </div>
  </div>
);

export const ProfileContainer = () => {
  return (
    <React.Suspense fallback={<ProfileLoading />}>
      <ProfilePage />
    </React.Suspense>
  );
};

export const ProfileLoading = () => (
  <div className="p-4 md:px-10 md:py-6 h-full">
    <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8 h-full">
      <ProfileHeader />
      <div className="flex justify-center items-center flex-1 min-h-[200px]">
        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    </div>
  </div>
);

export const ProfileError = () => (
  <ErrorView message="Failed to load your profile. Please try again." />
);
