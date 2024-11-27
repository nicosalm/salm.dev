export type FontFamily =
    | 'Iosevka Fixed SS05 Extended'
    | 'IBM Flexi VGA'
    | 'IBM VGA'
    | 'BigBlue Terminal Plus';

export type FontVariant = {
    family: FontFamily;
    weight: 'normal' | 'bold';
    style: 'normal' | 'italic';
};

export type FontCSSVariable =
    | '--font-iosevka'
    | '--font-ibm-flexi'
    | '--font-ibm-vga'
    | '--font-bigblue';
