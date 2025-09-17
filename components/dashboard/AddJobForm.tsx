"use client";

import { useState } from "react";
import { useSWRConfig } from "swr";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const AddJobForm = () => {
  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobLink, setJobLink] = useState("");
  const [description, setDescription] = useState("");
  const [appliedAt, setAppliedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body: any = { title, company, jobLink, description };
      if (appliedAt) body.appliedAt = appliedAt;
      // only a single note for simplicity
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to create job");
      // refresh jobs
      await mutate("/api/jobs");
      setTitle("");
      setCompany("");
      setJobLink("");
      setDescription("");
      setAppliedAt("");
    } catch (err) {
      alert((err as any).message || "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <div>
        <Label>Title</Label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Company</Label>
        <Input
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Job link</Label>
        <Input value={jobLink} onChange={(e) => setJobLink(e.target.value)} />
      </div>
      <div>
        <Label>Applied at</Label>
        <Input
          value={appliedAt}
          onChange={(e) => setAppliedAt(e.target.value)}
          type="date"
        />
      </div>
      <div>
        <Label>Description</Label>
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Adding…" : "Add job"}
      </Button>
    </form>
  );
};

export default AddJobForm;
