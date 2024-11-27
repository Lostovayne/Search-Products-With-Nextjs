"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

const BackButton = () => {
  const router = useRouter();

  return (
    <Button variant={"secondary"} onClick={() => router.back()} className="flex gap-2 items-center text-sm pb-2">
      <ChevronLeft className="size-4" />
      Back
    </Button>
  );
};

export default BackButton;
