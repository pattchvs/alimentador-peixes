import { Animated, Easing } from 'react-native';

// Animation timing configurations
export const timing = {
    fast: 150,
    normal: 300,
    slow: 500,
};

// Fade in animation
export const fadeIn = (animValue: Animated.Value, duration: number = timing.normal): Animated.CompositeAnimation => {
    return Animated.timing(animValue, {
        toValue: 1,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
    });
};

// Fade out animation
export const fadeOut = (animValue: Animated.Value, duration: number = timing.normal): Animated.CompositeAnimation => {
    return Animated.timing(animValue, {
        toValue: 0,
        duration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
    });
};

// Scale press animation (press in)
export const scaleDown = (animValue: Animated.Value, toValue: number = 0.95): Animated.CompositeAnimation => {
    return Animated.spring(animValue, {
        toValue,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
    });
};

// Scale release animation (press out)
export const scaleUp = (animValue: Animated.Value): Animated.CompositeAnimation => {
    return Animated.spring(animValue, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 4,
    });
};

// Pulse animation (for glowing effects)
export const createPulseAnimation = (animValue: Animated.Value): Animated.CompositeAnimation => {
    return Animated.loop(
        Animated.sequence([
            Animated.timing(animValue, {
                toValue: 1.05,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(animValue, {
                toValue: 1,
                duration: 1000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ])
    );
};

// Glow pulse animation (for opacity-based glow)
export const createGlowAnimation = (animValue: Animated.Value): Animated.CompositeAnimation => {
    return Animated.loop(
        Animated.sequence([
            Animated.timing(animValue, {
                toValue: 1,
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
            Animated.timing(animValue, {
                toValue: 0.3,
                duration: 1500,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
            }),
        ])
    );
};

// Shimmer animation for skeleton loading
export const createShimmerAnimation = (animValue: Animated.Value): Animated.CompositeAnimation => {
    return Animated.loop(
        Animated.timing(animValue, {
            toValue: 1,
            duration: 1500,
            easing: Easing.linear,
            useNativeDriver: true,
        })
    );
};

// Slide up animation (for modals)
export const slideUp = (animValue: Animated.Value, duration: number = timing.normal): Animated.CompositeAnimation => {
    return Animated.timing(animValue, {
        toValue: 0,
        duration,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
    });
};

// Slide down animation (for modals)
export const slideDown = (animValue: Animated.Value, toValue: number, duration: number = timing.normal): Animated.CompositeAnimation => {
    return Animated.timing(animValue, {
        toValue,
        duration,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
    });
};

// Staggered animation helper
export const staggeredFadeIn = (
    animValues: Animated.Value[],
    staggerDelay: number = 100
): Animated.CompositeAnimation => {
    return Animated.stagger(
        staggerDelay,
        animValues.map(anim => fadeIn(anim))
    );
};

// Spring bounce animation
export const springBounce = (animValue: Animated.Value, toValue: number = 1): Animated.CompositeAnimation => {
    return Animated.spring(animValue, {
        toValue,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
    });
};

// Interpolation helpers
export const interpolateOpacity = (animValue: Animated.Value, inputRange: number[] = [0, 1]) => {
    return animValue.interpolate({
        inputRange,
        outputRange: [0, 1],
    });
};

export const interpolateScale = (animValue: Animated.Value, minScale: number = 0.8) => {
    return animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [minScale, 1],
    });
};

export const interpolateTranslateY = (animValue: Animated.Value, distance: number = 300) => {
    return animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [distance, 0],
    });
};
