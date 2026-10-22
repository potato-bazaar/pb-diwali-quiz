export const CATEGORIES = [
  "Cultivation",
  "Varieties & Uses",
  "Storage",
  "Trading & Mandi",
  "Processing",
  "General Knowledge",
  "Potato Bazaar App",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const DAILY_MIX: Record<Category, number> = {
  Cultivation: 2,
  "Varieties & Uses": 2,
  Storage: 1,
  "Trading & Mandi": 1,
  Processing: 1,
  "General Knowledge": 2,
  "Potato Bazaar App": 1,
};

export const OPTION_LETTERS = ["A", "B", "C", "D"] as const;
export type OptionLetter = (typeof OPTION_LETTERS)[number];

export const POINTS_PER_CORRECT = 10;

export type QuizQuestion = {
  id: string;
  text: string;
  options: [string, string, string, string];
  /** Administrator-only. Never render this to participants. */
  answer: OptionLetter;
  category: Category;
};

export type QuizDay = {
  day: number;
  /** Contest calendar date in India (YYYY-MM-DD). */
  date: string;
  theme: string;
  questions: QuizQuestion[];
};

type RawQuestion = [text: string, options: QuizQuestion["options"], answer: OptionLetter, category: Category];

function defineDay(day: number, date: string, theme: string, raw: RawQuestion[]): QuizDay {
  return {
    day,
    date,
    theme,
    questions: raw.map(([text, options, answer, category], i) => ({
      id: `D${day}-Q${i + 1}`,
      text,
      options,
      answer,
      category,
    })),
  };
}

export const QUESTION_BANK: QuizDay[] = [
  defineDay(1, "2026-11-01", "Potato Knowledge Kick-off", [
    ["Which part of a potato is capable of sprouting?", ["Mandi receipt", "Eyes or buds", "Packaging string", "Price label"], "B", "General Knowledge"],
    ["Which potato trait is important for French fries?", ["Long tuber shape and suitable frying quality", "round shaped tubers only", "Thick roots only", "green leaves"], "A", "Varieties & Uses"],
    ["Which potato trait matters especially for making crisp chips?", ["Flower colour alone", "Number of leaves alone", "Field fence colour", "Suitable dry matter and frying quality"], "D", "Varieties & Uses"],
    ["Why should harvested potatoes be kept away from direct sunlight?", ["To raise moisture loss", "To increase sunburn", "To reduce greening & rotting", "To make them sweeter immediately"], "C", "Storage"],
    ["Potato is botanically classified as what?", ["A cereal grain", "A tree nut", "A modified stem crop", "A citrus fruit"], "C", "General Knowledge"],
    ["What does a mandi price indicate?", ["A soil pH reading", "A crop disease name", "A cold-room sensor type", "A market trading rate"], "D", "Trading & Mandi"],
    ["Which soil is generally suitable for potato cultivation?", ["Permanently flooded soil", "Hard concrete-like soil", "Well-drained sandy loam soil", "Highly saline soil"], "C", "Cultivation"],
    ["Which of these is made by frying sliced potatoes?", ["Tea powder", "Potato chips", "Jaggery", "Cotton fibre"], "B", "Processing"],
    ["Which Potato Bazaar feature helps check market rates?", ["Weather", "Directory", "Mandi Prices", "Jobs"], "C", "Potato Bazaar App"],
    ["Which part of a potato plant develops into the harvested potato?", ["Seed pod", "Flower", "Modified Stem tuber", "Leaf"], "C", "Cultivation"],
  ]),
  defineDay(2, "2026-11-02", "From Field to Market", [
    ["What does a potato variety name identify?", ["A storage receipt", "A mandi tax", "A type of potato with particular characteristics", "A fertilizer invoice"], "C", "Varieties & Uses"],
    ["What should farmers generally avoid in a potato field?", ["Standing water", "Healthy seed", "Good drainage", "Proper spacing"], "A", "Cultivation"],
    ["What is a 'lot' in agricultural trading?", ["A defined quantity offered together", "A fertilizer dose", "A seed eye", "A weather warning"], "A", "Trading & Mandi"],
    ["Which food is commonly prepared with boiled potatoes?", ["Jaggery syrup", "Mashed potatoes", "Cottonseed oil", "Tea infusion"], "B", "General Knowledge"],
    ["Why do buyers ask for a specific potato variety?", ["Every variety is identical", "Variety replaces grading", "Variety determines rainfall", "Varieties differ in processing and market suitability"], "D", "Varieties & Uses"],
    ["Where can users explore potato buy and sell offers in the app?", ["Buy/Sell", "Jobs", "Help & Support", "Weather"], "A", "Potato Bazaar App"],
    ["Which condition can encourage potato rot in storage?", ["Unsuitable temperature, moisture and poor conditions", "Regular inspection", "Good hygiene", "Careful handling"], "A", "Storage"],
    ["What is the purpose of earthing up potato plants?", ["Dry out the field", "Stop leaf growth", "Cover developing tubers with soil & removing weeds", "Remove all roots"], "C", "Cultivation"],
    ["Which product is commonly made from potato strips?", ["French fries", "Jute rope", "Wheat bran", "Sugar cubes"], "A", "Processing"],
    ["Which nutrient is potato particularly known for providing?", ["Carbohydrate & starch", "Dietary cholesterol", "Vitamin B12", "Caffeine"], "A", "General Knowledge"],
  ]),
  defineDay(3, "2026-11-03", "Discover the Potato World", [
    ["What is a table potato primarily sold for?", ["Household cooking", "Producing tea powder", "Making sugarcane jaggery", "Spinning textile fibre"], "A", "Varieties & Uses"],
    ["What are potato flakes?", ["Fresh potato flowers", "A type of insect", "Dehydrated potato product", "A weighing instrument"], "C", "Processing"],
    ["Which continent did cultivated potatoes originate from?", ["South America", "Antarctica", "Australia", "Europe"], "A", "General Knowledge"],
    ["What does FIFO mean in inventory handling?", ["First In, First Out", "Fast Invoice, Fast Order", "Farm Inspection, Farm Order", "Fresh Input, Fixed Output"], "A", "Storage"],
    ["Which Potato Bazaar section is intended for industry contacts?", ["Crop Diagnostic", "Directory", "Jobs", "Weather"], "B", "Potato Bazaar App"],
    ["Which product is made from potatoes?", ["Jaggery", "Cotton yarn", "Tea leaves", "Potato starch"], "D", "Varieties & Uses"],
    ["What causes the green colour sometimes seen on potatoes exposed to light?", ["Added green dye from soil", "Chlorophyll & toxic product formation", "Conversion into leaves", "Increased iron metal"], "B", "General Knowledge"],
    ["Why is certified disease-free seed useful?", ["It prevents all pests forever", "It eliminates irrigation", "It guarantees fixed prices", "Reduce degeneration, yield losses and diseases"], "D", "Cultivation"],
    ["What is the usual planting material for commercial potato crops?", ["Dry leaves", "Roots", "Seed tubers & cuttings", "Flowers"], "C", "Cultivation"],
    ["Why should a buyer specify quantity and grade?", ["To guarantee rain", "To make requirements clear", "To change a variety after harvest", "To avoid transport planning"], "B", "Trading & Mandi"],
  ]),
  defineDay(4, "2026-11-04", "Varieties and Uses", [
    ["Why are potatoes graded before storage or sale?", ["To separate by quality or size", "To change their variety", "To remove all starch", "To eliminate transport"], "A", "Storage"],
    ["What is a weighing slip used for?", ["Recording measured weight", "Testing soil pH", "Identifying potato disease", "Measuring sunlight"], "A", "Trading & Mandi"],
    ["Which of these is a common potato dish in India?", ["Sugarcane jaggery", "Aloo paratha, samosa and tikki", "Cotton fabric", "Tea dust"], "B", "General Knowledge"],
    ["Why is field drainage important?", ["It replaces seed treatment", "It stops tuber growth", "It prevents waterlogging & suitable condition for plant growth", "It creates permanent ponds"], "C", "Cultivation"],
    ["What is the primary edible part of a potato plant?", ["Green berries", "Dry stems", "Flower petals", "Underground stem, called tuber"], "D", "General Knowledge"],
    ["What is a potato eye?", ["A type of leaf", "A storage bag label", "A hole made by a weighing scale", "A bud from which a sprout can grow"], "D", "Varieties & Uses"],
    ["What is a major purpose of washing potatoes before processing?", ["Add stones to the lot", "Increase soil contamination", "Change their variety", "Remove soil and clean surface dirt"], "D", "Processing"],
    ["What is the primary purpose of irrigation?", ["Flood the field continuously", "Increase soil salinity", "Wash away all fertilizer", "Maintain suitable soil moisture for plant growth"], "D", "Cultivation"],
    ["Why do processors care about potato dry matter?", ["It affects processing yield and product quality", "It measures the truck's fuel", "It determines seed certification alone", "It sets road tolls"], "A", "Varieties & Uses"],
    ["Which feature provides local forecast information?", ["Buy/Sell", "Transport", "Directory", "Weather"], "D", "Potato Bazaar App"],
  ]),
  defineDay(5, "2026-11-05", "Farming and Technology", [
    ["What does 'per kilogram' mean in a quoted rate?", ["Price for one season", "Price for one hectare", "Price for one kilogram", "Price for one truck always"], "C", "Trading & Mandi"],
    ["What does potato sprouting mean?", ["Soil changes colour", "New shoots emerge from eyes", "Flowers become fruits", "Leaves turn into roots"], "B", "Cultivation"],
    ["What is a common sign of spoilage in stored potatoes?", ["Soft rotten patches", "Normal skin colour", "Firm healthy tubers", "Correct labelling"], "A", "Storage"],
    ["Which of these is an example of potato-based snack?", ["Jute fibre", "Raw cotton", "Potato chips", "Wheat straw"], "C", "General Knowledge"],
    ["Which statement about potato varieties is correct?", ["Different varieties suit different end uses", "Variety has no role in processing", "All varieties fry identically", "All varieties mature on the same day"], "A", "Varieties & Uses"],
    ["Which food item is commonly made with potato filling?", ["Tea leaves", "Cotton lint", "Sugarcane jaggery", "Samosa"], "D", "General Knowledge"],
    ["Which feature helps users explore logistics services?", ["PB Zone", "Transport", "News", "Weather"], "B", "Potato Bazaar App"],
    ["Why should seed tubers be handled carefully?", ["To remove all eyes", "To dry them in strong sunlight", "To reduce bruising and damage", "To increase cuts"], "C", "Cultivation"],
    ["What is a common form in which seed potatoes are supplied?", ["Cotton bolls", "Tea cuttings", "Sugarcane sticks", "Tubers"], "D", "Varieties & Uses"],
    ["What does peeling remove?", ["Potato starch completely", "Every nutrient in the tuber", "All water inside the potato", "Potato outer skin"], "D", "Processing"],
  ]),
  defineDay(6, "2026-11-06", "Markets and Trade", [
    ["What is the main role of roots in a potato plant?", ["Absorb water and nutrients from soil", "Make French fries", "Determine mandi fees", "Store potatoes in bags"], "A", "Cultivation"],
    ["Why do processors sort potatoes by size?", ["For more consistent processing products", "To increase road taxes", "To change seed genetics", "To predict rainfall"], "A", "Processing"],
    ["Why is ventilation relevant in potato storage?", ["It helps manage the storage conditions", "It creates sugar", "It replaces sorting", "It changes variety"], "A", "Storage"],
    ["Why might a processor specify tuber size?", ["To fit uniform cutting for processing equipment", "To change local rainfall", "To determine the farmer's name", "To avoid weighing produce"], "A", "Varieties & Uses"],
    ["What does 'perishable produce' mean?", ["Produce that needs no handling", "Produce that can deteriorate in specified time", "Produce with a fixed price forever", "Produce that cannot be damaged"], "B", "General Knowledge"],
    ["Where can users find all potato-related content?", ["Potato Bazar app", "Jobs", "Directory", "Transport"], "A", "Potato Bazaar App"],
    ["What does a purchase enquiry generally communicate?", ["A buyer's requirement", "A confirmed crop disease", "A weather forecast", "A storage temperature"], "A", "Trading & Mandi"],
    ["Why is crop rotation commonly recommended?", ["To guarantee a higher mandi price", "To manage fertility & reduce soil-borne pests and diseases", "To eliminate all weather risks", "To replace irrigation"], "B", "Cultivation"],
    ["Which of these is a potato-related farming activity?", ["Cotton ginning", "Tea leaf plucking", "Earthing up", "Sugarcane crushing"], "C", "General Knowledge"],
    ["Which feature can matter when choosing potatoes for chips?", ["Mandi gate height", "Frying color, drying matter & reducing sugar", "Bag printing colour", "Truck paint colour"], "B", "Varieties & Uses"],
  ]),
  defineDay(7, "2026-11-07", "Storage and Quality", [
    ["Which statement best describes potato starch?", ["A metal found in potatoes", "A type of pesticide", "A transport permit", "A carbohydrate extracted from potatoes"], "D", "Varieties & Uses"],
    ["What is one reason to avoid planting damaged seed tubers?", ["They always grow faster", "They eliminate pests", "They may carry & increase disease risk", "They require no soil"], "C", "Cultivation"],
    ["Which section carries potato industry updates?", ["Help & Support", "Weather", "Potato bazar News", "Jobs"], "C", "Potato Bazaar App"],
    ["What does 'harvest' mean?", ["Collect produce of crops", "Quote a mandi rate", "Plant a new seed only", "Register a truck"], "A", "General Knowledge"],
    ["What is a simple reason to wash potatoes before cooking?", ["Make them sprout instantly", "Remove dirt from the surface", "Turn them into sugarcane", "Remove all carbohydrates"], "B", "General Knowledge"],
    ["Which is a typical culinary use of potatoes?", ["Making tea leaves", "Boiling and mashing", "Extracting jaggery from cane", "Weaving cloth"], "B", "Varieties & Uses"],
    ["What does a cold storage sensor measure?", ["Truck mileage", "Temperature, humidity and CO2 levels", "Fertilizer price", "Mandi commission"], "B", "Storage"],
    ["Why does potato grading matter in trade?", ["Quality and size affect buyer requirements", "It guarantees identical prices", "It removes need for payment", "It determines the moon phase"], "A", "Trading & Mandi"],
    ["What is blanching in food processing?", ["Brief treatment with hot water or steam", "Weighing a truck", "Adding field soil", "Storing under direct sun for months"], "A", "Processing"],
    ["What is meant by plant emergence?", ["Storage begins", "Shoots appear above soil", "Potatoes are sold", "Tubers are packed in sacks"], "B", "Cultivation"],
  ]),
  defineDay(8, "2026-11-08", "Diwali Special", [
    ["What does 'seed grade' refer to in potato trade?", ["Potatoes intended and suitable for planting", "Potatoes used only for frying", "Potatoes used as packaging", "Potatoes that are already cooked"], "A", "Varieties & Uses"],
    ["What does 'processing grade' refer to?", ["Only potatoes sold on Sundays", "Only potatoes packed in red bags", "Only potatoes grown near a factory", "Potatoes requirements for processing"], "D", "Varieties & Uses"],
    ["Why should green potato portions not be eaten?", ["They have no water", "They contain extra protein", "They may contain toxic elevated glycoalkaloids", "They are always sweeter"], "C", "General Knowledge"],
    ["Which Potato Bazaar feature relates to hiring storage space?", ["PB Zone", "Weather", "Jobs", "Cold Storage Hire/Rent"], "D", "Potato Bazaar App"],
    ["Which action helps reduce weed competition?", ["Leaving weeds unchecked", "Timely weed management", "Removing the crop", "Keeping fields flooded"], "B", "Cultivation"],
    ["Which is a common method of cooking potatoes?", ["Tea fermentation", "Cotton ginning", "Boiling", "Sugarcane pressing"], "C", "General Knowledge"],
    ["Why is adequate spacing between potato plants important?", ["It prevents all diseases completely", "It guarantees larger tubers", "It supports crop growth and field operations", "It removes need for water"], "C", "Cultivation"],
    ["What is a quotation in a trading transaction?", ["A crop leaf", "An offer stating commercial terms", "A cold storage motor", "A rainfall measurement"], "B", "Trading & Mandi"],
    ["Why should damaged potatoes be separated before storage?", ["They make bags heavier", "They can increase deterioration/ rotting risk", "They automatically heal every lot", "They improve all healthy potatoes"], "B", "Storage"],
    ["What does dehydration mean?", ["Adding irrigation water", "Applying pesticide to a field", "Growing new leaves", "Removing water"], "D", "Processing"],
  ]),
  defineDay(9, "2026-11-09", "Potato Industry Explorer", [
    ["What is the main purpose of harvesting?", ["To collect mature tubers from the soil", "Start seed germination", "Raise market taxes", "Apply first fertilizer"], "A", "Cultivation"],
    ["What is the purpose of sorting harvested potatoes?", ["Separate according to the quality or size", "Increase rainfall", "Change their botanical family", "Grow new roots in every bag"], "A", "General Knowledge"],
    ["What is a key purpose of food-grade packaging?", ["Increase crop weeds", "Protect product quality, self-life and safety", "Change the potato variety", "Replace cooking"], "B", "Processing"],
    ["Which potato characteristic is useful to a French-fry processor?", ["Different bag logos", "Unrelated flower colours", "Uneven transport receipts", "Consistent size and shape"], "D", "Varieties & Uses"],
    ["What does a potato's skin colour tell us by itself?", ["Its exact market price", "Its guaranteed storage life", "Not enough to establish its complete processing suitability", "Its precise starch percentage"], "C", "Varieties & Uses"],
    ["Which statement about potatoes is true?", ["They can be used for food and industrial starch", "They are a type of cereal grain", "They grow on trees", "They are made from jaggery"], "A", "General Knowledge"],
    ["What is shrinkage in potato storage?", ["Rise in truck speed", "Change in mandi name", "Loss of moisture/ water during storage", "Increase in land area"], "C", "Storage"],
    ["Where can users find potato-related video content?", ["Jobs", "Mandi Prices", "Print, media & app", "Transport"], "C", "Potato Bazaar App"],
    ["Why should potatoes be protected from cuts during harvest?", ["Cuts stop all sprouting", "Cuts improve shelf life", "Cuts can increase losses due to rotting in storage", "Cuts increase starch instantly"], "C", "Cultivation"],
    ["Why should delivery terms be agreed before a transaction?", ["To clarify responsibilities and costs", "To make potatoes grow faster", "To stop grading", "To change harvest date automatically"], "A", "Trading & Mandi"],
  ]),
  defineDay(10, "2026-11-10", "Grand Finale", [
    ["What is a common sign that a potato plant is growing?", ["The field turns into a pond", "Tubers become glass", "Plant canopy develops above soil", "All foliage disappears immediately"], "C", "Cultivation"],
    ["Which of these is NOT normally a potato product?", ["Potato flakes", "Jaggery", "Potato chips", "French fries"], "B", "Varieties & Uses"],
    ["Why is uniform grading useful to buyers?", ["It eliminates transport costs", "It sets government policy", "It guarantees zero spoilage", "It makes product lots more consistent"], "D", "Varieties & Uses"],
    ["What is a key benefit of checking more than one market rate?", ["Guaranteed highest sale price", "To get appropriate price of his product", "Guaranteed immediate payment", "Elimination of all transport costs"], "B", "Trading & Mandi"],
    ["Why is quality inspection important at a processing plant?", ["To decide monsoon dates", "To eliminate all equipment", "To identify potatoes that do not meet specifications", "To change market boundaries"], "C", "Processing"],
    ["What is a key benefit of monitoring a crop regularly?", ["Eliminate the need for all inputs", "Guarantee daily price rises", "Avoid checking soil moisture", "Identify problems early before spreading throughout crop/ field"], "D", "Cultivation"],
    ["Which Potato Bazaar feature is intended for crop problem identification?", ["Directory", "Transport", "Jobs", "Crop Diagnostic"], "D", "Potato Bazaar App"],
    ["Why is regular stock inspection useful?", ["To change tuber genetics", "To detect quality problems early", "To stop all electricity use", "To remove recordkeeping"], "B", "Storage"],
    ["What is a potato tuber?", ["A dry seed pod", "A flower petal", "A modified underground stem", "A leaf stalk only"], "C", "General Knowledge"],
    ["Which item is NOT typically made from potatoes?", ["Chips", "Flakes", "Jaggery", "Starch"], "C", "General Knowledge"],
  ]),
];
