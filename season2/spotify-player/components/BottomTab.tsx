import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import {
  PanGestureHandler,
  RectButton,
  State
} from "react-native-gesture-handler";
import { onGestureEvent } from "react-native-redash";

import { timing, withSpring } from "./AnimatedHelpers";

const { height } = Dimensions.get("window");
const SNAP_TOP = 0;
const SNAP_BOTTOM = height - 128;
const config = {
  damping: 15,
  mass: 1,
  stiffness: 150,
  overshootClamping: false,
  restSpeedThreshold: 0.1,
  restDisplacementThreshold: 0.1
};
const {
  Clock,
  Value,
  cond,
  useCode,
  set,
  block,
  not,
  clockRunning,
  add
} = Animated;

const styles = StyleSheet.create({
  playerSheet: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "cyan"
  },
  navigation: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: "blue"
  }
});

export default () => {
  const translationY = new Value(0);
  const velocityY = new Value(0);
  const state = new Value(State.UNDETERMINED);
  const offset = new Value(0);
  const goUp = new Value(0);
  const goDown = new Value(0);
  const gestureHandler = onGestureEvent({
    state,
    translationY,
    velocityY
  });
  const translateY = withSpring({
    value: translationY,
    velocity: velocityY,
    offset,
    state,
    snapPoints: [SNAP_TOP, SNAP_BOTTOM],
    config
  });
  const clock = new Clock();
  useCode(
    block([
      cond(goUp, [
        set(
          offset,
          timing({
            clock,
            from: offset,
            to: SNAP_TOP
          })
        ),
        cond(not(clockRunning(clock)), [set(goUp, 0)])
      ]),
      cond(goDown, [
        set(
          offset,
          timing({
            clock,
            from: offset,
            to: SNAP_BOTTOM
          })
        ),
        cond(not(clockRunning(clock)), [set(goDown, 0)])
      ])
    ]),
    []
  );
  return (
    <>
      <PanGestureHandler {...gestureHandler}>
        <Animated.View
          style={[styles.playerSheet, { transform: [{ translateY }] }]}
        />
      </PanGestureHandler>
      <View style={styles.navigation}>
        <RectButton onPress={() => goUp.setValue(1)}>
          <Text style={{ margin: 4, fontSize: 16 }}>Up</Text>
        </RectButton>
        <RectButton onPress={() => goDown.setValue(1)}>
          <Text style={{ margin: 4, fontSize: 16 }}>Down</Text>
        </RectButton>
      </View>
    </>
  );
};
