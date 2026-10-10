// Part 2 cue cards from the speaking question bank (individual long turn).
// `n` is the page number in the source PDF, used to build a stable id.

export type ThemeId =
  | "family"
  | "tech"
  | "shopping"
  | "environment"
  | "health"
  | "travel"
  | "school"
  | "hobbies"
  | "kindness"
  | "special"
  | "media";

export type Card = {
  id: string;
  theme: ThemeId;
  title: string;
  prompt: string;
  points: string[]; // "You should say" bullets
};

type Raw = [n: number, theme: ThemeId, title: string, prompt: string, points: string[]];

const raw: Raw[] = [
  [3, "travel", "Travelling", "Talk about a city you would like to visit.", ["what the city is", "where it is", "why you want to go there", "if people need to travel to other places (why/why not?)"]],
  [4, "tech", "Favourite social media", "Talk about your favourite social media.", ["what it is", "when you started using it", "why you like it", "if teenagers need to use social media wisely (why/why not?)"]],
  [5, "kindness", "An act of kindness", "Talk about an act of kindness you have done.", ["what it was", "who you did it for", "how it impacted the person", "if being kind to others can change the world (why/why not?)"]],
  [7, "school", "A job", "Talk about a job you dream of.", ["what the job is", "who encourages you", "why you choose the job", "if salary is important when choosing a job (why/why not?)"]],
  [8, "family", "House chores", "Talk about a house chore you usually do.", ["what it is", "how many times you do it", "why you enjoy doing the chore", "if parents should ask their children to do the house chores (why/why not?)"]],
  [9, "media", "Music", "Talk about the music you like.", ["what the music is", "when you started listening to it", "how the music makes you feel", "if music helps students in their studies (why/why not?)"]],
  [10, "family", "Your hometown", "Talk about your hometown.", ["the name of your hometown", "why you love your hometown", "what you usually do at your hometown", "what you would change to improve your hometown"]],
  [11, "shopping", "An advertisement", "Talk about an advertisement you watched recently.", ["what product was in the advertisement", "who was in the advertisement", "why you like / dislike it", "why it is important to not be easily influenced by advertisements"]],
  [12, "family", "An important family member", "Talk about a family member who is important to you.", ["who the person is", "why the person is important to you", "what you usually do together", "why it is important for teenagers to have good role models at home"]],
  [13, "kindness", "A good neighbour", "Talk about a neighbour who has been good to you.", ["who the person is", "where the person lives", "what good thing the person did", "why it is important to build a good relationship with neighbours"]],
  [14, "kindness", "Neighbours", "Talk about your neighbours.", ["who your neighbours are", "how often you meet your neighbours", "if you like your neighbours (why/why not?)", "the importance of having good neighbours"]],
  [15, "health", "Staying healthy", "Talk about ways to stay healthy.", ["what you do to stay healthy", "how often you do them", "why you do them", "the challenges you face to stay fit and healthy"]],
  [16, "shopping", "Shopping experience", "Talk about your shopping experience.", ["one thing that you bought", "name of the shop", "reasons you chose the shop", "if you prefer to shop online or in store (why/why not?)"]],
  [17, "tech", "Technology", "Talk about the benefits of technology.", ["what the technology is", "what you use it for", "how it has improved your life", "why it is important to not use technology too much"]],
  [18, "special", "A birthday present", "Talk about a birthday present you would give to your favourite aunt.", ["what the present is", "why you chose that present", "why she is your favourite aunt", "why it is important to have a close relationship with extended family members"]],
  [19, "shopping", "An online shopping platform", "Talk about an online shopping platform you like.", ["what platform it is", "what it sells", "why you prefer the platform than others", "why it is important to be mindful when shopping online"]],
  [20, "tech", "Going online", "Talk about going online.", ["what you do when you are online", "how much time you usually spend online", "if you can live without the Internet (why/why not?)", "ways to be safe online"]],
  [21, "special", "A proud moment", "Talk about a moment that made you feel proud.", ["what the moment was", "who else was there", "what you did to achieve that moment", "what you learned from that moment"]],
  [22, "media", "E-books", "Talk about an e-book that you have read.", ["what the title was", "who suggested you to read it", "if you prefer using e-books to printed books (why/why not?)", "how e-books make students' life easier"]],
  [23, "environment", "Planting activity", "Talk about a planting activity that you have joined.", ["what you planted", "where the activity was held", "the benefits of planting activity to teenagers", "how planting trees can save the environment"]],
  [24, "school", "Plan after SPM", "Talk about your plan after SPM.", ["what you want to do", "why you want to do it", "if you plan to do it on your own or with friends (why?)", "if teenagers should work after SPM (why/why not?)"]],
  [25, "family", "Best area in your house", "Talk about the best area in your house.", ["what it is", "what you usually do there", "how you would improve the area", "if it is important to keep your house clean (why/why not?)"]],
  [26, "hobbies", "Taking photographs", "Talk about taking photographs.", ["type of photographs you like to take", "the best photograph you have taken", "what you do with the photograph", "if you prefer taking photographs or videos (why/why not?)"]],
  [27, "environment", "School clean-up", "Talk about a school clean-up that you joined.", ["when it was held", "who organised it", "what you did", "if school clean-up should be made compulsory for pupils (why/why not?)"]],
  [28, "tech", "A famous influencer", "Talk about a famous influencer whom you would like to meet.", ["who the person is", "what he/she is famous for", "what you would feel if you met him/her", "if you think influencers are good role models (why/why not?)"]],
  [29, "tech", "Excessive use of mobile phones", "Talk about excessive use of mobile phones.", ["how the issue affects teenagers", "ways to overcome the issue", "why teenagers spend too much time on mobile phones", "if you think parents should play a role in reducing screen time (why/why not?)"]],
  [30, "hobbies", "A hobby", "Talk about a hobby.", ["what your hobby is", "how often you spend time on the hobby", "who you share your hobby with", "if you think your hobby is useful for you (why/why not?)"]],
  [31, "school", "A foreign language", "Talk about a foreign language that you would like to learn.", ["what it is", "why you want to learn it", "how you can learn it", "if you think knowing more than one language is useful (why/why not?)"]],
  [32, "kindness", "A volunteering programme", "Talk about a volunteering programme that you have participated in.", ["what the programme was", "when the programme was held", "why you participated in the programme", "if you think participating in volunteering programmes increases one's self-confidence (why/why not?)"]],
  [33, "kindness", "Charity", "Talk about an act of charity you have done.", ["what did you do?", "who did you help?", "how it made you feel?", "do you think charity brings good impact to society? Why/Why not?"]],
  [34, "family", "Family", "Talk about a family member you admire the most.", ["who is the person?", "what quality does the person own?", "how the person has influenced you?", "do you think everyone should have someone to respect? Why/Why not?"]],
  [35, "special", "Birthday present", "Talk about a birthday present that you would like to get.", ["what is it?", "why do you want it?", "who should get you the present?", "do you think someone should receive a present in every birthday? Why/Why not?"]],
  [37, "shopping", "Shopping", "Talk about a place you like to shop.", ["where is it?", "why do you like it there?", "what do you like to buy?", "do you think teenagers should have the freedom to buy everything they want? Why/Why not?"]],
  [38, "media", "Reading", "Talk about your reading choice.", ["what is it?", "why do you like it?", "where do you go to read?", "do you think reading is a culture in your country? Why/Why not?"]],
  [39, "tech", "Computer", "Talk about a computer that you like.", ["what is it?", "why do you like it?", "how it helps in your daily life?", "do you think computers can replace a teacher in the future? Why/Why not?"]],
  [40, "special", "Unforgettable day", "Talk about an incident you can't forget.", ["what was it?", "how it happened?", "who involved?", "if you can turn back time, what will you change? Why/Why not?"]],
  [41, "media", "Movie", "Talk about a movie you like the most.", ["what is it?", "why do you like it?", "what do you learn from it?", "if you were given a chance, would you like to be an actor/actress? Why/Why not?"]],
  [42, "travel", "Travel", "Talk about a thing you need to do before travelling.", ["what is it?", "why is it important?", "how to solve a problem if it happens?", "do you think someone would be able to travel the world in 80 days? Why/Why not?"]],
  [43, "hobbies", "Picnic", "Talk about your experience having a picnic.", ["where was it?", "who involved?", "what activities that you enjoyed the most?", "do you think hanging out with family and friends can help you become a better person? Why/Why not?"]],
  [44, "environment", "Environment", "Talk about a way to protect the environment.", ["what is it?", "how will it help?", "why is it important?", "do you think you have done enough in keeping your area green? Why/Why not?"]],
  [45, "hobbies", "Pet", "Talk about a pet you own or would like to have.", ["what is it?", "why do you like it?", "how it helps you with your mood?", "if you were given a chance, will you exchange your life with your pet? Why/Why not?"]],
  [46, "family", "A new friend", "Talk about your experience making a new friend.", ["who he/she is", "where you met him/her", "what activities you enjoy doing with him/her", "how social media helps teenagers to make new friends"]],
  [47, "health", "A healthy snack", "Talk about a healthy snack that you eat.", ["what snack it is", "when you eat it", "where you buy it", "whether eating healthy snacks helps in students' overall diet (why/why not?)"]],
  [48, "shopping", "Advertisement", "Talk about an interesting advertisement you saw.", ["what advertisement it was", "where you saw it", "why it attracted you", "if you purchased the product advertised (why/why not?)"]],
  [49, "media", "Reading (a book)", "Talk about a book you read recently.", ["the title of the book", "when you read it", "why you bought it", "if e-books are better than physical books (why/why not?)"]],
  [50, "shopping", "A sale", "Talk about a product you bought during a sale.", ["what the product was", "when the sale was held", "why you bought the product", "how colours and images influence buyers"]],
  [51, "health", "Staying active", "Talk about an activity you do to stay active.", ["what the activity is", "when you do it", "how long you spend doing it", "whether having an active lifestyle is important for all age groups (why/why not?)"]],
  [52, "hobbies", "Favourite colour", "Talk about your favourite colour.", ["what colour it is", "what items you have in that colour", "why you like it", "if colours affect your mood (why/why not?)"]],
  [53, "shopping", "Favourite shop", "Talk about a shop you like to go to.", ["what shop it is", "what you usually buy there", "how often you go there", "if the shop introduced a membership programme, would you join it (why/why not?)"]],
  [54, "environment", "An environmental problem", "Talk about an environmental problem you know.", ["what the problem is", "where it happens", "how to prevent it", "if it is important to take care of the environment (why/why not?)"]],
  [55, "tech", "An electronic device", "Talk about an electronic device that you use.", ["what it is", "where you buy it", "why you like it", "how electronic devices make our lives easier"]],
  [56, "tech", "Favourite smartphone application", "Talk about your favourite smartphone application.", ["the name of the app", "how often you use it", "what you use it for", "how smartphone apps help people in their daily lives"]],
  [57, "tech", "Favourite way to communicate", "Talk about your preferred mode of communication with your friends.", ["what it is", "when you do it", "what topic you normally talk about", "whether or not online communication is better than face-to-face interaction"]],
  [58, "school", "A team project", "Talk about your experience doing a team project.", ["the name of the project", "your role in the team", "how you felt about it", "if you think it is good to have different opinions when handling the project (why/why not?)"]],
  [59, "school", "An important skill", "Talk about an important skill you learnt recently.", ["what the skill was", "where you learnt the skill", "whether the learning process was difficult", "why learning life skills is important for teenagers"]],
  [60, "family", "A home appliance", "Talk about a useful home electrical appliance you have used.", ["what it is", "how often you use it", "what you like about it", "if you think everyone should use home electrical appliances (why/why not?)"]],
  [61, "health", "A healthy lifestyle", "Talk about how to maintain a healthy lifestyle.", ["what you do to be healthy", "how often you practise it", "why you choose it", "how you can encourage more people to be healthy"]],
  [62, "health", "Stress management", "Talk about handling stress.", ["what makes you stressful", "how you reduce stress", "why it is important to manage stress", "how you can help a friend deal with stress"]],
  [63, "hobbies", "Watching sports", "Talk about a sport you enjoy watching.", ["what the sport is", "why you like watching it", "who you usually watch it with", "the key factors needed to be a good athlete"]],
  [64, "school", "Choosing a job", "Talk about a job that suits your personality the best.", ["what the job is", "why you choose it", "the challenges that might come with the job", "how we can prepare ourselves when looking for jobs"]],
  [65, "environment", "A place in nature", "Talk about your favourite nature spot.", ["where the place is", "how you got to know about it", "why you like the place", "whether nature spots should be free from development (why/why not?)"]],
  [66, "family", "Making new friends", "Talk about a friendship you started with someone.", ["who the person is", "how the friendship started", "what you like about him/her", "how teenagers can maintain strong friendships"]],
  [67, "health", "Cooking at home", "Talk about preparing meals at home.", ["who normally does the cooking at home", "what you do to help in the kitchen", "why it is important to have meals together", "if teenagers should learn how to cook (why/why not?)"]],
  [68, "health", "Sleeping habit", "Talk about your sleeping habit.", ["when you usually go to sleep", "what you normally do before going to sleep", "how to improve your sleeping habit", "why having a good sleeping habit is important for health"]],
  [69, "travel", "A meaningful holiday", "Talk about a meaningful holiday you recently had.", ["where was the holiday", "what did you do during the holiday", "who was involved", "why was that holiday meaningful"]],
  [70, "special", "Your biggest fear", "Talk about your biggest fear.", ["what you consider to be your biggest fear", "why you feel that way", "what you can do to overcome your fear", "if it is important for people to face their fears (why/why not?)"]],
  [71, "family", "Favourite family activity", "Talk about your favourite activity you like to do with your family.", ["what the activity is", "when do you normally do the activity", "if you enjoy this activity with your family", "why spending time with family is important"]],
  [72, "kindness", "A social activity you joined", "Talk about a social activity that you recently joined.", ["what social activity was it", "what you did there", "did you enjoy yourself (why/why not?)", "why social activities are important in developing students' responsibility"]],
  [73, "special", "Your best birthday gift", "Talk about the best birthday gift you have had so far.", ["what is it", "who gave it to you", "how you felt when you received it", "why it is the best birthday gift"]],
  [74, "shopping", "An expensive item", "Talk about an expensive item you have ever bought.", ["what the item is", "where you bought it", "how you benefit from the item", "whether spending money on expensive items is a good choice (why/why not?)"]],
  [75, "health", "My favourite exercise", "Talk about your favourite exercise.", ["what is it", "when and how often you do it", "reasons for choosing this exercise", "the benefits of doing this exercise"]],
];

export const cards: Card[] = raw.map(([n, theme, title, prompt, points]) => ({
  id: `p2-${n}`,
  theme,
  title,
  prompt,
  points,
}));

export const getCard = (id: string) => cards.find((c) => c.id === id);

export type Theme = {
  id: ThemeId;
  name: string;
  emoji: string;
  /** Ideas bank: useful vocabulary and points to say, shown during prep. */
  vocab: string[];
  ideas: string[];
};

export const themes: Theme[] = [
  {
    id: "family",
    name: "Family, Friends & Home",
    emoji: "🏠",
    vocab: ["supportive", "role model", "close-knit", "bond", "quality time", "household chores", "lifelong friendship", "look up to", "grow up in", "cosy"],
    ideas: [
      "Describe the person/place first (who, where, how long you have known them)",
      "Give one short story or example, not only adjectives",
      "Link to a value: responsibility, respect, gratitude, teamwork",
      "Answer the last bullet with an opinion + reason + example",
    ],
  },
  {
    id: "tech",
    name: "Technology & Social Media",
    emoji: "📱",
    vocab: ["convenient", "user-friendly", "stay connected", "addicted to", "screen time", "cyberbullying", "misinformation", "time-saving", "keep up with", "moderation"],
    ideas: [
      "Benefits: fast, convenient, easy access to information",
      "Risks: addiction, privacy, fake news, less face-to-face time",
      "Balance: use it wisely, set time limits, parents' guidance",
      "Give a personal example of how you use it daily",
    ],
  },
  {
    id: "shopping",
    name: "Shopping, Money & Ads",
    emoji: "🛍️",
    vocab: ["bargain", "impulse buying", "budget", "worth the money", "discount", "persuasive", "brand loyalty", "genuine", "compare prices", "overspend"],
    ideas: [
      "Say what you bought/saw, where, and when",
      "Online vs in-store: convenience vs trying before buying",
      "Be a smart consumer: plan, compare, avoid impulse buying",
      "Ads influence us through celebrities, colours and catchy slogans",
    ],
  },
  {
    id: "environment",
    name: "Environment & Nature",
    emoji: "🌳",
    vocab: ["pollution", "recycle", "sustainable", "global warming", "preserve", "raise awareness", "eco-friendly", "deforestation", "reduce, reuse, recycle", "ecosystem"],
    ideas: [
      "Explain the problem and its cause clearly",
      "Effects: on animals, health, the next generation",
      "Solutions: individual (recycle), school (campaigns), government (laws)",
      "End with a call to action: every small step counts",
    ],
  },
  {
    id: "health",
    name: "Health & Lifestyle",
    emoji: "💪",
    vocab: ["balanced diet", "well-being", "stay in shape", "stress-free", "sedentary", "nutritious", "routine", "boost my mood", "burn calories", "get enough rest"],
    ideas: [
      "Say what you do and how often (twice a week, every morning)",
      "Physical benefits and mental benefits",
      "Challenges: lack of time, laziness, homework, junk food",
      "Tips to stay motivated: friends, schedule, small goals",
    ],
  },
  {
    id: "travel",
    name: "Travel & Places",
    emoji: "✈️",
    vocab: ["breathtaking", "cultural heritage", "itinerary", "broaden my horizons", "local cuisine", "sightseeing", "unforgettable", "tourist attraction", "get away from", "immerse in"],
    ideas: [
      "Where, when, with whom, how you got there",
      "Describe what you saw/did/ate with sensory details",
      "What you learned: culture, independence, family bonding",
      "Preparation and safety before travelling",
    ],
  },
  {
    id: "school",
    name: "School, Skills & Future",
    emoji: "🎓",
    vocab: ["ambition", "pursue", "qualification", "gain experience", "teamwork", "time management", "step out of my comfort zone", "career path", "competitive", "self-confidence"],
    ideas: [
      "State your goal clearly, then give two reasons",
      "Mention who supports you (parents, teachers) and how",
      "Challenges you may face and how you will overcome them",
      "Skills needed: communication, discipline, problem-solving",
    ],
  },
  {
    id: "hobbies",
    name: "Hobbies, Sports & Leisure",
    emoji: "🎨",
    vocab: ["passionate about", "relieve stress", "hands-on", "look forward to", "pastime", "creativity", "teamwork", "keep me motivated", "a sense of achievement", "recharge"],
    ideas: [
      "How you started and how often you do it",
      "Who you do it with and why that makes it fun",
      "How it helps you: mood, skills, friendship, focus",
      "Does it waste time or help you grow? Give a balanced view",
    ],
  },
  {
    id: "kindness",
    name: "Kindness & Community",
    emoji: "🤝",
    vocab: ["selfless", "give back to society", "compassion", "make a difference", "volunteer", "generosity", "less fortunate", "community spirit", "heart-warming", "lend a helping hand"],
    ideas: [
      "Tell the story in order: what happened, who, how you felt",
      "Explain the impact on the other person AND on you",
      "Link to values: empathy, unity, gratitude",
      "Small acts can create a big change in society",
    ],
  },
  {
    id: "special",
    name: "Special Moments & Gifts",
    emoji: "🎁",
    vocab: ["memorable", "sentimental value", "overjoyed", "thoughtful", "treasure", "milestone", "taken aback", "a sense of pride", "cherish", "turning point"],
    ideas: [
      "Set the scene: when, where, who was there",
      "Use past tenses correctly and a few linking words (then, after that, finally)",
      "Say how you felt, then what you learned",
      "Close with the lesson or the value of the moment",
    ],
  },
  {
    id: "media",
    name: "Reading, Movies & Music",
    emoji: "🎬",
    vocab: ["captivating", "plot", "inspiring", "gripping", "genre", "soundtrack", "escape from reality", "enrich my vocabulary", "thought-provoking", "relatable"],
    ideas: [
      "Name it, say the genre, and who recommended it",
      "Describe what it is about in 2 to 3 sentences",
      "Lesson or feeling you take from it",
      "Compare formats: e-book vs printed book, cinema vs streaming",
    ],
  },
];

export const getTheme = (id: ThemeId) => themes.find((t) => t.id === id)!;
