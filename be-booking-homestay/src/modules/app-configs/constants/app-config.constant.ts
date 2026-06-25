export enum AppConfigKey {
  BOOKING_EXPIRY_MINUTES = 'BOOKING_EXPIRY_MINUTES',
  CANCELLATION_POLICY = 'CANCELLATION_POLICY',
  SITE_NAME = 'SITE_NAME',
  CONTACT_EMAIL = 'CONTACT_EMAIL',
}

export const AppConfigDefaults: Record<AppConfigKey, any> = {
  [AppConfigKey.BOOKING_EXPIRY_MINUTES]: 30,
  [AppConfigKey.CANCELLATION_POLICY]: [
    { daysBefore: 7, refundPercent: 1.0 },
    { daysBefore: 3, refundPercent: 0.5 },
    { daysBefore: 0, refundPercent: 0.0 },
  ],
  [AppConfigKey.SITE_NAME]: '4Stay Booking',
  [AppConfigKey.CONTACT_EMAIL]: 'support@4stay.com',
};
