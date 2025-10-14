import { useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import styles from "../styles/miscStyles";

const randomIndex = (length, exclude) => {
  if (length <= 1) {
    return 0;
  }
  let index = Math.floor(Math.random() * length);
  if (exclude !== undefined && length > 1) {
    while (index === exclude) {
      index = Math.floor(Math.random() * length);
    }
  }
  return index;
};

const WAIFU_POOL = [
  {
    name: "Aiko Hoshizora",
    image: "https://cdn.myanimelist.net/images/characters/3/310905.jpg",
    traits: ["Builds pocket mechs", "Sleeps under the stars", "Tea ceremony ace"],
    catchphrase: "Every nebula hides a promise.",
  },
  {
    name: "Rin Arashi",
    image: "https://cdn.myanimelist.net/images/characters/13/279455.jpg",
    traits: ["Battle chef", "Lightning swordswoman", "Notebook sketcher"],
    catchphrase: "Storms clear the path for dreamers.",
  },
  {
    name: "Mika Tsukino",
    image: "https://cdn.myanimelist.net/images/characters/15/457356.jpg",
    traits: ["Retro gamer", "Ambient music DJ", "Chibi mascot designer"],
    catchphrase: "Glitch the rules, glow in the dark.",
  },
];

const QUOTE_POOL = [
  {
    line: "The moment you think of giving up, think of the reason you held on so long.",
    source: "Natsu Dragneel, Fairy Tail",
  },
  {
    line: "A lesson without pain is meaningless. You cannot gain something without sacrificing something else.",
    source: "Edward Elric, Fullmetal Alchemist",
  },
  {
    line: "Whatever you lose, you will find it again. But what you throw away you will never get back.",
    source: "Gintoki Sakata, Gintama",
  },
];

const GAME_POOL = [
  {
    id: "guess-1",
    title: "Guess the Anime",
    prompt: "Two brothers search for redemption after breaking the law of equivalent exchange.",
    answers: ["Fullmetal Alchemist", "Blue Exorcist", "Trigun"],
    correctIndex: 0,
  },
  {
    id: "guess-2",
    title: "Who Said This Line?",
    prompt: "\"I will become the Hokage and show everyone my true power.\"",
    answers: ["Naruto Uzumaki", "Ichigo Kurosaki", "Eren Yeager"],
    correctIndex: 0,
  },
  {
    id: "guess-3",
    title: "Guess the Anime",
    prompt: "A manager and a tiny titan setter rebuild a fallen volleyball team.",
    answers: ["Haikyuu", "Kuroko's Basketball", "Yowamushi Pedal"],
    correctIndex: 0,
  },
];

const NEWS_FEED = [
  {
    id: "news-1",
    headline: "New trailer drops for Solo Leveling: Arise anime adaptation.",
    source: "Crunchyroll News",
    timeAgo: "3 hours ago",
  },
  {
    id: "news-2",
    headline: "Anime Expo announces expanded indie creator showcase for next summer.",
    source: "Anime News Network",
    timeAgo: "1 day ago",
  },
  {
    id: "news-3",
    headline: "Frieren: Beyond Journey's End wins best fantasy at annual Crystal Awards.",
    source: "Otaku Times",
    timeAgo: "2 days ago",
  },
];

const Miscellaneous = () => {
  const [waifuIndex, setWaifuIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [gameIndex, setGameIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [traceStatus, setTraceStatus] = useState("Waiting for upload.");

  const waifu = useMemo(() => WAIFU_POOL[waifuIndex], [waifuIndex]);
  const quote = useMemo(() => QUOTE_POOL[quoteIndex], [quoteIndex]);
  const game = useMemo(() => GAME_POOL[gameIndex], [gameIndex]);

  const handleNextWaifu = () => {
    setWaifuIndex((prev) => randomIndex(WAIFU_POOL.length, prev));
  };

  const handleNextQuote = () => {
    setQuoteIndex((prev) => randomIndex(QUOTE_POOL.length, prev));
  };

  const handleNextGame = () => {
    setGameIndex((prev) => randomIndex(GAME_POOL.length, prev));
    setSelectedAnswer(null);
  };

  const handleGameAnswer = (index) => {
    setSelectedAnswer(index);
  };

  const handleTraceUpload = () => {
    setTraceStatus("Analyzing screenshot... Matched to Episode 19 of Demon Slayer.");
  };

  const handleSaveWaifu = () => {
    console.log("Saved waifu:", waifu.name);
  };

  const handleShare = (payload) => {
    console.log("Share payload:", payload);
  };

  const gameFeedback = useMemo(() => {
    if (selectedAnswer === null) {
      return "Pick an answer to reveal the result.";
    }
    if (selectedAnswer === game.correctIndex) {
      return "Correct. You are on a roll.";
    }
    return "Not quite. Give it another shot.";
  }, [selectedAnswer, game.correctIndex]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Misc Playground</Text>
        <Text style={styles.pageSubtitle}>
          A creative sandbox for experiments, API showcases, and community surprises.
        </Text>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Waifu Generator</Text>
          <Text style={styles.cardSubtitle}>Pull a new companion from the data cosmos.</Text>
        </View>
        <View style={styles.waifuContent}>
          <Image source={{ uri: waifu.image }} style={styles.waifuPortrait} />
          <View style={styles.waifuDetails}>
            <Text style={styles.waifuName}>{waifu.name}</Text>
            <Text style={styles.waifuCatch}>{waifu.catchphrase}</Text>
            <View style={styles.traitRow}>
              {waifu.traits.map((trait) => (
                <View key={trait} style={styles.traitBadge}>
                  <Text style={styles.traitText}>{trait}</Text>
                </View>
              ))}
            </View>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionPrimary]}
                onPress={handleNextWaifu}
              >
                <Text style={styles.actionText}>Randomize</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionSecondary]}
                onPress={handleSaveWaifu}
              >
                <Text style={styles.actionText}>Save Profile</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionGhost]}
                onPress={() => handleShare({ type: "waifu", name: waifu.name })}
              >
                <Text style={styles.actionText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Anime Quotes</Text>
          <Text style={styles.cardSubtitle}>Fuel your socials with bite sized wisdom.</Text>
        </View>
        <Text style={styles.quoteText}>"{quote.line}"</Text>
        <Text style={styles.quoteSource}>{quote.source}</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionPrimary]}
            onPress={handleNextQuote}
          >
            <Text style={styles.actionText}>New Quote</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionGhost]}
            onPress={() => handleShare({ type: "quote", quote })}
          >
            <Text style={styles.actionText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Anime Trace</Text>
          <Text style={styles.cardSubtitle}>
            Drop a screenshot to identify the series and episode context.
          </Text>
        </View>
        <TouchableOpacity style={styles.traceDropzone} onPress={handleTraceUpload}>
          <Text style={styles.tracePrompt}>Tap to upload screenshot</Text>
          <Text style={styles.traceStatus}>{traceStatus}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Mini Games</Text>
          <Text style={styles.cardSubtitle}>Guess the anime or name the speaker.</Text>
        </View>
        <View style={styles.gameCard}>
          <Text style={styles.gameTitle}>{game.title}</Text>
          <Text style={styles.gamePrompt}>{game.prompt}</Text>
          <View>
            {game.answers.map((answer, index) => {
              const isSelected = selectedAnswer === index;
              let optionStyle = styles.gameOption;
              if (selectedAnswer !== null) {
                if (index === game.correctIndex) {
                  optionStyle = [styles.gameOption, styles.gameOptionCorrect];
                } else if (isSelected) {
                  optionStyle = [styles.gameOption, styles.gameOptionWrong];
                }
              } else if (isSelected) {
                optionStyle = [styles.gameOption, styles.gameOptionActive];
              }
              return (
                <TouchableOpacity
                  key={answer}
                  style={optionStyle}
                  onPress={() => handleGameAnswer(index)}
                >
                  <Text style={styles.gameOptionText}>{answer}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Text style={styles.gameFeedback}>{gameFeedback}</Text>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionPrimary]}
            onPress={handleNextGame}
          >
            <Text style={styles.actionText}>Next Prompt</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Anime News Feed</Text>
          <Text style={styles.cardSubtitle}>Live headlines from partner APIs.</Text>
        </View>
        <View>
          {NEWS_FEED.map((item) => (
            <View key={item.id} style={styles.newsItem}>
              <View style={styles.newsMarker} />
              <View style={styles.newsCopy}>
                <Text style={styles.newsHeadline}>{item.headline}</Text>
                <Text style={styles.newsMeta}>
                  {item.source} · {item.timeAgo}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.newsShare}
                onPress={() => handleShare({ type: "news", id: item.id })}
              >
                <Text style={styles.newsShareText}>Share</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

export default Miscellaneous;
