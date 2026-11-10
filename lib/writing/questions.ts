// The question bank for essay marking: the SPM 2026 state trial-paper questions from Gary's Drive notes (Part 2 Q2 and Part 3 Q3/Q4/Q5).
// The question wording in those notes is a picture, so each entry holds what the marker needs: the content points taken from the
// "Question Analysis" table of each note, and any rule such as "the story MUST BEGIN with ...". Add new questions at the end of the array.
import { GENRE_LABEL, type Genre } from "./mark";

export type BankQuestion = {
  id: string;
  state: string;
  part: 2 | 3;
  qno: number;
  genre: Genre;
  topic: string; // for example "Relaxing Getaway" (empty when the note has no name)
  points: string[]; // the content points the student must cover
  rule: string | null; // for example: The story MUST BEGIN with: "..."
};

export const QUESTIONS: BankQuestion[] = [
  {
    "id": "johor-set-3-p2q2",
    "state": "Johor (Set 3)",
    "part": 2,
    "qno": 2,
    "genre": "essay",
    "topic": "Cyberbullying",
    "points": [
      "one example of cyberbullying on social media (give ONE example only)",
      "why online bullying happens – reason 1",
      "why online bullying happens – reason 2",
      "ways students can stop cyberbullying – \"ways\" is plural, so give at least two",
      "ways students can stop cyberbullying – way 2"
    ],
    "rule": null
  },
  {
    "id": "kedah-p2q2",
    "state": "Kedah",
    "part": 2,
    "qno": 2,
    "genre": "essay",
    "topic": "Entertainment Media and Learning",
    "points": [
      "state ONE type of entertainment media that helps your learning (one only)",
      "explain how this media helps you in your studies – point 1",
      "explain how this media helps you – point 2",
      "suggest ways students can control their screen time – \"ways\" is plural, so give at least two",
      "suggest ways – way 2"
    ],
    "rule": null
  },
  {
    "id": "kelantan-p2q2",
    "state": "Kelantan",
    "part": 2,
    "qno": 2,
    "genre": "essay",
    "topic": "A Movie That Stayed in My Mind",
    "points": [
      "describe a part of the movie that you will never forget (ONE part only)",
      "explain why this part was so special to you – reason 1",
      "why it was special – reason 2",
      "discuss whether movies can teach us important lessons about life – stand + point 1",
      "discuss – point 2"
    ],
    "rule": null
  },
  {
    "id": "negeri-sembilan-p2q2",
    "state": "Negeri Sembilan",
    "part": 2,
    "qno": 2,
    "genre": "essay",
    "topic": "Being Charitable",
    "points": [
      "state an activity you do to help people (ONE activity)",
      "describe why you help others – reason 1",
      "why you help others – reason 2",
      "explain how helping people can change a person – change 1",
      "how helping people can change a person – change 2"
    ],
    "rule": null
  },
  {
    "id": "perlis-p2q2",
    "state": "Perlis",
    "part": 2,
    "qno": 2,
    "genre": "essay",
    "topic": "Physical Appearance",
    "points": [
      "discuss why physical appearance is important to some people – reason 1",
      "why it is important – reason 2",
      "explain how appearance can affect self-confidence – effect 1",
      "how appearance can affect self-confidence – effect 2",
      "suggest ways to maintain physical appearance – way 1",
      "suggest ways – way 2"
    ],
    "rule": null
  },
  {
    "id": "sbp-p2q2",
    "state": "SBP",
    "part": 2,
    "qno": 2,
    "genre": "essay",
    "topic": "Popularity of Sports",
    "points": [
      "describe a sport that you enjoy watching (ONE sport)",
      "explain why the sport is popular – reason 1",
      "why popular – reason 2",
      "discuss whether watching sports can inspire people to be active – stand + point 1",
      "discuss – point 2"
    ],
    "rule": null
  },
  {
    "id": "sarawak-set-1-p2q2",
    "state": "Sarawak (Set 1)",
    "part": 2,
    "qno": 2,
    "genre": "essay",
    "topic": "Travelling",
    "points": [
      "a place you dream of visiting (ONE place)",
      "the reasons of your choice – reason 1",
      "reasons – reason 2",
      "ways to encourage people to travel more in their own country – way 1",
      "ways – way 2"
    ],
    "rule": null
  },
  {
    "id": "terengganu-p2q2",
    "state": "Terengganu",
    "part": 2,
    "qno": 2,
    "genre": "essay",
    "topic": "Managing Time Effectively",
    "points": [
      "say ONE thing that often distracts you from your studies (give only one)",
      "explain how you overcome this distraction – step 1",
      "how you overcome it – step 2",
      "discuss why students should do important tasks first – reason 1",
      "why do important tasks first – reason 2"
    ],
    "rule": null
  },
  {
    "id": "wpkl-p2q2",
    "state": "WPKL",
    "part": 2,
    "qno": 2,
    "genre": "essay",
    "topic": "Teenagers Contributing to Society",
    "points": [
      "the different ways teenagers can help – \"ways\" is plural, so give at least two (way 1)",
      "ways teenagers can help – way 2",
      "the benefits of community service – \"benefits\" is plural (benefit 1)",
      "benefits of community service – benefit 2",
      "ONE way to encourage more teenagers to get involved in charity events (give only one)"
    ],
    "rule": null
  },
  {
    "id": "johor-set-3-p3q3",
    "state": "Johor (Set 3)",
    "part": 3,
    "qno": 3,
    "genre": "review",
    "topic": "Movie Review",
    "points": [
      "What is the title of the movie?",
      "What is the genre of the movie?",
      "Explain what you learnt from the movie – lesson 1",
      "Explain what you learnt from the movie – lesson 2",
      "Would you recommend the movie to your friends? Why? – reason 1",
      "Why? – reason 2"
    ],
    "rule": null
  },
  {
    "id": "johor-set-3-p3q4",
    "state": "Johor (Set 3)",
    "part": 3,
    "qno": 4,
    "genre": "report",
    "topic": "",
    "points": [
      "where the programme was held",
      "whether the place was suitable (give a reason)",
      "a common cyber safety issue highlighted in the programme (only ONE issue)",
      "ways to improve your online safety – \"ways\" is plural, so give at least two",
      "ways to improve your online safety – way 2"
    ],
    "rule": null
  },
  {
    "id": "johor-set-3-p3q5",
    "state": "Johor (Set 3)",
    "part": 3,
    "qno": 5,
    "genre": "story",
    "topic": "",
    "points": [
      "write what the hidden message was",
      "explain how it risked Ammar throughout the adventure – risk 1",
      "how it risked Ammar – risk 2 (\"throughout\" = more than one moment)",
      "how the experience influenced him and his friends to face challenges in life – influence 1",
      "influence 2 (remember: him AND his friends)"
    ],
    "rule": "The story MUST begin with: \"Ammar realised the message was the beginning of his adventure…\""
  },
  {
    "id": "kedah-p3q3",
    "state": "Kedah",
    "part": 3,
    "qno": 3,
    "genre": "story",
    "topic": "",
    "points": [
      "an unexpected event that happened during your free time",
      "the unexpected event – detail / your reaction",
      "what you decided to do – decision 1",
      "what you decided to do – decision 2",
      "result of the decision (links the story to the ending)"
    ],
    "rule": "The story MUST END with: \"… I realised that time is more valuable than I thought.\""
  },
  {
    "id": "kedah-p3q4",
    "state": "Kedah",
    "part": 3,
    "qno": 4,
    "genre": "review",
    "topic": "Animal Shelter",
    "points": [
      "the location of your visit",
      "the purpose of your visit",
      "the activities you had there",
      "the experiences you had there",
      "your opinions",
      "suggestions for improvement"
    ],
    "rule": null
  },
  {
    "id": "kedah-p3q5",
    "state": "Kedah",
    "part": 3,
    "qno": 5,
    "genre": "report",
    "topic": "Spending Habits",
    "points": [
      "the purpose of the survey",
      "the findings on pupils' spending habits – finding 1",
      "the findings – finding 2 (\"findings\" is plural)",
      "suggestions to improve pupils' financial awareness – suggestion 1",
      "suggestions – suggestion 2"
    ],
    "rule": null
  },
  {
    "id": "kelantan-p3q3",
    "state": "Kelantan",
    "part": 3,
    "qno": 3,
    "genre": "story",
    "topic": "The Mysterious Gate",
    "points": [
      "what was beyond the gate",
      "how Isaac reacted to it",
      "how it affected Isaac's life – effect 1",
      "how it affected Isaac's life – effect 2",
      "the consequences that followed"
    ],
    "rule": "The story MUST BEGIN with: \"Isaac stepped through the mysterious gate and encountered…\""
  },
  {
    "id": "kelantan-p3q4",
    "state": "Kelantan",
    "part": 3,
    "qno": 4,
    "genre": "report",
    "topic": "International Students Visit",
    "points": [
      "number of students involved",
      "their nationalities",
      "different activities held during the week – activity 1",
      "different activities – activity 2",
      "lessons learnt from the programme – lesson 1",
      "lessons learnt – lesson 2"
    ],
    "rule": null
  },
  {
    "id": "kelantan-p3q5",
    "state": "Kelantan",
    "part": 3,
    "qno": 5,
    "genre": "review",
    "topic": "Live Performance",
    "points": [
      "Who was the performer?",
      "What kind of performance was it?",
      "Did you enjoy the performance? Why? – reason 1",
      "Why? – reason 2",
      "Why? – reason 3"
    ],
    "rule": null
  },
  {
    "id": "negeri-sembilan-p3q3",
    "state": "Negeri Sembilan",
    "part": 3,
    "qno": 3,
    "genre": "story",
    "topic": "The Robot",
    "points": [
      "what the robot did next – action 1",
      "what the robot did next – action 2",
      "how you handled the situation – action 1",
      "how you handled the situation – action 2",
      "outcome (closes the plot)"
    ],
    "rule": "The story MUST BEGIN with: \"The robot in the corner of the room suddenly blinked …\""
  },
  {
    "id": "negeri-sembilan-p3q4",
    "state": "Negeri Sembilan",
    "part": 3,
    "qno": 4,
    "genre": "review",
    "topic": "Shopping Mall",
    "points": [
      "State the name of the shopping mall",
      "State the location of the shopping mall",
      "Tell us about the facilities",
      "Tell us about the services",
      "Would you recommend it to others? Why? – reason 1",
      "Why? – reason 2"
    ],
    "rule": null
  },
  {
    "id": "negeri-sembilan-p3q5",
    "state": "Negeri Sembilan",
    "part": 3,
    "qno": 5,
    "genre": "article",
    "topic": "Eco-friendly Lifestyle",
    "points": [
      "Do you believe in an eco-friendly lifestyle? Tell us about an eco-friendly practice that you do (ONE practice)",
      "What inspired you to start? – inspiration 1",
      "What inspired you to start? – inspiration 2",
      "Why should we adapt to this way of life? – reason 1",
      "Why should we adapt? – reason 2"
    ],
    "rule": null
  },
  {
    "id": "perlis-p3q3",
    "state": "Perlis",
    "part": 3,
    "qno": 3,
    "genre": "report",
    "topic": "Animal Shelter Visit",
    "points": [
      "aims of the visit – aim 1 (\"aims\" is plural)",
      "aims of the visit – aim 2",
      "TWO activities carried out – activity 1",
      "TWO activities – activity 2 (exactly two)",
      "suggestions to help and support animal shelters – suggestion 1",
      "suggestions – suggestion 2"
    ],
    "rule": null
  },
  {
    "id": "perlis-p3q4",
    "state": "Perlis",
    "part": 3,
    "qno": 4,
    "genre": "article",
    "topic": "Technology and the Environment",
    "points": [
      "describe an environmental problem faced today (ONE problem)",
      "give reasons why this problem is happening – reason 1",
      "reasons – reason 2",
      "explain how technology can help solve environmental problems – way 1",
      "how technology can help – way 2"
    ],
    "rule": null
  },
  {
    "id": "perlis-p3q5",
    "state": "Perlis",
    "part": 3,
    "qno": 5,
    "genre": "story",
    "topic": "The Abandoned House",
    "points": [
      "describe what happened that scared you and the group – event 1",
      "what happened that scared you – event 2",
      "share what you learned about respecting local culture and traditions – lesson 1",
      "what you learned – lesson 2"
    ],
    "rule": "A group of friends explores an old, abandoned building. The story MUST END with: \"…in that chilling silence, I finally understood why the elders warned us not to go there\"."
  },
  {
    "id": "sbp-p3q3",
    "state": "SBP",
    "part": 3,
    "qno": 3,
    "genre": "article",
    "topic": "Teenagers and Technology",
    "points": [
      "state a technology commonly used by teenagers (ONE technology)",
      "explain the benefits – benefit 1",
      "benefits – benefit 2",
      "discuss how teenagers can use it responsibly – way 1",
      "use it responsibly – way 2"
    ],
    "rule": null
  },
  {
    "id": "sbp-p3q4",
    "state": "SBP",
    "part": 3,
    "qno": 4,
    "genre": "story",
    "topic": "Arif",
    "points": [
      "describe what the person asked Arif to do",
      "what Arif did (supports C1)",
      "explain how the action affected his relationship with his family – effect 1",
      "effect 2",
      "effect 3"
    ],
    "rule": "The story MUST BEGIN with: \"Arif's heart stopped beating when he heard someone call out his name.\""
  },
  {
    "id": "sbp-p3q5",
    "state": "SBP",
    "part": 3,
    "qno": 5,
    "genre": "review",
    "topic": "Popular Food",
    "points": [
      "What is the name of the food?",
      "How did you find out about it?",
      "What makes the food special? – point 1",
      "What makes it special? – point 2",
      "Would you recommend it to others and why? – reason 1",
      "Why? – reason 2"
    ],
    "rule": null
  },
  {
    "id": "sarawak-set-1-p3q3",
    "state": "Sarawak (Set 1)",
    "part": 3,
    "qno": 3,
    "genre": "review",
    "topic": "Comic Book",
    "points": [
      "What is the title of the comic book?",
      "Who is the author?",
      "What makes the comic book interesting? – point 1",
      "What makes it interesting? – point 2",
      "Would you recommend it to your friends and why? – reason 1",
      "Why? – reason 2"
    ],
    "rule": null
  },
  {
    "id": "sarawak-set-1-p3q4",
    "state": "Sarawak (Set 1)",
    "part": 3,
    "qno": 4,
    "genre": "report",
    "topic": "E-Learning Day",
    "points": [
      "what activities were carried out – activity 1",
      "activities – activity 2",
      "why was it successful / unsuccessful? (choose ONE stand) – reason 1",
      "why successful – reason 2",
      "how to improve the event in the future – suggestion 1",
      "how to improve – suggestion 2"
    ],
    "rule": null
  },
  {
    "id": "sarawak-set-1-p3q5",
    "state": "Sarawak (Set 1)",
    "part": 3,
    "qno": 5,
    "genre": "story",
    "topic": "The Unexpected Gift",
    "points": [
      "what the unexpected gift Farhana received was (ONE gift)",
      "how the gift impacted Farhana's life – impact 1",
      "impact 2",
      "impact 3",
      "impact 4 (long-term)"
    ],
    "rule": "The story MUST BEGIN with: \"Farhana was watching television when the doorbell rang. …\""
  },
  {
    "id": "terengganu-p3q3",
    "state": "Terengganu",
    "part": 3,
    "qno": 3,
    "genre": "article",
    "topic": "Teenagers and Gadgets",
    "points": [
      "what influences your choice of gadgets – factor 1",
      "what influences your choice – factor 2",
      "which is more important – features or price? (stand + reason)",
      "tell us how gadgets help you in your daily life – way 1",
      "how gadgets help in daily life – way 2"
    ],
    "rule": null
  },
  {
    "id": "terengganu-p3q4",
    "state": "Terengganu",
    "part": 3,
    "qno": 4,
    "genre": "story",
    "topic": "Asyraf and the Miracle",
    "points": [
      "what he felt when he witnessed the miracle – feeling 1",
      "what he felt – feeling 2",
      "how the experience changed his view on kindness – change 1",
      "how it changed his view – change 2"
    ],
    "rule": "The story MUST BEGIN with: \"Asyraf stood speechless as he watched the miracle unfold before his eyes...\""
  },
  {
    "id": "terengganu-p3q5",
    "state": "Terengganu",
    "part": 3,
    "qno": 5,
    "genre": "report",
    "topic": "Clean-up Activity",
    "points": [
      "mention when the programme took place",
      "describe what you did during the programme – activity 1",
      "what you did – activity 2",
      "suggest ways to make clean-up practices a habit – \"ways\" is plural (way 1)",
      "ways to make it a habit – way 2"
    ],
    "rule": null
  },
  {
    "id": "wpkl-p3q3",
    "state": "WPKL",
    "part": 3,
    "qno": 3,
    "genre": "article",
    "topic": "How Technology Changed Communication",
    "points": [
      "explain how technology has changed communication – change 1",
      "how technology has changed communication – change 2",
      "describe ONE positive effect of this change (only one)",
      "describe ONE negative effect of this change (only one)",
      "suggest ONE way to ensure young people use technology responsibly (only one)"
    ],
    "rule": null
  },
  {
    "id": "wpkl-p3q4",
    "state": "WPKL",
    "part": 3,
    "qno": 4,
    "genre": "review",
    "topic": "Relaxing Getaway",
    "points": [
      "a description of the place",
      "its most interesting facility (ONE facility)",
      "your personal experience during the stay – experience 1",
      "personal experience – experience 2",
      "would you recommend the place to others? why? – stand + reason 1",
      "why – reason 2"
    ],
    "rule": null
  },
  {
    "id": "wpkl-p3q5",
    "state": "WPKL",
    "part": 3,
    "qno": 5,
    "genre": "story",
    "topic": "Shattering Glass",
    "points": [
      "describe what happened",
      "describe the characters involved",
      "show how the situation was resolved – step 1",
      "how it was resolved – step 2",
      "how it was resolved – result"
    ],
    "rule": "The story MUST BEGIN with: \"The silence of the night was broken by the sound of shattering glass.\""
  }
] as BankQuestion[];

export const questionLabel = (q: BankQuestion) => `${q.state} · Q${q.qno}${q.topic ? ` · ${q.topic}` : ""}`;

export const getQuestion = (id: string) => QUESTIONS.find((q) => q.id === id);

export const questionsFor = (part: number, genre: Genre) => QUESTIONS.filter((q) => q.part === part && q.genre === genre);

// The text sent to the marker (and saved with the essay): what was asked, as a list of content points the essay must cover.
export function questionText(q: BankQuestion): string {
  const head = `${q.state} SPM 2026 trial paper, Part ${q.part} Question ${q.qno} (${GENRE_LABEL[q.genre]}${q.topic ? `: ${q.topic}` : ""}).`;
  const pts = q.points.map((p, i) => `${i + 1}. ${p}`).join("\n");
  const rule = q.rule ? `\nExtra rule: ${q.rule}` : "";
  return `${head}\nThe essay must cover these content points:\n${pts}${rule}`;
}
