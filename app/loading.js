// components/Loading.js
'use client';
import React, { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import Lottie from 'lottie-web';

const Loading = () => {
 const container = useRef(null);
 const { theme } = useTheme();

 useEffect(() => {
    const loadLottie = async () => {
        Lottie.loadAnimation({
          container: container.current, // the dom element that will contain the animation
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: theme === 'light' ? '/loading.json' : '/imposter.json', // the path to the animation json
        });
    };

    loadLottie();
 }, [theme]); // Add theme as a dependency to re-run the effect if the theme changes

 return <div className="justify-center items-center w-screen h-screen" ref={container}></div>;
};

export default Loading;