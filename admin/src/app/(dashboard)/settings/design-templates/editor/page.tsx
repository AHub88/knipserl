import { prisma } from "@/lib/db";
import { TemplateEditorClient } from "./template-editor-client";

type Props = {
  searchParams: Promise<{ id?: string }>;
};

export default async function TemplateEditorPage({ searchParams }: Props) {
  const { id } = await searchParams;

  let existingTemplate = null;
  if (id) {
    existingTemplate = await prisma.layoutTemplate.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        format: true,
        category: true,
        canvasJson: true,
      },
    });
  }

  return (
    <TemplateEditorClient
      existingTemplate={existingTemplate ? JSON.parse(JSON.stringify(existingTemplate)) : null}
    />
  );
}
