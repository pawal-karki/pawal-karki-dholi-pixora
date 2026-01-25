"use client";

import React from "react";
import { EasyblocksEditor } from "@easyblocks/editor";

import { createEasyblocksConfig } from "@/lib/easyblocks/config";
import {
  PageBlock,
  SectionBlock,
  ContainerBlock,
  CardBlock,
  TextBlock,
  BadgeBlock,
  ButtonBlock,
  ImageBlock,
} from "./blocks";

const easyblocksComponents = {
  Page: PageBlock,
  Section: SectionBlock,
  Container: ContainerBlock,
  Card: CardBlock,
  Text: TextBlock,
  Badge: BadgeBlock,
  Button: ButtonBlock,
  Image: ImageBlock,
};

const MissingToken = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-background p-6">
    <div className="max-w-xl rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      <h1 className="text-lg font-semibold text-foreground">Easyblocks setup</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Set `NEXT_PUBLIC_EASYBLOCKS_ACCESS_TOKEN` in your environment to open
        the editor.
      </p>
    </div>
  </div>
);

const EasyblocksEditorClient = () => {
  const accessToken = process.env.NEXT_PUBLIC_EASYBLOCKS_ACCESS_TOKEN || "";

  const config = React.useMemo(
    () => (accessToken ? createEasyblocksConfig(accessToken) : null),
    [accessToken]
  );

  if (!accessToken || !config) {
    return <MissingToken />;
  }

  return <EasyblocksEditor config={config} components={easyblocksComponents} />;
};

export default EasyblocksEditorClient;
