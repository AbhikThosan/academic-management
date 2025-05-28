import { useMutation } from "@apollo/client";
import {
  ADD_STUDENT,
  UPDATE_STUDENT,
  DELETE_STUDENT,
} from "../lib/graphql/mutations/students";
import toast from "react-hot-toast";

interface AddStudentInput {
  name: string;
  year: number;
}

interface UpdateStudentInput {
  id: string;
  name: string;
  year: number;
}

export function useStudentMutations() {
  const [addStudentMutation, { loading: addLoading }] = useMutation(
    ADD_STUDENT,
    {
      onCompleted: () => {
        toast.success("Student added successfully");
      },
      onError: (error) => {
        toast.error(`Failed to add student: ${error.message}`);
      },
    }
  );

  const [updateStudentMutation, { loading: updateLoading }] = useMutation(
    UPDATE_STUDENT,
    {
      onCompleted: () => {
        toast.success("Student updated successfully");
      },
      onError: (error) => {
        toast.error(`Failed to update student: ${error.message}`);
      },
    }
  );

  const [deleteStudentMutation, { loading: deleteLoading }] = useMutation(
    DELETE_STUDENT,
    {
      onCompleted: () => {
        toast.success("Student deleted successfully");
      },
      onError: (error) => {
        toast.error(`Failed to delete student: ${error.message}`);
      },
    }
  );

  const addStudent = async (input: AddStudentInput) => {
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
    }
  };

  const updateStudent = async (input: UpdateStudentInput) => {
    try {
      const { data } = await updateStudentMutation({
        variables: { input },
        context: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        },
      });
      return data.updateStudent;
    } catch (error) {
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      const { data } = await deleteStudentMutation({
        variables: { id },
        context: {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
          },
        },
      });
      return data.deleteStudent;
    } catch (error) {
      throw error;
    }
  };

  return {
    addStudent,
    updateStudent,
    deleteStudent,
    loading: addLoading || updateLoading || deleteLoading,
  };
}
