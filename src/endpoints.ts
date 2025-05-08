const catalogSummary = '/catalog/summary';

const products = {
    path: '/catalog/products',
    byId: (id: number) => `/catalog/products/${id}`,
    batchPrices: '/pricing/products',
    metafields: {
        batch: '/catalog/products/metafields',
        product: {
            path: (productId: number) => `/catalog/products/${productId}/metafields`,
            byId: (productId: number, id: number) => `/catalog/products/${productId}/metafields/${id}`,
        },
    },
    bulkPricingRules: {
        path: (productId: number) => `/catalog/products/${productId}/bulk-pricing-rules`,
        byId: (productId: number, id: number) => `/catalog/products/${productId}/bulk-pricing-rules/${id}`,
    },
    categoryAssignments: '/catalog/products/category-assignments',
    channelAssignments: '/catalog/products/channel-assignments',
    complexRules: {
        path: (productId: number) => `/catalog/products/${productId}/complex-rules`,
        byId: (productId: number, id: number) => `/catalog/products/${productId}/complex-rules/${id}`,
    },
    customFields: {
        path: (productId: number) => `/catalog/products/${productId}/custom-fields`,
        byId: (productId: number, id: number) => `/catalog/products/${productId}/custom-fields/${id}`,
    },
    images: {
        path: (productId: number) => `/catalog/products/${productId}/images`,
        byId: (productId: number, id: number) => `/catalog/products/${productId}/images/${id}`,
    },
    reviews: {
        path: (productId: number) => `/catalog/products/${productId}/reviews`,
        byId: (productId: number, id: number) => `/catalog/products/${productId}/reviews/${id}`,
    },
    videos: {
        path: (productId: number) => `/catalog/products/${productId}/videos`,
        byId: (productId: number, id: number) => `/catalog/products/${productId}/videos/${id}`,
    },
};

const modifiers = {
    path: (productId: number) => `/catalog/products/${productId}/modifiers`,
    byId: (productId: number, id: number) => `/catalog/products/${productId}/modifiers/${id}`,
    values: {
        path: (productId: number, modifierId: number) =>
            `/catalog/products/${productId}/modifiers/${modifierId}/values`,
        byId: (productId: number, modifierId: number, id: number) =>
            `/catalog/products/${productId}/modifiers/${modifierId}/values/${id}`,
        createImage: (productId: number, modifierId: number, id: number) =>
            `/catalog/products/${productId}/modifiers/${modifierId}/values/${id}/image`,
    },
};

const variantOptions = {
    path: (productId: number) => `/catalog/products/${productId}/options`,
    byId: (productId: number, id: number) => `/catalog/products/${productId}/options/${id}`,
    values: {
        path: (productId: number, optionId: number) => `/catalog/products/${productId}/options/${optionId}/values`,
        byId: (productId: number, optionId: number, id: number) =>
            `/catalog/products/${productId}/options/${optionId}/values/${id}`,
    },
};

const variants = {
    batch: '/catalog/variants',
    path: (productId: number) => `/catalog/products/${productId}/variants`,
    byId: (productId: number, id: number) => `/catalog/products/${productId}/variants/${id}`,
    createImage: (productId: number, id: number) => `/catalog/products/${productId}/variants/${id}/image`,
    metafields: {
        batch: '/catalog/variants/metafields',
        path: (productId: number, id: number) => `/catalog/products/${productId}/variants/${id}/metafields`,
        byId: (productId: number, variantId: number, id: number) =>
            `/catalog/products/${productId}/variants/${variantId}/metafields/${id}`,
    },
};

const brands = {
    path: '/catalog/brands',
    byId: (id: number) => `/catalog/brands/${id}`,
    image: (id: number) => `/catalog/brands/${id}/image`,
    metafields: {
        batch: '/catalog/brands/metafields',
        path: (id: number) => `/catalog/brands/${id}/metafields`,
        byId: (brandId: number, id: number) => `/catalog/brands/${brandId}/metafields/${id}`,
    },
};

const categories = {
    deprecated: {
        path: '/catalog/categories',
        byId: (id: number) => `/catalog/categories/${id}`,
    },
    image: (id: number) => `/catalog/categories/${id}/image`,
    metafields: {
        batch: '/catalog/categories/metafields',
        path: (id: number) => `/catalog/categories/${id}/metafields`,
        byId: (categoryId: number, id: number) => `/catalog/categories/${categoryId}/metafields/${id}`,
    },
    sortOrder: (id: number) => `/catalog/categories/${id}/products/sort-order`,
};

const trees = {
    path: '/catalog/trees',
    byId: (id: number) => `/catalog/trees/${id}`,
    categories: (id: number) => `/catalog/trees/${id}/categories`,
};

const abandonedCarts = {
    path: (token: string) => `/abandoned-carts/${token}`,
    settings: {
        global: '/abandoned-carts/settings',
        channel: (channelId: number) => `/abandoned-carts/settings/${channelId}`,
    },
};

const carts = {
    path: '/carts',
    byId: (uuid: string) => `/carts/${uuid}`,
    createRedirectUrl: (uuid: string) => `/carts/${uuid}/redirect_urls`,
    items: {
        path: (uuid: string) => `/carts/${uuid}/items`,
        byId: (cartUuid: string, itemUuid: string) => `/carts/${cartUuid}/items/${itemUuid}`,
    },
    metafields: {
        batch: '/carts/metafields',
        path: (uuid: string) => `/carts/${uuid}/metafields`,
        byId: (cartUuid: string, metafieldUuid: string) => `/carts/${cartUuid}/metafields/${metafieldUuid}`,
    },
    settings: {
        global: '/carts/settings',
        channel: (channelId: number) => `/carts/settings/${channelId}`,
    },
};

const channels = {
    path: '/channels',
    byId: (id: number) => `/channels/${id}`,
    activeTheme: (id: number) => `/channels/${id}/active-theme`,
    site: (id: number) => `/channels/${id}/site`,
    menus: (id: number) => `/channels/${id}/channel-menus`,
    checkoutUrl: (id: number) => `/channels/${id}/site/checkout-url`,
    currencyAssignments: {
        path: (id: number) => `/channels/${id}/currency-assignments`,
        byId: (channelId: number, id: number) => `/channels/${channelId}/currency-assignments/${id}`,
    },
    listings: {
        path: (id: number) => `/channels/${id}/listings`,
        byId: (channelId: number, id: number) => `/channels/${channelId}/listings/${id}`,
    },
    metafields: {
        batch: '/channels/metafields',
        path: (id: number) => `/channels/${id}/metafields`,
        byId: (channelId: number, id: number) => `/channels/${channelId}/metafields/${id}`,
    },
};

const checkouts = {
    path: (uuid: string) => `/checkouts/${uuid}`,
    billingAddress: (uuid: string) => `/checkouts/${uuid}/billing-address`,
    consignments: {
        path: (uuid: string) => `/checkouts/${uuid}/consignments`,
        byId: (checkoutUuid: string, consignmentUuid: string) => `/checkouts/${checkoutUuid}/consignments/${consignmentUuid}`,
    },
    coupons: {
        add: (uuid: string) => `/checkouts/${uuid}/coupons`,
        delete: (uuid: string, code: string) => `/checkouts/${uuid}/coupons/${code}`,
    },
    discounts: (uuid: string) => `/checkouts/${uuid}/discounts`,
    fees: (uuid: string) => `/checkouts/${uuid}/fees`,
    createOrder: (uuid: string) => `/checkouts/${uuid}/orders`,
    settings: '/checkouts/settings',
    createToken: (uuid: string) => `/checkouts/${uuid}/token`,
};

const currencies = {
    v2: {
        path: '/currencies',
        byId: (id: string) => `/currencies/${id}`,
    },
};

const customers = {
    path: '/customers',
    addresses: (id: number) => `/customers/${id}/addresses`,
    attributes: (id: number) => `/customers/${id}/attributes`,
    attributesValues: (id: number) => `/customers/${id}/attribute-values`,
    settings: {
        channel: (channelId: number) => `/customers/settings/channels/${channelId}`,
        global: '/customers/settings',
    },
    consent: (id: number) => `/customers/${id}/consent`,
    formFieldValues: '/customers/form-field-values',
    storedInstruments: (id: number) => `/customers/${id}/stored-instruments`,
    validateCredentials: '/customers/validate-credentials',
    metafields: {
        batch: '/customers/metafields',
        path: (id: number) => `/customers/${id}/metafields`,
        byId: (customerId: number, id: number) => `/customers/${customerId}/metafields/${id}`,
    },
    v2: {
        groups: {
            path: '/customer_groups',
            byId: (id: number) => `/customer_groups/${id}`,
            count: '/customer_groups/count',
        },
        deprecated: {
            path: '/customers',
            byId: (id: number) => `/customers/${id}`,
            addresses: {
                path: (id: number) => `/customers/${id}/addresses`,
                byId: (customerId: number, id: number) => `/customers/${customerId}/addresses/${id}`,
            },
            validatePassword: (id: number) => `/customers/${id}/validate_password`,
        },
    },
    subscribers: {
        path: '/customers/subscribers',
        byId: (id: number) => `/customers/subscribers/${id}`,
    },
};

export const customerSegmentation = {
    segments: '/segments',
    shopperProfileSegments: (profileId: string) => `/shopper-profiles/${profileId}/segments`,
    shopperProfiles: '/shopper-profiles',
    segmentShopperProfiles: (segmentId: string) => `/segments/${segmentId}/shopper-profiles`,
};

export const geography = {
    v2: {
        countries: {
            path: '/countries',
            byId: (id: string) => `/countries/${id}`,
            count: '/countries/count',
            states: {
                path: (id: string) => `/countries/${id}/states`,
                byId: (countryId: string, id: string) => `/countries/${countryId}/states/${id}`,
                count: (countryId: string) => `/countries/${countryId}/states/count`,
            },
        },
        states: {
            path: '/countries/states',
            count: '/countries/states/count',
        },
    },
};

const inventory = {
    adjustments: {
        absolute: '/inventory/adjustments/absolute',
        relative: '/inventory/adjustments/relative',
    },
    items: {
        path: '/inventory/items',
        atLocation: (locationId: string) => `/inventory/locations/${locationId}/items`,
        updateLocationSettings: (locationId: string) => `/inventory/locations/${locationId}/items`,
    },
};

const locations = {
    path: '/inventory/locations',
    metafields: {
        batch: '/inventory/locations/metafields',
        path: (id: string) => `/inventory/locations/${id}/metafields`,
        byId: (locationId: string, id: string) => `/inventory/locations/${locationId}/metafields/${id}`,
    },
};

const ordersV2 = {
    path: '/orders',
    byId: (id: number) => `/orders/${id}`,
    count: '/orders/count',
    consignments: {
        path: (id: number) => `/orders/${id}/consignments`,
        shippingQuotes: (orderId: number, consignmentId: number) =>
            `/orders/${orderId}/consignments/shipping/${consignmentId}/shipping_quotes`,
    },
    coupons: (id: number) => `/orders/${id}/coupons`,
    fees: (id: number) => `/orders/${id}/fees`,
    messages: (id: number) => `/orders/${id}/messages`,
    products: {
        path: (id: number) => `/orders/${id}/products`,
        byId: (orderId: number, id: number) => `/orders/${orderId}/products/${id}`,
    },
    shipments: {
        path: (id: number) => `/orders/${id}/shipments`,
        count: (id: number) => `/orders/${id}/shipments/count`,
        byId: (orderId: number, id: number) => `/orders/${orderId}/shipments/${id}`,
    },
    shippingAddresses: {
        path: (id: number) => `/orders/${id}/shipping_addresses`,
        byId: (orderId: number, id: number) => `/orders/${orderId}/shipping_addresses/${id}`,
        quotes: (orderId: number, id: number) => `/orders/${orderId}/shipping_addresses/${id}/shipping_quotes`,
    },
    statuses: {
        path: '/order_statuses',
        byId: (id: number) => `/order_statuses/${id}`,
    },
    taxes: (id: number) => `/orders/${id}/taxes`,
};

const orders = {
    v2: ordersV2,
    transactions: (id: number) => `/orders/${id}/transactions`,
    metafields: {
        batch: '/orders/metafields',
        path: (id: number) => `/orders/${id}/metafields`,
        byId: (orderId: number, id: number) => `/orders/${orderId}/metafields/${id}`,
    },
    settings: {
        global: '/orders/settings',
        channel: (channelId: number) => `/orders/settings/${channelId}`,
    },
    payments: {
        capture: (id: number) => `/orders/${id}/payment_actions/capture`,
        void: (id: number) => `/orders/${id}/payment_actions/void`,
    },
    refunds: {
        path: '/orders/payment_actions/refunds',
        byId: (refundId: number) => `/orders/payment_actions/refunds/${refundId}`,
        quote: (id: number) => `/orders/${id}/payment_actions/refund_quote`,
        forOrder: (id: number) => `/orders/${id}/payment_actions/refunds`,
    },
    pickups: {
        path: '/orders/pickups',
        methods: '/pickup/methods',
        options: '/pickup/options',
    },
};

const priceLists = {
    path: '/pricelists',
    byId: (id: number) => `/pricelists/${id}`,
    assignments: {
        path: '/pricelists/assignments',
        byId: (id: number) => `/pricelists/assignments/${id}`,
    },
    records: {
        path: '/pricelists/records',
        forList: (id: number) => `/pricelists/${id}/records`,
        byVariant: (listId: number, variantId: number) => `/pricelists/${listId}/records/${variantId}`,
        byCurrency: (listId: number, variantId: number, currencyCode: string) =>
            `/pricelists/${listId}/records/${variantId}/${currencyCode}`,
    },
};

const promotions = {
    path: '/promotions',
    byId: (id: number) => `/promotions/${id}`,
    coupons: {
        path: (promotionId: number) => `/promotions/${promotionId}/codes`,
        byId: (promotionId: number, id: number) => `/promotions/${promotionId}/codes/${id}`,
    },
    settings: '/promotions/settings',
};

const redirects = {
    path: '/storefront/redirects',
    imexJobs: '/storefront/redirects/imex/jobs',
    createExportJob: '/storefront/redirects/imex/export',
    createImportJob: '/storefront/redirects/imex/import',
    exportEventStream: (jobUuid: string) => `/storefront/redirects/imex/export/${jobUuid}/events`,
    importEventStream: (jobUuid: string) => `/storefront/redirects/imex/import/${jobUuid}/events`,
    downloadExport: (jobUuid: string) => `/storefront/redirects/imex/export/${jobUuid}/download`,
};

const scripts = {
    path: '/content/scripts',
    byId: (uuid: string) => `/content/scripts/${uuid}`,
};

const settings = {
    analytics: {
        providers: '/settings/analytics',
        provider: (providerId: string) => `/settings/analytics/${providerId}`,
    },
    catalog: '/settings/catalog',
    emailStatuses: '/settings/email-statuses',
    createFavicon: '/settings/favicon/image',
    inventory: {
        path: '/settings/inventory',
        notifications: '/settings/inventory/notifications',
    },
    logo: {
        path: '/settings/logo',
        image: '/settings/logo/image',
    },
    filters: {
        enabled: '/settings/search/filters',
        available: '/settings/search/filters/available',
        contextual: '/settings/search/filters/contexts',
    },
    locale: '/settings/locale',
    profile: '/settings/profile',
    storefront: {
        category: '/settings/storefront/category',
        product: '/settings/storefront/product',
        robotstxt: '/settings/storefront/robotstxt',
        search: '/settings/storefront/search',
        security: '/settings/storefront/security',
        seo: '/settings/storefront/seo',
        status: '/settings/storefront/status',
        uom: '/settings/storefront/units-of-measurement',
    },
};

const shippingV2 = {
    carrierConnections: '/shipping/carrier/connection',
    methods: {
        path: (zoneId: number) => `/shipping/zones/${zoneId}/methods`,
        byId: (zoneId: number, id: number) => `/shipping/zones/${zoneId}/methods/${id}`,
    },
    zones: {
        path: '/shipping/zones',
        byId: (id: number) => `/shipping/zones/${id}`,
    },
};

const shipping = {
    v2: shippingV2,
    customsInformation: '/shipping/products/customs-information',
    settings: {
        global: '/shipping/settings',
        channel: (channelId: number) => `/shipping/settings/${channelId}`,
    },
};

const sites = {
    path: '/sites',
    byId: (id: number) => `/sites/${id}`,
    certificates: {
        all: '/sites/certificates',
        forSite: (id: number) => `/sites/${id}/certificates`,
    },
    routes: {
        path: (siteId: number) => `/sites/${siteId}/routes`,
        byId: (siteId: number, id: number) => `/sites/${siteId}/routes/${id}`,
    },
};

const store = {
    v2: {
        info: '/store',
        time: '/time',
    },
    metafields: {
        batch: '/store/metafields',
        path: (id: number) => `/store/metafields/${id}`,
        byId: (storeId: number, id: number) => `/store/metafields/${storeId}/${id}`,
    },
    logs: '/store/systemlogs',
};

const tax = {
    v2: {
        classes: {
            path: '/tax_classes',
            byId: (id: number) => `/tax_classes/${id}`,
        },
    },
    customers: '/tax/customers',
    rates: '/tax/rates',
    zones: '/tax/zones',
    properties: '/tax/properties',
    productProperties: '/tax/products/properties',
    settings: '/tax/settings',
};

const wishlists = {
    path: '/wishlists',
    byId: (id: number) => `/wishlists/${id}`,
    items: {
        delete: (id: number, itemId: number) => `/wishlists/${id}/items/${itemId}`,
        add: (id: number) => `/wishlists/${id}/items`,
    },
};

const webhooks = {
    path: '/hooks',
    byId: (id: number) => `/hooks/${id}`,
    admin: '/hooks/admin',
    upsertEmailNotifications: '/hooks/admin',
};

export const bc = {
    catalogSummary,
    products,
    modifiers,
    variantOptions,
    variants,
    brands,
    categories,
    trees,
    abandonedCarts,
    carts,
    channels,
    checkouts,
    currencies,
    customers,
    customerSegmentation,
    geography,
    inventory,
    locations,
    orders,
    priceLists,
    promotions,
    redirects,
    scripts,
    settings,
    shipping,
    sites,
    store,
    tax,
    wishlists,
    webhooks,
};
