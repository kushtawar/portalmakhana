import Image from "next/image";
import PacketArt, { type PackType } from "@/components/product/PacketArt";

export default function ProductImage({
  imagePath,
  label,
  packType,
  className = "",
  sizes,
  priority,
}: {
  imagePath?: string;
  label: string;
  packType: PackType;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!imagePath) {
    return <PacketArt packType={packType} label={label} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={imagePath}
        alt={`${label} packaging`}
        fill
        priority={priority}
        sizes={sizes ?? "(min-width: 1024px) 25vw, 50vw"}
        className="object-cover"
      />
    </div>
  );
}
