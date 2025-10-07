export type OAuthProvider = "google" | "github" | "linkedin";

export interface ProfileDTO {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  jobTitle?: string | null;
  linkedinUrl?: string | null;
  githubUsername?: string | null;
  createdAt: string;
  lastLogin?: string | null;

  connectedProviders: OAuthProvider[];
  accounts?: { provider: string; providerAccountId: string }[];
};

export interface EmailVerificationBannerProps {
  email: string;
  emailVerified: boolean;
}
