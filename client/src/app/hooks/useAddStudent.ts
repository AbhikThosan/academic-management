import { useState } from "react";
import { useMutation } from "@apollo/client";
import { ADD_STUDENT } from "../lib/graphql/mutations/students";
import toast from "react-hot-toast";

interface AddStudentInput {
  name: string;
  year: number;
}

export function useAddStudent() {
  const [loading, setLoading] = useState(false);
  const [addStudentMutation] = useMutation(ADD_STUDENT, {
    onCompleted: () => {
      toast.success("Student added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add student: ${error.message}`);
    },
  });

  const addStudent = async (input: AddStudentInput) => {
    setLoading(true);
    try {
      const { data } = await addStudentMutation({
        variables: { input },
        context: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        },
      });
      return data.addStudent;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    addStudent,
    loading,
  };
}
