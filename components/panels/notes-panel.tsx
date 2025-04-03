"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Save, Trash, Download, Copy, FileText, Search } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface Note {
  id: string
  title: string
  content: string
  createdAt: number
  updatedAt: number
}

export default function NotesPanel() {
  const { toast } = useToast()
  const [notes, setNotes] = useState<Note[]>([])
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  // Load notes from localStorage on initial render
  useEffect(() => {
    const savedNotes = localStorage.getItem("notes")
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes)
        setNotes(parsedNotes)

        // Set the most recently updated note as active
        if (parsedNotes.length > 0) {
          const sortedNotes = [...parsedNotes].sort((a, b) => b.updatedAt - a.updatedAt)
          setActiveNoteId(sortedNotes[0].id)
          setTitle(sortedNotes[0].title)
          setContent(sortedNotes[0].content)
        }
      } catch (e) {
        console.error("Failed to parse saved notes", e)
      }
    }
  }, [])

  // Save notes to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("notes", JSON.stringify(notes))
  }, [notes])

  // Update form when active note changes
  useEffect(() => {
    if (activeNoteId) {
      const activeNote = notes.find((note) => note.id === activeNoteId)
      if (activeNote) {
        setTitle(activeNote.title)
        setContent(activeNote.content)
      }
    }
  }, [activeNoteId, notes])

  const createNewNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: "Untitled Note",
      content: "",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }

    setNotes([...notes, newNote])
    setActiveNoteId(newNote.id)
    setTitle(newNote.title)
    setContent(newNote.content)

    toast({
      title: "Note Created",
      description: "New note has been created",
    })
  }

  const saveNote = () => {
    if (!activeNoteId) return

    setNotes(
      notes.map((note) => (note.id === activeNoteId ? { ...note, title, content, updatedAt: Date.now() } : note)),
    )

    toast({
      title: "Note Saved",
      description: "Your note has been saved",
    })
  }

  const deleteNote = () => {
    if (!activeNoteId) return

    if (confirm("Are you sure you want to delete this note?")) {
      const updatedNotes = notes.filter((note) => note.id !== activeNoteId)
      setNotes(updatedNotes)

      if (updatedNotes.length > 0) {
        setActiveNoteId(updatedNotes[0].id)
        setTitle(updatedNotes[0].title)
        setContent(updatedNotes[0].content)
      } else {
        setActiveNoteId(null)
        setTitle("")
        setContent("")
      }

      toast({
        title: "Note Deleted",
        description: "Your note has been deleted",
      })
    }
  }

  const downloadNote = () => {
    if (!activeNoteId) return

    const activeNote = notes.find((note) => note.id === activeNoteId)
    if (!activeNote) return

    const blob = new Blob([`# ${activeNote.title}\n\n${activeNote.content}`], { type: "text/plain" })

    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${activeNote.title.replace(/\s+/g, "_")}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Note Downloaded",
      description: `Note saved as ${activeNote.title.replace(/\s+/g, "_")}.md`,
    })
  }

  const copyNoteContent = () => {
    if (!activeNoteId) return

    navigator.clipboard.writeText(content)

    toast({
      title: "Copied",
      description: "Note content copied to clipboard",
    })
  }

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={createNewNote}>
            <Plus className="h-4 w-4 mr-1" />
            New
          </Button>
          <Button variant="outline" size="sm" onClick={saveNote} disabled={!activeNoteId}>
            <Save className="h-4 w-4 mr-1" />
            Save
          </Button>
          <Button variant="outline" size="sm" onClick={deleteNote} disabled={!activeNoteId}>
            <Trash className="h-4 w-4 mr-1" />
            Delete
          </Button>
          <Button variant="outline" size="sm" onClick={downloadNote} disabled={!activeNoteId}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          <Button variant="outline" size="sm" onClick={copyNoteContent} disabled={!activeNoteId}>
            <Copy className="h-4 w-4 mr-1" />
            Copy
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        <div className="w-1/3 border-r p-2 flex flex-col">
          <div className="relative mb-2">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="pl-8"
            />
          </div>

          <div className="flex-1 overflow-auto">
            {filteredNotes.length > 0 ? (
              <ul className="space-y-1">
                {filteredNotes.map((note) => (
                  <li
                    key={note.id}
                    className={`
                      p-2 rounded cursor-pointer flex items-center
                      ${activeNoteId === note.id ? "bg-muted" : "hover:bg-muted/50"}
                    `}
                    onClick={() => setActiveNoteId(note.id)}
                  >
                    <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{note.title}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {new Date(note.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <FileText className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  {notes.length === 0 ? "No notes yet. Create your first note!" : "No notes match your search."}
                </p>
                {notes.length === 0 && (
                  <Button variant="outline" size="sm" className="mt-2" onClick={createNewNote}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Note
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="w-2/3 p-2 flex flex-col">
          {activeNoteId ? (
            <>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note title"
                className="mb-2"
              />
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your note here..."
                className="flex-1 resize-none"
              />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <FileText className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Select a note or create a new one to get started</p>
              <Button variant="outline" className="mt-4" onClick={createNewNote}>
                <Plus className="h-4 w-4 mr-1" />
                Create New Note
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

