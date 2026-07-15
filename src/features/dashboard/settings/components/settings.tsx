"use client";

import {
  AlertTriangleIcon,
  CreditCardIcon,
  KeyRoundIcon,
  SlidersHorizontalIcon,
} from "lucide-react";
import React from "react";
import { ErrorView } from "@/components/layout/shared/entityComponents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettingsParams } from "../hooks/useSettingsParams";
import { ApiKeysTab } from "./apiKeysTab";
import { BillingTab } from "./billingTab";
import { DangerZoneTab } from "./dangerZoneTab";
import { GeneralTab } from "./generalTab";

export const SettingsHeader = () => (
  <div className="flex flex-col">
    <h1 className="text-lg md:text-xl font-semibold">Settings</h1>
    <p className="text-sm text-muted-foreground">
      Manage your notifications, privacy, API access, and billing.
    </p>
  </div>
);

const SettingsData = () => {
  const [{ tab }, setParams] = useSettingsParams();

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setParams({ tab: value as typeof tab })}
    >
      <div className="-mx-4 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
        <TabsList className="w-max self-start">
          <TabsTrigger value="general">
            <SlidersHorizontalIcon />
            General
          </TabsTrigger>
          <TabsTrigger value="api-keys">
            <KeyRoundIcon />
            API Keys
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCardIcon />
            Billing
          </TabsTrigger>
          <TabsTrigger value="danger-zone">
            <AlertTriangleIcon />
            Danger Zone
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="general" className="mt-4 max-w-2xl">
        <GeneralTab />
      </TabsContent>
      <TabsContent value="api-keys" className="mt-4 max-w-2xl">
        <ApiKeysTab />
      </TabsContent>
      <TabsContent value="billing" className="mt-4 max-w-2xl">
        <BillingTab />
      </TabsContent>
      <TabsContent value="danger-zone" className="mt-4 max-w-2xl">
        <DangerZoneTab />
      </TabsContent>
    </Tabs>
  );
};

const SettingsPage = () => (
  <div className="p-4 md:px-10 md:py-6 h-full max-w-[100vw] overflow-x-hidden">
    <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8 h-full">
      <SettingsHeader />
      <SettingsData />
    </div>
  </div>
);

export const SettingsContainer = () => {
  return (
    <React.Suspense fallback={<SettingsLoading />}>
      <SettingsPage />
    </React.Suspense>
  );
};

export const SettingsLoading = () => (
  <div className="p-4 md:px-10 md:py-6 h-full max-w-[100vw] overflow-x-hidden">
    <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8 h-full">
      <SettingsHeader />
      <div className="flex justify-center items-center flex-1 min-h-[200px]">
        <div className="size-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    </div>
  </div>
);

export const SettingsError = () => (
  <ErrorView message="Failed to load your settings. Please try again." />
);
