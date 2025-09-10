"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Edit,
    Trash2,
    MoreVertical,
    Calendar,
    Clock,
    Users,
    Eye,
    EyeOff,
    Plus,
    Search,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

export function QuizzesManagement() {
    const supabase = createClient();
    const [quizzes, setQuizzes] = useState([]);
    const [filteredQuizzes, setFilteredQuizzes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteQuizId, setDeleteQuizId] = useState(null);

    useEffect(() => {
        fetchQuizzes();
    }, []);

    useEffect(() => {
        const filtered = quizzes.filter(quiz =>
            quiz.short_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.certification?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            quiz.certification?.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredQuizzes(filtered);
    }, [searchTerm, quizzes]);

    const fetchQuizzes = async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from("quizzes")
                .select(`
          *,
          certification:certifications (
            name,
            code
          )
        `)
                .order("created_at", { ascending: false });

            if (error) {
                console.error("Error fetching quizzes:", error);
                toast.error("Failed to load quizzes");
                return;
            }

            setQuizzes(data || []);
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to load quizzes");
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditQuiz = (quiz) => {
        setEditingQuiz(quiz);
        setIsEditDialogOpen(true);
    };

    const handleSaveQuiz = async () => {
        if (!editingQuiz) return;

        try {
            const { error } = await supabase
                .from("quizzes")
                .update({
                    short_description: editingQuiz.short_description,
                    long_description: editingQuiz.long_description,
                    instructions: editingQuiz.instructions,
                    participants: editingQuiz.participants,
                    is_active: editingQuiz.is_active,
                    start_date: editingQuiz.start_date,
                })
                .eq("id", editingQuiz.id);

            if (error) {
                console.error("Error updating quiz:", error);
                toast.error("Failed to update quiz");
                return;
            }

            toast.success("Quiz updated successfully");
            setIsEditDialogOpen(false);
            setEditingQuiz(null);
            fetchQuizzes();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to update quiz");
        }
    };

    const handleDeleteQuiz = async () => {
        if (!deleteQuizId) return;

        try {
            const { error } = await supabase
                .from("quizzes")
                .delete()
                .eq("id", deleteQuizId);

            if (error) {
                console.error("Error deleting quiz:", error);
                toast.error("Failed to delete quiz");
                return;
            }

            toast.success("Quiz deleted successfully");
            setIsDeleteDialogOpen(false);
            setDeleteQuizId(null);
            fetchQuizzes();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to delete quiz");
        }
    };

    const toggleQuizStatus = async (quizId, currentStatus) => {
        try {
            const { error } = await supabase
                .from("quizzes")
                .update({ is_active: !currentStatus })
                .eq("id", quizId);

            if (error) {
                console.error("Error toggling quiz status:", error);
                toast.error("Failed to update quiz status");
                return;
            }

            toast.success(`Quiz ${!currentStatus ? "activated" : "deactivated"}`);
            fetchQuizzes();
        } catch (error) {
            console.error("Error:", error);
            toast.error("Failed to update quiz status");
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                        <p className="mt-4 text-muted-foreground">Loading quizzes...</p>
                    </div>
                </div>
            </div>
        );
    }


    const handleScroll = () => {
        const el = document.getElementById("quiz-gen");
        if (el) {
            el.scrollIntoView({ behavior: "smooth" });
        }
    };
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Quizzes Management</h1>
                    <p className="text-muted-foreground">
                        Create, edit, and manage your quizzes
                    </p>
                </div>
                <Button onClick={handleScroll}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Quiz
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>All Quizzes</CardTitle>
                            <CardDescription>
                                {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""} found
                            </CardDescription>
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder="Search quizzes..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredQuizzes.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-muted-foreground">
                                {searchTerm ? "No quizzes match your search" : "No quizzes found"}
                            </p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Quiz Description</TableHead>
                                    <TableHead>Certification</TableHead>
                                    <TableHead>Participants</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredQuizzes.map((quiz) => (
                                    <TableRow key={quiz.id}>
                                        <TableCell>
                                            <Button
                                                variant={quiz.is_active ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => toggleQuizStatus(quiz.id, quiz.is_active)}
                                                className="flex items-center gap-1"
                                            >
                                                {quiz.is_active ? (
                                                    <Eye className="h-4 w-4" />
                                                ) : (
                                                    <EyeOff className="h-4 w-4" />
                                                )}
                                                {quiz.is_active ? "Active" : "Inactive"}
                                            </Button>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{quiz.short_description}</p>
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {quiz.long_description}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {quiz.certification ? (
                                                <div>
                                                    <p className="font-medium">{quiz.certification.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {quiz.certification.code}
                                                    </p>
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">Not assigned</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                                                <span>{quiz.participants}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleEditQuiz(quiz)}>
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => toggleQuizStatus(quiz.id, quiz.is_active)}
                                                    >
                                                        {quiz.is_active ? (
                                                            <EyeOff className="h-4 w-4 mr-2" />
                                                        ) : (
                                                            <Eye className="h-4 w-4 mr-2" />
                                                        )}
                                                        {quiz.is_active ? "Deactivate" : "Activate"}
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive"
                                                        onClick={() => {
                                                            setDeleteQuizId(quiz.id);
                                                            setIsDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Edit Quiz Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Edit Quiz</DialogTitle>
                        <DialogDescription>
                            Update the quiz details below.
                        </DialogDescription>
                    </DialogHeader>
                    {editingQuiz && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="short_description" className="text-right">
                                    Short Description
                                </Label>
                                <Input
                                    id="short_description"
                                    value={editingQuiz.short_description}
                                    onChange={(e) =>
                                        setEditingQuiz({
                                            ...editingQuiz,
                                            short_description: e.target.value,
                                        })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="long_description" className="text-right">
                                    Long Description
                                </Label>
                                <Textarea
                                    id="long_description"
                                    value={editingQuiz.long_description}
                                    onChange={(e) =>
                                        setEditingQuiz({
                                            ...editingQuiz,
                                            long_description: e.target.value,
                                        })
                                    }
                                    className="col-span-3"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="instructions" className="text-right">
                                    Instructions
                                </Label>
                                <Textarea
                                    id="instructions"
                                    value={editingQuiz.instructions}
                                    onChange={(e) =>
                                        setEditingQuiz({
                                            ...editingQuiz,
                                            instructions: e.target.value,
                                        })
                                    }
                                    className="col-span-3"
                                    rows={3}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="participants" className="text-right">
                                    Participants
                                </Label>
                                <Input
                                    id="participants"
                                    type="number"
                                    value={editingQuiz.participants}
                                    onChange={(e) =>
                                        setEditingQuiz({
                                            ...editingQuiz,
                                            participants: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    className="col-span-3"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="is_active" className="text-right">
                                    Status
                                </Label>
                                <Select
                                    value={editingQuiz.is_active ? "active" : "inactive"}
                                    onValueChange={(value) =>
                                        setEditingQuiz({
                                            ...editingQuiz,
                                            is_active: value === "active",
                                        })
                                    }
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSaveQuiz}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the quiz
                            and remove all associated data.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteQuiz} className="bg-destructive text-destructive-foreground">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}