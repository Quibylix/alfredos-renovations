import { useState, useEffect, useRef } from "react";
import { Image, Skeleton } from "@mantine/core";

export type LazySkeletonImageProps = {
  src: string;
  alt: string;
};

export function LazySkeletonImage({ src, alt }: LazySkeletonImageProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    imgRef.current.onload = () => setLoaded(true);
    if (imgRef.current.complete) setLoaded(true);
  }, []);

  return (
    <figure style={{ position: "relative" }}>
      {!loaded && <Skeleton height={200} width={400} radius="md" />}
      <Image
        ref={imgRef}
        style={loaded ? {} : { visibility: "hidden", position: "absolute" }}
        miw="100%"
        mih="100%"
        maw="100%"
        mah="100%"
        src={src}
        alt={alt}
        fit="cover"
        loading="lazy"
      />
    </figure>
  );
}
