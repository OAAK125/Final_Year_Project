"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

export default function ManCertTop() {
  const supabase = createClient();

  const [topics, setTopics] = useState([]);
  const [certTypes, setCertTypes] = useState([]);
  const [newTopic, setNewTopic] = useState({ name: "" });
  const [newCertType, setNewCertType] = useState({ name: "" });
  const [showAlert, setShowAlert] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: topicData }, { data: typeData }] = await Promise.all([
        supabase.from("topics").select("*"),
        supabase.from("certification_type").select("*"),
      ]);

      setTopics(topicData || []);
      setCertTypes(typeData || []);
    };

    fetchData();
  }, []);

  const handleNewTopicChange = (value) => setNewTopic({ name: value });
  const handleNewCertTypeChange = (value) => setNewCertType({ name: value });

  const saveItem = async (item, table) => {
    setSaving(true);
    try {
      await supabase.from(table).insert([item]);
      const { data } = await supabase.from(table).select("*");
      if (table === "topics") setTopics(data || []);
      else setCertTypes(data || []);
      setNewTopic({ name: "" });
      setNewCertType({ name: "" });
      setShowAlert(false);
    } catch (err) {
      console.error(`Error saving to ${table}:`, err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Topics & Certification Types</h1>

      {/* Topics Table */}
      <h2 className="text-xl font-semibold mb-2">Topics</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {topics.map((topic) => (
            <TableRow key={topic.id}>
              <TableCell>{topic.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add New Topic */}
      <div className="mt-4 flex gap-2">
        <Input
          placeholder="New Topic"
          value={newTopic.name}
          onChange={(e) => handleNewTopicChange(e.target.value)}
        />
        <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
          <AlertDialogTrigger asChild>
            <Button>Add Topic</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save New Topic?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button onClick={() => saveItem(newTopic, "topics")} disabled={saving}>
                {saving ? "Saving..." : "Confirm"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <hr className="my-8" />

      {/* Certification Types Table */}
      <h2 className="text-xl font-semibold mb-2">Certification Types</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certTypes.map((ct) => (
            <TableRow key={ct.id}>
              <TableCell>{ct.name}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Add New Certification Type */}
      <div className="mt-4 flex gap-2">
        <Input
          placeholder="New Certification Type"
          value={newCertType.name}
          onChange={(e) => handleNewCertTypeChange(e.target.value)}
        />
        <AlertDialog open={showAlert} onOpenChange={setShowAlert}>
          <AlertDialogTrigger asChild>
            <Button>Add Certification Type</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Save New Certification Type?</AlertDialogTitle>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <Button
                onClick={() => saveItem(newCertType, "certification_type")}
                disabled={saving}
              >
                {saving ? "Saving..." : "Confirm"}
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </section>
  );
}
