import React from "react";
import { cn } from "@/lib/utils";

type BlockquoteProps = {
  children?: React.ReactNode;
  className?: string;
};

const Blockquote = ({ children, className }: BlockquoteProps) => {
  return (
    <div
      className={cn(
        "w-full h-full relative rounded-lg bg-gray-100 py-4 pl-14 pr-5 text-md italic leading-relaxed text-gray-500 before:absolute before:left-3 before:top-3 before:font-serif before:text-5xl before:text-gray-700 before:content-['“']",
        className
      )}
    >
      {children}
    </div>
  );
};

export { Blockquote };
