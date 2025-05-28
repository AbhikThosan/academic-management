"use client";
import { Card, Typography, Tooltip, Tag } from "antd";
import { EditOutlined, DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { Course } from "@/app/hooks/useCourses";
import { useState } from "react";

interface CourseCardProps {
  course: Course;
  onEdit: () => void;
  onDelete: () => void;
}

export default function CourseCard({
  course,
  onEdit,
  onDelete,
}: CourseCardProps) {
  const [hovered, setHovered] = useState(false);
  const headerColor = "#247994";

  return (
    <Card
      className="transition-shadow duration-200 hover:shadow-2xl relative rounded-xl border-0 w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 16,
        boxShadow: hovered
          ? "0 4px 24px rgba(0,0,0,0.10)"
          : "0 1px 4px rgba(0,0,0,0.06)",
      }}
      bodyStyle={{ padding: "16px", paddingTop: 12 }}
      headStyle={{
        background: headerColor,
        borderRadius: "16px 16px 0 0",
        color: "#fff",
        padding: "12px 16px",
      }}
      title={
        <div className="flex items-center justify-between">
          <span className="text-white font-semibold text-base sm:text-lg truncate pr-2">
            {course.name}
          </span>
          {hovered && (
            <div className="flex gap-2 flex-shrink-0">
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
        style={{ color: "#555", fontSize: 14 }}
      >
        <Tag color="blue" style={{ marginRight: 8 }}>
          {course.faculty?.name || "No Faculty"}
        </Tag>
      </Typography.Paragraph>
      <div className="flex items-center gap-2 text-xs text-gray-600">
        <UserOutlined />
        <span style={{ fontWeight: 500 }}>{course.enrollmentCount}</span>{" "}
        students
      </div>
    </Card>
  );
}
