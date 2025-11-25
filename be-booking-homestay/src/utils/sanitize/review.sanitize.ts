import { buildImageUrl } from '../object.util';

function sanitizeReview(review: any) {
  return {
    id: review.id,
    rating: Number(review.rating),
    comment: review.comment,
    createdAt: review.createdAt,
    user: review.users
      ? {
          id: review.users.id,
          name: `${review.users.firstName} ${review.users.lastName}`,
          avatar: buildImageUrl(review.users.avatar),
        }
      : null,
    bookingId: review.bookings.id,
  };
}

export function sanitizeReviewList(data: any[]) {
  return Array.isArray(data) ? data.map(sanitizeReview) : [];
}
