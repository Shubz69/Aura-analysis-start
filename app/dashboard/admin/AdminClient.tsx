"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserRow {
  id: string;
  full_name: string | null;
  username: string | null;
  role: string;
}

interface AssetRow {
  id: string;
  symbol: string;
  display_name: string;
  asset_class: string;
  is_active: boolean;
}

interface AdminClientProps {
  users: UserRow[];
  tradesCount: number;
  assets: AssetRow[];
}

export function AdminClient({ users, tradesCount, assets }: AdminClientProps) {
  return (
    <Tabs defaultValue="users">
      <TabsList>
        <TabsTrigger value="users">Users</TabsTrigger>
        <TabsTrigger value="assets">Asset registry</TabsTrigger>
        <TabsTrigger value="overview">Overview</TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        <Card className="glass">
          <CardHeader>
            <CardTitle>User management</CardTitle>
            <CardDescription>View and manage roles. Only super_admin can assign admin/super_admin.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>{u.full_name ?? "—"}</TableCell>
                    <TableCell>{u.username ?? "—"}</TableCell>
                    <TableCell>{u.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="assets">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Asset registry</CardTitle>
            <CardDescription>Active instruments. Edit via main app or API.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Symbol</TableHead>
                  <TableHead>Display name</TableHead>
                  <TableHead>Asset class</TableHead>
                  <TableHead>Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {assets.slice(0, 30).map((a) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.symbol}</TableCell>
                    <TableCell>{a.display_name}</TableCell>
                    <TableCell>{a.asset_class}</TableCell>
                    <TableCell>{a.is_active ? "Yes" : "No"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {assets.length > 30 && (
              <p className="text-sm text-muted-foreground mt-2">Showing 30 of {assets.length} assets.</p>
            )}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="overview">
        <Card className="glass">
          <CardHeader>
            <CardTitle>Community overview</CardTitle>
            <CardDescription>High-level stats.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="text-muted-foreground">Total users:</span> {users.length}</p>
            <p><span className="text-muted-foreground">Total trades (sample):</span> {tradesCount >= 1 ? "Data present" : "None"}</p>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
