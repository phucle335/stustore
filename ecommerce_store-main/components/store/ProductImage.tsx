import Image, { type ImageProps } from "next/image";
import { isNextImageAllowedUrl } from "@/lib/store/allowed-image-hosts";

type ProductImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
};

/**
 * Ảnh sản phẩm từ DB/Admin — dùng `next/image` khi host đã cấu hình,
 * ngược lại `<img>` để tránh lỗi hostname chưa whitelist.
 */
export function ProductImage({
  src,
  alt,
  className,
  width,
  height,
  sizes,
  priority,
  ...rest
}: ProductImageProps) {
  if (!src || !isNextImageAllowedUrl(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={typeof width === "number" ? width : undefined}
        height={typeof height === "number" ? height : undefined}
        className={className}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      sizes={sizes}
      priority={priority}
      className={className}
      {...rest}
    />
  );
}
