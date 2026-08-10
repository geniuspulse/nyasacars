import {
  Role,
  Plan,
  Condition,
  BodyType,
  Transmission,
  FuelType,
  ListingStatus,
  SubscriptionStatus,
  InquiryStatus,
  TransactionType,
  User,
  Seller,
  CarListing,
  Subscription,
  Inquiry,
  AdCreditTransaction,
} from '@prisma/client';

export {
  Role,
  Plan,
  Condition,
  BodyType,
  Transmission,
  FuelType,
  ListingStatus,
  SubscriptionStatus,
  InquiryStatus,
  TransactionType,
};

export type {
  User,
  Seller,
  CarListing,
  Subscription,
  Inquiry,
  AdCreditTransaction,
};

export type SellerWithUser = Seller & {
  user: User;
};

export type CarListingWithSeller = CarListing & {
  seller: SellerWithUser;
};

export type InquiryWithListing = Inquiry & {
  carListing: CarListing;
};

export type SubscriptionWithSeller = Subscription & {
  seller: Seller;
};

export type AdCreditTransactionWithSeller = AdCreditTransaction & {
  seller: Seller;
};
