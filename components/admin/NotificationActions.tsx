"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createNotification, deleteNotification } from "@/actions/admin";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Send } from "lucide-react";

export function CreateNotificationDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("ALL");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      await createNotification({ title, body, audience });
      setTitle("");
      setBody("");
      setAudience("ALL");
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-2 rounded-xl">
          <Plus className="w-4 h-4" />
          Send Notification
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send Platform Notification
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="e.g. Scheduled Maintenance"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Message</Label>
            <textarea
              id="body"
              placeholder="Write the notification message..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={4}
              className="flex w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="audience">Audience</Label>
            <select
              id="audience"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="flex h-9 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="ALL">All Users</option>
              <option value="PREMIUM">Premium Only</option>
              <option value="FREE">Free Tier Only</option>
            </select>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              className="rounded-xl gap-2"
              disabled={isPending || !title.trim() || !body.trim()}
            >
              {isPending ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteNotificationButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 w-7 p-0 rounded-xl text-muted-foreground hover:text-foreground"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await deleteNotification(id);
          router.refresh();
        })
      }
    >
      <Trash2 className="w-3.5 h-3.5" />
    </Button>
  );
}
