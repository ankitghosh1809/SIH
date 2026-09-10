import MusicHero from "@/components/ui/scroll-locked-video-hero";

// Unlinked on purpose — not in marketingNavItems, so it never shows up in
// the site's real navigation. It doesn't fit the product's own content
// (this is a music-player hero, not a screening-tool page), so it's kept
// reachable only by direct link, for previewing the component itself
// rather than presenting it as part of the app.
export default function MusicHeroShowcase() {
  return <MusicHero />;
}
