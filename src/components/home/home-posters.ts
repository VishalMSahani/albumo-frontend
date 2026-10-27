// Replace these three sources to change the alternating homepage artwork.
const artwork = [
  {
    src: "/images/home/poster-coast.webp",
    alt: "A traveller overlooking a sunlit coastline and blue sea",
  },
  {
    src: "/images/home/poster-family.webp",
    alt: "A mother and child laughing together at a garden picnic",
  },
  {
    src: "/images/home/poster-mountains.webp",
    alt: "Two friends hiking towards snow-capped Himalayan mountains",
  },
];

export const homePosters = Array.from({ length: 9 }, (_, index) => ({
  id: `memory-${index + 1}`,
  ...artwork[index % artwork.length],
}));
