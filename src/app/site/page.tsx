import Image from "next/image";
export default function Home() {
  return (
    <>
      <section className="h-full w-full pt-24 md:pt-32 relative flex items-center justify-center flex-col">
        {/* grid */}

        {/* Grid - light mode uses dark lines, dark mode uses lighter lines */}
        <div className="absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#e5e5e5_1px,transparent_1px),linear-gradient(to_bottom,#e5e5e5_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#2a2a2a_1px,transparent_1px),linear-gradient(to_bottom,#2a2a2a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_110%)] -z-10" />

        <p className="text-center">
          Drag and Drop Website for your online Presence
        </p>
        <div className="bg-gradient-to-r from-primary to-secondary-foreground text-transparent bg-clip-text relative">
          <h1 className="text-9xl font-bold text-center md:text-[300px]">
            Pixora
          </h1>
        </div>
        <div className="flex justify-center items-center relative md:mt-[-70px]">
          <Image
            src="/site.png"
            alt="site"
            width={1200}
            height={1200}
            className="rounded-tl-2xl rounded-br-2xl rounded-tr-2xl border-2 border-muted"
          />
          <div className="bottom-0 top-[-50%] bg-gradient-to-t dark:from-background left-0 right-0 absolute z-10"></div>
        </div>
      </section>
    </>
  );
}
