const BASE_URL = "https://green-hydrozen.vercel.app/api";

// AUTH ENDPOINTS
export const authEndpoints = {
  LOGIN_API: BASE_URL + "/auth/login",
  REGISTER_API: BASE_URL + "/auth/register",
  PROFILE_API: BASE_URL + "/auth/profile",
  LOGOUT_API: BASE_URL + "/auth/logout",
};

// PRODUCER ENDPOINTS
export const producerEndpoints = {
  GET_APPLICATIONS_API: BASE_URL + "/producer/applications",
  SUBMIT_APPLICATION_API: BASE_URL + "/producer/apply",
  SUBMIT_APPLICATION_JSON_API: BASE_URL + "/producer/apply-json",
  GET_APPLICATION_DETAILS_API: BASE_URL + "/producer/applications/:id",
  GET_LISTINGS_API: BASE_URL + "/producer/listings",
  CREATE_LISTING_API: BASE_URL + "/producer/listings",
  UPDATE_LISTING_API: BASE_URL + "/producer/listings/:id",
  GET_DASHBOARD_STATS_API: BASE_URL + "/producer/dashboard",
};

// CERTIFIER ENDPOINTS
export const certifierEndpoints = {
  GET_PENDING_APPLICATIONS_API: BASE_URL + "/certifier/applications/pending",
  GET_APPLICATIONS_API: BASE_URL + "/certifier/applications",
  GET_APPLICATION_DETAILS_API: BASE_URL + "/certifier/applications/:id",
  SCHEDULE_INSPECTION_API: BASE_URL + "/certifier/applications/:id/schedule",
  APPROVE_APPLICATION_API: BASE_URL + "/certifier/applications/:id/approve",
  REJECT_APPLICATION_API: BASE_URL + "/certifier/applications/:id/reject",
  UPDATE_STATUS_API: BASE_URL + "/certifier/applications/:id/status",
  GET_SCHEDULED_INSPECTIONS_API: BASE_URL + "/certifier/inspections/scheduled",
  GET_DASHBOARD_STATS_API: BASE_URL + "/certifier/dashboard",
};

// BUYER ENDPOINTS
export const buyerEndpoints = {
  GET_PURCHASES_API: BASE_URL + "/buyer/purchases",
  GET_PURCHASE_DETAILS_API: BASE_URL + "/buyer/purchases/:id",
  GET_DASHBOARD_STATS_API: BASE_URL + "/buyer/dashboard",
  GET_CERTIFICATES_API: BASE_URL + "/buyer/certificates",
  DOWNLOAD_CERTIFICATE_API: BASE_URL + "/buyer/certificates/:id/download",
  GET_BUYER_PROFILE_API: BASE_URL + "/buyer/profile",
  UPDATE_BUYER_PROFILE_API: BASE_URL + "/buyer/profile",
};

// MARKETPLACE ENDPOINTS
export const marketplaceEndpoints = {
  GET_LISTINGS_API: BASE_URL + "/marketplace/listings",
  GET_LISTING_DETAILS_API: BASE_URL + "/marketplace/listings/:id",
  GET_ENERGY_SOURCES_API: BASE_URL + "/marketplace/energy-sources",
  GET_PRODUCTION_METHODS_API: BASE_URL + "/marketplace/production-methods",
  SEARCH_LISTINGS_API: BASE_URL + "/marketplace/search",
  PURCHASE_LISTING_API: BASE_URL + "/marketplace/purchase",
  ADD_TO_WATCHLIST_API: BASE_URL + "/marketplace/watchlist",
  GET_WATCHLIST_API: BASE_URL + "/marketplace/watchlist",
};

// PAYMENT ENDPOINTS
export const paymentEndpoints = {
  CREATE_ORDER_API: BASE_URL + "/payment/create-order",
  VERIFY_PAYMENT_API: BASE_URL + "/payment/verify-payment",
  PURCHASE_API: BASE_URL + "/payment/purchase",
  GET_PAYMENT_STATUS_API: BASE_URL + "/payment/status/:orderId",
  REQUEST_REFUND_API: BASE_URL + "/payment/refund/:transactionId",
  GET_PAYMENT_ANALYTICS_API: BASE_URL + "/payment/analytics",
};

// UTILS
export const formatApiEndpoint = (endpoint, params) => {
  let formattedEndpoint = endpoint;
  
  if (params) {
    Object.keys(params).forEach(key => {
      formattedEndpoint = formattedEndpoint.replace(`:${key}`, params[key]);
    });
  }
  
  return formattedEndpoint;
};
