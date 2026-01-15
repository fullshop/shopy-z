
export interface Product {
  id: string;
  title: string;
  price: string;
  images: string[];
  stock: number;
  description?: string;
}

export interface CartItem {
  id: string;
  title: string;
  price: string;
}

export interface Order {
  id?: string;
  name: string;
  phone: string;
  wilaya: string;
  commune: string;
  address: string;
  total: string;
  items: CartItem[];
  date: number;
  status: string;
  deliveryMethod?: 'desk' | 'home';
  shipping?: string;
}

export interface Review {
  text: string;
}

export type Lang = 'en' | 'ar';

export const TRANSLATIONS = {
  en: {
    shop_now: "Shop Now",
    find_style: "Find Your Perfect Style.",
    track: "Track Order",
    pay_at_door: "Cash on Delivery",
    confirm: "Confirm My Order",
    clear: "Clear Bag",
    search: "Search products...",
    related: "You Might Also Like",
    like: "Like",
    share: "Share",
    comments: "Reviews",
    post: "Post Comment",
    scarcity: "Only {stock} left in stock!",
    orders: "Orders",
    revenue: "Revenue",
    export: "Export CSV",
    summary: "Summary",
    total: "Total",
    subtotal: "Subtotal",
    shipping: "Shipping",
    shipping_details: "Shipping Details",
    full_name: "Full Name",
    phone_number: "Phone (05/06/07...)",
    select_wilaya: "Select Wilaya",
    commune_label: "Commune / Municipality",
    address_placeholder: "Exact House Address...",
    order_success: "Confirmed!",
    thank_you: "We will contact you soon.",
    home: "Home",
    return_home: "Return Home",
    added_to_bag: "Added to Bag",
    link_copied: "Link Copied",
    liked: "Added to Wishlist",
    removed: "Removed from Wishlist",
    fill_details: "Please enter a valid Name and Phone Number",
    select_location: "Please select your Wilaya and Commune",
    bag_empty: "Your bag is empty",
    error_saving: "Error saving order. Try again.",
    not_found: "Order not found.",
    admin_title: "shopyz Admin",
    product: "Product",
    stock: "Stock",
    action: "Action",
    delete: "Delete",
    update: "Update",
    find_order: "Find Order",
    delivered_revenue: "Delivered Revenue",
    all_orders: "All Orders",
    csv: "CSV",
    status: "Status",
    phone_number_simple: "Phone number",
    add_product: "Add Product",
    title_label: "Title",
    price_label: "Price",
    desc_label: "Description",
    images_label: "Product Images",
    upload_images: "Select from Device",
    cancel: "Cancel",
    save: "Save",
    delivery_method: "Delivery Method",
    stop_desk: "Stop Desk (Office Pickup)",
    home_delivery: "Home Delivery",
    free: "Free",
    confirm_clear: "Are you sure you want to clear your bag?",
    wishlist: "Wishlist",
    empty_wishlist: "Your wishlist is empty",
    new_arrivals: "New Arrivals",
    view_all: "View All",
    sort_by: "Sort by",
    newest: "Newest",
    price_low: "Price: Low to High",
    price_high: "Price: High to Low"
  },
  ar: {
    shop_now: "تسوق الآن",
    find_style: "اكتشف أسلوبك المثالي.",
    track: "تتبع الطلب",
    pay_at_door: "الدفع عند الاستلام",
    confirm: "تأكيد الطلب",
    clear: "تفريغ الحقيبة",
    search: "ابحث عن منتج...",
    related: "قد يعجبك أيضاً",
    like: "أعجبني",
    share: "مشاركة",
    comments: "التعليقات",
    post: "نشر",
    scarcity: "بقي {stock} قطع فقط!",
    orders: "طلبيات",
    revenue: "الأرباح",
    export: "تحميل ملف CSV",
    summary: "ملخص",
    total: "المجموع",
    subtotal: "المبلغ الأولي",
    shipping: "التوصيل",
    shipping_details: "معلومات التوصيل",
    full_name: "الاسم الكامل",
    phone_number: "رقم الهاتف (05/06/07...)",
    select_wilaya: "اختر الولاية",
    commune_label: "البلدية",
    address_placeholder: "العنوان بالتدقيق...",
    order_success: "تم التأكيد!",
    thank_you: "سنتصل بك قريباً.",
    home: "الرئيسية",
    return_home: "العودة للرئيسية",
    added_to_bag: "تمت الإضافة للسلة",
    link_copied: "تم نسخ الرابط",
    liked: "تم الإعجاب",
    removed: "تمت الإزالة",
    fill_details: "يرجى إدخال اسم ورقم هاتف صحيحين",
    select_location: "يرجى اختيار الولاية والبلدية",
    bag_empty: "حقيبتك فارغة",
    error_saving: "خطأ في حفظ الطلب. حاول مرة أخرى.",
    not_found: "لم يتم العثور على الطلب",
    admin_title: "لوحة التحكم",
    product: "المنتج",
    stock: "المخزون",
    action: "إجراء",
    delete: "حذف",
    update: "تحديث",
    find_order: "البحث عن الطلب",
    delivered_revenue: "العائدات (تم التوصيل)",
    all_orders: "كل الطلبات",
    csv: "ملف CSV",
    status: "الحالة",
    phone_number_simple: "رقم الهاتف",
    add_product: "إضافة منتج",
    title_label: "العنوان",
    price_label: "السعر",
    desc_label: "الوصف",
    images_label: "صور المنتج",
    upload_images: "اختر من الجهاز",
    cancel: "إلغاء",
    save: "حفظ",
    delivery_method: "طريقة التوصيل",
    stop_desk: "توصيل للمكتب (Stop Desk)",
    home_delivery: "توصيل للمنزل",
    free: "مجاني",
    confirm_clear: "هل أنت متأكد من تفريغ الحقيبة؟",
    wishlist: "المفضلة",
    empty_wishlist: "قائمة المفضلة فارغة",
    new_arrivals: "وصل حديثاً",
    view_all: "عرض الكل",
    sort_by: "ترتيب حسب",
    newest: "الأحدث",
    price_low: "السعر: الأقل إلى الأعلى",
    price_high: "السعر: الأعلى إلى الأقل"
  }
};

export const COMMUNES: Record<string, string[]> = {
  "16": ["Bab Ezzouar", "Kouba", "Alger Center", "Hydra", "Ben Aknoun", "El Biar"],
  "31": ["Es Senia", "Oran Center", "Bir El Djir"],
  "25": ["El Khroub", "Constantine", "Ali Mendjeli"]
};

export interface WilayaData {
  code: string;
  name: string;
  desk: number | null; // null means unavailable
  home: number;
}

export const WILAYAS: WilayaData[] = [
  { code: "1", name: "01 - Adrar", desk: 800, home: 1300 },
  { code: "2", name: "02 - Chlef", desk: 450, home: 750 },
  { code: "3", name: "03 - Laghouat", desk: 450, home: 900 },
  { code: "4", name: "04 - Oum El Bouaghi", desk: 450, home: 700 },
  { code: "5", name: "05 - Batna", desk: 450, home: 700 },
  { code: "6", name: "06 - Béjaïa", desk: 450, home: 750 },
  { code: "7", name: "07 - Biskra", desk: 450, home: 900 },
  { code: "8", name: "08 - Béchar", desk: 600, home: 1000 },
  { code: "9", name: "09 - Blida", desk: 450, home: 700 },
  { code: "10", name: "10 - Bouira", desk: 450, home: 750 },
  { code: "11", name: "11 - Tamanrasset", desk: 750, home: 1500 },
  { code: "12", name: "12 - Tébessa", desk: 450, home: 800 },
  { code: "13", name: "13 - Tlemcen", desk: 450, home: 850 },
  { code: "14", name: "14 - Tiaret", desk: 450, home: 850 },
  { code: "15", name: "15 - Tizi-Ouzou", desk: 450, home: 750 },
  { code: "16", name: "16 - Alger", desk: 450, home: 600 },
  { code: "17", name: "17 - Djelfa", desk: 500, home: 900 },
  { code: "18", name: "18 - Jijel", desk: 450, home: 700 },
  { code: "19", name: "19 - Sétif", desk: 300, home: 450 },
  { code: "20", name: "20 - Saida", desk: 450, home: 900 },
  { code: "21", name: "21 - Skikda", desk: 450, home: 750 },
  { code: "22", name: "22 - Sidi-Bel-Abbès", desk: 450, home: 850 },
  { code: "23", name: "23 - Annaba", desk: 450, home: 750 },
  { code: "24", name: "24 - Guelma", desk: 450, home: 700 },
  { code: "25", name: "25 - Constantine", desk: 450, home: 700 },
  { code: "26", name: "26 - Médéa", desk: 450, home: 750 },
  { code: "27", name: "27 - Mostaganem", desk: 450, home: 850 },
  { code: "28", name: "28 - M'Sila", desk: 450, home: 800 },
  { code: "29", name: "29 - Mascara", desk: 450, home: 850 },
  { code: "30", name: "30 - Ouargla", desk: 450, home: 900 },
  { code: "31", name: "31 - Oran", desk: 450, home: 850 },
  { code: "32", name: "32 - El-Bayadh", desk: 450, home: 1000 },
  { code: "33", name: "33 - Illizi", desk: 800, home: 1700 },
  { code: "34", name: "34 - Bordj-Bou-Arreridj", desk: 450, home: 550 },
  { code: "35", name: "35 - Boumerdès", desk: 450, home: 700 },
  { code: "36", name: "36 - El-Tarf", desk: 450, home: 750 },
  { code: "37", name: "37 - Tindouf", desk: null, home: 1600 },
  { code: "38", name: "38 - Tissemsilt", desk: 450, home: 800 },
  { code: "39", name: "39 - El-Oued", desk: 450, home: 900 },
  { code: "40", name: "40 - Khenchela", desk: 450, home: 750 },
  { code: "41", name: "41 - Souk-Ahras", desk: 450, home: 750 },
  { code: "42", name: "42 - Tipaza", desk: 450, home: 700 },
  { code: "43", name: "43 - Mila", desk: 450, home: 700 },
  { code: "44", name: "44 - Aïn-Defla", desk: 450, home: 750 },
  { code: "45", name: "45 - Naâma", desk: 500, home: 1000 },
  { code: "46", name: "46 - Aïn-Témouchent", desk: 450, home: 850 },
  { code: "47", name: "47 - Ghardaia", desk: 600, home: 900 },
  { code: "48", name: "48 - Relizane", desk: 450, home: 850 },
  { code: "49", name: "49 - Timimoun", desk: null, home: 1300 },
  { code: "50", name: "50 - Bordj Badji Mokhtar", desk: null, home: 1500 },
  { code: "51", name: "51 - Ouled Djellal", desk: null, home: 900 },
  { code: "52", name: "52 - Béni Abbès", desk: null, home: 1050 },
  { code: "53", name: "53 - In Salah", desk: null, home: 1400 },
  { code: "54", name: "54 - In Guezzam", desk: null, home: 1700 },
  { code: "55", name: "55 - Touggourt", desk: 550, home: 1000 },
  { code: "56", name: "56 - Djanet", desk: 800, home: 1600 },
  { code: "57", name: "57 - El M'Ghair", desk: 500, home: 900 },
  { code: "58", name: "58 - El Meniaa", desk: 500, home: 1000 }
];
