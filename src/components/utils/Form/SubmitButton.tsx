import React from "react";
import { useFormStatus } from "react-dom";
import { ClipLoader } from "react-spinners";

export function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      className="w-full my-6 p-2 border border-slate-500 relative hover:bg-slate-300"
      data-cy="submit"
    >
      <ClipLoader
        color={"black"}
        loading={pending}
        size={15}
        aria-label="Loading Spinner"
        data-testid="loader"
        className="absolute left-3"
      />
      {text}
    </button>
  );
}
