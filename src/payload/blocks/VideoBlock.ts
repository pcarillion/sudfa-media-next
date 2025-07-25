import { Block } from "payload";

export const VideoBlock: Block = {
  slug: "video",
  labels: {
    singular: "Vidéo",
    plural: "Vidéos",
  },
  fields: [
    {
      name: "videoType",
      type: "select",
      label: "Type de vidéo",
      options: [
        {
          label: "YouTube",
          value: "youtube",
        },
        {
          label: "Vimeo",
          value: "vimeo",
        },
      ],
      defaultValue: "youtube",
      required: true,
    },
    {
      name: "youtubeID",
      type: "text",
      label: "ID YouTube",
      admin: {
        description: "Seulement l'ID de la vidéo (ex: dQw4w9WgXcQ)",
        condition: (_data, field) => field.videoType === "youtube",
      },
    },
    {
      name: "vimeoID",
      type: "text",
      label: "ID Vimeo",
      admin: {
        description: "Seulement l'ID de la vidéo (ex: 123456789)",
        condition: (_data, field) => field.videoType === "vimeo",
      },
    },
    {
      name: "title",
      type: "text",
      label: "Titre de la vidéo",
    },
  ],
};
