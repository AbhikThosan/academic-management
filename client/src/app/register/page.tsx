"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { Button, Form, Input, Select, Spin } from "antd";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/app/lib/redux/store";
import { setCredentials } from "@/app/lib/redux/slices/authSlice";
import { REGISTER } from "@/app/lib/graphql/mutations/auth";

const { Option } = Select;

export default function Register() {
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );
  const [registerMutation, { loading }] = useMutation(REGISTER);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitialized, router]);

  const onFinish = async (values: {
    email: string;
    password: string;
    role: string;
  }) => {
    try {
      const toastId = toast.loading("Registering...");
      const { data } = await registerMutation({
        variables: {
          email: values.email,
          password: values.password,
          role: values.role,
        },
      });
      if (data.register) {
        dispatch(
          setCredentials({
            user: data.register.user,
            token: data.register.token,
          })
        );
        toast.success("Registration successful!", { id: toastId });
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Registration failed. Please try again.");
      console.error(error);
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Register</h2>
        <Form form={form} name="register" onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                type: "email",
                message: "Please enter a valid email",
              },
            ]}
          >
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter a password" }]}
          >
            <Input.Password placeholder="Enter your password" />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select a role" }]}
          >
            <Select placeholder="Select your role">
              <Option value="admin">Admin</Option>
              <Option value="faculty">Faculty</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Register
            </Button>
          </Form.Item>
        </Form>
        <Button type="link" onClick={() => router.push("/login")}>
          Already registered? Log in
        </Button>
      </div>
    </div>
  );
}
