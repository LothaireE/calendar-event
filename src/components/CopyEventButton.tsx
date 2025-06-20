"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyCheck, CopyCheckIcon, CopyX } from "lucide-react";

type CopyState = "idle" | "copied" | "error";

export function CopyEventButton ({ eventId, clerkUserId, ...buttonProps} : Omit<React.ComponentProps<typeof Button>, "children" | "onClick"> & {
  eventId: string;
  clerkUserId: string;
}) {

  const [copyState, setCopyState] = useState<CopyState>("idle");

  const handleCopy = () => {
    const url = `${location.origin}/book/${clerkUserId}/${eventId}`;
    navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopyState("copied");
          setTimeout(() => setCopyState("idle"), 2000); // Reset after 2 seconds
        })
        .catch(() => {
          setCopyState("error");
          setTimeout(() => setCopyState("idle"), 2000); // Reset after 2 seconds
        }
    );
  };

  const CopyIcon = getCopyIcon(copyState)

  return (
    <Button onClick={handleCopy} {...buttonProps}>
      <CopyIcon className="size-4 mr-2" />
      {getChildren(copyState)}
    </Button>
  );

}

function getCopyIcon(copyState: CopyState) {
  switch (copyState) {
    case "idle":
      return CopyCheckIcon;
    case "copied":
      return CopyCheck;
    case "error":
      return CopyX;
  }
}

function getChildren(copyState: CopyState) {
  switch (copyState) {
    case "idle":
      return "Copy Event";
    case "copied":
      return "Copied!";
    case "error":
      return "Error!";
  }
}