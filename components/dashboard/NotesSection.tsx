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
import { fetcher } from "@/lib/helpers";
import { ScrollArea } from "../ui/scroll-area";

const NotesSection = ({ selectedJobId }: NotesSectionProps) => {
  const { data: notes, mutate, isLoading } = useSWR<Note[]>(
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
    <Card className="relative h-full flex flex-col !gap-5">
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
            <div className="flex-1 pr-2">
              {isLoading ? (
                <div className="pt-5 flex-1 flex-center text-muted-foreground">
                  Loading notes...
                </div>
              ) : (!notes || notes.length === 0) && (
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

              <ScrollArea className="h-[14vh] w-full">
                <Table>
                  <TableBody>
                    {notes?.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell>{note.note}</TableCell>
                        <TableCell className="text-end text-muted-foreground">
                          {moment(note.createdAt).format("MMM D, YYYY")}
                        </TableCell>
                        <TableCell className="!p-1.5 !pr-2.5 text-end !w-0">
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
              </ScrollArea>
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
