'use client';

import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from 'react';
import { BrandingService, BrandingConfig } from '@/lib/branding';
import { Organization } from '@prisma/client';
import Image from 'next/image';

interface BrandingContextType {
  branding: BrandingConfig;
  updateBranding: (config: Partial<BrandingConfig>) => void;
  isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

interface BrandingProviderProps {
  children: ReactNode;
  organization?: Organization | null;
}

export function BrandingProvider({ children, organization }: BrandingProviderProps) {
  const [customBranding, setCustomBranding] = useState<Partial<BrandingConfig>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Derive base branding from organization prop
  const baseBranding = useMemo(() => {
    return BrandingService.getOrganizationBranding(organization || null);
  }, [organization]);

  // Merge base branding with any local overrides
  const branding = useMemo(() => {
    return { ...baseBranding, ...customBranding };
  }, [baseBranding, customBranding]);

  useEffect(() => {
    // Apply CSS variables to document
    const styleElement = document.createElement('style');
    styleElement.textContent = BrandingService.generateCSSVariables(branding);
    document.head.appendChild(styleElement);

    // Update favicon
    const faviconHTML = BrandingService.generateFaviconHTML(branding);
    const existingFavicon = document.querySelector('link[rel="icon"]');
    if (existingFavicon) {
      existingFavicon.remove();
    }

    // Add new favicon
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = faviconHTML;
    tempDiv.querySelectorAll('link').forEach(link => {
      document.head.appendChild(link);
    });

    return () => {
      // Cleanup
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [branding]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 0);
    return () => clearTimeout(timer);
  }, []);

  const updateBranding = (config: Partial<BrandingConfig>) => {
    setCustomBranding(prev => ({ ...prev, ...config }));
  };

  const value = {
    branding,
    updateBranding,
    isLoading,
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}

// Brand-aware components
export function BrandHeader({ className = '' }: { className?: string }) {
  const { branding } = useBranding();

  return (
    <header
      className={`header-brand ${className}`}
      style={{
        backgroundColor: branding.primaryColor,
      }}
    >
      <div className="flex items-center space-x-3">
        {branding.logo && (
          <Image
            src={branding.logo}
            alt={branding.name}
            width={32}
            height={32}
            className="rounded"
          />
        )}
        <h1 className="text-xl font-bold text-white">{branding.name}</h1>
      </div>
    </header>
  );
}

export function BrandButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  // branding is not used directly here because CSS variables are applied globally
  const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
  const variantClasses = variant === 'primary'
    ? 'brand-primary'
    : 'brand-secondary';

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BrandCard({
  children,
  className = '',
  ...props
}: {
  children: ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) {
  const { branding } = useBranding();

  return (
    <div
      className={`border rounded-lg p-6 ${className}`}
      style={{
        borderColor: branding.primaryColor,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export function BrandLink({
  children,
  href,
  className = '',
  ...props
}: {
  children: ReactNode;
  href: string;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { branding } = useBranding();

  return (
    <a
      href={href}
      className={`brand-primary-text hover:underline ${className}`}
      style={{
        color: branding.primaryColor,
      }}
      {...props}
    >
      {children}
    </a>
  );
}
