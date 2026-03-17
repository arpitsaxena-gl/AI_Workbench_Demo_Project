import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TouchableOpacity,
  useColorScheme,
} from 'react-native';

export interface CardProps {
  title?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  contentStyle?: ViewStyle;
  onPress?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  children,
  style,
  titleStyle,
  contentStyle,
  onPress,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  const backgroundColor = isDarkMode ? '#2a2a2a' : '#f5f5f5';
  const textColor = isDarkMode ? '#ffffff' : '#000000';

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[
        styles.card,
        { backgroundColor },
        style,
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}>
      {title && (
        <Text style={[styles.cardTitle, { color: textColor }, titleStyle]}>
          {title}
        </Text>
      )}
      {children && (
        <View style={[styles.content, contentStyle]}>
          {typeof children === 'string' ? (
            <Text style={[styles.cardText, { color: textColor }]}>
              {children}
            </Text>
          ) : (
            children
          )}
        </View>
      )}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  content: {
    // Container for card content
  },
  cardText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default Card;

