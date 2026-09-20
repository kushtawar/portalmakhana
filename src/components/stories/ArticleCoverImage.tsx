import Image from "next/image";
import ProductImagePlaceholder from "@/components/product/ProductImagePlaceholder";

export default function ArticleCoverImage({
  imagePath,
  label,
  className = "",
  sizes,
  priority,
}: {
  imagePath?: string;
  label: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (!imagePath) {
    return <ProductImagePlaceholder label={label} className={className} />;
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={imagePath}
        alt={label}
        fill
        priority={priority}
        sizes={sizes ?? "(min-width: 1024px) 33vw, 100vw"}
        className="object-cover"
      />
    </div>
  );
}
