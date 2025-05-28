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
    <Card
      title={
        <span className="text-base sm:text-lg font-semibold ">
          Top Students
        </span>
      }
      className="h-full shadow-sm hover:shadow-md transition-shadow duration-200"
      bordered={false}
      bodyStyle={{ padding: "16px" }}
    >
      <List
        itemLayout="horizontal"
        dataSource={topStudents}
        renderItem={(student) => (
          <List.Item className="py-2">
            <List.Item.Meta
              avatar={
                <Avatar
                  style={{
                    backgroundColor: student.tag,
                    color: "#fff",
                    width: "32px",
                    height: "32px",
                    lineHeight: "32px",
                    fontSize: "14px",
                  }}
                >
                  {topStudents.indexOf(student) + 1}
                </Avatar>
              }
              title={
                <span className="font-semibold text-sm sm:text-base">
                  {student.name}
                </span>
              }
              description={
                <span className="text-xs text-gray-500">{student.id}</span>
              }
            />
            <Tag
              color={student.tag}
              className="text-sm sm:text-base font-semibold px-2 py-1"
            >
              {student.gpa}
            </Tag>
          </List.Item>
        )}
      />
    </Card>
  );
}
