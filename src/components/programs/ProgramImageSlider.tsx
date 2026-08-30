"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import "swiper/css";
import "swiper/css/effect-fade";

const sliderImages = [
  {
    src: "/images/Strength-&-Balance-Program-new.webp",
    alt: "Elderly group exercise session - Strength and balance training",
  },
  {
    src: "/images/Strength-&-Balance-Program-new-2webp.webp",
    alt: "Physiotherapy guided group strength exercise",
  }
];

export default function ProgramImageSlider() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex-1 relative w-full aspect-[4/3] rounded-[40px] overflow-hidden shadow-2xl border-4 border-white bg-light">
      {!mounted ? (
        <div className="w-full h-full relative">
          <Image
            src={sliderImages[0].src}
            alt={sliderImages[0].alt}
            fill
            className="object-cover"
            priority
          />
        </div>
      ) : (
        <Swiper
          modules={[Autoplay, EffectFade]}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          className="w-full h-full"
        >
          {sliderImages.map((image, index) => (
            <SwiperSlide key={index} className="w-full h-full relative">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                priority={index === 0}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </div>
  );
}

