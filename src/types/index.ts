export interface Guest {
  id: string;
  queueNumber: number;
  name: string;
  phone: string;
  addressInstansi: string;
  feedbackMessage: string;
  rating: number; // 1 to 5
  timestamp: string; // ISO string
}

export interface Product {
  id: string;
  title: string;
  category: string;
  price: number;
  description: string;
  imageUrl: string;
  tags: string[];
  isFeatured?: boolean;
  createdBy: 'admin';
  status: 'approved';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
}

export interface AudioSettings {
  mode: 'tts' | 'custom'; // 'tts' = Web Speech API, 'custom' = Admin voice recording
  hasCustomRecording: boolean;
  ttsTemplate: string;
  pitch: number;
  rate: number;
  recordingDate?: string;
}

export type BackgroundThemeId =
  | 'floral-kraft'
  | 'sage-botanical'
  | 'emerald-gold'
  | 'terracotta-rose'
  | 'custom-image';

export interface StandConfig {
  whatsappNumber: string; // default: 083111701845
  unikmaBrandName: string;
  klovibeBrandName: string;
  tagline: string;
  heroTitle: string;
  heroSubtitle: string;
  boothLocation: string;
  operationalHours: string;
  customUnikmaLogoUrl?: string;
  customKlovibeLogoUrl?: string;
  backgroundTheme: BackgroundThemeId;
  customBackgroundImageUrl?: string;
  customBannerImageUrl?: string;
  backgroundBlur: boolean;
  aboutMeTitle: string;
  aboutMeStory: string;
  aboutMeOwnerName: string;
  aboutMeRole: string;
  aboutMePhotoUrl?: string;
  // Customizable notices for guest menu
  registrationNotice?: string;
  successNotice?: string;
  queueInstruction?: string;
  footerNotice?: string;
  kioskWelcomeNotice?: string;
}
