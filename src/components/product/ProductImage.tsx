import Image from "next/image";
import PacketArt, { type PackType } from "@/components/product/PacketArt";

export default function ProductImage({
  imagePath,
  label,
  packType,
  className = "",
  sizes,
  priority,
  fit = "cover",
}: {
  imagePath?: string;
  label: string;
  packType: PackType;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** "contain" shows the whole image (letterboxed on black) instead of cropping it. */
  fit?: "cover" | "contain";
}) {
  if (!imagePath) {
    return <PacketArt packType={packType} label={label} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden ${fit === "contain" ? "bg-black" : ""} ${className}`}>
      <Image
        src={imagePath}
        alt={`${label} packaging`}
        fill
        priority={priority}
        sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
        className={fit === "contain" ? "object-contain" : "object-cover"}
      />
    </div>
  );
}
