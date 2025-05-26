"use client";

import { ApolloProvider } from "@apollo/client";
import { Provider } from "react-redux";
import { client } from "@/app/lib/apollo-client";
import { store } from "@/app/lib/redux/store";

export default function AppProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ApolloProvider client={client}>
      <Provider store={store}>{children}</Provider>
    </ApolloProvider>
  );
}
