// ==================== SLIDER TYPES ====================
export interface SliderSlide {
  id?: number;
  url: string;
  alt: string;
  link?: string;
  order: number;
  _id?: string;
}

export interface SliderSettings {
  autoplay: boolean;
  autoplaySpeed: number;
  showArrows: boolean;
  height: string;
}

// ==================== HERO OFFERS TYPES ====================
export interface HeroOffer {
  id?: number;
  image: string;
  imageBg: string;
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  order: number;
  _id?: string;
}

// ==================== PARTNER LOGOS ====================
export interface PartnerLogo {
  _id?: string;
  url: string;
}

// ==================== SIDEBAR PROMO (Legacy) ====================
export interface SidebarPromo {
  category: string;
  title: string;
  image: string;
  link: string;
  isHighlighted: boolean;
  _id?: string;
}

// ==================== PROMO CARD (For promotional sections) ====================
export interface PromoCard {
  gameTitle: string;
  badge: string;
  badgeColor: string; // purple, blue, green, orange
  image: string;
  heading: string;
  description: string;
  linkText: string;
  linkUrl: string;
  order: number;
  _id?: string;
}

// ==================== OFFER CARD (Legacy) ====================
export interface OfferCard {
  gameTitle: string;
  badge: string;
  heading: string;
  subText: string;
  image: string;
  link: string;
  _id?: string;
}

// ==================== CATALOGUE SECTION ====================
export interface CatalogueSection {
  enabled: boolean;
  image: string;
  badge: string;
  badgeIcon: string;
  title: string;
  coloredTitle: string;
  description: string;
  primaryBtn: {
    text: string;
    url: string;
  };
  secondaryBtn: {
    text: string;
    url: string;
  };
  stats: {
    customerCount: string;
    rating: number;
  };
}

// ==================== MAIN HOME SETTINGS ====================
export interface HomeSettings {
  _id?: string;
  hero: {
    slider: {
      enabled: boolean;
      slides: SliderSlide[];
      settings: SliderSettings;
    };
    offers: HeroOffer[];
    backgroundImg?: string;
    characterImg?: string;
    partnerLogos: string[];
    sidebarPromos: SidebarPromo[]; // Legacy
  };
  promotionalSection: {
    title: string;
    enabled: boolean;
    cards: PromoCard[];
  };
  promotionalSectionTwo: {
    title: string;
    enabled: boolean;
    cards: PromoCard[];
  };
  catalogueSection: CatalogueSection;
  offersSection: {
    title: string;
    cards: OfferCard[];
  };
  ctaBanner: {
    mainHeading: string;
    coloredHeading: string;
    description: string;
    featuredGameCovers: string[];
    stats: {
      customerCount: string;
      rating: number;
    };
    primaryBtn: {
      text: string;
      url: string;
    };
    secondaryBtn: {
      text: string;
      url: string;
    };
  };
  createdAt?: string;
  updatedAt?: string;
}

// ==================== API RESPONSE ====================
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}