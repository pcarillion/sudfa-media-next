"use client";

import React from "react";
import { useFormState } from "react-dom";
import { SubmitButton } from "./SubmitButton";

const initialState = {
  status: null,
  message: "",
};

export type FormState = {
  status: "ok" | "error" | null;
  message: string;
};

export type FormSchema = {
  type: "text" | "textarea" | "email";
  name: string;
  placeholder: string;
  required?: boolean;
}[];

interface FormProps {
  submitForm: (state: FormState, formData: FormData) => Promise<FormState>;
  formSchema: FormSchema;
  submitText: string;
}

export const Form = ({ submitForm, formSchema, submitText }: FormProps) => {
  const [state, formAction] = useFormState<FormState, FormData>(
    submitForm,
    initialState
  );
  return (
    <div className="block mx-auto max-w-96">
      {state.status !== "ok" && (
        <form
          action={formAction}
          className="flex flex-col items-stretch py-4 md:py-8"
        >
          {formSchema.map(({ name, type, required, placeholder }) => {
            if (type === "textarea") {
              return (
                <textarea
                  id={name}
                  key={name}
                  name={name}
                  required={required}
                  placeholder={placeholder}
                  className="w-full my-6 p-2 border border-slate-500"
                />
              );
            }
            return (
              <input
                type={type}
                id={name}
                key={name}
                name={name}
                required={required}
                placeholder={placeholder}
                className="w-full my-6 p-2 border border-slate-500"
              />
            );
          })}
          <input name="hp" id="hp" className="hidden" />
          <SubmitButton text={submitText} />
        </form>
      )}
      {state.status && (
        <div
          className={`w-full text-center my-12 ${
            state.status === "error" ? "text-red-600" : ""
          }`}
        >
          {state.message}
        </div>
      )}
    </div>
  );
};
