import * as React from "react";

import { IconSvgProps } from "@/types";

export const Logo: React.FC<IconSvgProps> = ({
  size = 36,
  width,
  height,
  ...props
}) => (
  <svg
    fill="none"
    height={size || height}
    viewBox="0 0 32 32"
    width={size || width}
    {...props}
  >
    <path
      clipRule="evenodd"
      d="M17.6482 10.1305L15.8785 7.02583L7.02979 22.5499H10.5278L17.6482 10.1305ZM19.8798 14.0457L18.11 17.1983L19.394 19.4511H16.8453L15.1056 22.5499H24.7272L19.8798 14.0457Z"
      fill="currentColor"
      fillRule="evenodd"
    />
  </svg>
);

export const DiscordIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M14.82 4.26a10.14 10.14 0 0 0-.53 1.1 14.66 14.66 0 0 0-4.58 0 10.14 10.14 0 0 0-.53-1.1 16 16 0 0 0-4.13 1.3 17.33 17.33 0 0 0-3 11.59 16.6 16.6 0 0 0 5.07 2.59A12.89 12.89 0 0 0 8.23 18a9.65 9.65 0 0 1-1.71-.83 3.39 3.39 0 0 0 .42-.33 11.66 11.66 0 0 0 10.12 0q.21.18.42.33a10.84 10.84 0 0 1-1.71.84 12.41 12.41 0 0 0 1.08 1.78 16.44 16.44 0 0 0 5.06-2.59 17.22 17.22 0 0 0-3-11.59 16.09 16.09 0 0 0-4.09-1.35zM8.68 14.81a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.93 1.93 0 0 1 1.8 2 1.93 1.93 0 0 1-1.8 2zm6.64 0a1.94 1.94 0 0 1-1.8-2 1.93 1.93 0 0 1 1.8-2 1.92 1.92 0 0 1 1.8 2 1.92 1.92 0 0 1-1.8 2z"
        fill="currentColor"
      />
    </svg>
  );
};

export const TwitterIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        d="M19.633 7.997c.013.175.013.349.013.523 0 5.325-4.053 11.461-11.46 11.461-2.282 0-4.402-.661-6.186-1.809.324.037.636.05.973.05a8.07 8.07 0 0 0 5.001-1.721 4.036 4.036 0 0 1-3.767-2.793c.249.037.499.062.761.062.361 0 .724-.05 1.061-.137a4.027 4.027 0 0 1-3.23-3.953v-.05c.537.299 1.16.486 1.82.511a4.022 4.022 0 0 1-1.796-3.354c0-.748.199-1.434.548-2.032a11.457 11.457 0 0 0 8.306 4.215c-.062-.3-.1-.611-.1-.923a4.026 4.026 0 0 1 4.028-4.028c1.16 0 2.207.486 2.943 1.272a7.957 7.957 0 0 0 2.556-.973 4.02 4.02 0 0 1-1.771 2.22 8.073 8.073 0 0 0 2.319-.624 8.645 8.645 0 0 1-2.019 2.083z"
        fill="currentColor"
      />
    </svg>
  );
};

export const GithubIcon: React.FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 24 24"
      width={size || width}
      {...props}
    >
      <path
        clipRule="evenodd"
        d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z"
        fill="currentColor"
        fillRule="evenodd"
      />
    </svg>
  );
};

export const MoonFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M21.53 15.93c-.16-.27-.61-.69-1.73-.49a8.46 8.46 0 01-1.88.13 8.409 8.409 0 01-5.91-2.82 8.068 8.068 0 01-1.44-8.66c.44-1.01.13-1.54-.09-1.76s-.77-.55-1.83-.11a10.318 10.318 0 00-6.32 10.21 10.475 10.475 0 007.04 8.99 10 10 0 002.89.55c.16.01.32.02.48.02a10.5 10.5 0 008.47-4.27c.67-.93.49-1.519.32-1.79z"
      fill="currentColor"
    />
  </svg>
);

export const SunFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <g fill="currentColor">
      <path d="M19 12a7 7 0 11-7-7 7 7 0 017 7z" />
      <path d="M12 22.96a.969.969 0 01-1-.96v-.08a1 1 0 012 0 1.038 1.038 0 01-1 1.04zm7.14-2.82a1.024 1.024 0 01-.71-.29l-.13-.13a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.984.984 0 01-.7.29zm-14.28 0a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a1 1 0 01-.7.29zM22 13h-.08a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zM2.08 13H2a1 1 0 010-2 1.038 1.038 0 011.04 1 .969.969 0 01-.96 1zm16.93-7.01a1.024 1.024 0 01-.71-.29 1 1 0 010-1.41l.13-.13a1 1 0 011.41 1.41l-.13.13a.984.984 0 01-.7.29zm-14.02 0a1.024 1.024 0 01-.71-.29l-.13-.14a1 1 0 011.41-1.41l.13.13a1 1 0 010 1.41.97.97 0 01-.7.3zM12 3.04a.969.969 0 01-1-.96V2a1 1 0 012 0 1.038 1.038 0 01-1 1.04z" />
    </g>
  </svg>
);

export const HeartFilledIcon = ({
  size = 24,
  width,
  height,
  ...props
}: IconSvgProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    height={size || height}
    role="presentation"
    viewBox="0 0 24 24"
    width={size || width}
    {...props}
  >
    <path
      d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 0 1 4.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12Z"
      fill="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
    />
  </svg>
);

export const SearchIcon = (props: IconSvgProps) => (
  <svg
    aria-hidden="true"
    fill="none"
    focusable="false"
    height="1em"
    role="presentation"
    viewBox="0 0 24 24"
    width="1em"
    {...props}
  >
    <path
      d="M11.5 21C16.7467 21 21 16.7467 21 11.5C21 6.25329 16.7467 2 11.5 2C6.25329 2 2 6.25329 2 11.5C2 16.7467 6.25329 21 11.5 21Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
    <path
      d="M22 22L20 20"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
    />
  </svg>
);



export function LogoLoader(props: React.SVGProps<SVGSVGElement>) {
	return (
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 24 24"
  width="100%"
  height="100%"
  preserveAspectRatio="xMidYMid meet"
>
  <defs>
    <filter
      id="gooey"
      filterUnits="userSpaceOnUse"
      x="-50%"
      y="-50%"
      width="200%"
      height="200%"
    >
      <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
      <feColorMatrix
        in="blur"
        mode="matrix"
        values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
        result="gooey"
      />
    </filter>
    <filter
      id="shadow"
      filterUnits="userSpaceOnUse"
      x="-50%"
      y="-50%"
      width="200%"
      height="200%"
    >
      <feDropShadow
        dx={0}
        dy={0}
        stdDeviation="0.5"
        floodColor="#f97316"
        floodOpacity="0.5"
      />
    </filter>
    <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ff9736" />
      <stop offset="100%" stopColor="#f05d14" />
    </linearGradient>
  </defs>
  <style
    dangerouslySetInnerHTML={{
      __html:
        "\n    @keyframes morphSquare {\n      0%, 5% { d: path('M7,7 h10 v10 h-10 z'); }\n      15%, 20% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(45deg) scale(0.9); }\n      30% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(90deg) scale(1.1); }\n      40%, 100% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(90deg) scale(1); }\n    }\n    \n    @keyframes blob1Appear {\n      0%, 30% { transform: translate(0, 0) scale(0); opacity: 0; }\n      40% { transform: translate(-2px, -2px) scale(0.7); opacity: 1; filter: blur(1px); }\n      50% { transform: translate(-1px, -1px) scale(1.2); opacity: 1; filter: blur(0); }\n      60%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }\n    }\n    \n    @keyframes blob2Appear {\n      0%, 35% { transform: translate(0, 0) scale(0); opacity: 0; }\n      45% { transform: translate(2px, -2px) scale(0.7); opacity: 1; filter: blur(1px); }\n      55% { transform: translate(1px, -1px) scale(1.2); opacity: 1; filter: blur(0); }\n      65%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }\n    }\n    \n    @keyframes blob3Appear {\n      0%, 40% { transform: translate(0, 0) scale(0); opacity: 0; }\n      50% { transform: translate(2px, 2px) scale(0.7); opacity: 1; filter: blur(1px); }\n      60% { transform: translate(1px, 1px) scale(1.2); opacity: 1; filter: blur(0); }\n      70%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }\n    }\n    \n    @keyframes blob4Appear {\n      0%, 45% { transform: translate(0, 0) scale(0); opacity: 0; }\n      55% { transform: translate(-2px, 2px) scale(0.7); opacity: 1; filter: blur(1px); }\n      65% { transform: translate(-1px, 1px) scale(1.2); opacity: 1; filter: blur(0); }\n      75%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }\n    }\n    \n    @keyframes finalRotateAndSplash {\n      0%, 70% { transform: rotate(0deg) scale(1); }\n      75% { transform: rotate(90deg) scale(1.05); }\n      80% { transform: rotate(180deg) scale(0.95); }\n      85% { transform: rotate(270deg) scale(1.02); }\n      90%, 100% { transform: rotate(360deg) scale(1); }\n    }\n    \n    @keyframes pulse {\n      0%, 100% { filter: brightness(1); }\n      50% { filter: brightness(1.2); }\n    }\n    \n    @keyframes restart {\n      0%, 95% { opacity: 1; }\n      97.5% { opacity: 0.7; }\n      100% { opacity: 1; }\n    }\n    \n    :root {\n      --animation-duration: 2.2s;\n    }\n    \n    svg {\n      width: 100%;\n      height: 100%;\n      max-width: 100%;\n      max-height: 100%;\n    }\n    \n    .container {\n      animation: restart var(--animation-duration) infinite;\n      filter: url(#gooey);\n    }\n    \n    .square {\n      fill: url(#orangeGradient);\n      transform-origin: 12px 12px;\n      animation: morphSquare var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) infinite, \n                 pulse var(--animation-duration) ease-in-out infinite;\n      filter: url(#shadow);\n    }\n    \n    .blob {\n      fill: url(#orangeGradient);\n      transform-origin: 12px 12px;\n      filter: url(#shadow);\n    }\n    \n    #blob1 {\n      animation: blob1Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) infinite;\n      transform-origin: 6px 6px;\n    }\n    \n    #blob2 {\n      animation: blob2Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) infinite;\n      transform-origin: 18px 6px;\n    }\n    \n    #blob3 {\n      animation: blob3Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) infinite;\n      transform-origin: 18px 18px;\n    }\n    \n    #blob4 {\n      animation: blob4Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) infinite;\n      transform-origin: 6px 18px;\n    }\n    \n    #finalShape {\n      transform-origin: 12px 12px;\n      animation: finalRotateAndSplash var(--animation-duration) cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;\n    }\n  "
    }}
  />
  {/* Main container with gooey filter */}
  <g className="container">
    {/* Morphing square */}
    <path className="square" d="M7,7 h10 v10 h-10 z" />
    {/* Liquid blobs appearing as corners */}
    <g id="finalShape">
      <path id="blob1" className="blob" d="M8 5a3 3 0 1 0-3 3h3v-3z">
        <animate
          attributeName="d"
          dur="2.2s"
          repeatCount="indefinite"
          values="M8 5a3 3 0 1 0-3 3h3v-3z;
                 M8 5a3 3 0 1 0-3 3h3c0.5,-1 0,-2 0,-3z;
                 M8 5a3 3 0 1 0-3 3h3v-3z"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
        />
      </path>
      <path id="blob2" className="blob" d="M16 8h3a3 3 0 1 0-3-3v3z">
        <animate
          attributeName="d"
          dur="2.2s"
          repeatCount="indefinite"
          values="M16 8h3a3 3 0 1 0-3-3v3z;
                 M16 8h3a3 3 0 1 0-3-3c-1,0.5 -2,0 -3,0 h3z;
                 M16 8h3a3 3 0 1 0-3-3v3z"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
        />
      </path>
      <path id="blob3" className="blob" d="M16 16h3a3 3 0 1 1-3 3v-3z">
        <animate
          attributeName="d"
          dur="2.2s"
          repeatCount="indefinite"
          values="M16 16h3a3 3 0 1 1-3 3v-3z;
                 M16 16h3a3 3 0 1 1-3 3c-1,-0.5 -2,0 -3,0 h3z;
                 M16 16h3a3 3 0 1 1-3 3v-3z"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
        />
      </path>
      <path id="blob4" className="blob" d="M5 16a3 3 0 1 0 3 3v-3H5z">
        <animate
          attributeName="d"
          dur="2.2s"
          repeatCount="indefinite"
          values="M5 16a3 3 0 1 0 3 3v-3H5z;
                 M5 16a3 3 0 1 0 3 3c0.5,-1 0,-2 0,-3H5z;
                 M5 16a3 3 0 1 0 3 3v-3H5z"
          calcMode="spline"
          keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
        />
      </path>
    </g>
  </g>
</svg>

  );
}



export function SuccessLoader(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <defs>
        <filter
          id="gooey-check"
          filterUnits="userSpaceOnUse"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="gooey"
          />
        </filter>
        <filter
          id="shadow-check"
          filterUnits="userSpaceOnUse"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feDropShadow
            dx={0}
            dy={0}
            stdDeviation="0.5"
            floodColor="#f97316"
            floodOpacity="0.5"
          />
        </filter>
        <linearGradient id="orangeGradient-check" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff9736" />
          <stop offset="100%" stopColor="#f05d14" />
        </linearGradient>
      </defs>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes morphToCheck {
          0%, 5% { d: path('M7,7 h10 v10 h-10 z'); }
          15%, 20% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(45deg) scale(0.9); }
          30% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(90deg) scale(1.1); }
          40% { d: path('M9,9 h6 v6 h-6 z'); transform: rotate(0deg) scale(1); }
          45% { d: path('M9,9 l6,6'); transform: scale(1); }
          50% { d: path('M9,13 l3,3'); transform: scale(1); opacity: 0.7; }
          55% { d: path('M8,13 l4,4 l5,-8'); transform: scale(1); opacity: 0.8; }
          60%, 70% { d: path('M7,13 l5,5 l6,-10'); transform: scale(1.05); opacity: 1; }
          80%, 100% { d: path('M7,13 l5,5 l6,-10'); transform: scale(1); opacity: 1; }
        }
        
        @keyframes finalPulse {
          0%, 70% { transform: translate(0, 0); }
          72% { transform: translate(-0.5px, 0.5px); }
          74% { transform: translate(1px, -0.5px); }
          76% { transform: translate(-1px, -0.5px); }
          78% { transform: translate(0.5px, 1px); }
          80% { transform: translate(-0.5px, -1px); }
          82% { transform: translate(1px, 0.5px); }
          84% { transform: translate(-0.5px, 0.5px); }
          86% { transform: translate(0.5px, -0.5px); }
          88%, 100% { transform: translate(0, 0); }
        }

        @keyframes blobAnimation {
          0%, 20% { r: 0; opacity: 0; }
          30% { r: 1.5; opacity: 0.2; }
          40% { r: 1; opacity: 0.4; }
          50% { r: 0.5; opacity: 0.6; }
          60%, 100% { r: 0; opacity: 0; }
        }
        
        :root {
          --animation-duration: 2.2s;
        }
        
        svg {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
        }

        .container-check {
          filter: url(#gooey-check);
        }
        
        .checkmark {
          fill: none;
          stroke: url(#orangeGradient-check);
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          transform-origin: 12px 12px;
          animation: morphToCheck var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          filter: url(#shadow-check);
        }
        
        #check-finalShape {
          transform-origin: 12px 12px;
          animation: finalPulse var(--animation-duration) cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
        }

        .blob-effect {
          fill: url(#orangeGradient-check);
          filter: url(#shadow-check);
        }
      `
        }}
      />
      {/* Container with gooey filter */}
      <g className="container-check">
        <g id="check-finalShape">
          {/* Morphing square to check */}
          <path className="checkmark" d="M7,7 h10 v10 h-10 z" />
          
          {/* Small blob effects that appear briefly during the animation */}
          <circle className="blob-effect" cx="7" cy="7" r="0">
            <animate
              attributeName="r"
              begin="0s"
              dur="2.2s"
              values="0;1.5;1;0.5;0"
              keyTimes="0;0.3;0.4;0.5;0.6"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              begin="0s"
              dur="2.2s"
              values="0;0.2;0.4;0.6;0"
              keyTimes="0;0.3;0.4;0.5;0.6"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              fill="freeze"
            />
          </circle>
          
          <circle className="blob-effect" cx="17" cy="7" r="0">
            <animate
              attributeName="r"
              begin="0.1s"
              dur="2.2s"
              values="0;1.5;1;0.5;0"
              keyTimes="0;0.3;0.4;0.5;0.6"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              begin="0.1s"
              dur="2.2s"
              values="0;0.2;0.4;0.6;0"
              keyTimes="0;0.3;0.4;0.5;0.6"
              calcMode="spline" 
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              fill="freeze"
            />
          </circle>
          
          <circle className="blob-effect" cx="17" cy="17" r="0">
            <animate
              attributeName="r"
              begin="0.2s"
              dur="2.2s"
              values="0;1.5;1;0.5;0"
              keyTimes="0;0.3;0.4;0.5;0.6"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              begin="0.2s"
              dur="2.2s"
              values="0;0.2;0.4;0.6;0"
              keyTimes="0;0.3;0.4;0.5;0.6"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              fill="freeze"
            />
          </circle>
          
          <circle className="blob-effect" cx="7" cy="17" r="0">
            <animate
              attributeName="r"
              begin="0.3s"
              dur="2.2s"
              values="0;1.5;1;0.5;0"
              keyTimes="0;0.3;0.4;0.5;0.6"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              fill="freeze"
            />
            <animate
              attributeName="opacity"
              begin="0.3s"
              dur="2.2s"
              values="0;0.2;0.4;0.6;0"
              keyTimes="0;0.3;0.4;0.5;0.6"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1; 0.4 0 0.2 1"
              fill="freeze"
            />
          </circle>
        </g>
      </g>
    </svg>
  );
}

export function FailLoader(props: JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <defs>
        <filter
          id="gooey-fail"
          filterUnits="userSpaceOnUse"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="gooey"
          />
        </filter>
        <filter
          id="shadow-fail"
          filterUnits="userSpaceOnUse"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feDropShadow
            dx={0}
            dy={0}
            stdDeviation="0.5"
            floodColor="#f97316"
            floodOpacity="0.5"
          />
        </filter>
        <linearGradient id="orangeGradient-fail" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff9736" />
          <stop offset="100%" stopColor="#f05d14" />
        </linearGradient>
      </defs>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes morphToX {
          0%, 5% { d: path('M7,7 h10 v10 h-10 z'); }
          15%, 20% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(45deg) scale(0.9); }
          30% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(90deg) scale(1.1); }
          40% { d: path('M9,9 h6 v6 h-6 z'); transform: rotate(0deg) scale(1); }
          45% { d: path('M9,9 l6,6'); transform: scale(1); }
          50% { d: path('M9,9 l6,6 m0,0 l-6,-6'); transform: scale(1); opacity: 0.7; }
          55% { d: path('M8,8 l8,8 m0,-8 l-8,8'); transform: scale(1); opacity: 0.8; }
          60%, 70% { d: path('M8,8 l8,8 m0,-8 l-8,8'); transform: scale(1.05); opacity: 1; }
          80%, 100% { d: path('M8,8 l8,8 m0,-8 l-8,8'); transform: scale(1); opacity: 1; }
        }
        
        @keyframes blob1Appear {
          0%, 30% { transform: translate(0, 0) scale(0); opacity: 0; }
          40% { transform: translate(-2px, -2px) scale(0.7); opacity: 1; filter: blur(1px); }
          50% { transform: translate(-1px, -1px) scale(1.2); opacity: 1; filter: blur(0); }
          60%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
        }
        
        @keyframes blob2Appear {
          0%, 35% { transform: translate(0, 0) scale(0); opacity: 0; }
          45% { transform: translate(2px, -2px) scale(0.7); opacity: 1; filter: blur(1px); }
          55% { transform: translate(1px, -1px) scale(1.2); opacity: 1; filter: blur(0); }
          65%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
        }
        
        @keyframes blob3Appear {
          0%, 40% { transform: translate(0, 0) scale(0); opacity: 0; }
          50% { transform: translate(2px, 2px) scale(0.7); opacity: 1; filter: blur(1px); }
          60% { transform: translate(1px, 1px) scale(1.2); opacity: 1; filter: blur(0); }
          70%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
        }
        
        @keyframes blob4Appear {
          0%, 45% { transform: translate(0, 0) scale(0); opacity: 0; }
          55% { transform: translate(-2px, 2px) scale(0.7); opacity: 1; filter: blur(1px); }
          65% { transform: translate(-1px, 1px) scale(1.2); opacity: 1; filter: blur(0); }
          75%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
        }
        
        @keyframes finalShake {
          0%, 70% { transform: translate(0, 0); }
          72% { transform: translate(-0.5px, 0.5px); }
          74% { transform: translate(1px, -0.5px); }
          76% { transform: translate(-1px, -0.5px); }
          78% { transform: translate(0.5px, 1px); }
          80% { transform: translate(-0.5px, -1px); }
          82% { transform: translate(1px, 0.5px); }
          84% { transform: translate(-0.5px, 0.5px); }
          86% { transform: translate(0.5px, -0.5px); }
          88%, 100% { transform: translate(0, 0); }
        }
        
        @keyframes pulse {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.2); }
        }
        
        @keyframes restart {
          0%, 95% { opacity: 1; }
          97.5% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        
        :root {
          --animation-duration: 2.2s;
        }
        
        svg {
          width: 100%;
          height: 100%;
          max-width: 100%;
          max-height: 100%;
        }
        
        .container-fail {
          filter: url(#gooey-fail);
        }
        
        .xmark {
          fill: none;
          stroke: url(#orangeGradient-fail);
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          transform-origin: 12px 12px;
          animation: morphToX var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          filter: url(#shadow-fail);
        }
        
        .blob-fail {
          fill: url(#orangeGradient-fail);
          transform-origin: 12px 12px;
          filter: url(#shadow-fail);
        }
        
        #fail-blob1 {
          animation: blob1Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: 6px 6px;
        }
        
        #fail-blob2 {
          animation: blob2Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: 18px 6px;
        }
        
        #fail-blob3 {
          animation: blob3Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: 18px 18px;
        }
        
        #fail-blob4 {
          animation: blob4Appear var(--animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          transform-origin: 6px 18px;
        }
        
        #fail-finalShape {
          transform-origin: 12px 12px;
          animation: finalShake var(--animation-duration) cubic-bezier(0.45, 0.05, 0.55, 0.95) forwards;
        }
      `
        }}
      />
      {/* Main container with gooey filter */}
      <g className="container-fail">
        {/* Morphing square to X */}
        <path className="xmark" d="M7,7 h10 v10 h-10 z" />
        {/* Liquid blobs appearing as corners */}
        <g id="fail-finalShape">
          <path id="fail-blob1" className="blob-fail" d="M8 5a3 3 0 1 0-3 3h3v-3z">
            <animate
              attributeName="d"
              dur="2.2s"
              fill="freeze"
              values="M8 5a3 3 0 1 0-3 3h3v-3z;
                     M8 5a3 3 0 1 0-3 3h3c0.5,-1 0,-2 0,-3z;
                     M8 5a3 3 0 1 0-3 3h3v-3z"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </path>
          <path id="fail-blob2" className="blob-fail" d="M16 8h3a3 3 0 1 0-3-3v3z">
            <animate
              attributeName="d"
              dur="2.2s"
              repeatCount="indefinite"
              values="M16 8h3a3 3 0 1 0-3-3v3z;
                     M16 8h3a3 3 0 1 0-3-3c-1,0.5 -2,0 -3,0 h3z;
                     M16 8h3a3 3 0 1 0-3-3v3z"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </path>
          <path id="fail-blob3" className="blob-fail" d="M16 16h3a3 3 0 1 1-3 3v-3z">
            <animate
              attributeName="d"
              dur="2.2s"
              repeatCount="indefinite"
              values="M16 16h3a3 3 0 1 1-3 3v-3z;
                     M16 16h3a3 3 0 1 1-3 3c-1,-0.5 -2,0 -3,0 h3z;
                     M16 16h3a3 3 0 1 1-3 3v-3z"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </path>
          <path id="fail-blob4" className="blob-fail" d="M5 16a3 3 0 1 0 3 3v-3H5z">
            <animate
              attributeName="d"
              dur="2.2s"
              repeatCount="indefinite"
              values="M5 16a3 3 0 1 0 3 3v-3H5z;
                     M5 16a3 3 0 1 0 3 3c0.5,-1 0,-2 0,-3H5z;
                     M5 16a3 3 0 1 0 3 3v-3H5z"
              calcMode="spline"
              keySplines="0.4 0 0.2 1; 0.4 0 0.2 1"
            />
          </path>
        </g>
      </g>
    </svg>
  );
}


export function LogoMappr(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      {...props}
    >
      <defs>
        <filter
          id="gooey"
          filterUnits="userSpaceOnUse"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feGaussianBlur in="SourceGraphic" stdDeviation="1.5" result="blur" />
          <feColorMatrix
            in="blur"
            mode="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
            result="gooey"
          />
        </filter>
        <filter
          id="shadow"
          filterUnits="userSpaceOnUse"
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feDropShadow
            dx={0}
            dy={0}
            stdDeviation="0.5"
            floodColor="#f97316"
            floodOpacity="0.5"
          />
        </filter>
        <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff9736" />
          <stop offset="100%" stopColor="#f05d14" />
        </linearGradient>
      </defs>
      <style
        dangerouslySetInnerHTML={{
          __html:
            "\n    @keyframes morphSquare {\n      0%, 5% { d: path('M7,7 h10 v10 h-10 z'); }\n      15%, 20% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(45deg) scale(0.9); }\n      30% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(90deg) scale(1.1); }\n      40%, 100% { d: path('M7,7 h10 v10 h-10 z'); transform: rotate(90deg) scale(1); }\n    }\n    \n    @keyframes blob1Appear {\n      0%, 30% { transform: translate(0, 0) scale(0); opacity: 0; }\n      40% { transform: translate(-2px, -2px) scale(0.7); opacity: 1; filter: blur(1px); }\n      50% { transform: translate(-1px, -1px) scale(1.2); opacity: 1; filter: blur(0); }\n      60%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }\n    }\n    \n    @keyframes blob2Appear {\n      0%, 35% { transform: translate(0, 0) scale(0); opacity: 0; }\n      45% { transform: translate(2px, -2px) scale(0.7); opacity: 1; filter: blur(1px); }\n      55% { transform: translate(1px, -1px) scale(1.2); opacity: 1; filter: blur(0); }\n      65%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }\n    }\n    \n    @keyframes blob3Appear {\n      0%, 40% { transform: translate(0, 0) scale(0); opacity: 0; }\n      50% { transform: translate(2px, 2px) scale(0.7); opacity: 1; filter: blur(1px); }\n      60% { transform: translate(1px, 1px) scale(1.2); opacity: 1; filter: blur(0); }\n      70%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }\n    }\n    \n    @keyframes blob4Appear {\n      0%, 45% { transform: translate(0, 0) scale(0); opacity: 0; }\n      55% { transform: translate(-2px, 2px) scale(0.7); opacity: 1; filter: blur(1px); }\n      65% { transform: translate(-1px, 1px) scale(1.2); opacity: 1; filter: blur(0); }\n      75%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }\n    }\n    \n    @keyframes finalRotateAndSplash {\n      0%, 70% { transform: rotate(0deg) scale(1); }\n      75% { transform: rotate(90deg) scale(1.05); }\n      80% { transform: rotate(180deg) scale(0.95); }\n      85% { transform: rotate(270deg) scale(1.02); }\n      90%, 100% { transform: rotate(360deg) scale(1); }\n    }\n    \n    @keyframes pulse {\n      0%, 100% { filter: brightness(1); }\n      50% { filter: brightness(1.2); }\n    }\n    \n    @keyframes restart {\n      0%, 95% { opacity: 1; }\n      97.5% { opacity: 0.7; }\n      100% { opacity: 1; }\n    }\n    \n    :root {\n       }\n        .container {\n           filter: url(#gooey);\n    }\n      .square {\n      fill: url(#orangeGradient);\n      transform-origin: 12px 12px;\n   }\n     .blob {\n      fill: url(#orangeGradient);\n      transform-origin: 12px 12px;\n      filter: url(#shadow);\n    }  "
        }}
      />
      {/* Main container with gooey filter */}
      <g className="container">
        {/* Morphing square */}
        <path className="square" d="M7,7 h10 v10 h-10 z" />
        {/* Liquid blobs appearing as corners */}
        <g id="finalShape">
          <path id="blob1" className="blob" d="M8 5a3 3 0 1 0-3 3h3v-3z">
           
          </path>
          <path id="blob2" className="blob" d="M16 8h3a3 3 0 1 0-3-3v3z">
       
          </path>
          <path id="blob3" className="blob" d="M16 16h3a3 3 0 1 1-3 3v-3z">
       
          </path>
          <path id="blob4" className="blob" d="M5 16a3 3 0 1 0 3 3v-3H5z">
      
          </path>
        </g>
      </g>
    </svg>
  );
}