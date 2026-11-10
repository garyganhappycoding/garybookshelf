// The question bank for essay marking: the SPM 2026 state trial-paper questions from Gary's Drive notes (Part 2 Q2 and Part 3 Q3/Q4/Q5).
// The question wording in those notes is a picture, so each entry holds what the marker needs: the content points taken from the
// "Question Analysis" table of each note, and any rule such as "the story MUST BEGIN with ...". Add new questions at the end of the array.
import { GENRE_LABEL, type Genre } from "./mark";
import type { Requirement } from "./requirements";

export type BankQuestion = {
  id: string;
  state: string;
  part: 2 | 3;
  qno: number;
  genre: Genre;
  topic: string; // for example "Relaxing Getaway" (empty when the note has no name)
  points: string[]; // the content points the student must cover
  rule: string | null; // for example: The story MUST BEGIN with: "..."
  requirements?: Requirement[]; // what each point really demands (written once by the question-reading step, so marking can skip it)
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
    "rule": null,
    "requirements": [
      {
        "asked": "Give one example of cyberbullying on social media",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Provide a reason why online bullying happens (reason 1)",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Provide a second reason why online bullying happens (reason 2)",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "List ways students can stop cyberbullying (at least two ways)",
        "kind": "advice_to_reader",
        "number": "at_least_two",
        "needs_reason": false
      },
      {
        "asked": "Give a second specific way students can stop cyberbullying (way 2)",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "state ONE type of entertainment media that helps your learning",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "explain how this media helps you in your studies – point 1",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "explain how this media helps you – point 2",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "suggest ways students can control their screen time",
        "kind": "advice_to_reader",
        "number": "at_least_two",
        "needs_reason": false
      },
      {
        "asked": "suggest ways – way 2",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "Describe a part of the movie that you will never forget (ONE part only).",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Explain why this part was so special to you – reason 1.",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Explain why this part was special – reason 2.",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Discuss whether movies can teach us important lessons about life – give your stance and point 1.",
        "kind": "opinion",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Discuss a second point supporting your view on whether movies can teach important life lessons – point 2.",
        "kind": "opinion",
        "number": "one",
        "needs_reason": true
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "state an activity you do to help people",
        "kind": "own_habit_or_experience",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "describe why you help others – reason 1",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "why you help others – reason 2",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "explain how helping people can change a person – change 1",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "how helping people can change a person – change 2",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "discuss why physical appearance is important to some people – reason 1",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "discuss why physical appearance is important – reason 2",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "explain how appearance can affect self‑confidence – effect 1",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "explain how appearance can affect self‑confidence – effect 2",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "suggest ways to maintain physical appearance – way 1",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "suggest ways to maintain physical appearance – way 2",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "describe a sport that you enjoy watching",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "explain why the sport is popular (reason 1)",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "explain why the sport is popular (reason 2)",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "discuss whether watching sports can inspire people to be active – provide a stance and point 1",
        "kind": "opinion",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "discuss whether watching sports can inspire people to be active – provide point 2",
        "kind": "opinion",
        "number": "one",
        "needs_reason": true
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "a place you dream of visiting",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "reason 1 for your choice",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "reason 2 for your choice",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "way 1 to encourage people to travel more in their own country",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "way 2 to encourage people to travel more in their own country",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "One thing that often distracts you from your studies",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Step 1 of how you overcome this distraction",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Step 2 of how you overcome this distraction",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Reason 1 why students should do important tasks first",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Reason 2 why students should do important tasks first",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "different ways teenagers can help",
        "kind": "description",
        "number": "at_least_two",
        "needs_reason": false
      },
      {
        "asked": "a second way teenagers can help",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "benefits of community service",
        "kind": "description",
        "number": "at_least_two",
        "needs_reason": false
      },
      {
        "asked": "a second benefit of community service",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "one way to encourage more teenagers to get involved in charity events",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "What is the title of the movie?",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "What is the genre of the movie?",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Explain what you learnt from the movie – lesson 1",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Explain what you learnt from the movie – lesson 2",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Would you recommend the movie to your friends?",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Why would you recommend the movie? – reason 1",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Why would you recommend the movie? – reason 2",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "where the programme was held",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "whether the place was suitable",
        "kind": "opinion",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "a common cyber safety issue highlighted in the programme",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "ways to improve your online safety",
        "kind": "description",
        "number": "at_least_two",
        "needs_reason": false
      },
      {
        "asked": "way 2 to improve your online safety",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": "The story MUST begin with: \"Ammar realised the message was the beginning of his adventure…\"",
    "requirements": [
      {
        "asked": "write what the hidden message was",
        "kind": "description",
        "needs_reason": false,
        "number": "one"
      },
      {
        "asked": "explain how it risked Ammar throughout the adventure – risk 1",
        "kind": "explanation_or_reason",
        "needs_reason": true,
        "number": "one"
      },
      {
        "asked": "explain how it risked Ammar – risk 2",
        "kind": "explanation_or_reason",
        "needs_reason": true,
        "number": "one"
      },
      {
        "asked": "explain how the experience influenced Ammar to face challenges in life – influence 1",
        "kind": "explanation_or_reason",
        "needs_reason": true,
        "number": "one"
      },
      {
        "asked": "explain how the experience influenced his friends to face challenges in life – influence 2",
        "kind": "explanation_or_reason",
        "needs_reason": true,
        "number": "one"
      },
      {
        "asked": "begin the story with the sentence \"Ammar realised the message was the beginning of his adventure…\"",
        "kind": "description",
        "needs_reason": false,
        "number": "one"
      }
    ]
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
    "rule": "The story MUST END with: \"… I realised that time is more valuable than I thought.\"",
    "requirements": [
      {
        "asked": "Describe an unexpected event that happened during your free time",
        "kind": "description",
        "needs_reason": false,
        "number": "one"
      },
      {
        "asked": "Give details of the unexpected event and your reaction to it",
        "kind": "description",
        "needs_reason": false,
        "number": "one"
      },
      {
        "asked": "State the first decision you made in response to the event",
        "kind": "description",
        "needs_reason": false,
        "number": "one"
      },
      {
        "asked": "State the second decision you made in response to the event",
        "kind": "description",
        "needs_reason": false,
        "number": "one"
      },
      {
        "asked": "Explain the result of your decisions and link it to the story’s ending",
        "kind": "description",
        "needs_reason": false,
        "number": "one"
      },
      {
        "asked": "End the story with the exact sentence: \"… I realised that time is more valuable than I thought.\"",
        "kind": "other",
        "needs_reason": false,
        "number": "one"
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "the location of your visit",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "the purpose of your visit",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "the activities you had there",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "the experiences you had there",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "your opinions",
        "kind": "opinion",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "suggestions for improvement",
        "kind": "advice_to_reader",
        "number": "any",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "state the purpose of the survey",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "present the first finding on pupils' spending habits",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "present the second finding on pupils' spending habits",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "give the first suggestion to improve pupils' financial awareness",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "give the second suggestion to improve pupils' financial awareness",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": "The story MUST BEGIN with: \"Isaac stepped through the mysterious gate and encountered…\"",
    "requirements": [
      {
        "asked": "Describe what was beyond the gate",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Describe how Isaac reacted to it",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Describe the first effect on Isaac's life",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Describe the second effect on Isaac's life",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Describe the consequences that followed",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Begin the story with the exact sentence: \"Isaac stepped through the mysterious gate and encountered…\"",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "state the number of students involved",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "state the nationalities of the students",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "describe activity 1 that was held during the week",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "describe activity 2 that was held during the week",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "state lesson 1 learned from the programme",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "state lesson 2 learned from the programme",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "Who was the performer?",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "What kind of performance was it?",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Reason 1 for why you enjoyed the performance",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Reason 2 for why you enjoyed the performance",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Reason 3 for why you enjoyed the performance",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": "The story MUST BEGIN with: \"The robot in the corner of the room suddenly blinked …\"",
    "requirements": [
      {
        "asked": "Describe what the robot did next – action 1",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "Describe what the robot did next – action 2",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "Describe how you handled the situation – action 1",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "Describe how you handled the situation – action 2",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "Provide the outcome that closes the plot",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "Begin the story with the exact phrase \"The robot in the corner of the room suddenly blinked …\"",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "State the name of the shopping mall",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "State the location of the shopping mall",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Tell us about the facilities",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "Tell us about the services",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "Would you recommend it to others? (reason 1)",
        "kind": "opinion",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Why? (reason 2)",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "State whether you believe in an eco‑friendly lifestyle",
        "kind": "opinion",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Describe one eco‑friendly practice that you do",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Give the first inspiration that made you start the practice",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Give the second inspiration that made you start the practice",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Explain the first reason why people should adapt to this way of life",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Explain the second reason why people should adapt to this way of life",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "state aim 1 of the visit",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "state aim 2 of the visit",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "describe activity 1 carried out during the visit",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "describe activity 2 carried out during the visit",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "give suggestion 1 to help and support animal shelters",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "give suggestion 2 to help and support animal shelters",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "describe an environmental problem faced today",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "give a reason why this problem is happening",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "give another reason why this problem is happening",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "explain how technology can help solve environmental problems (first way)",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "explain how technology can help solve environmental problems (second way)",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": "A group of friends explores an old, abandoned building. The story MUST END with: \"…in that chilling silence, I finally understood why the elders warned us not to go there\".",
    "requirements": [
      {
        "asked": "describe what happened that scared you and the group – event 1",
        "kind": "description",
        "needs_reason": false,
        "number": "one"
      },
      {
        "asked": "describe what happened that scared you – event 2",
        "kind": "description",
        "needs_reason": false,
        "number": "one"
      },
      {
        "asked": "share what you learned about respecting local culture and traditions – lesson 1",
        "kind": "description",
        "needs_reason": false,
        "number": "one"
      },
      {
        "asked": "share what you learned – lesson 2",
        "kind": "description",
        "needs_reason": false,
        "number": "one"
      },
      {
        "asked": "end the story with the exact sentence \"…in that chilling silence, I finally understood why the elders warned us not to go there\"",
        "kind": "description",
        "needs_reason": false,
        "number": "one"
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "state a technology commonly used by teenagers",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "explain the first benefit of the technology",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "explain the second benefit of the technology",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "discuss a way teenagers can use the technology responsibly (first way)",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "discuss another way teenagers can use the technology responsibly (second way)",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": "The story MUST BEGIN with: \"Arif's heart stopped beating when he heard someone call out his name.\"",
    "requirements": [
      {
        "asked": "Describe what the person asked Arif to do",
        "kind": "description",
        "needs_reason": false,
        "number": "any"
      },
      {
        "asked": "State what Arif did (supports C1)",
        "kind": "description",
        "needs_reason": false,
        "number": "any"
      },
      {
        "asked": "Explain how the action affected his relationship with his family – effect 1",
        "kind": "explanation_or_reason",
        "needs_reason": true,
        "number": "any"
      },
      {
        "asked": "Explain how the action affected his relationship with his family – effect 2",
        "kind": "explanation_or_reason",
        "needs_reason": true,
        "number": "any"
      },
      {
        "asked": "Explain how the action affected his relationship with his family – effect 3",
        "kind": "explanation_or_reason",
        "needs_reason": true,
        "number": "any"
      },
      {
        "asked": "Begin the story with the sentence: \"Arif's heart stopped beating when he heard someone call out his name.\"",
        "kind": "description",
        "needs_reason": false,
        "number": "one"
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "What is the name of the food?",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "How did you find out about it?",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "What makes the food special? – point 1",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "What makes it special? – point 2",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Would you recommend it to others and why? – reason 1",
        "kind": "opinion",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Why? – reason 2",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "What is the title of the comic book?",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Who is the author?",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "What makes the comic book interesting? – point 1",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "What makes the comic book interesting? – point 2",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Would you recommend it to your friends and why? – reason 1",
        "kind": "opinion",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Why? – reason 2",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "Describe activity 1 that was carried out during the E‑Learning Day.",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Describe activity 2 that was carried out during the E‑Learning Day.",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "State why the event was successful or unsuccessful (choose one stance).",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Explain why the event was successful.",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "Give a suggestion on how to improve the event in the future.",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Give another suggestion on how to improve the event in the future.",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": "The story MUST BEGIN with: \"Farhana was watching television when the doorbell rang. …\"",
    "requirements": [
      {
        "asked": "State what the unexpected gift Farhana received was",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Describe impact 1 of the gift on Farhana's life",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Describe impact 2 of the gift on Farhana's life",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Describe impact 3 of the gift on Farhana's life",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Describe impact 4 (long‑term) of the gift on Farhana's life",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Begin the story with the exact sentence: \"Farhana was watching television when the doorbell rang. …\"",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "what influences your choice of gadgets – factor 1",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "what influences your choice of gadgets – factor 2",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "which is more important – features or price?",
        "kind": "opinion",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "how gadgets help you in your daily life – way 1",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "how gadgets help you in your daily life – way 2",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": "The story MUST BEGIN with: \"Asyraf stood speechless as he watched the miracle unfold before his eyes...\"",
    "requirements": [
      {
        "asked": "Describe what he felt when he witnessed the miracle – feeling 1",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Describe what he felt – feeling 2",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Explain how the experience changed his view on kindness – change 1",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Explain how it changed his view – change 2",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "Begin the story with the exact sentence: \"Asyraf stood speechless as he watched the miracle unfold before his eyes...\"",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "mention when the programme took place",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "describe what you did during the programme – activity 1",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "describe what you did during the programme – activity 2",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "suggest a way to make clean-up practices a habit (way 1)",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "suggest another way to make clean-up practices a habit (way 2)",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "explain how technology has changed communication – change 1",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "explain how technology has changed communication – change 2",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "describe ONE positive effect of this change",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "describe ONE negative effect of this change",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "suggest ONE way to ensure young people use technology responsibly",
        "kind": "advice_to_reader",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": null,
    "requirements": [
      {
        "asked": "a description of the place",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "its most interesting facility (ONE facility)",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "your personal experience during the stay – experience 1",
        "kind": "own_habit_or_experience",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "personal experience – experience 2",
        "kind": "own_habit_or_experience",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "would you recommend the place to others? why? – stand + reason 1",
        "kind": "opinion",
        "number": "one",
        "needs_reason": true
      },
      {
        "asked": "why – reason 2",
        "kind": "explanation_or_reason",
        "number": "one",
        "needs_reason": false
      }
    ]
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
    "rule": "The story MUST BEGIN with: \"The silence of the night was broken by the sound of shattering glass.\"",
    "requirements": [
      {
        "asked": "describe what happened",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "describe the characters involved",
        "kind": "description",
        "number": "any",
        "needs_reason": false
      },
      {
        "asked": "show how the situation was resolved – step 1",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "show how the situation was resolved – step 2",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "show how the situation was resolved – result",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      },
      {
        "asked": "begin the story with the sentence \"The silence of the night was broken by the sound of shattering glass.\"",
        "kind": "description",
        "number": "one",
        "needs_reason": false
      }
    ]
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
