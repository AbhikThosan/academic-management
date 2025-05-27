"use client";
import React from "react";
import { Modal } from "antd";

interface ConfirmDeleteModalProps {
  open: boolean;
  title?: string;
  content?: string;
  onOk: () => void;
  onCancel: () => void;
  okText?: string;
  cancelText?: string;
}

export default function ConfirmDeleteModal({
  open,
  title = "Delete",
  content = "Are you sure you want to delete this item?",
  onOk,
  onCancel,
  okText = "Delete",
  cancelText = "Cancel",
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      okType="danger"
      cancelText={cancelText}
      centered
      destroyOnClose
    >
      {content}
    </Modal>
  );
}
