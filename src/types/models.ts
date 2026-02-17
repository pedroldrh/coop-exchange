import type { Post, Profile, Request, Message } from './database';

/** Post joined with its seller profile */
export type PostWithSeller = Post & { seller: Profile };

/** Request joined with buyer, seller, and post */
export type RequestWithDetails = Request & {
  buyer: Profile;
  seller: Profile;
  post: Post;
};

/** Request joined with buyer and seller profiles (no post) */
export type RequestWithProfiles = Request & {
  buyer: Profile;
  seller: Profile;
};

/** Message joined with sender profile */
export type MessageWithSender = Message & {
  sender: Profile;
};
