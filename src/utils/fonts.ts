import type { FontFamily, FontVariant, FontCSSVariable } from '../types/fonts';

export const getFontVariable = (family: FontFamily): FontCSSVariable => {
    const map: Record<FontFamily, FontCSSVariable> = {
        'Iosevka Fixed SS05 Extended': '--font-iosevka',
        'IBM Flexi VGA': '--font-ibm-flexi',
        'IBM VGA': '--font-ibm-vga',
        'BigBlue Terminal Plus': '--font-bigblue'
    };
    return map[family];
};

export const isValidFontVariant = (variant: FontVariant): boolean => {
    // Iosevka supports all combinations
    if (variant.family === 'Iosevka Fixed SS05 Extended') {
        return true;
    }

    // All other fonts only support normal weight and style
    return variant.weight === 'normal' && variant.style === 'normal';
};
