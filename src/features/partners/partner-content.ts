export type PartnerType =
  | "TRAVEL_AGENCY"
  | "PHOTOGRAPHER"
  | "WEDDING_PLANNER"
  | "CORPORATE_EVENTS"
  | "REAL_ESTATE"
  | "OTHER";

export type PartnerCategory = {
  slug: string;
  type: PartnerType;
  title: string;
  headline: string;
  description: string;
  shortDescription: string;
  example: { occasion: string; keepsake: string; connection: string };
  ideas: string[];
};

export const partnerCategories: PartnerCategory[] = [
  {
    slug: "travel-agencies",
    type: "TRAVEL_AGENCY",
    title: "Travel agencies",
    headline: "Let the journey live beyond the itinerary.",
    description:
      "Make a photo album part of the trip. Your travellers come home with their memories in print, and your agency finds a place for its next adventure in the Albumo partner directory.",
    shortDescription: "From the first departure to a book full of favourite moments.",
    example: {
      occasion: "A week in the mountains",
      keepsake: "A travel album to come home to",
      connection: "A new traveller discovers your agency",
    },
    ideas: [
      "Include an album in a group tour or honeymoon package.",
      "Plan a photo collection and ordering process after the trip.",
      "Introduce your agency to travellers looking for their next journey.",
    ],
  },
  {
    slug: "photographers",
    type: "PHOTOGRAPHER",
    title: "Photographers",
    headline: "Beautiful photographs deserve to be held.",
    description:
      "Bring a printed chapter to your photography packages. Turn the images your clients love into albums, and let people planning their next milestone discover your studio.",
    shortDescription: "Give your photographs a life beyond the gallery.",
    example: {
      occasion: "A portrait session worth keeping",
      keepsake: "Their favourite frames, in a book",
      connection: "A new client discovers your studio",
    },
    ideas: [
      "Offer an album alongside your digital gallery.",
      "Discuss formats and finishes that suit your photography.",
      "Showcase your speciality and link clients to your portfolio.",
    ],
  },
  {
    slug: "wedding-planners",
    type: "WEDDING_PLANNER",
    title: "Wedding planners",
    headline: "A celebration ends. Its story stays.",
    description:
      "Include a thoughtful keepsake in the celebrations you create. Work with couples and their photographer on an album, and introduce your planning business to people preparing for their own big day.",
    shortDescription: "A thoughtful final chapter for every celebration.",
    example: {
      occasion: "A wedding full of little details",
      keepsake: "One album, a whole celebration",
      connection: "Another couple finds their planner",
    },
    ideas: [
      "Explore albums as part of your wedding packages.",
      "Coordinate photo selection with the couple and photographer.",
      "Help future couples discover your planning services.",
    ],
  },
  {
    slug: "corporate-events",
    type: "CORPORATE_EVENTS",
    title: "Corporate & events",
    headline: "Make shared moments part of your story.",
    description:
      "Bring company milestones, retreats and events into print. Plan an album for the people who made it happen, and help new clients discover your event business.",
    shortDescription: "Keep the moments that brought everyone together.",
    example: {
      occasion: "A team retreat to remember",
      keepsake: "A shared story for every desk",
      connection: "Your event team meets its next client",
    },
    ideas: [
      "Discuss keepsakes for retreats, launches and team milestones.",
      "Plan quantities and delivery dates around your event.",
      "Introduce your event services through a public partner profile.",
    ],
  },
  {
    slug: "real-estate",
    type: "REAL_ESTATE",
    title: "Real estate",
    headline: "Welcome them home with something personal.",
    description:
      "Make the handover feel as meaningful as the home itself. Explore a photo book as a closing gift and introduce your agency to people starting their next chapter.",
    shortDescription: "A new home. A new chapter. A keepsake to begin it.",
    example: {
      occasion: "The day they get their keys",
      keepsake: "The first chapter of a new home",
      connection: "A future homeowner discovers you",
    },
    ideas: [
      "Explore a personalised photo book as a handover gift.",
      "Build a story from the first visit to moving day.",
      "Share your agency and location in the partner directory.",
    ],
  },
  {
    slug: "creative-businesses",
    type: "OTHER",
    title: "Creative businesses",
    headline: "Have an idea worth making tangible?",
    description:
      "From independent creators to experience hosts, there is more than one way to turn a memory into print. Tell us what you do and we will explore how Albumo could be part of it.",
    shortDescription: "Fresh ideas from creators, hosts and independent businesses.",
    example: {
      occasion: "An experience only you could create",
      keepsake: "A printed reminder of that feeling",
      connection: "Someone new discovers your work",
    },
    ideas: [
      "Explore albums for workshops, communities or hosted experiences.",
      "Tell us about your audience and the memories you help create.",
      "Discuss a directory listing that introduces your business.",
    ],
  },
];
