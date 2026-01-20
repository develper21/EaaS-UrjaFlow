import { Organization } from '@prisma/client';

export interface BrandingConfig {
  name: string;
  logo?: string;
  primaryColor: string;
  secondaryColor: string;
  favicon?: string;
  customCSS?: string;
  domain?: string;
  theme: 'light' | 'dark' | 'auto';
}

export class BrandingService {
  static getDefaultBranding(): BrandingConfig {
    return {
      name: 'UrjaFlow',
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      theme: 'light',
    };
  }

  static getOrganizationBranding(organization: Organization | null): BrandingConfig {
    const defaultBranding = this.getDefaultBranding();

    if (!organization) {
      return defaultBranding;
    }

    return {
      name: organization.name,
      logo: organization.logo || undefined,
      primaryColor: organization.primaryColor || defaultBranding.primaryColor,
      secondaryColor: organization.secondaryColor || defaultBranding.secondaryColor,
      domain: organization.domain || undefined,
      theme: 'light', // Can be extended to store in organization.settings
    };
  }

  static generateCSSVariables(branding: BrandingConfig): string {
    return `
      :root {
        --brand-primary: ${branding.primaryColor};
        --brand-primary-rgb: ${this.hexToRgb(branding.primaryColor)};
        --brand-secondary: ${branding.secondaryColor};
        --brand-secondary-rgb: ${this.hexToRgb(branding.secondaryColor)};
        --brand-primary-hover: ${this.lightenColor(branding.primaryColor, 10)};
        --brand-primary-light: ${this.lightenColor(branding.primaryColor, 20)};
        --brand-primary-dark: ${this.darkenColor(branding.primaryColor, 10)};
      }
    `;
  }

  static hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
      : '59, 130, 246'; // Default blue
  }

  static lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255))
      .toString(16).slice(1);
  }

  static darkenColor(hex: string, percent: number): string {
    return this.lightenColor(hex, -percent);
  }

  static generateFaviconHTML(branding: BrandingConfig): string {
    if (branding.logo) {
      return `
        <link rel="icon" type="image/x-icon" href="${branding.logo}">
        <link rel="icon" type="image/png" href="${branding.logo}">
        <link rel="apple-touch-icon" href="${branding.logo}">
      `;
    }
    
    return `
      <link rel="icon" type="image/x-icon" href="/favicon.ico">
      <link rel="icon" type="image/png" href="/favicon.png">
      <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    `;
  }

  static generateCustomCSS(branding: BrandingConfig): string {
    return `
      ${this.generateCSSVariables(branding)}
      
      /* Custom brand styles */
      .brand-primary {
        background-color: var(--brand-primary) !important;
        border-color: var(--brand-primary) !important;
        color: white !important;
      }
      
      .brand-primary-text {
        color: var(--brand-primary) !important;
      }
      
      .brand-secondary {
        background-color: var(--brand-secondary) !important;
        border-color: var(--brand-secondary) !important;
        color: white !important;
      }
      
      .brand-secondary-text {
        color: var(--brand-secondary) !important;
      }
      
      /* Override default button styles */
      .btn-primary {
        background-color: var(--brand-primary) !important;
        border-color: var(--brand-primary) !important;
      }
      
      .btn-primary:hover {
        background-color: var(--brand-primary-hover) !important;
        border-color: var(--brand-primary-hover) !important;
      }
      
      /* Header and navigation */
      .header-brand {
        background-color: var(--brand-primary) !important;
      }
      
      .nav-brand {
        color: var(--brand-primary) !important;
      }
      
      /* Links */
      a {
        color: var(--brand-primary) !important;
      }
      
      a:hover {
        color: var(--brand-primary-hover) !important;
      }
      
      /* Focus states */
      .focus-brand:focus {
        outline-color: var(--brand-primary) !important;
        border-color: var(--brand-primary) !important;
      }
      
      ${branding.customCSS || ''}
    `;
  }

  static getDomainFromRequest(request: Request): string | null {
    const url = new URL(request.url);
    return url.hostname;
  }

  static async getOrganizationByDomain(domain: string): Promise<Organization | null> {
    // This would typically query your database
    // For now, return null - implement based on your needs
    return null;
  }

  static validateBrandingConfig(config: Partial<BrandingConfig>): string[] {
    const errors: string[] = [];

    if (config.name && config.name.length < 2) {
      errors.push('Organization name must be at least 2 characters');
    }

    if (config.primaryColor && !/^#[0-9A-F]{6}$/i.test(config.primaryColor)) {
      errors.push('Primary color must be a valid hex color (e.g., #3b82f6)');
    }

    if (config.secondaryColor && !/^#[0-9A-F]{6}$/i.test(config.secondaryColor)) {
      errors.push('Secondary color must be a valid hex color (e.g., #64748b)');
    }

    if (config.logo && !this.isValidUrl(config.logo)) {
      errors.push('Logo must be a valid URL');
    }

    if (config.domain && !this.isValidDomain(config.domain)) {
      errors.push('Domain must be a valid domain name');
    }

    return errors;
  }

  static isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static isValidDomain(domain: string): boolean {
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
    return domainRegex.test(domain);
  }

  static generateBrandPreview(branding: BrandingConfig): string {
    return `
      <div style="font-family: system-ui, -apple-system, sans-serif; padding: 20px;">
        <h1 style="color: ${branding.primaryColor}; margin-bottom: 10px;">${branding.name}</h1>
        <div style="display: flex; gap: 10px; margin-bottom: 20px;">
          <div style="background: ${branding.primaryColor}; color: white; padding: 10px 20px; border-radius: 4px;">
            Primary Button
          </div>
          <div style="background: ${branding.secondaryColor}; color: white; padding: 10px 20px; border-radius: 4px;">
            Secondary Button
          </div>
        </div>
        <div style="border: 2px solid ${branding.primaryColor}; padding: 15px; border-radius: 8px;">
          <h3 style="color: ${branding.primaryColor}; margin-top: 0;">Sample Card</h3>
          <p style="color: ${branding.secondaryColor};">This is how your brand colors will appear in the application.</p>
        </div>
      </div>
    `;
  }
}
