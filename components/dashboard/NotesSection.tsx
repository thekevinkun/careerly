"use client";

import { useEffect, useState } from "react";
import moment from "moment";
import useSWR from "swr";

import { Trash2 } from "lucide-react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Note, NotesSectionProps } from "@/types/dashboard";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const NotesSection = ({ selectedJobId }: NotesSectionProps) => {
  const { data: notes, mutate } = useSWR<Note[]>(
    selectedJobId ? `/api/jobs/${selectedJobId}/notes` : null,
    fetcher
  );

  const [newNote, setNewNote] = useState("");
  const [showNoteInput, setShowNoteInput] = useState(false);
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

  useEffect(() => {
    setShowNoteInput(false);
  }, [selectedJobId, notes]);

  return (
    <Card className="relative h-full flex flex-col">
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>

      {!showNoteInput && notes && selectedJobId && notes.length > 0 && (
        <div className="absolute top-0 right-0 p-3.5">
          <Button
            size="sm"
            onClick={() => setShowNoteInput(true)}
            disabled={loading}
            className="text-lg py-3.5 cursor-pointer"
          >
            +
          </Button>
        </div>
      )}

      <CardContent className="flex-1 flex flex-col overflow-hidden">
        {!selectedJobId ? (
          <div className="flex-1 flex-center text-muted-foreground">
            Select a job to view notes
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto pr-2">
              {(!notes || notes.length === 0) && (
                <>
                  <p className="text-sm text-muted-foreground">
                    No notes yet. Add your first one below.
                  </p>

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

              <Table>
                <TableBody>
                  {notes?.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell>{note.note}</TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {moment(note.createdAt).format("MMM D, YYYY")}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={async () => {
                            if (!confirm("Delete this note?")) return;
                            await fetch(
                              `/api/jobs/${selectedJobId}/notes/${note.id}`,
                              { method: "DELETE" }
                            );
                            mutate(); // refresh list
                          }}
                        >
                          <Trash2 />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {showNoteInput && (
              <div className="flex items-center gap-2 mt-4">
                <Input
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Write a note..."
                />
                <Button onClick={handleAddNote} disabled={loading}>
                  Add
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowNoteInput(false)}
                >
                  Cancel
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default NotesSection;
