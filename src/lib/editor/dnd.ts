import type React from "react";

export const DRAG_ELEMENT_ID = "pixora/editor-element-id";

export const setDraggedElement = (
  event: React.DragEvent,
  elementId: string
) => {
  event.dataTransfer.setData(DRAG_ELEMENT_ID, elementId);
  event.dataTransfer.effectAllowed = "move";
};

export const getDraggedElementId = (event: React.DragEvent) =>
  event.dataTransfer.getData(DRAG_ELEMENT_ID);
