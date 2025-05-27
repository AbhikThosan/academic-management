"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client";
import { Button, Form, Input, Spin } from "antd";
import { toast } from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/app/lib/redux/store";
import { setCredentials } from "@/app/lib/redux/slices/authSlice";
import { LOGIN } from "@/app/lib/graphql/mutations/auth";

export default function Login() {
  const [form] = Form.useForm();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isInitialized } = useAppSelector(
    (state) => state.auth
  );
  const [loginMutation, { loading }] = useMutation(LOGIN);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isInitialized, router]);

  const onFinish = async (values: { email: string; password: string }) => {
    try {
      const toastId = toast.loading("Logging in...");
      const { data } = await loginMutation({
        variables: { email: values.email, password: values.password },
      });
      if (data.login) {
        dispatch(
          setCredentials({ user: data.login.user, token: data.login.token })
        );
        toast.success("Login successful!", { id: toastId });
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
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
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <Form form={form} name="login" onFinish={onFinish} layout="vertical">
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
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Login
            </Button>
          </Form.Item>
        </Form>
        <Button type="link" onClick={() => router.push("/register")}>
          Not registered? Sign up
        </Button>
      </div>
    </div>
  );
}
