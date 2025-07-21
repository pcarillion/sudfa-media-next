import React from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full my-6 p-2 border border-slate-500 relative hover:bg-slate-300"
      data-cy="submit"
    >
      {pending && (
        <Loader2 
          size={15} 
          className="animate-spin absolute left-3"
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      )}
      {text}
    </button>
  );
}
