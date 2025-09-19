"use client";

import { useState } from "react";
import useSWR from "swr";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import moment from "moment";

import { Note, NotesSectionProps } from "@/types/dashboard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const NotesSection = ({ selectedJobId }: NotesSectionProps) => {
  const { data: notes, mutate } = useSWR<Note[]>(
    selectedJobId ? `/api/jobs/${selectedJobId}/notes` : null,
    fetcher
  );

  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAddNote = async () => {
    if (!newNote.trim() || !selectedJobId) return;

    setLoading(true);
    const res = await fetch(`/api/jobs/${selectedJobId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newNote }),
    });
    setLoading(false);

    if (res.ok) {
      setNewNote("");
      mutate(); // refresh list
    } else {
      alert("Failed to add note");
    }
  };

  return (
    <Card className="mt-2">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>

      <CardContent>
        {!selectedJobId ? (
          <div className="text-center py-8 text-muted-foreground">
            Select a job to view notes
          </div>
        ) : (
          <>
            {(!notes || notes.length === 0) && (
              <p className="text-sm text-muted-foreground">
                No notes yet. Add your first one below.
              </p>
            )}

            <Table>
              <TableBody>
                {notes?.map((note) => (
                  <TableRow key={note.id}>
                    <TableCell>{note.note}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {moment(note.createdAt).format("MMM D, YYYY")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center gap-2 mt-4">
              <Input
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Write a note..."
              />
              <Button onClick={handleAddNote} disabled={loading}>
                Add
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesSection;
