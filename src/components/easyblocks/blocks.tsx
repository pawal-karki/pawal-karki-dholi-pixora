"use client";

import React, { type ReactElement } from "react";

type Slot = React.ReactNode;

const renderSlot = (slot: Slot) =>
  slot ? React.Children.toArray(slot) : null;

export const PageBlock = ({
  Root,
  Sections,
}: {
  Root: ReactElement;
  Sections?: Slot;
}) => {
  const RootEl = Root.type;
  return <RootEl {...Root.props}>{renderSlot(Sections)}</RootEl>;
};

export const SectionBlock = ({
  Root,
  Content,
}: {
  Root: ReactElement;
  Content?: Slot;
}) => {
  const RootEl = Root.type;
  return <RootEl {...Root.props}>{renderSlot(Content)}</RootEl>;
};

export const ContainerBlock = ({
  Root,
  Items,
}: {
  Root: ReactElement;
  Items?: Slot;
}) => {
  const RootEl = Root.type;
  return <RootEl {...Root.props}>{renderSlot(Items)}</RootEl>;
};

export const CardBlock = ({
  Root,
  Content,
}: {
  Root: ReactElement;
  Content?: Slot;
}) => {
  const RootEl = Root.type;
  return <RootEl {...Root.props}>{renderSlot(Content)}</RootEl>;
};

export const TextBlock = ({
  Root,
  text,
}: {
  Root: ReactElement;
  text?: string;
}) => {
  const RootEl = Root.type;
  return <RootEl {...Root.props}>{text}</RootEl>;
};

export const BadgeBlock = ({
  Root,
  text,
}: {
  Root: ReactElement;
  text?: string;
}) => {
  const RootEl = Root.type;
  return <RootEl {...Root.props}>{text}</RootEl>;
};

export const ButtonBlock = ({
  Root,
  Button,
  label,
  href,
}: {
  Root: ReactElement;
  Button: ReactElement;
  label?: string;
  href?: string;
}) => {
  const RootEl = Root.type;
  const ButtonEl = Button.type;
  return (
    <RootEl {...Root.props}>
      <ButtonEl {...Button.props} href={href || "#"}>
        {label}
      </ButtonEl>
    </RootEl>
  );
};

export const ImageBlock = ({
  Root,
  src,
  alt,
}: {
  Root: ReactElement;
  src?: string;
  alt?: string;
}) => {
  const RootEl = Root.type;
  return (
    <RootEl {...Root.props}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src || ""}
        alt={alt || ""}
        style={{
          width: "100%",
          height: "auto",
          display: "block",
        }}
      />
    </RootEl>
  );
};
