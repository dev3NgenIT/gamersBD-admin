import axios from 'axios';
import { ApiResponse, HomeSettings, SliderSlide, HeroOffer, PromoCard } from '../types/homeSettings.types';

const API_BASE_URL = 'https://gamersbd-server.onrender.com/api/home-settings';

export const homeSettingsService = {
  // ==================== BASIC CRUD ====================
  
  // Get settings
  getSettings: async (): Promise<HomeSettings> => {
    const response = await axios.get<ApiResponse<HomeSettings>>(API_BASE_URL);
    return response.data.data;
  },

  // Update entire settings
  updateSettings: async (data: HomeSettings): Promise<HomeSettings> => {
    const response = await axios.put<ApiResponse<HomeSettings>>(API_BASE_URL, data);
    return response.data.data;
  },

  // Partial update
  partialUpdate: async (updates: Partial<HomeSettings>): Promise<HomeSettings> => {
    const response = await axios.patch<ApiResponse<HomeSettings>>(API_BASE_URL, updates);
    return response.data.data;
  },

  // Reset settings
  resetSettings: async (): Promise<HomeSettings> => {
    const response = await axios.delete<ApiResponse<HomeSettings>>(`${API_BASE_URL}/reset`);
    return response.data.data;
  },

  // ==================== SLIDER MANAGEMENT ====================
  
  addSliderSlide: async (slideData: SliderSlide): Promise<HomeSettings> => {
    const response = await axios.post<ApiResponse<HomeSettings>>(`${API_BASE_URL}/slider/slides`, slideData);
    return response.data.data;
  },

  updateSliderSlide: async (index: number, slideData: SliderSlide): Promise<HomeSettings> => {
    const response = await axios.put<ApiResponse<HomeSettings>>(`${API_BASE_URL}/slider/slides/${index}`, slideData);
    return response.data.data;
  },

  deleteSliderSlide: async (index: number): Promise<HomeSettings> => {
    const response = await axios.delete<ApiResponse<HomeSettings>>(`${API_BASE_URL}/slider/slides/${index}`);
    return response.data.data;
  },

  updateSliderSettings: async (settings: {
    autoplay?: boolean;
    autoplaySpeed?: number;
    showArrows?: boolean;
    height?: string;
  }): Promise<HomeSettings> => {
    const response = await axios.put<ApiResponse<HomeSettings>>(`${API_BASE_URL}/slider/settings`, settings);
    return response.data.data;
  },

  // ==================== HERO OFFERS MANAGEMENT ====================
  
  addHeroOffer: async (offerData: HeroOffer): Promise<HomeSettings> => {
    const response = await axios.post<ApiResponse<HomeSettings>>(`${API_BASE_URL}/hero/offers`, offerData);
    return response.data.data;
  },

  updateHeroOffer: async (index: number, offerData: HeroOffer): Promise<HomeSettings> => {
    const response = await axios.put<ApiResponse<HomeSettings>>(`${API_BASE_URL}/hero/offers/${index}`, offerData);
    return response.data.data;
  },

  deleteHeroOffer: async (index: number): Promise<HomeSettings> => {
    const response = await axios.delete<ApiResponse<HomeSettings>>(`${API_BASE_URL}/hero/offers/${index}`);
    return response.data.data;
  },

  // ==================== PARTNER LOGOS ====================
  
  addPartnerLogo: async (logoUrl: string): Promise<HomeSettings> => {
    const response = await axios.post<ApiResponse<HomeSettings>>(`${API_BASE_URL}/partner-logos`, { logoUrl });
    return response.data.data;
  },

  removePartnerLogo: async (logoUrl: string): Promise<HomeSettings> => {
    const response = await axios.delete<ApiResponse<HomeSettings>>(`${API_BASE_URL}/partner-logos`, {
      data: { logoUrl }
    });
    return response.data.data;
  },

  // ==================== PROMOTIONAL SECTION ONE ====================
  
  updatePromotionalSection: async (settings: { title?: string; enabled?: boolean }): Promise<HomeSettings> => {
    const response = await axios.put<ApiResponse<HomeSettings>>(`${API_BASE_URL}/promotional-section/settings`, settings);
    return response.data.data;
  },

  addPromoCard: async (cardData: PromoCard): Promise<HomeSettings> => {
    const response = await axios.post<ApiResponse<HomeSettings>>(`${API_BASE_URL}/promotional-section/cards`, cardData);
    return response.data.data;
  },

  updatePromoCard: async (index: number, cardData: PromoCard): Promise<HomeSettings> => {
    const response = await axios.put<ApiResponse<HomeSettings>>(`${API_BASE_URL}/promotional-section/cards/${index}`, cardData);
    return response.data.data;
  },

  deletePromoCard: async (index: number): Promise<HomeSettings> => {
    const response = await axios.delete<ApiResponse<HomeSettings>>(`${API_BASE_URL}/promotional-section/cards/${index}`);
    return response.data.data;
  },

  // ==================== PROMOTIONAL SECTION TWO ====================
  
  updatePromotionalSectionTwo: async (settings: { title?: string; enabled?: boolean }): Promise<HomeSettings> => {
    const response = await axios.put<ApiResponse<HomeSettings>>(`${API_BASE_URL}/promotional-section-two/settings`, settings);
    return response.data.data;
  },

  addPromoCardTwo: async (cardData: PromoCard): Promise<HomeSettings> => {
    const response = await axios.post<ApiResponse<HomeSettings>>(`${API_BASE_URL}/promotional-section-two/cards`, cardData);
    return response.data.data;
  },

  updatePromoCardTwo: async (index: number, cardData: PromoCard): Promise<HomeSettings> => {
    const response = await axios.put<ApiResponse<HomeSettings>>(`${API_BASE_URL}/promotional-section-two/cards/${index}`, cardData);
    return response.data.data;
  },

  deletePromoCardTwo: async (index: number): Promise<HomeSettings> => {
    const response = await axios.delete<ApiResponse<HomeSettings>>(`${API_BASE_URL}/promotional-section-two/cards/${index}`);
    return response.data.data;
  },

  // ==================== CATALOGUE SECTION ====================
  
  updateCatalogueSection: async (catalogueData: Partial<HomeSettings['catalogueSection']>): Promise<HomeSettings> => {
    const response = await axios.put<ApiResponse<HomeSettings>>(`${API_BASE_URL}/catalogue`, catalogueData);
    return response.data.data;
  },

  // ==================== LEGACY METHODS (Backward Compatibility) ====================
  
  // Sidebar promos (legacy)
  addSidebarPromo: async (promoData: any): Promise<HomeSettings> => {
    const response = await axios.post<ApiResponse<HomeSettings>>(`${API_BASE_URL}/sidebar-promos`, promoData);
    return response.data.data;
  },

  updateSidebarPromo: async (promoIndex: number, promoData: any): Promise<HomeSettings> => {
    const response = await axios.put<ApiResponse<HomeSettings>>(`${API_BASE_URL}/sidebar-promos`, {
      promoIndex,
      promoData
    });
    return response.data.data;
  },

  deleteSidebarPromo: async (promoIndex: number): Promise<HomeSettings> => {
    const response = await axios.delete<ApiResponse<HomeSettings>>(`${API_BASE_URL}/sidebar-promos/${promoIndex}`);
    return response.data.data;
  },

  // Offer cards (legacy)
  addOfferCard: async (cardData: any): Promise<HomeSettings> => {
    const response = await axios.post<ApiResponse<HomeSettings>>(`${API_BASE_URL}/offer-cards`, cardData);
    return response.data.data;
  },

  updateOfferCard: async (cardIndex: number, cardData: any): Promise<HomeSettings> => {
    const response = await axios.put<ApiResponse<HomeSettings>>(`${API_BASE_URL}/offer-cards`, {
      cardIndex,
      cardData
    });
    return response.data.data;
  },

  deleteOfferCard: async (cardIndex: number): Promise<HomeSettings> => {
    const response = await axios.delete<ApiResponse<HomeSettings>>(`${API_BASE_URL}/offer-cards/${cardIndex}`);
    return response.data.data;
  },

  // CTA Banner (legacy)
  updateCtaBanner: async (ctaData: Partial<HomeSettings['ctaBanner']>): Promise<HomeSettings> => {
    const response = await axios.put<ApiResponse<HomeSettings>>(`${API_BASE_URL}/cta-banner`, ctaData);
    return response.data.data;
  },

  // Game covers (convenience method)
  addGameCover: async (coverUrl: string): Promise<HomeSettings> => {
    const currentSettings = await homeSettingsService.getSettings();
    return homeSettingsService.updateSettings({
      ...currentSettings,
      ctaBanner: {
        ...currentSettings.ctaBanner,
        featuredGameCovers: [...currentSettings.ctaBanner.featuredGameCovers, coverUrl]
      }
    });
  },

  removeGameCover: async (index: number): Promise<HomeSettings> => {
    const currentSettings = await homeSettingsService.getSettings();
    const updatedCovers = currentSettings.ctaBanner.featuredGameCovers.filter((_, i) => i !== index);
    return homeSettingsService.updateSettings({
      ...currentSettings,
      ctaBanner: {
        ...currentSettings.ctaBanner,
        featuredGameCovers: updatedCovers
      }
    });
  }
};