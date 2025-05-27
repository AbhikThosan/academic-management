import { Card, Col, Row, Statistic } from "antd";

interface SummaryCardProps {
  summaryData: Array<{
    title: string;
    value: number;
    color: string;
    bg: string;
  }>;
}

export default function SummaryCards({ summaryData }: SummaryCardProps) {
  return (
    <Row gutter={[16, 16]} className="mb-6">
      {summaryData.map((item) => (
        <Col xs={24} sm={12} md={8} key={item.title}>
          <Card className={`${item.bg} shadow-sm`} bordered={false}>
            <Statistic
              title={<span className="text-gray-500">{item.title}</span>}
              value={item.value}
              valueStyle={{ color: item.color.replace("text-", "") }}
            />
          </Card>
        </Col>
      ))}
    </Row>
  );
}
