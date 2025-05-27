"use client";
import React from "react";
import StudentDetails from "../components/StudentDetails";

export default function StudentDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <div className="p-6 min-h-screen bg-gray-50 mt-6">
      <StudentDetails studentId={params.id} />
    </div>
  );
}
