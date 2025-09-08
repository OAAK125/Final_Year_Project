"use client";

import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, MoreHorizontal, Edit, Trash2, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";

export default function UserManagementPage() {
  const supabase = createClient();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

const fetchUsers = async () => {
  try {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("id, full_name, email, avatar_url, role, status, created_at, updated_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
      return;
    }

    // Transform the data to match your schema
    const formattedUsers = data.map((profile) => ({
      id: profile.id,
      email: profile.email || "No email",
      role: profile.role || "student",
      status: profile.status || "active",
      created_at: profile.created_at,
      updated_at: profile.updated_at,
      profile: {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
      },
    }));

    setUsers(formattedUsers);
  } catch (error) {
    console.error("Error:", error);
    toast.error("Failed to load users");
  } finally {
    setIsLoading(false);
  }
};

const filterUsers = () => {
  let filtered = users;

  // Apply search filter
  if (searchTerm) {
    filtered = filtered.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.profile?.full_name && user.profile.full_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }

  // Apply role filter
  if (roleFilter !== "all") {
    filtered = filtered.filter(user => user.role === roleFilter);
  }

  // Apply status filter
  if (statusFilter !== "all") {
    filtered = filtered.filter(user => user.status === statusFilter);
  }

  setFilteredUsers(filtered);
};

const updateUserRole = async (userId, newRole) => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ role: newRole, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
      return;
    }

    toast.success("User role updated successfully");
    fetchUsers(); // Refresh the user list
  } catch (error) {
    console.error("Error:", error);
    toast.error("Failed to update user role");
  }
};

const updateUserStatus = async (userId, newStatus) => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", userId);

    if (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
      return;
    }

    toast.success(`User ${newStatus === "active" ? "activated" : "suspended"} successfully`);
    fetchUsers(); // Refresh the user list
  } catch (error) {
    console.error("Error:", error);
    toast.error("Failed to update user status");
  }
};

const deleteUser = async (userId) => {
  if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
    return;
  }

  try {
    // First delete from auth.users (this will cascade to profiles due to foreign key with on delete CASCADE)
    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
      return;
    }

    toast.success("User deleted successfully");
    fetchUsers(); // Refresh the user list
  } catch (error) {
    console.error("Error:", error);
    toast.error("Failed to delete user");
  }
};

const getUserName = (user) => {
  if (user.profile?.full_name) {
    return user.profile.full_name;
  }
  return user.email || "Unknown User";
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getRoleBadgeVariant = (role) => {
  switch (role) {
    case "admin": return "destructive";
    case "contributor": return "default";
    case "student": return "secondary";
    default: return "outline";
  }
};

const getStatusBadgeVariant = (status) => {
  return status === "active" ? "default" : "outline";
};

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage user accounts, roles, and permissions
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>All Users</CardTitle>
              <CardDescription>
                {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""} found
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="contributor">Contributor</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="suspended">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchTerm || roleFilter !== "all" || statusFilter !== "all"
                  ? "No users match your search criteria"
                  : "No users found"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {getUserName(user)}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(user.created_at)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          
                          {/* Role Management */}
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Change Role
                          </DropdownMenuLabel>
                          {user.role !== "admin" && (
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, "admin")}>
                              Make Admin
                            </DropdownMenuItem>
                          )}
                          {user.role !== "contributor" && (
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, "contributor")}>
                              Make Contributor
                            </DropdownMenuItem>
                          )}
                          {user.role !== "student" && (
                            <DropdownMenuItem onClick={() => updateUserRole(user.id, "student")}>
                              Make User
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          {/* Status Management */}
                          <DropdownMenuLabel className="text-xs text-muted-foreground">
                            Change Status
                          </DropdownMenuLabel>
                          {user.status === "active" ? (
                            <DropdownMenuItem onClick={() => updateUserStatus(user.id, "suspended")}>
                              <UserX className="h-4 w-4 mr-2" />
                              Suspend User
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => updateUserStatus(user.id, "active")}>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Activate User
                            </DropdownMenuItem>
                          )}
                          
                          <DropdownMenuSeparator />
                          
                          {/* Delete Action */}
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => deleteUser(user.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete User
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
    </div>
  );
}