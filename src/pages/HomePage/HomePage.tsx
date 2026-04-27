import React, { useState, useEffect } from "react";
import {
  HomeSettings,
  OfferCard,
  SidebarPromo,
  SliderSlide,
  HeroOffer,
  PromoCard,
} from "../../types/homeSettings.types";
import { homeSettingsService } from "../../services/homeSettings.service";

const AdminHomePage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeSidebarTab, setActiveSidebarTab] = useState<
    "slider" | "offers" | "partners" | "promo1" | "promo2" | "catalogue"
  >("slider");
  const [initialData, setInitialData] = useState<HomeSettings | null>(null);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  const [formData, setFormData] = useState<HomeSettings>({
    hero: {
      slider: {
        enabled: true,
        slides: [],
        settings: {
          autoplay: true,
          autoplaySpeed: 5000,
          showArrows: true,
          height: "568px",
        },
      },
      offers: [],
      backgroundImg: "",
      characterImg: "",
      partnerLogos: [],
      sidebarPromos: [],
    },
    promotionalSection: {
      title: "Featured Offers",
      enabled: true,
      cards: [],
    },
    promotionalSectionTwo: {
      title: "More Offers",
      enabled: true,
      cards: [],
    },
    catalogueSection: {
      enabled: true,
      image: "",
      badge: "New Arrivals",
      badgeIcon: "sparkles",
      title: "Discover Your",
      coloredTitle: "Ultimate Gaming",
      description:
        "Explore our massive collection of premium games, accessories, and exclusive merchandise.",
      primaryBtn: {
        text: "Go to Catalog",
        url: "/categories",
      },
      secondaryBtn: {
        text: "Shop Now",
        url: "/shop",
      },
      stats: {
        customerCount: "2k+",
        rating: 4.8,
      },
    },
    offersSection: {
      title: "Latest Offers",
      cards: [],
    },
    ctaBanner: {
      mainHeading: "",
      coloredHeading: "",
      description: "",
      featuredGameCovers: [],
      stats: {
        customerCount: "2k+",
        rating: 4.8,
      },
      primaryBtn: { text: "", url: "" },
      secondaryBtn: { text: "", url: "" },
    },
  });

  // Form states for adding new items
  const [newPartnerLogo, setNewPartnerLogo] = useState<string>("");
  const [newGameCover, setNewGameCover] = useState<string>("");

  // Slider states
  const [newSliderSlide, setNewSliderSlide] = useState<SliderSlide>({
    url: "",
    alt: "",
    link: "/shop",
    order: 0,
  });
  const [editingSliderSlide, setEditingSliderSlide] = useState<{
    index: number;
    data: SliderSlide;
  } | null>(null);

  // Hero Offer states
  const [newHeroOffer, setNewHeroOffer] = useState<HeroOffer>({
    image: "",
    imageBg: "bg-purple-100",
    title: "",
    description: "",
    linkText: "Shop Now",
    linkUrl: "/shop",
    order: 0,
  });
  const [editingHeroOffer, setEditingHeroOffer] = useState<{
    index: number;
    data: HeroOffer;
  } | null>(null);

  // Promo Card states
  const [newPromoCard, setNewPromoCard] = useState<PromoCard>({
    gameTitle: "",
    badge: "",
    badgeColor: "purple",
    image: "",
    heading: "",
    description: "",
    linkText: "Learn More",
    linkUrl: "/shop",
    order: 0,
  });
  const [editingPromoCard, setEditingPromoCard] = useState<{
    index: number;
    data: PromoCard;
    section: "promotionalSection" | "promotionalSectionTwo";
  } | null>(null);

  const [newPromoCardTwo, setNewPromoCardTwo] = useState<PromoCard>({
    gameTitle: "",
    badge: "",
    badgeColor: "blue",
    image: "",
    heading: "",
    description: "",
    linkText: "Learn More",
    linkUrl: "/shop",
    order: 0,
  });

  // Image upload states
  const [uploadingImage, setUploadingImage] = useState<{
    field: string;
    index?: number;
    section?: string;
  } | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Check system preference for dark mode
  useEffect(() => {
    const isDark =
      localStorage.getItem("theme") === "dark" ||
      (window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);
    setIsDarkMode(isDark);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    fetchHomeSettings();
  }, []);

  useEffect(() => {
    if (initialData) {
      const hasChanges =
        JSON.stringify(initialData) !== JSON.stringify(formData);
      setHasChanges(hasChanges);
    }
  }, [formData, initialData]);

  const fetchHomeSettings = async (): Promise<void> => {
    try {
      setLoading(true);
      const data = await homeSettingsService.getSettings();
      setFormData(data);
      setInitialData(data);
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch home settings";
      setError(errorMessage);
      console.error("Error fetching settings:", err);
    } finally {
      setLoading(false);
    }
  };

  // Compress image before converting to base64
  const compressImage = (
    file: File,
    maxWidth: number = 1200,
    quality: number = 0.8,
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);

          const base64 = canvas.toDataURL("image/jpeg", quality);
          resolve(base64);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  // Handle image upload with compression
  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string,
    index?: number,
    section?: string,
  ): Promise<void> => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image size should be less than 10MB");
      return;
    }

    setUploadingImage({ field, index, section });
    setImagePreview(URL.createObjectURL(file));

    try {
      const base64 = await compressImage(file, 1200, 0.8);

      if (field === "sliderImage" && index !== undefined) {
        const updatedSlides = [...formData.hero.slider.slides];
        updatedSlides[index] = { ...updatedSlides[index], url: base64 };
        setFormData((prev: HomeSettings) => ({
          ...prev,
          hero: {
            ...prev.hero,
            slider: {
              ...prev.hero.slider,
              slides: updatedSlides,
            },
          },
        }));
        setHasChanges(true);
      } else if (field === "newSliderImage") {
        setNewSliderSlide({ ...newSliderSlide, url: base64 });
      } else if (field === "heroOfferImage" && index !== undefined) {
        const updatedOffers = [...formData.hero.offers];
        updatedOffers[index] = { ...updatedOffers[index], image: base64 };
        setFormData((prev: HomeSettings) => ({
          ...prev,
          hero: { ...prev.hero, offers: updatedOffers },
        }));
        setHasChanges(true);
      } else if (field === "newHeroOfferImage") {
        setNewHeroOffer({ ...newHeroOffer, image: base64 });
      } else if (field === "promoCardImage" && section && index !== undefined) {
        const updatedCards = [
          ...(formData[section as keyof HomeSettings] as any).cards,
        ];
        updatedCards[index] = { ...updatedCards[index], image: base64 };
        setFormData((prev: HomeSettings) => ({
          ...prev,
          [section]: {
            ...(prev[section as keyof HomeSettings] as any),
            cards: updatedCards,
          },
        }));
        setHasChanges(true);
      } else if (field === "newPromoCardImage") {
        setNewPromoCard({ ...newPromoCard, image: base64 });
      } else if (field === "newPromoCardTwoImage") {
        setNewPromoCardTwo({ ...newPromoCardTwo, image: base64 });
      } else if (field === "catalogueImage") {
        setFormData((prev: HomeSettings) => ({
          ...prev,
          catalogueSection: { ...prev.catalogueSection, image: base64 },
        }));
        setHasChanges(true);
      } else if (field === "backgroundImg") {
        setFormData((prev: HomeSettings) => ({
          ...prev,
          hero: { ...prev.hero, backgroundImg: base64 },
        }));
        setHasChanges(true);
      } else if (field === "characterImg") {
        setFormData((prev: HomeSettings) => ({
          ...prev,
          hero: { ...prev.hero, characterImg: base64 },
        }));
        setHasChanges(true);
      } else if (field === "partnerLogo") {
        setNewPartnerLogo(base64);
      } else if (field === "gameCover") {
        setNewGameCover(base64);
      }

      setSuccess("Image uploaded and compressed successfully!");
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to convert image";
      setError(errorMessage);
      console.error("Image upload error:", err);
    } finally {
      setUploadingImage(null);
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  // Clean data before sending to API
  const cleanDataForAPI = (data: HomeSettings): any => {
    return {
      hero: {
        slider: {
          enabled: data.hero.slider.enabled,
          settings: {
            autoplay: data.hero.slider.settings.autoplay,
            autoplaySpeed: data.hero.slider.settings.autoplaySpeed,
            showArrows: data.hero.slider.settings.showArrows,
            height: data.hero.slider.settings.height || "568px",
          },
          slides: data.hero.slider.slides.map((slide, idx) => ({
            id: slide.id || idx + 1,
            url: slide.url || "",
            alt: slide.alt || "",
            link: slide.link || "/shop",
            order: slide.order || idx,
          })),
        },
        offers: data.hero.offers.map((offer, idx) => ({
          id: offer.id || idx + 1,
          image: offer.image || "",
          imageBg: offer.imageBg || "bg-purple-100",
          title: offer.title || "",
          description: offer.description || "",
          linkText: offer.linkText || "Shop Now",
          linkUrl: offer.linkUrl || "/shop",
          order: offer.order || idx,
        })),
        backgroundImg: data.hero.backgroundImg || "",
        characterImg: data.hero.characterImg || "",
        partnerLogos: data.hero.partnerLogos || [],
        sidebarPromos: data.hero.sidebarPromos || [],
      },
      promotionalSection: {
        title: data.promotionalSection.title || "Featured Offers",
        enabled: data.promotionalSection.enabled !== false,
        cards: data.promotionalSection.cards.map((card, idx) => ({
          gameTitle: card.gameTitle || "",
          badge: card.badge || "",
          badgeColor: card.badgeColor || "purple",
          image: card.image || "",
          heading: card.heading || "",
          description: card.description || "",
          linkText: card.linkText || "Learn More",
          linkUrl: card.linkUrl || "/shop",
          order: card.order || idx,
        })),
      },
      promotionalSectionTwo: {
        title: data.promotionalSectionTwo.title || "More Offers",
        enabled: data.promotionalSectionTwo.enabled !== false,
        cards: data.promotionalSectionTwo.cards.map((card, idx) => ({
          gameTitle: card.gameTitle || "",
          badge: card.badge || "",
          badgeColor: card.badgeColor || "blue",
          image: card.image || "",
          heading: card.heading || "",
          description: card.description || "",
          linkText: card.linkText || "Learn More",
          linkUrl: card.linkUrl || "/shop",
          order: card.order || idx,
        })),
      },
      catalogueSection: {
        enabled: data.catalogueSection.enabled !== false,
        image: data.catalogueSection.image || "",
        badge: data.catalogueSection.badge || "New Arrivals",
        badgeIcon: data.catalogueSection.badgeIcon || "sparkles",
        title: data.catalogueSection.title || "Discover Your",
        coloredTitle: data.catalogueSection.coloredTitle || "Ultimate Gaming",
        description: data.catalogueSection.description || "",
        primaryBtn: {
          text: data.catalogueSection.primaryBtn?.text || "Go to Catalog",
          url: data.catalogueSection.primaryBtn?.url || "/categories",
        },
        secondaryBtn: {
          text: data.catalogueSection.secondaryBtn?.text || "Shop Now",
          url: data.catalogueSection.secondaryBtn?.url || "/shop",
        },
        stats: {
          customerCount: data.catalogueSection.stats?.customerCount || "2k+",
          rating: data.catalogueSection.stats?.rating || 4.8,
        },
      },
      offersSection: {
        title: data.offersSection?.title || "Latest Offers",
        cards: data.offersSection?.cards || [],
      },
      ctaBanner: {
        mainHeading: data.ctaBanner?.mainHeading || "",
        coloredHeading: data.ctaBanner?.coloredHeading || "",
        description: data.ctaBanner?.description || "",
        featuredGameCovers: data.ctaBanner?.featuredGameCovers || [],
        stats: {
          customerCount: data.ctaBanner?.stats?.customerCount || "2k+",
          rating: data.ctaBanner?.stats?.rating || 4.8,
        },
        primaryBtn: {
          text: data.ctaBanner?.primaryBtn?.text || "",
          url: data.ctaBanner?.primaryBtn?.url || "",
        },
        secondaryBtn: {
          text: data.ctaBanner?.secondaryBtn?.text || "",
          url: data.ctaBanner?.secondaryBtn?.url || "",
        },
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    if (!hasChanges) {
      setError("No changes to save");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setSaving(true);
    setSuccess(null);
    setError(null);

    try {
      const cleanedData = cleanDataForAPI(formData);
      await homeSettingsService.updateSettings(cleanedData);
      setInitialData(formData);
      setHasChanges(false);
      setSuccess("Home settings updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update settings";
      setError(errorMessage);
      console.error("Error updating settings:", err);
      if ((err as any).response) {
        console.error("Response data:", (err as any).response.data);
        const serverError = (err as any).response.data;
        if (serverError.message) {
          setError(`Server error: ${serverError.message}`);
        }
      }
    } finally {
      setSaving(false);
    }
  };

  // Slider Management
  const addSliderSlide = async (): Promise<void> => {
    if (!newSliderSlide.url) return;
    try {
      const updatedSlides = [...formData.hero.slider.slides, newSliderSlide];
      setFormData((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          slider: {
            ...prev.hero.slider,
            slides: updatedSlides,
          },
        },
      }));
      setNewSliderSlide({
        url: "",
        alt: "",
        link: "/shop",
        order: updatedSlides.length,
      });
      setHasChanges(true);
      setSuccess("Slider slide added! Click Save to confirm.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add slider slide";
      setError(errorMessage);
      console.error("Add slider slide error:", err);
    }
  };

  const updateSliderSlide = async (index: number): Promise<void> => {
    if (!editingSliderSlide) return;
    try {
      const updatedSlides = [...formData.hero.slider.slides];
      updatedSlides[index] = editingSliderSlide.data;
      setFormData((prev) => ({
        ...prev,
        hero: {
          ...prev.hero,
          slider: {
            ...prev.hero.slider,
            slides: updatedSlides,
          },
        },
      }));
      setEditingSliderSlide(null);
      setImagePreview(null);
      setHasChanges(true);
      setSuccess("Slide updated! Click Save to confirm.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update slider slide";
      setError(errorMessage);
      console.error("Update slider slide error:", err);
    }
  };

  const deleteSliderSlide = async (index: number): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this slide?")) {
      try {
        const updatedSlides = formData.hero.slider.slides.filter(
          (_, i) => i !== index,
        );
        setFormData((prev) => ({
          ...prev,
          hero: {
            ...prev.hero,
            slider: {
              ...prev.hero.slider,
              slides: updatedSlides,
            },
          },
        }));
        setHasChanges(true);
        setSuccess("Slide deleted! Click Save to confirm.");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete slider slide";
        setError(errorMessage);
        console.error("Delete slider slide error:", err);
      }
    }
  };

  // Hero Offers Management
  const addHeroOffer = async (): Promise<void> => {
    if (!newHeroOffer.title) return;
    try {
      const offerToAdd = {
        ...newHeroOffer,
        description: newHeroOffer.description || "",
        id: formData.hero.offers.length + 1,
        order: formData.hero.offers.length,
      };

      const updatedOffers = [...formData.hero.offers, offerToAdd];
      setFormData((prev) => ({
        ...prev,
        hero: { ...prev.hero, offers: updatedOffers },
      }));
      setNewHeroOffer({
        image: "",
        imageBg: "bg-purple-100",
        title: "",
        description: "",
        linkText: "Shop Now",
        linkUrl: "/shop",
        order: updatedOffers.length,
      });
      setHasChanges(true);
      setSuccess("Offer added! Click Save to confirm.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add hero offer";
      setError(errorMessage);
      console.error("Add hero offer error:", err);
    }
  };

  const updateHeroOffer = async (index: number): Promise<void> => {
    if (!editingHeroOffer) return;
    try {
      const cleanedOffer = {
        ...editingHeroOffer.data,
        description: editingHeroOffer.data.description || "",
        title: editingHeroOffer.data.title || "",
        image: editingHeroOffer.data.image || "",
        imageBg: editingHeroOffer.data.imageBg || "bg-purple-100",
        linkText: editingHeroOffer.data.linkText || "Shop Now",
        linkUrl: editingHeroOffer.data.linkUrl || "/shop",
        id: editingHeroOffer.data.id || index + 1,
        order: editingHeroOffer.data.order || index,
      };

      const updatedOffers = [...formData.hero.offers];
      updatedOffers[index] = cleanedOffer;

      setFormData((prev) => ({
        ...prev,
        hero: { ...prev.hero, offers: updatedOffers },
      }));
      setEditingHeroOffer(null);
      setImagePreview(null);
      setHasChanges(true);
      setSuccess("Offer updated! Click Save to confirm.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update hero offer";
      setError(errorMessage);
      console.error("Update hero offer error:", err);
    }
  };

  const deleteHeroOffer = async (index: number): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this offer?")) {
      try {
        const updatedOffers = formData.hero.offers.filter(
          (_, i) => i !== index,
        );
        setFormData((prev) => ({
          ...prev,
          hero: { ...prev.hero, offers: updatedOffers },
        }));
        setHasChanges(true);
        setSuccess("Offer deleted! Click Save to confirm.");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete hero offer";
        setError(errorMessage);
        console.error("Delete hero offer error:", err);
      }
    }
  };

  // Add Promo Card
  const addPromoCard = async (
    section: "promotionalSection" | "promotionalSectionTwo",
  ): Promise<void> => {
    const cardData =
      section === "promotionalSection" ? newPromoCard : newPromoCardTwo;
    if (!cardData.gameTitle) return;

    try {
      const updatedCards = [...(formData[section] as any).cards, cardData];
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          cards: updatedCards,
        },
      }));

      if (section === "promotionalSection") {
        setNewPromoCard({
          gameTitle: "",
          badge: "",
          badgeColor: "purple",
          image: "",
          heading: "",
          description: "",
          linkText: "Learn More",
          linkUrl: "/shop",
          order: updatedCards.length,
        });
      } else {
        setNewPromoCardTwo({
          gameTitle: "",
          badge: "",
          badgeColor: "blue",
          image: "",
          heading: "",
          description: "",
          linkText: "Learn More",
          linkUrl: "/shop",
          order: updatedCards.length,
        });
      }

      setHasChanges(true);
      setSuccess("Promo card added! Click Save to confirm.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add promo card";
      setError(errorMessage);
      console.error("Add promo card error:", err);
    }
  };

  // Update Promo Card
  const updatePromoCard = async (
    section: "promotionalSection" | "promotionalSectionTwo",
    index: number,
  ): Promise<void> => {
    if (!editingPromoCard) return;
    try {
      const updatedCards = [...(formData[section] as any).cards];
      updatedCards[index] = editingPromoCard.data;
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...(prev[section] as any),
          cards: updatedCards,
        },
      }));
      setEditingPromoCard(null);
      setImagePreview(null);
      setHasChanges(true);
      setSuccess("Promo card updated! Click Save to confirm.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update promo card";
      setError(errorMessage);
      console.error("Update promo card error:", err);
    }
  };

  // Delete Promo Card
  const deletePromoCard = async (
    section: "promotionalSection" | "promotionalSectionTwo",
    index: number,
  ): Promise<void> => {
    if (window.confirm("Are you sure you want to delete this card?")) {
      try {
        const updatedCards = (formData[section] as any).cards.filter(
          (_: any, i: number) => i !== index,
        );
        setFormData((prev) => ({
          ...prev,
          [section]: {
            ...(prev[section] as any),
            cards: updatedCards,
          },
        }));
        setHasChanges(true);
        setSuccess("Promo card deleted! Click Save to confirm.");
        setTimeout(() => setSuccess(null), 3000);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete promo card";
        setError(errorMessage);
        console.error("Delete promo card error:", err);
      }
    }
  };

  // Partner Logos Management
  const addPartnerLogo = async (): Promise<void> => {
    if (!newPartnerLogo) return;
    try {
      const updatedLogos = [...formData.hero.partnerLogos, newPartnerLogo];
      setFormData((prev) => ({
        ...prev,
        hero: { ...prev.hero, partnerLogos: updatedLogos },
      }));
      setNewPartnerLogo("");
      setHasChanges(true);
      setSuccess("Partner logo added! Click Save to confirm.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add partner logo";
      setError(errorMessage);
      console.error("Add partner logo error:", err);
    }
  };

  const removePartnerLogo = async (logoUrl: string): Promise<void> => {
    try {
      const updatedLogos = formData.hero.partnerLogos.filter(
        (logo) => logo !== logoUrl,
      );
      setFormData((prev) => ({
        ...prev,
        hero: { ...prev.hero, partnerLogos: updatedLogos },
      }));
      setHasChanges(true);
      setSuccess("Partner logo removed! Click Save to confirm.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove partner logo";
      setError(errorMessage);
      console.error("Remove partner logo error:", err);
    }
  };

  // Game Cover Management
  const addGameCover = async (): Promise<void> => {
    if (!newGameCover) return;
    try {
      const updatedCovers = [
        ...formData.ctaBanner.featuredGameCovers,
        newGameCover,
      ];
      setFormData((prev) => ({
        ...prev,
        ctaBanner: { ...prev.ctaBanner, featuredGameCovers: updatedCovers },
      }));
      setNewGameCover("");
      setHasChanges(true);
      setSuccess("Game cover added! Click Save to confirm.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to add game cover";
      setError(errorMessage);
      console.error("Add game cover error:", err);
    }
  };

  const removeGameCover = async (index: number): Promise<void> => {
    try {
      const updatedCovers = formData.ctaBanner.featuredGameCovers.filter(
        (_, i) => i !== index,
      );
      setFormData((prev) => ({
        ...prev,
        ctaBanner: { ...prev.ctaBanner, featuredGameCovers: updatedCovers },
      }));
      setHasChanges(true);
      setSuccess("Game cover removed! Click Save to confirm.");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to remove game cover";
      setError(errorMessage);
      console.error("Remove game cover error:", err);
    }
  };

  if (loading) {
    return (
      <div
        className={`flex justify-center items-center h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <div
            className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}
          >
            Loading dashboard...
          </div>
        </div>
      </div>
    );
  }

  // Theme classes
  const theme = {
    bg: isDarkMode ? "bg-gray-900" : "bg-gray-50",
    cardBg: isDarkMode ? "bg-gray-800" : "bg-white",
    text: isDarkMode ? "text-white" : "text-gray-900",
    textSecondary: isDarkMode ? "text-gray-300" : "text-gray-600",
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    input: isDarkMode
      ? "bg-gray-700 border-gray-600 text-white"
      : "bg-white border-gray-300 text-gray-900",
    sidebarBg: isDarkMode ? "bg-gray-800" : "bg-white",
    button: {
      primary: "bg-blue-500 hover:bg-blue-600 text-white",
      success: "bg-green-500 hover:bg-green-600 text-white",
      danger: "bg-red-500 hover:bg-red-600 text-white",
      warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
      secondary: isDarkMode
        ? "bg-gray-600 hover:bg-gray-500 text-white"
        : "bg-gray-500 hover:bg-gray-600 text-white",
    },
  };

  // Sidebar menu items
  const sidebarItems = [
    {
      id: "slider",
      label: "Hero Slider",
      icon: "🎠",
      count: formData.hero.slider.slides.length,
    },
    {
      id: "offers",
      label: "Hero Offers",
      icon: "🎁",
      count: formData.hero.offers.length,
    },
    {
      id: "partners",
      label: "Partner Logos",
      icon: "🤝",
      count: formData.hero.partnerLogos.length,
    },
    {
      id: "promo1",
      label: "Promo Section 1",
      icon: "📢",
      count: formData.promotionalSection.cards.length,
    },
    {
      id: "promo2",
      label: "Promo Section 2",
      icon: "📢",
      count: formData.promotionalSectionTwo.cards.length,
    },
    { id: "catalogue", label: "Catalogue & CTA", icon: "📚", count: 0 },
  ];

  return (
    <div className={`min-h-screen ${theme.bg} transition-colors duration-300`}>
      <div className="flex h-screen overflow-hidden gap-6">
        {/* Sidebar */}
        <div
          className={`w-80 ${theme.sidebarBg} border-r ${theme.border} flex flex-col shadow-lg rounded-xl`}
        >
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className={`text-2xl font-bold ${theme.text}`}>
              Home Settings
            </h1>
            <p className={`text-sm ${theme.textSecondary} mt-1`}>
              Manage homepage content
            </p>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            <nav className="space-y-1 px-3">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSidebarTab(item.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeSidebarTab === item.id
                      ? `${theme.button.primary} shadow-md`
                      : `${theme.textSecondary} hover:${theme.text} hover:bg-gray-100 dark:hover:bg-gray-700`
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.count > 0 && (
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        activeSidebarTab === item.id
                          ? "bg-white text-gray-800"
                          : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => {
                setIsDarkMode(!isDarkMode);
                localStorage.setItem("theme", !isDarkMode ? "dark" : "light");
              }}
              className={`w-full px-4 py-2 rounded-lg ${theme.button.secondary} transition-colors flex items-center justify-center gap-2`}
            >
              {isDarkMode ? "☀️ Light Mode" : "🌙 Dark Mode"}
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-6 py-4">
            {/* Save Bar */}
            <div
              className={`sticky top-0 z-10 rounded-xl py-4 mb-6 ${theme.cardBg} border-b ${theme.border} shadow-sm flex justify-between items-center`}
            >
              <div>
                <h4 className="text-lg font-semibold ps-4">
                  Manage{" "}
                  {sidebarItems.find((i) => i.id === activeSidebarTab)?.label}
                </h4>
                <div>
                  {hasChanges && (
                    <span
                      className={`text-sm ${theme.textSecondary} flex items-center gap-2 ps-4`}
                    >
                      <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                      You have unsaved changes
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={fetchHomeSettings}
                  className={`px-5 py-2 rounded-lg ${theme.button.secondary} transition-all`}
                >
                  ↻ Reset
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={saving || !hasChanges}
                  className={`px-6 py-2 rounded-lg transition-all flex items-center gap-2 ${
                    saving || !hasChanges
                      ? "bg-gray-400 cursor-not-allowed opacity-50"
                      : `${theme.button.primary} shadow-md hover:shadow-lg`
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>💾 Save Changes</>
                  )}
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="space-y-6">
              {/* Slider Section */}
              {activeSidebarTab === "slider" && (
                <div
                  className={`${theme.cardBg} rounded-xl shadow-lg p-6 ${theme.border} border`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold ${theme.text}`}>
                      Hero Slider
                    </h2>
                    <label className={`flex items-center gap-2 ${theme.text}`}>
                      <input
                        type="checkbox"
                        checked={formData.hero.slider.enabled}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            hero: {
                              ...prev.hero,
                              slider: {
                                ...prev.hero.slider,
                                enabled: e.target.checked,
                              },
                            },
                          }));
                          setHasChanges(true);
                        }}
                        className="w-4 h-4"
                      />
                      Enable Slider
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme.text}`}
                      >
                        Auto-play Speed (ms)
                      </label>
                      <input
                        type="number"
                        value={formData.hero.slider.settings.autoplaySpeed}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            hero: {
                              ...prev.hero,
                              slider: {
                                ...prev.hero.slider,
                                settings: {
                                  ...prev.hero.slider.settings,
                                  autoplaySpeed: parseInt(e.target.value),
                                },
                              },
                            },
                          }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme.text}`}
                      >
                        Slider Height
                      </label>
                      <input
                        type="text"
                        value={formData.hero.slider.settings.height}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            hero: {
                              ...prev.hero,
                              slider: {
                                ...prev.hero.slider,
                                settings: {
                                  ...prev.hero.slider.settings,
                                  height: e.target.value,
                                },
                              },
                            },
                          }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <h3 className={`font-semibold mb-3 ${theme.text}`}>
                      Current Slides ({formData.hero.slider.slides.length})
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.hero.slider.slides.map((slide, index) => (
                        <div
                          key={index}
                          className={`border rounded-lg overflow-hidden ${theme.border} group`}
                        >
                          <img
                            src={slide.url}
                            alt={slide.alt}
                            className="h-40 w-full object-cover"
                          />
                          <div className="p-3">
                            <p
                              className={`text-sm truncate font-medium ${theme.text}`}
                            >
                              {slide.alt || "Untitled"}
                            </p>
                            <p
                              className={`text-xs truncate ${theme.textSecondary} mt-1`}
                            >
                              {slide.link}
                            </p>
                            <div className="flex justify-end gap-2 mt-3">
                              <button
                                type="button"
                                onClick={() =>
                                  setEditingSliderSlide({ index, data: slide })
                                }
                                className="px-3 py-1 rounded text-xs bg-yellow-500 text-white hover:bg-yellow-600 transition"
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteSliderSlide(index)}
                                className="px-3 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className={`font-semibold mb-4 ${theme.text}`}>
                      Add New Slide
                    </h3>

                    {/* Image Upload Section */}
                    <div className="mb-4">
                      <label
                        className={`block text-sm font-medium mb-2 ${theme.text}`}
                      >
                        Slide Image
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            className={`block text-xs mb-1 ${theme.textSecondary}`}
                          >
                            Upload Image (Base64)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(e, "newSliderImage")
                            }
                            className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                          />
                          <p className={`text-xs mt-1 ${theme.textSecondary}`}>
                            Supports JPG, PNG, GIF. Max 10MB
                          </p>
                        </div>
                        <div>
                          <label
                            className={`block text-xs mb-1 ${theme.textSecondary}`}
                          >
                            Or Image URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://example.com/slide.jpg"
                            value={newSliderSlide.url}
                            onChange={(e) =>
                              setNewSliderSlide({
                                ...newSliderSlide,
                                url: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Slide Details Grid - 2 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Alt Text
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Gaming Console"
                          value={newSliderSlide.alt}
                          onChange={(e) =>
                            setNewSliderSlide({
                              ...newSliderSlide,
                              alt: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Link URL
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., /shop"
                          value={newSliderSlide.link}
                          onChange={(e) =>
                            setNewSliderSlide({
                              ...newSliderSlide,
                              link: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={addSliderSlide}
                          disabled={!newSliderSlide.url}
                          className={`w-full px-5 py-2 rounded-lg ${theme.button.success} transition-all flex items-center justify-center gap-2 ${
                            !newSliderSlide.url
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:shadow-lg"
                          }`}
                        >
                          <span>➕</span> Add Slide
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Hero Offers Section */}
              {activeSidebarTab === "offers" && (
                <div
                  className={`${theme.cardBg} rounded-xl shadow-lg p-6 ${theme.border} border`}
                >
                  <h2 className={`text-2xl font-bold mb-6 ${theme.text}`}>
                    Hero Offers
                  </h2>

                  <div className="space-y-3 mb-6">
                    <h3 className={`font-semibold ${theme.text}`}>
                      Current Offers ({formData.hero.offers.length})
                    </h3>
                    {formData.hero.offers.map((offer, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-3 ${theme.border} flex justify-between items-center`}
                      >
                        <div className="flex gap-3 items-center">
                          <img
                            src={offer.image}
                            alt={offer.title}
                            className="h-12 w-12 object-cover rounded"
                          />
                          <div>
                            <p
                              className={`font-semibold text-sm ${theme.text}`}
                            >
                              {offer.title}
                            </p>
                            <p className={`text-xs ${theme.textSecondary}`}>
                              {offer.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              setEditingHeroOffer({ index, data: offer })
                            }
                            className="px-3 py-1 rounded text-xs bg-yellow-500 text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteHeroOffer(index)}
                            className="px-3 py-1 rounded text-xs bg-red-500 text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-6">
                    <h3 className={`font-semibold mb-4 ${theme.text}`}>
                      Add New Offer
                    </h3>

                    {/* Image Upload Section - Full Width */}
                    <div className="mb-4">
                      <label
                        className={`block text-sm font-medium mb-2 ${theme.text}`}
                      >
                        Offer Image
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            className={`block text-xs mb-1 ${theme.textSecondary}`}
                          >
                            Upload Image (Base64)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(e, "newHeroOfferImage")
                            }
                            className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                          />
                          <p className={`text-xs mt-1 ${theme.textSecondary}`}>
                            Supports JPG, PNG, GIF. Max 10MB
                          </p>
                        </div>
                        <div>
                          <label
                            className={`block text-xs mb-1 ${theme.textSecondary}`}
                          >
                            Or Image URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://example.com/image.jpg"
                            value={newHeroOffer.image}
                            onChange={(e) =>
                              setNewHeroOffer({
                                ...newHeroOffer,
                                image: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Offer Details Grid - 2 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., MONTHLY DEALS"
                          value={newHeroOffer.title}
                          onChange={(e) =>
                            setNewHeroOffer({
                              ...newHeroOffer,
                              title: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Description <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., DualSense Controller"
                          value={newHeroOffer.description}
                          onChange={(e) =>
                            setNewHeroOffer({
                              ...newHeroOffer,
                              description: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Link Text
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Shop Now"
                          value={newHeroOffer.linkText}
                          onChange={(e) =>
                            setNewHeroOffer({
                              ...newHeroOffer,
                              linkText: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Link URL
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., /shop"
                          value={newHeroOffer.linkUrl}
                          onChange={(e) =>
                            setNewHeroOffer({
                              ...newHeroOffer,
                              linkUrl: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Background Color
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={newHeroOffer.imageBg}
                            onChange={(e) =>
                              setNewHeroOffer({
                                ...newHeroOffer,
                                imageBg: e.target.value,
                              })
                            }
                            className={`flex-1 px-3 py-2 border rounded-lg ${theme.input}`}
                          >
                            <option value="bg-purple-100">Purple</option>
                            <option value="bg-blue-100">Blue</option>
                            <option value="bg-green-100">Green</option>
                            <option value="bg-orange-100">Orange</option>
                            <option value="bg-red-100">Red</option>
                            <option value="bg-pink-100">Pink</option>
                            <option value="bg-indigo-100">Indigo</option>
                          </select>
                          <div
                            className={`w-10 h-10 rounded-lg border ${newHeroOffer.imageBg}`}
                            style={{
                              backgroundColor: newHeroOffer.imageBg
                                .replace("bg-", "")
                                .replace("-100", ""),
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={addHeroOffer}
                          disabled={!newHeroOffer.title}
                          className={`w-full px-5 py-2 rounded-lg ${theme.button.success} transition-all flex items-center justify-center gap-2 ${
                            !newHeroOffer.title
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:shadow-lg"
                          }`}
                        >
                          <span>➕</span> Add Offer
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Partners Section */}
              {activeSidebarTab === "partners" && (
                <div
                  className={`${theme.cardBg} rounded-xl shadow-lg p-6 ${theme.border} border`}
                >
                  <h2 className={`text-2xl font-bold mb-6 ${theme.text}`}>
                    Partner Logos
                  </h2>

                  <div className="flex flex-wrap gap-4 mb-6">
                    {formData.hero.partnerLogos.map((logo, index) => (
                      <div
                        key={index}
                        className="relative group border rounded-lg p-3 hover:shadow-md transition"
                      >
                        <img
                          src={logo}
                          alt={`Partner ${index}`}
                          className="h-12 w-auto object-contain"
                        />
                        <button
                          onClick={() => removePartnerLogo(logo)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs opacity-0 group-hover:opacity-100 transition hover:bg-red-600"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-6">
                    <h3 className={`font-semibold mb-3 ${theme.text}`}>
                      Add New Logo
                    </h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={newPartnerLogo}
                        onChange={(e) => setNewPartnerLogo(e.target.value)}
                        placeholder="Enter logo URL"
                        className={`flex-1 px-3 py-2 border rounded-lg ${theme.input}`}
                      />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "partnerLogo")}
                        className="hidden"
                        id="partnerLogoUpload"
                      />
                      <label
                        htmlFor="partnerLogoUpload"
                        className={`px-4 py-2 rounded-lg cursor-pointer ${theme.button.secondary} transition`}
                      >
                        Upload
                      </label>
                      <button
                        onClick={addPartnerLogo}
                        disabled={!newPartnerLogo}
                        className={`px-5 py-2 rounded-lg ${theme.button.primary} transition ${
                          !newPartnerLogo ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Promo Section 1 */}
              {activeSidebarTab === "promo1" && (
                <div
                  className={`${theme.cardBg} rounded-xl shadow-lg p-6 ${theme.border} border`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold ${theme.text}`}>
                      Promotional Section One
                    </h2>
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      2 Columns
                    </span>
                  </div>

                  <div className="mb-6">
                    <label
                      className={`block text-sm font-medium mb-1 ${theme.text}`}
                    >
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={formData.promotionalSection.title}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          promotionalSection: {
                            ...prev.promotionalSection,
                            title: e.target.value,
                          },
                        }));
                        setHasChanges(true);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    {formData.promotionalSection.cards.map((card, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-3 ${theme.border}`}
                      >
                        <img
                          src={card.image}
                          alt={card.gameTitle}
                          className="h-32 w-full object-cover rounded mb-2"
                        />
                        <p className={`font-semibold text-sm ${theme.text}`}>
                          {card.gameTitle}
                        </p>
                        <p className={`text-xs ${theme.textSecondary}`}>
                          {card.heading}
                        </p>
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() =>
                              setEditingPromoCard({
                                index,
                                data: card,
                                section: "promotionalSection",
                              })
                            }
                            className="px-2 py-1 rounded text-xs bg-yellow-500 text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              deletePromoCard("promotionalSection", index)
                            }
                            className="px-2 py-1 rounded text-xs bg-red-500 text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-6">
                    <h3 className={`font-semibold mb-4 ${theme.text}`}>
                      Add New Card
                    </h3>

                    {/* Image Upload Section */}
                    <div className="mb-4">
                      <label
                        className={`block text-sm font-medium mb-2 ${theme.text}`}
                      >
                        Card Image
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            className={`block text-xs mb-1 ${theme.textSecondary}`}
                          >
                            Upload Image (Base64)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(e, "newPromoCardImage")
                            }
                            className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                          />
                        </div>
                        <div>
                          <label
                            className={`block text-xs mb-1 ${theme.textSecondary}`}
                          >
                            Or Image URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://example.com/card.jpg"
                            value={newPromoCard.image}
                            onChange={(e) =>
                              setNewPromoCard({
                                ...newPromoCard,
                                image: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Details Grid - 2 Columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Game Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., FORTNITE"
                          value={newPromoCard.gameTitle}
                          onChange={(e) =>
                            setNewPromoCard({
                              ...newPromoCard,
                              gameTitle: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Badge
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., EPIC PACK"
                          value={newPromoCard.badge}
                          onChange={(e) =>
                            setNewPromoCard({
                              ...newPromoCard,
                              badge: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Heading
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., AmongUs x Fortnite"
                          value={newPromoCard.heading}
                          onChange={(e) =>
                            setNewPromoCard({
                              ...newPromoCard,
                              heading: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Badge Color
                        </label>
                        <select
                          value={newPromoCard.badgeColor}
                          onChange={(e) =>
                            setNewPromoCard({
                              ...newPromoCard,
                              badgeColor: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        >
                          <option value="purple">Purple</option>
                          <option value="blue">Blue</option>
                          <option value="green">Green</option>
                          <option value="orange">Orange</option>
                          <option value="red">Red</option>
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Description
                        </label>
                        <textarea
                          placeholder="Describe the offer..."
                          value={newPromoCard.description}
                          onChange={(e) =>
                            setNewPromoCard({
                              ...newPromoCard,
                              description: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                          rows={3}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Link Text
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Learn More"
                          value={newPromoCard.linkText}
                          onChange={(e) =>
                            setNewPromoCard({
                              ...newPromoCard,
                              linkText: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Link URL
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., /shop"
                          value={newPromoCard.linkUrl}
                          onChange={(e) =>
                            setNewPromoCard({
                              ...newPromoCard,
                              linkUrl: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div>
                        <button
                          onClick={() => addPromoCard("promotionalSection")}
                          disabled={!newPromoCard.gameTitle}
                          className={`w-full px-5 py-2 rounded-lg ${theme.button.success} transition-all flex items-center justify-center gap-2 ${
                            !newPromoCard.gameTitle
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:shadow-lg"
                          }`}
                        >
                          <span>➕</span> Add Card
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Promo Section 2 */}
              {activeSidebarTab === "promo2" && (
                <div
                  className={`${theme.cardBg} rounded-xl shadow-lg p-6 ${theme.border} border`}
                >
                  <div className="flex justify-between items-center mb-6">
                    <h2 className={`text-2xl font-bold ${theme.text}`}>
                      Promotional Section Two
                    </h2>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      3 Columns
                    </span>
                  </div>

                  <div className="mb-6">
                    <label
                      className={`block text-sm font-medium mb-1 ${theme.text}`}
                    >
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={formData.promotionalSectionTwo.title}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          promotionalSectionTwo: {
                            ...prev.promotionalSectionTwo,
                            title: e.target.value,
                          },
                        }));
                        setHasChanges(true);
                      }}
                      className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {formData.promotionalSectionTwo.cards.map((card, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-3 ${theme.border}`}
                      >
                        <img
                          src={card.image}
                          alt={card.gameTitle}
                          className="h-32 w-full object-cover rounded mb-2"
                        />
                        <p className={`font-semibold text-sm ${theme.text}`}>
                          {card.gameTitle}
                        </p>
                        <p className={`text-xs ${theme.textSecondary}`}>
                          {card.heading}
                        </p>
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() =>
                              setEditingPromoCard({
                                index,
                                data: card,
                                section: "promotionalSectionTwo",
                              })
                            }
                            className="px-2 py-1 rounded text-xs bg-yellow-500 text-white"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() =>
                              deletePromoCard("promotionalSectionTwo", index)
                            }
                            className="px-2 py-1 rounded text-xs bg-red-500 text-white"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-6">
                    <h3 className={`font-semibold mb-4 ${theme.text}`}>
                      Add New Card
                    </h3>

                    {/* Image Upload Section */}
                    <div className="mb-4">
                      <label
                        className={`block text-sm font-medium mb-2 ${theme.text}`}
                      >
                        Card Image
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label
                            className={`block text-xs mb-1 ${theme.textSecondary}`}
                          >
                            Upload Image (Base64)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              handleImageUpload(e, "newPromoCardTwoImage")
                            }
                            className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                          />
                        </div>
                        <div>
                          <label
                            className={`block text-xs mb-1 ${theme.textSecondary}`}
                          >
                            Or Image URL
                          </label>
                          <input
                            type="text"
                            placeholder="https://example.com/card-image.jpg"
                            value={newPromoCardTwo.image}
                            onChange={(e) =>
                              setNewPromoCardTwo({
                                ...newPromoCardTwo,
                                image: e.target.value,
                              })
                            }
                            className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Card Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Game Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., VALORANT"
                          value={newPromoCardTwo.gameTitle}
                          onChange={(e) =>
                            setNewPromoCardTwo({
                              ...newPromoCardTwo,
                              gameTitle: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Badge
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., NEW AGENT"
                          value={newPromoCardTwo.badge}
                          onChange={(e) =>
                            setNewPromoCardTwo({
                              ...newPromoCardTwo,
                              badge: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Heading
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., New Agent Revealed"
                          value={newPromoCardTwo.heading}
                          onChange={(e) =>
                            setNewPromoCardTwo({
                              ...newPromoCardTwo,
                              heading: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Badge Color
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={newPromoCardTwo.badgeColor}
                            onChange={(e) =>
                              setNewPromoCardTwo({
                                ...newPromoCardTwo,
                                badgeColor: e.target.value,
                              })
                            }
                            className={`flex-1 px-3 py-2 border rounded-lg ${theme.input}`}
                          >
                            <option value="purple">Purple</option>
                            <option value="blue">Blue</option>
                            <option value="green">Green</option>
                            <option value="orange">Orange</option>
                            <option value="red">Red</option>
                          </select>
                          <div
                            className={`w-10 h-10 rounded-lg border`}
                            style={{
                              backgroundColor:
                                newPromoCardTwo.badgeColor === "purple"
                                  ? "#f3e8ff"
                                  : newPromoCardTwo.badgeColor === "blue"
                                    ? "#dbeafe"
                                    : newPromoCardTwo.badgeColor === "green"
                                      ? "#d1fae5"
                                      : newPromoCardTwo.badgeColor === "orange"
                                        ? "#ffedd5"
                                        : newPromoCardTwo.badgeColor === "red"
                                          ? "#fee2e2"
                                          : "#e0e7ff",
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Description
                        </label>
                        <textarea
                          placeholder="Describe the offer in detail..."
                          value={newPromoCardTwo.description}
                          onChange={(e) =>
                            setNewPromoCardTwo({
                              ...newPromoCardTwo,
                              description: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                          rows={3}
                        />
                      </div>

                      <div>
                        <label
                          className={`block text-sm font-medium mb-2 ${theme.text}`}
                        >
                          Link URL
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., /shop"
                          value={newPromoCardTwo.linkUrl}
                          onChange={(e) =>
                            setNewPromoCardTwo({
                              ...newPromoCardTwo,
                              linkUrl: e.target.value,
                            })
                          }
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>

                      <div className="flex items-end">
                        <button
                          onClick={() => addPromoCard("promotionalSectionTwo")}
                          disabled={!newPromoCardTwo.gameTitle}
                          className={`w-full px-5 py-2 rounded-lg ${theme.button.success} transition-all flex items-center justify-center gap-2 ${
                            !newPromoCardTwo.gameTitle
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:shadow-lg transform hover:scale-105"
                          }`}
                        >
                          <span>➕</span> Add Card
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Catalogue Section */}
              {activeSidebarTab === "catalogue" && (
                <div
                  className={`${theme.cardBg} rounded-xl shadow-lg p-6 ${theme.border} border`}
                >
                  <h2 className={`text-2xl font-bold mb-6 ${theme.text}`}>
                    Catalogue & CTA Section
                  </h2>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-2 ${theme.text}`}
                      >
                        Hero Image
                      </label>
                      {formData.catalogueSection.image && (
                        <div className="mb-3 rounded-lg overflow-hidden border">
                          <img
                            src={formData.catalogueSection.image}
                            alt="Catalogue"
                            className="w-full h-48 object-cover"
                          />
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, "catalogueImage")}
                        className={`w-full mb-2 ${theme.input}`}
                      />
                      <input
                        type="text"
                        value={formData.catalogueSection.image}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            catalogueSection: {
                              ...prev.catalogueSection,
                              image: e.target.value,
                            },
                          }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        placeholder="Or enter image URL"
                      />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${theme.text}`}
                        >
                          Badge
                        </label>
                        <input
                          type="text"
                          value={formData.catalogueSection.badge}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              catalogueSection: {
                                ...prev.catalogueSection,
                                badge: e.target.value,
                              },
                            }));
                            setHasChanges(true);
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${theme.text}`}
                        >
                          Main Title
                        </label>
                        <input
                          type="text"
                          value={formData.catalogueSection.title}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              catalogueSection: {
                                ...prev.catalogueSection,
                                title: e.target.value,
                              },
                            }));
                            setHasChanges(true);
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${theme.text}`}
                        >
                          Colored Title
                        </label>
                        <input
                          type="text"
                          value={formData.catalogueSection.coloredTitle}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              catalogueSection: {
                                ...prev.catalogueSection,
                                coloredTitle: e.target.value,
                              },
                            }));
                            setHasChanges(true);
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                        />
                      </div>
                      <div>
                        <label
                          className={`block text-sm font-medium mb-1 ${theme.text}`}
                        >
                          Description
                        </label>
                        <textarea
                          value={formData.catalogueSection.description}
                          onChange={(e) => {
                            setFormData((prev) => ({
                              ...prev,
                              catalogueSection: {
                                ...prev.catalogueSection,
                                description: e.target.value,
                              },
                            }));
                            setHasChanges(true);
                          }}
                          className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme.text}`}
                      >
                        Primary Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.catalogueSection.primaryBtn.text}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            catalogueSection: {
                              ...prev.catalogueSection,
                              primaryBtn: {
                                ...prev.catalogueSection.primaryBtn,
                                text: e.target.value,
                              },
                            },
                          }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                      />
                      <label
                        className={`block text-sm font-medium mb-1 mt-2 ${theme.text}`}
                      >
                        Primary Button URL
                      </label>
                      <input
                        type="text"
                        value={formData.catalogueSection.primaryBtn.url}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            catalogueSection: {
                              ...prev.catalogueSection,
                              primaryBtn: {
                                ...prev.catalogueSection.primaryBtn,
                                url: e.target.value,
                              },
                            },
                          }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme.text}`}
                      >
                        Secondary Button Text
                      </label>
                      <input
                        type="text"
                        value={formData.catalogueSection.secondaryBtn.text}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            catalogueSection: {
                              ...prev.catalogueSection,
                              secondaryBtn: {
                                ...prev.catalogueSection.secondaryBtn,
                                text: e.target.value,
                              },
                            },
                          }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                      />
                      <label
                        className={`block text-sm font-medium mb-1 mt-2 ${theme.text}`}
                      >
                        Secondary Button URL
                      </label>
                      <input
                        type="text"
                        value={formData.catalogueSection.secondaryBtn.url}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            catalogueSection: {
                              ...prev.catalogueSection,
                              secondaryBtn: {
                                ...prev.catalogueSection.secondaryBtn,
                                url: e.target.value,
                              },
                            },
                          }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t">
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme.text}`}
                      >
                        Customer Count
                      </label>
                      <input
                        type="text"
                        value={formData.catalogueSection.stats.customerCount}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            catalogueSection: {
                              ...prev.catalogueSection,
                              stats: {
                                ...prev.catalogueSection.stats,
                                customerCount: e.target.value,
                              },
                            },
                          }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                      />
                    </div>
                    <div>
                      <label
                        className={`block text-sm font-medium mb-1 ${theme.text}`}
                      >
                        Rating
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.catalogueSection.stats.rating}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            catalogueSection: {
                              ...prev.catalogueSection,
                              stats: {
                                ...prev.catalogueSection.stats,
                                rating: parseFloat(e.target.value),
                              },
                            },
                          }));
                          setHasChanges(true);
                        }}
                        className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Slider Slide Modal */}
      {editingSliderSlide && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) =>
            e.target === e.currentTarget && setEditingSliderSlide(null)
          }
        >
          <div
            className={`${theme.cardBg} rounded-xl shadow-xl p-6 w-full max-w-md mx-4`}
          >
            <h3 className={`text-xl font-bold mb-4 ${theme.text}`}>
              Edit Slide
            </h3>
            <div className="space-y-4">
              {(editingSliderSlide.data.url || imagePreview) && (
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Current Image
                  </label>
                  <img
                    src={imagePreview || editingSliderSlide.data.url}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Upload New Image
                </label>
                <input
                  key={`upload-slide-${editingSliderSlide.index}`}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!file.type.startsWith("image/")) {
                        setError("Please upload an image file");
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        setError("Image size should be less than 10MB");
                        return;
                      }
                      setUploadingImage({ field: "editSliderImage" });
                      try {
                        const base64 = await compressImage(file, 1200, 0.8);
                        setEditingSliderSlide({
                          ...editingSliderSlide,
                          data: { ...editingSliderSlide.data, url: base64 },
                        });
                        setImagePreview(base64);
                        setSuccess("Image uploaded successfully!");
                        setTimeout(() => setSuccess(null), 2000);
                      } catch (err) {
                        setError("Failed to upload image");
                      } finally {
                        setUploadingImage(null);
                        e.target.value = "";
                      }
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                  disabled={!!uploadingImage}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Or Image URL
                </label>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={editingSliderSlide.data.url}
                  onChange={(e) =>
                    setEditingSliderSlide({
                      ...editingSliderSlide,
                      data: { ...editingSliderSlide.data, url: e.target.value },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Alt Text
                </label>
                <input
                  type="text"
                  placeholder="Alt Text"
                  value={editingSliderSlide.data.alt}
                  onChange={(e) =>
                    setEditingSliderSlide({
                      ...editingSliderSlide,
                      data: { ...editingSliderSlide.data, alt: e.target.value },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Link URL
                </label>
                <input
                  type="text"
                  placeholder="Link URL"
                  value={editingSliderSlide.data.link}
                  onChange={(e) =>
                    setEditingSliderSlide({
                      ...editingSliderSlide,
                      data: {
                        ...editingSliderSlide.data,
                        link: e.target.value,
                      },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingSliderSlide(null);
                  setImagePreview(null);
                }}
                className={`px-4 py-2 rounded-lg ${theme.button.secondary}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateSliderSlide(editingSliderSlide.index);
                  setImagePreview(null);
                }}
                className={`px-4 py-2 rounded-lg ${theme.button.primary}`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Hero Offer Modal */}
      {editingHeroOffer && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) =>
            e.target === e.currentTarget && setEditingHeroOffer(null)
          }
        >
          <div
            className={`${theme.cardBg} rounded-xl shadow-xl p-6 w-full max-w-md mx-4`}
          >
            <h3 className={`text-xl font-bold mb-4 ${theme.text}`}>
              Edit Offer
            </h3>
            <div className="space-y-4">
              {(editingHeroOffer.data.image || imagePreview) && (
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Current Image
                  </label>
                  <img
                    src={imagePreview || editingHeroOffer.data.image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Upload New Image
                </label>
                <input
                  key={`upload-offer-${editingHeroOffer.index}`}
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!file.type.startsWith("image/")) {
                        setError("Please upload an image file");
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        setError("Image size should be less than 10MB");
                        return;
                      }
                      setUploadingImage({ field: "editHeroOfferImage" });
                      try {
                        const base64 = await compressImage(file, 1200, 0.8);
                        setEditingHeroOffer({
                          ...editingHeroOffer,
                          data: { ...editingHeroOffer.data, image: base64 },
                        });
                        setImagePreview(base64);
                        setSuccess("Image uploaded successfully!");
                        setTimeout(() => setSuccess(null), 2000);
                      } catch (err) {
                        setError("Failed to upload image");
                      } finally {
                        setUploadingImage(null);
                        e.target.value = "";
                      }
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                  disabled={!!uploadingImage}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Or Image URL
                </label>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={editingHeroOffer.data.image}
                  onChange={(e) =>
                    setEditingHeroOffer({
                      ...editingHeroOffer,
                      data: { ...editingHeroOffer.data, image: e.target.value },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Title
                </label>
                <input
                  type="text"
                  value={editingHeroOffer.data.title}
                  onChange={(e) =>
                    setEditingHeroOffer({
                      ...editingHeroOffer,
                      data: { ...editingHeroOffer.data, title: e.target.value },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Description
                </label>
                <input
                  type="text"
                  value={editingHeroOffer.data.description || ""}
                  onChange={(e) =>
                    setEditingHeroOffer({
                      ...editingHeroOffer,
                      data: {
                        ...editingHeroOffer.data,
                        description: e.target.value,
                      },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                  placeholder="Enter description"
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Link URL
                </label>
                <input
                  type="text"
                  value={editingHeroOffer.data.linkUrl}
                  onChange={(e) =>
                    setEditingHeroOffer({
                      ...editingHeroOffer,
                      data: {
                        ...editingHeroOffer.data,
                        linkUrl: e.target.value,
                      },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Background Color
                </label>
                <select
                  value={editingHeroOffer.data.imageBg}
                  onChange={(e) =>
                    setEditingHeroOffer({
                      ...editingHeroOffer,
                      data: {
                        ...editingHeroOffer.data,
                        imageBg: e.target.value,
                      },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                >
                  <option value="bg-purple-100">Purple</option>
                  <option value="bg-blue-100">Blue</option>
                  <option value="bg-green-100">Green</option>
                  <option value="bg-orange-100">Orange</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingHeroOffer(null);
                  setImagePreview(null);
                }}
                className={`px-4 py-2 rounded-lg ${theme.button.secondary}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updateHeroOffer(editingHeroOffer.index);
                  setImagePreview(null);
                }}
                className={`px-4 py-2 rounded-lg ${theme.button.primary}`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Promo Card Modal */}
      {editingPromoCard && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={(e) =>
            e.target === e.currentTarget && setEditingPromoCard(null)
          }
        >
          <div
            className={`${theme.cardBg} rounded-xl shadow-xl p-6 w-full max-w-md mx-4`}
          >
            <h3 className={`text-xl font-bold mb-4 ${theme.text}`}>
              Edit Promo Card
            </h3>
            <div className="space-y-4">
              {(editingPromoCard.data.image || imagePreview) && (
                <div>
                  <label
                    className={`block text-sm font-medium mb-2 ${theme.text}`}
                  >
                    Current Image
                  </label>
                  <img
                    src={imagePreview || editingPromoCard.data.image}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                </div>
              )}

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Upload New Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (!file.type.startsWith("image/")) {
                        setError("Please upload an image file");
                        return;
                      }
                      if (file.size > 10 * 1024 * 1024) {
                        setError("Image size should be less than 10MB");
                        return;
                      }
                      setUploadingImage({ field: "editPromoCardImage" });
                      try {
                        const base64 = await compressImage(file, 1200, 0.8);
                        setEditingPromoCard({
                          ...editingPromoCard,
                          data: { ...editingPromoCard.data, image: base64 },
                        });
                        setImagePreview(base64);
                        setSuccess("Image uploaded successfully!");
                        setTimeout(() => setSuccess(null), 2000);
                      } catch (err) {
                        setError("Failed to upload image");
                      } finally {
                        setUploadingImage(null);
                      }
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                  disabled={!!uploadingImage}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Or Image URL
                </label>
                <input
                  type="text"
                  placeholder="Image URL"
                  value={editingPromoCard.data.image}
                  onChange={(e) =>
                    setEditingPromoCard({
                      ...editingPromoCard,
                      data: { ...editingPromoCard.data, image: e.target.value },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Game Title
                </label>
                <input
                  type="text"
                  value={editingPromoCard.data.gameTitle}
                  onChange={(e) =>
                    setEditingPromoCard({
                      ...editingPromoCard,
                      data: {
                        ...editingPromoCard.data,
                        gameTitle: e.target.value,
                      },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Badge
                </label>
                <input
                  type="text"
                  value={editingPromoCard.data.badge}
                  onChange={(e) =>
                    setEditingPromoCard({
                      ...editingPromoCard,
                      data: { ...editingPromoCard.data, badge: e.target.value },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Heading
                </label>
                <input
                  type="text"
                  value={editingPromoCard.data.heading}
                  onChange={(e) =>
                    setEditingPromoCard({
                      ...editingPromoCard,
                      data: {
                        ...editingPromoCard.data,
                        heading: e.target.value,
                      },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Description
                </label>
                <textarea
                  value={editingPromoCard.data.description}
                  onChange={(e) =>
                    setEditingPromoCard({
                      ...editingPromoCard,
                      data: {
                        ...editingPromoCard.data,
                        description: e.target.value,
                      },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                  rows={3}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Link URL
                </label>
                <input
                  type="text"
                  value={editingPromoCard.data.linkUrl}
                  onChange={(e) =>
                    setEditingPromoCard({
                      ...editingPromoCard,
                      data: {
                        ...editingPromoCard.data,
                        linkUrl: e.target.value,
                      },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                />
              </div>

              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${theme.text}`}
                >
                  Badge Color
                </label>
                <select
                  value={editingPromoCard.data.badgeColor}
                  onChange={(e) =>
                    setEditingPromoCard({
                      ...editingPromoCard,
                      data: {
                        ...editingPromoCard.data,
                        badgeColor: e.target.value,
                      },
                    })
                  }
                  className={`w-full px-3 py-2 border rounded-lg ${theme.input}`}
                >
                  <option value="purple">Purple</option>
                  <option value="blue">Blue</option>
                  <option value="green">Green</option>
                  <option value="orange">Orange</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingPromoCard(null);
                  setImagePreview(null);
                }}
                className={`px-4 py-2 rounded-lg ${theme.button.secondary}`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  updatePromoCard(
                    editingPromoCard.section,
                    editingPromoCard.index,
                  );
                  setImagePreview(null);
                }}
                className={`px-4 py-2 rounded-lg ${theme.button.primary}`}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHomePage;
