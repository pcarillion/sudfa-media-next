"use client";

import React from "react";

const LexicalRenderer = ({
  content,
  small,
}: {
  content: any;
  small?: true;
}) => {
  return (
    <div
      className={`rich-text-renderer ${small ? "small" : ""}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export default LexicalRenderer;
