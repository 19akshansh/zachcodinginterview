import { BarChart3Icon, FileTextIcon, SendIcon, UsersIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";

export const RecruiterHome = () => {
  return (
    <div className="p-4 md:px-10 md:py-6 h-full max-w-[100vw] overflow-x-hidden">
      <div className="mx-auto max-w-screen-xl w-full flex flex-col gap-y-8">
        <div className="flex flex-col">
          <h1 className="text-lg md:text-xl font-semibold">Recruiter portal</h1>
          <p className="text-sm text-muted-foreground">
            Author questions, invite candidates, and review their results.
          </p>
        </div>

        <ItemGroup className="gap-3">
          <Item variant="outline">
            <ItemMedia variant="icon" className="text-primary">
              <FileTextIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Questions</ItemTitle>
              <ItemDescription>
                Write your own interview questions and track review status.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size="sm" render={<Link href="/recruiter/questions" />}>
                Open
              </Button>
            </ItemActions>
          </Item>

          <Item variant="outline">
            <ItemMedia variant="icon" className="text-primary">
              <SendIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Invites</ItemTitle>
              <ItemDescription>
                Invite candidates by code and track who&apos;s redeemed.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size="sm" render={<Link href="/recruiter/invites" />}>
                Open
              </Button>
            </ItemActions>
          </Item>

          <Item variant="outline">
            <ItemMedia variant="icon" className="text-primary">
              <UsersIcon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Review</ItemTitle>
              <ItemDescription>
                Review completed interviews and make a hire call.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size="sm" render={<Link href="/recruiter/review" />}>
                Open
              </Button>
            </ItemActions>
          </Item>

          <Item variant="outline">
            <ItemMedia variant="icon" className="text-primary">
              <BarChart3Icon />
            </ItemMedia>
            <ItemContent>
              <ItemTitle>Analytics</ItemTitle>
              <ItemDescription>
                Compare pass rates and average scores across candidates, per
                question.
              </ItemDescription>
            </ItemContent>
            <ItemActions>
              <Button size="sm" render={<Link href="/recruiter/analytics" />}>
                Open
              </Button>
            </ItemActions>
          </Item>
        </ItemGroup>
      </div>
    </div>
  );
};
