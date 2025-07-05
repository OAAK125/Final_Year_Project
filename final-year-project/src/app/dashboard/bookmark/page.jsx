"use client";

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const triggerStyle =
  "text-sm px-4 py-2 border border-input rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring data-[state=open]:border-primary data-[state=open]:text-primary";

const BookmarkPage = () => {
  return (
    <section className="p-5 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bookmarks</h1>
        <p className="text-muted-foreground mt-2">
          Browse through your favourite practice tests.
        </p>
      </div>

      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        <Button variant="outline" className="text-sm px-4 py-2">
          Courses
        </Button>
        <Button variant="outline" className="text-sm px-4 py-2">
          Questions
        </Button>

        <Select>
          <SelectTrigger className={triggerStyle}>
            <SelectValue placeholder="Arrangement" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="popular">Popular</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />
    </section>
  );
};

export default BookmarkPage;
