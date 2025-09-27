"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSWRConfig } from "swr";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import moment from "moment";

const AddJobForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.get("modal") === "add-job";
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();

  const [appliedAt, setAppliedAt] = useState<Date | undefined>();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const body = {
      title: formData.get("title"),
      company: formData.get("company"),
      jobLink: formData.get("jobLink"),
      status: formData.get("status"),
      appliedAt: appliedAt ? appliedAt.toISOString(): new Date().toISOString(),
      description: formData.get("description"),
    };

    setLoading(true);

    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (res.ok) {
      mutate("/api/jobs"); // refersh list of jobs
      mutate("/api/jobs/status-summary"); // refersh chart
      handleClose();
    } else {
      alert("Failed to add job");
    }
  };

  const handleOpen = () => {
    router.push("?modal=add-job", { scroll: false });
  }

  const handleClose = () => {
    router.push("/dashboard", { scroll: false });
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => (open ? handleOpen() : handleClose())}>
      <DialogTrigger asChild>
        <Button 
          className="lg:w-full lg:mb-6"
        >
          + Add Job
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Job</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" name="company" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="jobLink">Job link</Label>
            <Input id="jobLink" name="jobLink" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select name="status" defaultValue="applied">
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent className="bg-card border border-border shadow-xl">
                <SelectItem value="applied">Applied</SelectItem>
                <SelectItem value="interviewing">Interviewing</SelectItem>
                <SelectItem value="offer">Offer</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="appliedAt">Applied at</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal !border-muted-foreground/40 focus:!border-primary"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {appliedAt ? moment(appliedAt).format("MMM D, YYYY") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-card shadow-md rounded-xl border">
                <Calendar
                  mode="single"
                  selected={appliedAt}
                  onSelect={setAppliedAt}
                  autoFocus
                  className="bg-card rounded-xl"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding…" : "Add job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddJobForm;
