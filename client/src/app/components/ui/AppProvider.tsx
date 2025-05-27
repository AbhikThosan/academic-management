"use client";

import { ApolloProvider } from "@apollo/client";
import { Provider } from "react-redux";
import { useEffect } from "react";
import { client } from "@/app/lib/apollo-client";
import { store } from "@/app/lib/redux/store";
import { initializeAuth } from "@/app/lib/redux/slices/authSlice";
import { Toaster } from "react-hot-toast";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    store.dispatch(initializeAuth());
  }, []);

  return <>{children}</>;
}

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>
        <AuthInitializer>{children}</AuthInitializer>
        <Toaster position="top-right" />
      </Provider>
    </ApolloProvider>
  );
}
