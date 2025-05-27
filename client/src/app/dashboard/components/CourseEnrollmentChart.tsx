import dynamic from "next/dynamic";
import { Card } from "antd";
import type { ApexOptions } from "apexcharts";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface CourseEnrollmentsChartProps {
  courseEnrollments: {
    series: { name: string; data: number[] }[];
    options: ApexOptions;
  };
}

export default function CourseEnrollmentsChart({
  courseEnrollments,
}: CourseEnrollmentsChartProps) {
  return (
    <Card
      title="Course Enrollments"
      className="h-full shadow-sm"
      bordered={false}
    >
      <ApexChart
        options={courseEnrollments.options}
        series={courseEnrollments.series}
        type="bar"
        height={250}
      />
    </Card>
  );
}
