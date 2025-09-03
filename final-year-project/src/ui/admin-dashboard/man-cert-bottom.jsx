"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
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
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import slug from "slug";

export default function ManCertBottom() {
  const supabase = createClient();

  const [certifications, setCertifications] = useState([]);
  const [topics, setTopics] = useState([]);
  const [certificationTypes, setCertificationTypes] = useState([]);
  const [editingCert, setEditingCert] = useState(null);
  const [newCert, setNewCert] = useState({
    name: "",
    topic_id: "",
    certification_type_id: "",
    code: "",
    max_questions: "",
    duration_minutes: "",
  });
  const [showEditAlert, setShowEditAlert] = useState(false);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: certs }, { data: topicData }, { data: typeData }] =
        await Promise.all([
          supabase.from("certifications").select("*"),
          supabase.from("topics").select("id, name"),
          supabase.from("certification_type").select("id, name"),
        ]);

      setCertifications(certs || []);
      setTopics(topicData || []);
      setCertificationTypes(typeData || []);
    };

    fetchData();
  }, []);

  const handleEditChange = (field, value) => {
    setEditingCert((prev) => ({ ...prev, [field]: value }));
  };

  const handleNewChange = (field, value) => {
    setNewCert((prev) => ({ ...prev, [field]: value }));
  };

  const saveCert = async (cert, isNew = false) => {
    setSaving(true);
    try {
      const certData = {
        ...cert,
        slug: slug(cert.name)
      };

      if (isNew) {
        await supabase.from("certifications").insert([certData]);
      } else {
        await supabase.from("certifications").update(certData).eq("id", cert.id);
      }

      const { data: updatedCerts } = await supabase
        .from("certifications")
        .select("*");
      setCertifications(updatedCerts || []);
      setEditingCert(null);
      setNewCert({
        name: "",
        topic_id: "",
        certification_type_id: "",
        code: "",
        max_questions: "",
        duration_minutes: "",
      });
      setShowEditAlert(false);
      setShowAddAlert(false);
    } catch (err) {
      console.error("Error saving certification:", err);
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditingCert(null);
  };

  return (
    <section className="p-6">
      <h1 className="text-3xl font-bold mb-6">Manage Certifications</h1>

      {/* Current Certifications Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Topic</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Questions</TableHead>
            <TableHead>Duration (mins)</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certifications.map((cert) => (
            <TableRow key={cert.id}>
              <TableCell>
                {editingCert?.id === cert.id ? (
                  <Input
                    value={editingCert.name || ""}
                    onChange={(e) => handleEditChange("name", e.target.value)}
                  />
                ) : (
                  cert.name
                )}
              </TableCell>
              <TableCell>
                {editingCert?.id === cert.id ? (
                  <Select
                    value={editingCert.topic_id?.toString() || ""}
                    onValueChange={(val) => handleEditChange("topic_id", val)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((t) => (
                        <SelectItem key={t.id} value={t.id.toString()}>
                          {t.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  topics.find(
                    (t) => t.id.toString() === cert.topic_id?.toString()
                  )?.name || "-"
                )}
              </TableCell>
              <TableCell>
                {editingCert?.id === cert.id ? (
                  <Select
                    value={editingCert.certification_type_id?.toString() || ""}
                    onValueChange={(val) =>
                      handleEditChange("certification_type_id", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {certificationTypes.map((ct) => (
                        <SelectItem key={ct.id} value={ct.id.toString()}>
                          {ct.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  certificationTypes.find(
                    (ct) =>
                      ct.id.toString() ===
                      cert.certification_type_id?.toString()
                  )?.name || "-"
                )}
              </TableCell>
              <TableCell>
                {editingCert?.id === cert.id ? (
                  <Input
                    value={editingCert.code || ""}
                    onChange={(e) => handleEditChange("code", e.target.value)}
                  />
                ) : (
                  cert.code
                )}
              </TableCell>
              <TableCell>
                {editingCert?.id === cert.id ? (
                  <Input
                    type="number"
                    value={editingCert.max_questions || ""}
                    onChange={(e) =>
                      handleEditChange("max_questions", e.target.value)
                    }
                  />
                ) : (
                  cert.max_questions
                )}
              </TableCell>
              <TableCell>
                {editingCert?.id === cert.id ? (
                  <Input
                    type="number"
                    value={editingCert.duration_minutes || ""}
                    onChange={(e) =>
                      handleEditChange("duration_minutes", e.target.value)
                    }
                  />
                ) : (
                  cert.duration_minutes
                )}
              </TableCell>
              <TableCell>
                {editingCert?.id === cert.id ? (
                  <div className="flex space-x-2">
                    <AlertDialog open={showEditAlert} onOpenChange={setShowEditAlert}>
                      <AlertDialogTrigger asChild>
                        <Button size="sm">Save</Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Save Changes?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction asChild>
                            <Button
                              onClick={() => saveCert(editingCert)}
                              disabled={saving}
                            >
                              {saving ? "Saving..." : "Confirm"}
                            </Button>
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button size="sm" onClick={() => setEditingCert({ ...cert })}>
                    Edit
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <hr className="my-8" />

      {/* Add New Certification */}
      <h2 className="text-xl font-semibold mb-4">Add New Certification</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-4">
        <Input
          placeholder="Name"
          value={newCert.name}
          onChange={(e) => handleNewChange("name", e.target.value)}
        />
        <Select
          value={newCert.topic_id}
          onValueChange={(val) => handleNewChange("topic_id", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Topic" />
          </SelectTrigger>
          <SelectContent>
            {topics.map((t) => (
              <SelectItem key={t.id} value={t.id.toString()}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={newCert.certification_type_id}
          onValueChange={(val) => handleNewChange("certification_type_id", val)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Certification Type" />
          </SelectTrigger>
          <SelectContent>
            {certificationTypes.map((ct) => (
              <SelectItem key={ct.id} value={ct.id.toString()}>
                {ct.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          placeholder="Code"
          value={newCert.code}
          onChange={(e) => handleNewChange("code", e.target.value)}
        />
        <Input
          placeholder="Max Questions"
          type="number"
          value={newCert.max_questions}
          onChange={(e) => handleNewChange("max_questions", e.target.value)}
        />
        <Input
          placeholder="Duration (minutes)"
          type="number"
          value={newCert.duration_minutes}
          onChange={(e) => handleNewChange("duration_minutes", e.target.value)}
        />
      </div>

      <AlertDialog open={showAddAlert} onOpenChange={setShowAddAlert}>
        <AlertDialogTrigger asChild>
          <Button
            disabled={!newCert.name.trim() || !newCert.code.trim()}
          >
            Add Certification
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save New Certification?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={() => saveCert(newCert, true)} disabled={saving}>
                {saving ? "Saving..." : "Confirm"}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}