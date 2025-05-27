"use client";
import { Card, Typography, Tooltip, Tag } from "antd";
import { EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { Course } from "@/app/lib/hooks/useCourses";
import { useState } from "react";

interface CourseCardProps {
  course: Course;
  onEdit: () => void;
  onDelete: () => void;
}

function stringToColor(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const color = Math.floor(
    Math.abs(((Math.sin(hash) * 10000) % 1) * 16777215)
  ).toString(16);
  return `#${color.padStart(6, "0")}`;
}

export default function CourseCard({
  course,
  onEdit,
  onDelete,
}: CourseCardProps) {
  const [hovered, setHovered] = useState(false);
  const headerColor = stringToColor(course.faculty?.name || "Unknown");

  return (
    <Card
      className="transition-shadow duration-200 hover:shadow-2xl relative rounded-xl border-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        minWidth: 260,
        maxWidth: 340,
        margin: "auto",
        background: "#fff",
        borderRadius: 16,
        boxShadow: hovered
          ? "0 4px 24px rgba(0,0,0,0.10)"
          : "0 1px 4px rgba(0,0,0,0.06)",
      }}
      bodyStyle={{ padding: 20, paddingTop: 16 }}
      headStyle={{
        background: headerColor,
        borderRadius: "16px 16px 0 0",
        color: "#fff",
        padding: 12,
      }}
      title={
        <div className="flex items-center justify-between">
          <span style={{ color: "#fff", fontWeight: 600 }}>{course.name}</span>
          {hovered && (
            <div className="flex gap-2">
              <Tooltip title="Edit">
                <EditOutlined
                  onClick={onEdit}
                  className="text-white hover:text-blue-200 cursor-pointer"
                />
              </Tooltip>
              <Tooltip title="Delete">
                <DeleteOutlined
                  onClick={onDelete}
                  className="text-white hover:text-red-200 cursor-pointer"
                />
              </Tooltip>
            </div>
          )}
        </div>
      }
    >
      <Typography.Paragraph
        className="mb-2"
        style={{ color: "#555", fontSize: 15 }}
      >
        <Tag color="blue" style={{ marginRight: 8 }}>
          {course.faculty?.name || "No Faculty"}
        </Tag>
      </Typography.Paragraph>
      <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
        <UserOutlined />
        <span style={{ fontWeight: 500 }}>{course.enrollmentCount}</span>{" "}
        students
      </div>
    </Card>
  );
}
