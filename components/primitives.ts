import { tv } from "tailwind-variants";

export const title = tv({
  base: "tracking-tight inline font-semibold",
  variants: {
    color: {
      primary: "from-orange-400 to-orange-600",
      secondary: "from-zinc-500 to-zinc-700 dark:from-zinc-400 dark:to-zinc-200",
      foreground: "from-zinc-800 to-zinc-900 dark:from-zinc-100 dark:to-zinc-300",
    },
    size: {
      sm: "text-3xl lg:text-4xl",
      md: "text-[2.3rem] lg:text-5xl leading-9",
      lg: "text-4xl lg:text-6xl",
    },
    fullWidth: {
      true: "w-full block",
    },
  },
  defaultVariants: {
    size: "md",
    color: "foreground",
  },
  compoundVariants: [
    {
      color: [
        "primary",
        "secondary",
        "foreground",
      ],
      class: "bg-clip-text text-transparent bg-gradient-to-b",
    },
  ],
});

export const subtitle = tv({
  base: "w-full md:w-1/2 my-2 text-lg lg:text-xl text-light-foreground/70 dark:text-dark-foreground/70 block max-w-full",
  variants: {
    fullWidth: {
      true: "!w-full",
    },
  },
  defaultVariants: {
    fullWidth: true,
  },
});

export const card = tv({
  base: "rounded-xl border border-light-divider dark:border-dark-divider bg-light-content1 dark:bg-dark-content1 shadow-sm overflow-hidden",
  variants: {
    clickable: {
      true: "transition-all duration-200 hover:shadow-md hover:border-primary-500/50 cursor-pointer",
    },
    flat: {
      true: "border-0 shadow-none bg-transparent",
    },
    gradient: {
      true: "bg-gradient-to-t from-light-content1 to-light-content2 dark:from-dark-content1 dark:to-dark-content2",
    },
  },
});

export const section = tv({
  base: "py-12 md:py-16",
  variants: {
    compact: {
      true: "py-8 md:py-10",
    },
  },
});