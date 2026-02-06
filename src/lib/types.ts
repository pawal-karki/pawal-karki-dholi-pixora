import type {
  Agency,
  AgencySidebarOption,
  Contact,
  Funnel,
  FunnelPage,
  Lane,
  Notification,
  Permissions,
  Pipeline,
  SubAccount,
  SubAccountSidebarOption,
  Tag,
  Ticket,
  User,
} from "@prisma/client";
import type Stripe from "stripe";

export type NotificationsWithUser = (Notification & {
  user: {
    id: string;
    name: string;
    avatarUrl: string;
    email: string;
    createdAt: Date;
    updatedAt: Date;
    role: string;
    agencyId: string | null;
  };
})[] | undefined;

export type UserWithPermissionsAndSubAccounts = User & {
  Permissions: (Permissions & {
    subAccount: SubAccount | null;
  })[];
};

export type AuthUserWithAgencySibebarOptionsSubAccounts = User & {
  agency: Agency & {
    SidebarOptions: AgencySidebarOption[];
    SubAccounts: (SubAccount & {
      sidebarOptions: SubAccountSidebarOption[];
    })[];
  };
  Permissions: Permissions[];
};

export type UsersWithAgencySubAccountPermissionsSidebarOptions = User & {
  agency: (Agency & {
    SubAccounts: SubAccount[];
  }) | null;
  permissions: (Permissions & {
    subAccount: SubAccount | null;
  })[];
  status?: string;
};

export type GetMediaFiles = SubAccount & {
  media: {
    id: string;
    name: string;
    link: string;
    type: string | null;
    subAccountId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
};

export type CreateMediaType = {
  name: string;
  link: string;
};

export type TicketAndTags = Ticket & {
  tags: Tag[];
  assigned: User | null;
  customer: Contact | null;
};

export type LaneDetail = Lane & {
  tickets: TicketAndTags[];
};

export type PipelineDetailsWithLanesCardsTagsTickets = Pipeline & {
  lanes: LaneDetail[];
};

export type TicketWithTags = Ticket & {
  tags: Tag[];
};

export type TicketDetails = Ticket & {
  customer: Contact | null;
  assigned: User | null;
  tags: Tag[];
};

export type PriceList = Stripe.ApiList<Stripe.Price>;

export type FunnelWithPages = Funnel & {
  funnelPages: FunnelPage[];
};

export type UpsertFunnelPage = FunnelPage;

export type SubAccountWithContacts = SubAccount & {
  contacts: (Contact & { tickets: Ticket[] })[];
};

export type ShippingAddress = {
  city: string;
  country: string;
  line1: string;
  postal_code: string;
  state: string;
};

export type ShippingInfo = {
  address: ShippingAddress;
  name: string;
};

export type StripeCustomerType = {
  email: string;
  name: string;
  shipping: ShippingInfo;
  address: ShippingAddress;
};

export type Address = {
  city: string;
  country: string;
  line1: string;
  line2: string;
  postal_code: string;
  state: string;
};

