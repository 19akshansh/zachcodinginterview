"use client";

import { BellIcon, EyeIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { Switch } from "@/components/ui/switch";
import { ProfileVisibility, UserRole } from "@/config/enums";
import { useSuspenseMe, useUpdateSettings } from "../hooks/useSettings";

export const GeneralTab = () => {
  const { data: me } = useSuspenseMe();
  const updateSettings = useUpdateSettings();

  const emailNotifications = me.settings?.emailNotifications ?? true;
  const appearsToRecruiters =
    me.settings?.profileVisibility === ProfileVisibility.PUBLIC;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications & privacy</CardTitle>
        <CardDescription>
          Control what you hear from us and what recruiters can see.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ItemGroup>
          <Item variant="outline">
            <ItemMedia variant="icon">
              <BellIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Email notifications</ItemTitle>
              <ItemDescription>
                Interview invites, report summaries, and account updates.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Switch
                checked={emailNotifications}
                disabled={updateSettings.isPending}
                onCheckedChange={(checked) =>
                  updateSettings.mutate({ emailNotifications: checked })
                }
              />
            </ItemActions>
          </Item>

          {me.role === UserRole.CANDIDATE && (
            <Item variant="outline">
              <ItemMedia variant="icon">
                <EyeIcon />
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Appear to recruiters</ItemTitle>
                <ItemDescription>
                  Let recruiters discover your profile and reach out with
                  opportunities.
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <Switch
                  checked={appearsToRecruiters}
                  disabled={updateSettings.isPending}
                  onCheckedChange={(checked) =>
                    updateSettings.mutate({
                      profileVisibility: checked
                        ? ProfileVisibility.PUBLIC
                        : ProfileVisibility.PRIVATE,
                    })
                  }
                />
              </ItemActions>
            </Item>
          )}
        </ItemGroup>
      </CardContent>
    </Card>
  );
};
