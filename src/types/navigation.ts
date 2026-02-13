/**
 * React Navigation param-list types for Coop Order Exchange.
 *
 * Usage:
 *   import { FeedStackParamList } from '@/types/navigation';
 *   const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
 */

/* ------------------------------------------------------------------ */
/* Auth flow                                                          */
/* ------------------------------------------------------------------ */

export type AuthStackParamList = {
  Login: undefined;
};

/* ------------------------------------------------------------------ */
/* Feed (browse posts, request orders)                                */
/* ------------------------------------------------------------------ */

export type FeedStackParamList = {
  Feed: undefined;
  CreatePost: undefined;
  PostDetail: { postId: string };
  CreateRequest: { postId: string; sellerId: string };
  OrderDetail: { requestId: string };
};

/* ------------------------------------------------------------------ */
/* Orders (buyer + seller order lists)                                */
/* ------------------------------------------------------------------ */

export type OrdersStackParamList = {
  OrdersList: undefined;
  OrderDetail: { requestId: string };
};

/* ------------------------------------------------------------------ */
/* Profile                                                            */
/* ------------------------------------------------------------------ */

export type ProfileStackParamList = {
  Profile: undefined;
  EditProfile: undefined;
};

/* ------------------------------------------------------------------ */
/* Bottom tab navigator                                               */
/* ------------------------------------------------------------------ */

export type MainTabParamList = {
  FeedTab: undefined;
  OrdersTab: undefined;
  ProfileTab: undefined;
  AdminTab: undefined;
};

/* ------------------------------------------------------------------ */
/* Root-level navigator (auth vs main vs onboarding)                  */
/* ------------------------------------------------------------------ */

export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};
