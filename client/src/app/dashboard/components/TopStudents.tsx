import { Card, List, Avatar, Tag } from "antd";

interface TopStudent {
  id: string;
  name: string;
  gpa: number;
  color: string;
  tag: string;
}

interface TopStudentsProps {
  topStudents: TopStudent[];
}

export default function TopStudents({ topStudents }: TopStudentsProps) {
  return (
    <Card title="Top Students" className="h-full shadow-sm" bordered={false}>
      <List
        itemLayout="horizontal"
        dataSource={topStudents}
        renderItem={(student) => (
          <List.Item className="py-2">
            <List.Item.Meta
              avatar={
                <Avatar style={{ backgroundColor: student.tag, color: "#fff" }}>
                  {topStudents.indexOf(student) + 1}
                </Avatar>
              }
              title={<span className="font-semibold">{student.name}</span>}
              description={
                <span className="text-xs text-gray-500">{student.id}</span>
              }
            />
            <Tag color={student.tag} className="text-base font-semibold">
              {student.gpa}
            </Tag>
          </List.Item>
        )}
      />
    </Card>
  );
}
