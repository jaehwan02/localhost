import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MOCK_TEAMS = [
  { id: 1, name: "Team 1", members: 4, coins: 1200 },
  { id: 2, name: "Team 2", members: 3, coins: 850 },
  { id: 3, name: "Team 3", members: 5, coins: 2100 },
  { id: 4, name: "Team 4", members: 4, coins: 500 },
  { id: 5, name: "Team 5", members: 2, coins: 3000 },
];

export default function AdminTeamsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">팀 관리</h1>
        <Button>+ 새 팀 추가</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>팀 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>팀명</TableHead>
                <TableHead>팀원 수</TableHead>
                <TableHead>보유 코인</TableHead>
                <TableHead className="text-right">관리</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_TEAMS.map((team) => (
                <TableRow key={team.id}>
                  <TableCell>{team.id}</TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.members}명</TableCell>
                  <TableCell>{team.coins.toLocaleString()} 코인</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm">
                      코인 조정
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      삭제
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
