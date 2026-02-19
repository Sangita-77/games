import React, { useMemo } from "react";
import { View, Text, StyleSheet, Dimensions, Pressable } from "react-native";
import ConfettiCannon from "react-native-confetti-cannon";

const { width } = Dimensions.get("window");

// Helper function to check if two circles overlap
const circlesOverlap = (circle1, circle2) => {
  const center1X = circle1.left + circle1.size / 2;
  const center1Y = circle1.top + circle1.size / 2;
  const center2X = circle2.left + circle2.size / 2;
  const center2Y = circle2.top + circle2.size / 2;
  
  const distance = Math.sqrt(
    Math.pow(center1X - center2X, 2) + Math.pow(center1Y - center2Y, 2)
  );
  
  const minDistance = (circle1.size + circle2.size) / 2;
  
  return distance < minDistance;
};

// Helper to generate a bunch of circles with different sizes and random positions (no overlaps)
const generateCircles = () => {
  const sizes = [
    { key: "small", size: 30 },
    { key: "medium", size: 50 },
    { key: "large", size: 70 },
  ];

  const circles = [];
  // box width matches visual box (screen width minus horizontal padding in boxWrapper)
  const boxHorizontalPadding = 40;
  const boxWidth = width - boxHorizontalPadding;
  const boxHeight = 180;

  for (let i = 0; i < 20; i += 1) {
    const sizeObj = sizes[i % sizes.length];
    const maxLeft = boxWidth - sizeObj.size;
    const maxTop = boxHeight - sizeObj.size;
    
    let attempts = 0;
    let placed = false;
    let left, top;

    // Try to place the circle without overlapping
    while (!placed && attempts < 100) {
      left = Math.random() * maxLeft;
      top = Math.random() * maxTop;

      const newCircle = {
        id: `${i}-${sizeObj.key}`,
        sizeKey: sizeObj.key,
        size: sizeObj.size,
        left,
        top,
      };

      // Check if this circle overlaps with any existing circle
      const overlaps = circles.some((existingCircle) =>
        circlesOverlap(newCircle, existingCircle)
      );

      if (!overlaps) {
        circles.push(newCircle);
        placed = true;
      }

      attempts++;
    }

    // If we couldn't place it after 100 attempts, skip it
    if (!placed) {
      console.log(`Could not place circle ${i} after 100 attempts`);
    }
  }

  return circles;
};

export default function FillRingsScreen() {
  const [circleStates, setCircleStates] = React.useState({});
  const [timeSpent, setTimeSpent] = React.useState(0);
  const [wrongClicks, setWrongClicks] = React.useState(0);
  const [showParticles, setShowParticles] = React.useState(false);

  // we only want to generate the layout once
  const circles = useMemo(() => generateCircles(), []);

  // ⏱ track time spent on this screen
  React.useEffect(() => {
    const intervalId = setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handlePress = (circle) => {
    let color = "#ffffff";

    if (circle.sizeKey === "small") {
      color = "#ffeb3b"; // yellow
    } else if (circle.sizeKey === "medium") {
      color = "#f44336"; // red
    } else if (circle.sizeKey === "large") {
      color = "#8bc34a"; // green
    }

    setCircleStates((prev) => {
      const updated = {
        ...prev,
        [circle.id]: color,
      };

      // check if all circles are now filled (no blank rings)
      const allFilled = circles.every((c) => updated[c.id]);

      if (allFilled) {
        setShowParticles(true);

        // after a short celebration, hide particles and reset rings
        setTimeout(() => {
          setShowParticles(false);
          setCircleStates({}); // blank rings again
        }, 2000);
      }

      return updated;
    });
  };

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Fill the Rings</Text>
      <Text style={styles.subtitle}>
        Tap a small ring to make it yellow, medium to make it red, and large to
        make it green.
      </Text>

      <View style={styles.statsRow}>
        <Text style={styles.statsText}>Time: {timeSpent}s</Text>
        <Text style={styles.statsText}>Wrong taps: {wrongClicks}</Text>
      </View>

      <View style={styles.boxWrapper}>
        <Pressable
          style={styles.box}
          onPress={() => setWrongClicks((prev) => prev + 1)}
        >
          {circles.map((circle) => (
            <Pressable
              key={circle.id}
              style={[
                styles.circle,
                {
                  width: circle.size,
                  height: circle.size,
                  borderRadius: circle.size / 2,
                  left: circle.left,
                  top: circle.top,
                  backgroundColor: circleStates[circle.id] || "#ffffff",
                },
              ]}
              onPress={(e) => {
                e.stopPropagation();
                handlePress(circle);
              }}
            />
          ))}
        </Pressable>
      </View>

      {showParticles && (
        <ConfettiCannon count={120} origin={{ x: width / 2, y: 0 }} fadeOut />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#111",
    paddingTop: 60,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },
  subtitle: {
    color: "#ccc",
    fontSize: 14,
    marginTop: 8,
    marginHorizontal: 24,
    textAlign: "center",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginTop: 16,
  },
  statsText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  boxWrapper: {
    marginTop: 40,
    paddingHorizontal: 20,
    width: "100%",
    alignItems: "center",
  },
  box: {
    width: "100%",
    maxWidth: 600,
    height: 180,
    borderWidth: 2,
    borderColor: "#5c6bc0",
    borderRadius: 12,
    backgroundColor: "#fafafa",
    overflow: "hidden",
  },
  circle: {
    position: "absolute",
    borderWidth: 1,
    borderColor: "#4a6fa5",
  },
});

