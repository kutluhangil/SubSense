
import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export default function Logo({ className = "h-8", showText = true }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5 select-none text-gray-900 dark:text-white">
      {/* Inline SVG with React-compliant attributes */}
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 375 375" 
        className={`${className} w-auto`} 
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <clipPath id="df7c37a91e">
            <path d="M 162 17.402344 L 375 17.402344 L 375 339.152344 L 162 339.152344 Z M 162 17.402344 " clipRule="nonzero"/>
          </clipPath>
          <clipPath id="132a367aea">
            <path d="M 353.417969 209.964844 L 195.710938 17.417969 C 156.488281 49.550781 150.742188 107.390625 182.867188 146.617188 L 340.574219 339.160156 C 379.792969 307.03125 385.542969 249.1875 353.417969 209.964844 Z M 353.417969 209.964844 " clipRule="nonzero"/>
          </clipPath>
          <linearGradient x1="318.268734" gradientTransform="matrix(0.748108, 0, 0, 0.748186, 0.149626, 17.41879)" y1="449.917726" x2="397.789849" gradientUnits="userSpaceOnUse" y2="-17.56746" id="6ed4d947a2">
            <stop stopOpacity="1" stopColor="rgb(87.059021%, 16.859436%, 16.859436%)" offset="0"/>
            <stop stopOpacity="1" stopColor="rgb(87.687683%, 19.174194%, 15.631104%)" offset="0.132812"/>
            <stop stopOpacity="1" stopColor="rgb(89.247131%, 24.911499%, 12.585449%)" offset="0.242187"/>
            <stop stopOpacity="1" stop-color="rgb(90.805054%, 30.648804%, 9.541321%)" offset="0.351562"/>
            <stop stopOpacity="1" stopColor="rgb(92.362976%, 36.386108%, 6.495667%)" offset="0.460938"/>
            <stop stopOpacity="1" stopColor="rgb(93.922424%, 42.123413%, 3.451538%)" offset="0.570312"/>
            <stop stopOpacity="1" stopColor="rgb(95.480347%, 47.860718%, 0.40741%)" offset="0.679688"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 62.5%, 0.587463%)" offset="1"/>
          </linearGradient>
          <clipPath id="0e77534de4">
            <path d="M 102 63 L 359 63 L 359 339.152344 L 102 339.152344 Z M 102 63 " clipRule="nonzero"/>
          </clipPath>
          <clipPath id="e6829d84da">
            <path d="M 320.679688 210.859375 L 119.8125 63.914062 C 89.878906 104.835938 98.785156 162.277344 139.707031 192.210938 L 340.574219 339.160156 C 370.507812 298.238281 361.597656 240.792969 320.679688 210.859375 Z M 320.679688 210.859375 " clipRule="nonzero"/>
          </clipPath>
          <linearGradient x1="299.983535" gradientTransform="matrix(0.748108, 0, 0, 0.748186, 0.149626, 17.41879)" y1="437.105208" x2="315.018235" gradientUnits="userSpaceOnUse" y2="55.056475" id="040ede334c">
            <stop stopOpacity="1" stopColor="rgb(87.059021%, 16.859436%, 16.859436%)" offset="0"/>
            <stop stopOpacity="1" stopColor="rgb(88.91449%, 23.687744%, 13.235474%)" offset="0.140625"/>
            <stop stopOpacity="1" stopColor="rgb(90.753174%, 30.456543%, 9.643555%)" offset="0.257812"/>
            <stop stopOpacity="1" stopColor="rgb(92.591858%, 37.223816%, 6.051636%)" offset="0.375"/>
            <stop stopOpacity="1" stopColor="rgb(94.429016%, 43.992615%, 2.459717%)" offset="0.492188"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 50.100708%, 0.0610352%)" offset="0.601562"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 56.427002%, 0.32959%)" offset="0.726562"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 62.753296%, 0.598145%)" offset="0.851562"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 70.266724%, 0.917053%)" offset="1"/>
          </linearGradient>
          <clipPath id="52ab25f69d">
            <path d="M 40 145 L 346 145 L 346 339.152344 L 40 339.152344 Z M 40 145 " clipRule="nonzero"/>
          </clipPath>
          <clipPath id="07afb0c93d">
            <path d="M 281.976562 223.304688 L 45.511719 145.695312 C 29.703125 193.871094 55.941406 245.742188 104.109375 261.550781 L 340.574219 339.160156 C 356.382812 290.984375 330.148438 239.113281 281.976562 223.304688 Z M 281.976562 223.304688 " clipRule="nonzero"/>
          </clipPath>
          <linearGradient x1="263.773538" gradientTransform="matrix(0.748108, 0, 0, 0.748186, 0.149626, 17.41879)" y1="439.123455" x2="251.91138" gradientUnits="userSpaceOnUse" y2="162.347896" id="3dc14361b5">
            <stop stopOpacity="1" stopColor="rgb(87.059021%, 16.859436%, 16.859436%)" offset="0"/>
            <stop stopOpacity="1" stopColor="rgb(88.900757%, 23.63739%, 13.261414%)" offset="0.117188"/>
            <stop stopOpacity="1" stopColor="rgb(90.750122%, 30.445862%, 9.648132%)" offset="0.222656"/>
            <stop stopOpacity="1" stopColor="rgb(92.599487%, 37.254333%, 6.036377%)" offset="0.328125"/>
            <stop stopOpacity="1" stopColor="rgb(94.448853%, 44.062805%, 2.42157%)" offset="0.433594"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 50.814819%, 0.0915527%)" offset="0.542969"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 57.000732%, 0.354004%)" offset="0.652344"/><stop stopOpacity="1" stopColor="rgb(95.689392%, 63.188171%, 0.616455%)" offset="0.761719"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 69.37561%, 0.878906%)" offset="0.871094"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 76.469421%, 1.179504%)" offset="1"/>
          </linearGradient>
          <clipPath id="11f35e4f0b">
            <path d="M 0 246 L 341 246 L 341 339.152344 L 0 339.152344 Z M 0 246 " clipRule="nonzero"/>
          </clipPath>
          <clipPath id="9e4743c121">
            <path d="M 249.019531 247.109375 L 0.148438 246.453125 C 0.015625 297.15625 41.003906 338.367188 91.703125 338.5 L 340.574219 339.160156 C 340.707031 288.457031 299.71875 247.246094 249.019531 247.109375 Z M 249.019531 247.109375 " clipRule="nonzero"/>
          </clipPath>
          <linearGradient x1="319.492496" gradientTransform="matrix(0.748108, 0, 0, 0.748186, 0.149626, 17.41879)" y1="514.98946" x2="135.551659" gradientUnits="userSpaceOnUse" y2="221.152073" id="a06e688b58">
            <stop stopOpacity="1" stopColor="rgb(91.929626%, 34.790039%, 7.344055%)" offset="0"/>
            <stop stopOpacity="1" stopColor="rgb(93.441772%, 40.356445%, 4.389954%)" offset="0.109375"/>
            <stop stopOpacity="1" stopColor="rgb(94.953918%, 45.924377%, 1.434326%)" offset="0.21875"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 51.31073%, 0.112915%)" offset="0.335938"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 56.538391%, 0.334167%)" offset="0.453125"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 61.764526%, 0.55542%)" offset="0.570312"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 66.992188%, 0.776672%)" offset="0.6875"/><stop stopOpacity="1" stopColor="rgb(95.689392%, 72.218323%, 0.999451%)" offset="0.804688"/>
            <stop stopOpacity="1" stopColor="rgb(95.689392%, 76.469421%, 1.179504%)" offset="1"/>
          </linearGradient>
        </defs>
        <g clipPath="url(#df7c37a91e)">
          <g clipPath="url(#132a367aea)">
            <path fill="url(#6ed4d947a2)" d="M 150.742188 17.417969 L 150.742188 339.152344 L 375 339.152344 L 375 17.417969 Z M 150.742188 17.417969 " fillRule="nonzero"/>
          </g>
        </g>
        <g clipPath="url(#0e77534de4)">
          <g clipPath="url(#e6829d84da)">
            <path fill="url(#040ede334c)" d="M 89.878906 63.914062 L 89.878906 339.152344 L 370.507812 339.152344 L 370.507812 63.914062 Z M 89.878906 63.914062 " fillRule="nonzero"/>
          </g>
        </g>
        <g clipPath="url(#52ab25f69d)">
          <g clipPath="url(#07afb0c93d)">
            <path fill="url(#3dc14361b5)" d="M 29.703125 145.695312 L 29.703125 339.152344 L 356.382812 339.152344 L 356.382812 145.695312 Z M 29.703125 145.695312 " fillRule="nonzero"/>
          </g>
        </g>
        <g clipPath="url(#11f35e4f0b)">
          <g clipPath="url(#9e4743c121)">
            <path fill="url(#a06e688b58)" d="M 0.015625 246.453125 L 0.015625 339.152344 L 340.707031 339.152344 L 340.707031 246.453125 Z M 0.015625 246.453125 " fillRule="nonzero"/>
          </g>
        </g>
      </svg>
      
      {/* Brand Text */}
      {showText && (
        <span className="font-semibold text-xl tracking-tight text-inherit">
          SubSense
        </span>
      )}
    </div>
  );
}
