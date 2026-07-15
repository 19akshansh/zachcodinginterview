"use client";

import { Loader2Icon, TrashIcon } from "lucide-react";
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
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useDeleteAccount } from "../hooks/useSettings";

export const DangerZoneTab = () => {
  const deleteAccount = useDeleteAccount();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danger zone</CardTitle>
        <CardDescription>
          Irreversible actions. Please proceed with caution.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Item variant="outline" className="border-destructive/20">
          <ItemMedia variant="icon" className="text-destructive">
            <TrashIcon />
          </ItemMedia>
          <ItemContent>
            <ItemTitle>Delete account</ItemTitle>
            <ItemDescription>
              Permanently delete your account, interviews, reports, and resume.
              This can't be undone.
            </ItemDescription>
          </ItemContent>
          <ItemActions>
            <AlertDialog>
              <AlertDialogTrigger
                render={
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    disabled={deleteAccount.isPending}
                  >
                    {deleteAccount.isPending ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <TrashIcon className="size-4" />
                    )}
                    Delete account
                  </Button>
                }
              />
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete your account permanently?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete your profile, interviews,
                    reports, resume, and practice history. You won't be able to
                    undo this or recover your data.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Keep account</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => deleteAccount.mutate()}
                  >
                    Yes, delete my account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </ItemActions>
        </Item>
      </CardContent>
    </Card>
  );
};
