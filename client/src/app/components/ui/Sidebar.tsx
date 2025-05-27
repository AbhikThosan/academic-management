"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Layout, Menu, Button, Drawer } from "antd";
import {
  MenuOutlined,
  DashboardOutlined,
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  BarChartOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useAppSelector, useAppDispatch } from "@/app/lib/redux/store";
import { logout } from "@/app/lib/redux/slices/authSlice";

const { Sider } = Layout;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerVisible, setMobileDrawerVisible] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  const items = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/students",
      icon: <UserOutlined />,
      label: "Students",
    },
    {
      key: "/courses",
      icon: <BookOutlined />,
      label: "Courses",
    },
    {
      key: "/faculty",
      icon: <TeamOutlined />,
      label: "Faculty",
    },
    {
      key: "/reports",
      icon: <BarChartOutlined />,
      label: "Reports",
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    router.push("/login");
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerVisible(!mobileDrawerVisible);
  };

  if (!isAuthenticated) return null;

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button icon={<MenuOutlined />} onClick={toggleMobileDrawer} />
      </div>

      {/* Drawer for Mobile */}
      <Drawer
        placement="left"
        closable
        onClose={toggleMobileDrawer}
        open={mobileDrawerVisible}
        className="md:hidden"
      >
        <Menu
          mode="inline"
          selectedKeys={[pathname]}
          items={items}
          onClick={({ key }) => {
            router.push(key);
            setMobileDrawerVisible(false);
          }}
          style={{ height: "100%", borderRight: 0 }}
        />
        <div className="p-4">
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            block
            danger
          >
            Logout
          </Button>
        </div>
      </Drawer>

      {/* Sidebar for Desktop */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="hidden md:block fixed top-0 left-0 h-screen"
        width={200}
        style={{ zIndex: 40 }}
      >
        <div className="h-16 flex items-center justify-center text-white text-lg font-bold">
          {collapsed ? "AM" : "Academic Mgmt"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={items}
          onClick={({ key }) => router.push(key)}
        />
        <div className="absolute bottom-4 w-full px-4">
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
            block
            danger
          >
            {collapsed ? "" : "Logout"}
          </Button>
        </div>
      </Sider>
    </>
  );
}
